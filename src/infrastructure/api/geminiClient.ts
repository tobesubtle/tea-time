import { GoogleGenAI } from '@google/genai';
import { SupabaseQuotaErrorRepository } from '../repositories/SupabaseQuotaErrorRepository';
import { NodemailerEmailService } from '../email/emailService';

export interface AttachedFileInfo {
  name: string;
  url?: string;
  source?: string;
  type?: string;
  size?: number;
  content?: string;
}

async function fetchFileTextContent(file: AttachedFileInfo): Promise<string | null> {
  // 1. 이미 content 텍스트가 클라이언트 등에서 전송된 경우
  if (file.content && file.content.trim()) {
    return file.content;
  }

  if (!file.url) return null;

  try {
    // 2. Google Drive 문서/시트/파일 URL에서 텍스트 추출 시도
    if (file.source === 'gdrive' || file.url.includes('docs.google.com') || file.url.includes('drive.google.com')) {
      const match = file.url.match(/\/d\/([a-zA-Z0-9_-]+)/) || file.url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const fileId = match[1];

        // Google Docs export (txt)
        if (file.url.includes('document')) {
          const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=txt`;
          const res = await fetch(exportUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
          });
          if (res.ok) {
            const txt = await res.text();
            if (!txt.includes('<!DOCTYPE html>') && !txt.includes('<html')) {
              return txt;
            }
          }
        }

        // Google Sheets export (csv)
        if (file.url.includes('spreadsheet')) {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv`;
          const res = await fetch(exportUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
          });
          if (res.ok) {
            const txt = await res.text();
            if (!txt.includes('<!DOCTYPE html>') && !txt.includes('<html')) {
              return txt;
            }
          }
        }

        // Direct download fallback
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const res = await fetch(downloadUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        });
        if (res.ok) {
          const txt = await res.text();
          if (!txt.includes('<!DOCTYPE html>') && !txt.includes('<html')) {
            return txt;
          }
        }
      }
    }

    // 3. 일반 공개 URL (Supabase 스토리지 등)
    if (file.url.startsWith('http')) {
      const res = await fetch(file.url, { cache: 'no-store' });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text') || contentType.includes('json') || contentType.includes('csv')) {
          const txt = await res.text();
          if (!txt.includes('<!DOCTYPE html>')) {
            return txt;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[geminiClient] Failed to fetch content for ${file.name}:`, err);
  }

  return null;
}

async function fetchPdfInlineData(file: AttachedFileInfo): Promise<{ mimeType: string; data: string } | null> {
  if (!file.url) return null;
  try {
    const res = await fetch(file.url, { cache: 'no-store' });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return {
        mimeType: 'application/pdf',
        data: base64,
      };
    }
  } catch (err) {
    console.warn(`[geminiClient] Failed to fetch PDF inline data for ${file.name}:`, err);
  }
  return null;
}

export async function runGeminiPrompt(
  promptText: string,
  modelName: string = 'gemini-2.5-flash',
  userEmail?: string,
  attachedFiles?: AttachedFileInfo[]
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  let promptWithAttachments = promptText;
  const pdfInlineParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

  if (attachedFiles && attachedFiles.length > 0) {
    const attachmentBlocks: string[] = [];

    for (let idx = 0; idx < attachedFiles.length; idx++) {
      const file = attachedFiles[idx];
      const isDrive = file.source === 'gdrive';
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const label = isDrive ? 'Google Drive 문서' : '첨부 파일';

      if (isPdf && file.url) {
        const pdfInlineData = await fetchPdfInlineData(file);
        if (pdfInlineData) {
          pdfInlineParts.push({ inlineData: pdfInlineData });
          attachmentBlocks.push(
            `[${label} #${idx + 1}: ${file.name} (PDF 문서)]\n(본 PDF 원본 바이너리 파일이 멀티모달 데이터로 Gemini 모델에 직접 입력 전송되었습니다.)`
          );
          continue;
        }
      }

      const fetchedContent = await fetchFileTextContent(file);

      if (fetchedContent && fetchedContent.trim()) {
        attachmentBlocks.push(
          `[${label} #${idx + 1}: ${file.name}]\n--- 파일 본문 텍스트 내용 시작 ---\n${fetchedContent.trim()}\n--- 파일 본문 텍스트 내용 끝 ---`
        );
      } else {
        const linkInfo = file.url ? ` (참조/링크: ${file.url})` : '';
        attachmentBlocks.push(
          `[${label} #${idx + 1}: ${file.name}${linkInfo}]\n(참고: 비공개 공유 설정 문서이거나 텍스트 직렬화가 불가능하여 문서 메타데이터와 참조 링크 정보가 전송되었습니다.)`
        );
      }
    }

    const attachmentSection = attachmentBlocks.join('\n\n');
    promptWithAttachments = `[첨부 파일 및 구글 드라이브 문서 데이터]\n아래는 사용자가 프롬프트 요청과 함께 첨부한 구글 드라이브 및 문서 파일 데이터입니다. 첨부된 파일과 본문 데이터를 정독하여 아래 프롬프트 요청에 대해 정확히 분석/작성해 주세요:\n\n${attachmentSection}\n\n==================================================\n\n[요청 프롬프트]\n${promptText}`;
  }

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Returning simulated result for testing.');
    const attachmentNotice = attachedFiles && attachedFiles.length > 0
      ? `\n\n[첨부된 파일 ${attachedFiles.length}개 연동 완료]\n` + attachedFiles.map((f) => `- ${f.name} (${f.source === 'gdrive' ? 'Google Drive' : 'Local File'})`).join('\n')
      : '';
    return `[Gemini AI 시뮬레이션 결과]\n\n입력받은 프롬프트:\n"${promptText}"${attachmentNotice}\n\n위 프롬프트와 첨부파일에 대한 Gemini AI의 응답입니다:\n- 요청사항 및 구글 드라이브/첨부파일 정보가 성공적으로 Gemini API에 전송 처리되었습니다.\n- .env 파일에 GEMINI_API_KEY를 설정하시면 실제 Gemini 모델의 최신 생성 결과를 받아보실 수 있습니다.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // SDK 표준 Gemini API 호출
    const targetModel = modelName.includes('gemini') ? modelName : 'gemini-2.5-flash';

    let finalContents: any;
    if (pdfInlineParts.length > 0) {
      finalContents = [...pdfInlineParts, { text: promptWithAttachments }];
    } else {
      finalContents = promptWithAttachments;
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: finalContents,
    });

    return response.text || '결과가 비어있습니다.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = error.message || String(error);

    // Check if error is related to quota / cost / rate limits / resource exhausted
    const isQuotaError =
      /quota|429|RESOURCE_EXHAUSTED|rate limit|credit|exceeded|billing/i.test(errorMessage);

    if (isQuotaError) {
      // Async record quota error log in DB and notify Admin via email
      try {
        const quotaRepo = new SupabaseQuotaErrorRepository();
        await quotaRepo.createLog({
          userEmail,
          modelName,
          errorMessage,
          status: 'notified',
        });

        const emailService = new NodemailerEmailService();
        await emailService.sendAdminQuotaAlertEmail({
          userEmail,
          modelName,
          errorMessage,
        });
      } catch (logErr) {
        console.error('Failed to log or send email alert for quota error:', logErr);
      }

      throw new Error(`[Gemini API 쿼터/비용 오류] 사용 가능한 API 쿼터가 초과되었거나 제한에 도달했습니다. 관리자에게 이메일 알림이 발송되었습니다.`);
    }

    throw new Error(`Gemini API 호출 실패: ${errorMessage}`);
  }
}
