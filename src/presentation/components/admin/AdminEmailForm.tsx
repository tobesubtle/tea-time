'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, FileText, UserCheck } from 'lucide-react';

interface AdminEmailFormProps {
  userEmail: string;
}

export function AdminEmailForm({ userEmail }: AdminEmailFormProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: '발송할 텍스트 내용을 입력해 주세요.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || `${userEmail} 주소로 메일과 txt 파일이 성공적으로 발송되었습니다.`,
        });
        setContent('');
        setSubject('');
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || '이메일 발송에 실패했습니다.',
        });
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      setStatusMessage({
        type: 'error',
        text: '이메일 발송 중 네트워크 오류가 발생했습니다.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <span>관리자 텍스트 이메일 전송</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                  .txt 자동 첨부
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                작성한 텍스트를 현재 로그인된 관리자 아이디 이메일로 전송합니다. 이메일 본문과 함께 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-mono">.txt</code> 파일이 자동으로 첨부됩니다.
              </p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 block text-[10px]">수신자 이메일</span>
              <strong className="font-semibold">{userEmail}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-medium flex items-start gap-3 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Subject Field (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              이메일 제목 <span className="text-zinc-400 font-normal">(선택 사항)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 프로젝트 주요 메모 및 백업 데이터"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Textarea Content Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                발송할 텍스트 내용 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                입력된 텍스트가 .txt 파일로 변환되어 첨부됩니다
              </span>
            </div>
            <textarea
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="전송할 텍스트나 메모, 보고서 내용을 자유롭게 입력하세요..."
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono leading-relaxed resize-y min-h-[200px]"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[11px] text-zinc-400">
              * 메일 수신함에서 스팸함도 함께 확인해 주세요.
            </div>

            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>이메일 전송 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>이메일 및 txt 보내기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
