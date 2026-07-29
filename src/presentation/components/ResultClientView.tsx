'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updatePromptResultAction } from '@/presentation/actions/promptActions';
import { Toast } from '@/presentation/components/common/Toast';
import { Badge } from '@/presentation/components/common/Badge';
import { Button } from '@/presentation/components/common/Button';

interface ResultClientViewProps {
  history: {
    id: string;
    templateId?: string;
    title?: string;
    finalPrompt: string;
    resultText?: string;
    aiModel: string;
    likeCount?: number;
    inputVariables?: Record<string, string>;
  };
  userEmail?: string;
}

export default function ResultClientView({ history, userEmail }: ResultClientViewProps) {
  const [resultText, setResultText] = useState(history.resultText || '');
  const [likeCount, setLikeCount] = useState(history.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 결과 텍스트 DB 저장 (onBlur / 버튼 클릭 시)
  const handleSaveResultText = async () => {
    if (resultText === history.resultText && !isSaving) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('historyId', history.id);
      formData.append('resultText', resultText);
      await updatePromptResultAction(formData);
      showToast('수정된 결과가 저장되었습니다.');
    } catch {
      showToast('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 첨부파일 파싱
  let attachedFiles: Array<{ id: string; name: string; size: number; type: string; source: 'local' | 'gdrive'; url?: string }> = [];
  if (history.inputVariables?._attachedFiles) {
    try {
      attachedFiles = JSON.parse(history.inputVariables._attachedFiles);
    } catch {}
  }

  const reRunUrl = history.templateId
    ? `/prompts/create?templateId=${history.templateId}&historyId=${history.id}`
    : `/prompts/create?historyId=${history.id}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 클립보드 복사
  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    showToast('클립보드에 복사되었습니다');
  };

  // 좋아요 토글
  const handleLikeToggle = async () => {
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setIsLiked(newLiked);
    setLikeCount(newCount);

    const formData = new FormData();
    formData.append('historyId', history.id);
    formData.append('likeCount', newCount.toString());
    await updatePromptResultAction(formData);
  };

  // TXT 다운로드
  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${history.title || 'gemini_result'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('.txt 파일이 다운로드되었습니다');
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // 이메일 발송 (백엔드 API 사용)
  const handleEmailSend = async () => {
    if (!userEmail) {
      showToast('이메일 발송을 위한 수신자 계정 정보를 찾을 수 없습니다.');
      return;
    }

    if (isSendingEmail) return;
    setIsSendingEmail(true);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: `[Prompt Result] ${history.title || 'Gemini 생성 결과'}`,
          text: resultText,
          filename: `${history.title || 'gemini_result'}.txt`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('이메일 및 .txt 첨부파일이 성공적으로 발송되었습니다.');
      } else {
        showToast(data.error || '이메일 발송 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      console.error('Email Dispatch Error:', err);
      showToast('이메일 발송에 실패했습니다. (네트워크 오류)');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Metadata Header */}
      <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <Badge variant="primary">{history.aiModel}</Badge>
          <h2 className="font-bold text-lg text-[#0b1c30] mt-1">
            {history.title || '생성 결과'}
          </h2>
        </div>

        <div className="flex gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-10 h-10 rounded-full bg-[#f8f9ff] hover:bg-[#dce9ff] transition-colors flex items-center justify-center text-[#091426] border border-[#c5c6cd]/40"
            title="복사"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
          </button>

          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center border border-[#c5c6cd]/40 ${
              isLiked ? 'bg-red-100 text-red-600 border-red-200' : 'bg-[#f8f9ff] text-[#091426] hover:bg-[#dce9ff]'
            }`}
            title="좋아요"
          >
            <span className="material-symbols-outlined text-sm">favorite</span>
          </button>
        </div>
      </div>

      {/* Attached Files Box (If Any) */}
      {attachedFiles.length > 0 && (
        <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4648d4]">attach_file</span>
              <span>사용된 첨부파일 ({attachedFiles.length}개)</span>
            </span>
            <span className="text-[11px] text-[#45474c]">Supabase 스토리지 및 구글 드라이브</span>
          </div>

          <div className="space-y-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-[#f8f9ff] border border-[#c5c6cd]/50 rounded-xl px-4 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-base shrink-0 ${
                      file.source === 'gdrive' ? 'text-green-600' : 'text-[#4648d4]'
                    }`}
                  >
                    {file.source === 'gdrive' ? 'add_to_drive' : 'description'}
                  </span>
                  <span className="font-medium text-[#0b1c30] truncate">{file.name}</span>
                </div>

                {file.url ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    download={file.source !== 'gdrive' ? file.name : undefined}
                    className="px-3 py-1 bg-white border border-[#c5c6cd] text-[#0b1c30] hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {file.source === 'gdrive' ? 'open_in_new' : 'download'}
                    </span>
                    <span>{file.source === 'gdrive' ? '열기' : '다운로드'}</span>
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Editable Container */}
      <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="h-1 bg-[#4648d4] w-full"></div>
        <div className="p-4 bg-[#f8f9ff] border-b border-[#c5c6cd]/30 flex justify-between items-center text-xs text-[#45474c]">
          <div className="flex items-center gap-2">
            <span>결과 텍스트 (직접 수정 가능)</span>
            {isSaving && <span className="text-[11px] text-[#4648d4] animate-pulse">저장 중...</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveResultText}
              disabled={isSaving}
              className="text-[11px] text-[#4648d4] hover:underline font-medium"
            >
              수정사항 저장
            </button>
            <span>좋아요 {likeCount}개</span>
          </div>
        </div>
        <textarea
          value={resultText}
          onChange={(e) => setResultText(e.target.value)}
          onBlur={handleSaveResultText}
          rows={12}
          className="w-full p-5 bg-white text-sm font-body border-none focus:outline-none leading-relaxed text-[#0b1c30]"
        />
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href={reRunUrl} className="flex-1">
          <Button variant="primary" icon="refresh" className="w-full">
            다시 실행 / 다른 변수 적용
          </Button>
        </Link>

        <Button variant="outline" icon="save_alt" onClick={handleDownloadTxt} className="flex-1">
          TXT로 저장
        </Button>

        <Button
          variant="outline"
          onClick={handleEmailSend}
          isLoading={isSendingEmail}
          icon="mail"
          className="flex-1"
        >
          {isSendingEmail ? '발송 중...' : '나에게 이메일 발송'}
        </Button>
      </div>
    </div>
  );
}
