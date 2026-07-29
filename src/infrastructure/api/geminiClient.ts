import { GoogleGenAI } from '@google/genai';
import { SupabaseQuotaErrorRepository } from '../repositories/SupabaseQuotaErrorRepository';
import { NodemailerEmailService } from '../email/emailService';

export async function runGeminiPrompt(
  promptText: string,
  modelName: string = 'gemini-2.5-flash',
  userEmail?: string
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Returning simulated result for testing.');
    return `[Gemini AI 시뮬레이션 결과]\n\n입력받은 프롬프트:\n"${promptText}"\n\n위 프롬프트에 대한 Gemini AI의 응답입니다:\n- 요청사항이 성공적으로 처리되었습니다.\n- .env 파일에 GEMINI_API_KEY를 설정하시면 실제 Gemini 모델의 최신 생성 결과를 받아보실 수 있습니다.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // SDK 표준 Gemini API 호출
    const targetModel = modelName.includes('gemini') ? modelName : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: promptText,
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
