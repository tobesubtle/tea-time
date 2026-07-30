import { SubmitButtonWithLoading } from '@/presentation/components/common/SubmitButtonWithLoading';
import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import Header from '@/presentation/components/Header';
import { executePromptAction } from '@/presentation/actions/promptActions';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    draftId?: string;
    templateId?: string;
    title?: string;
    aiModel?: string;
    prompt?: string;
    variables?: string;
  }>;
}

export default async function PromptRunPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const draftId = params.draftId || '';

  const historyRepo = new SupabasePromptHistoryRepository();
  const draftRecord = draftId ? await historyRepo.getPromptHistoryById(draftId) : null;

  const initialPrompt = draftRecord?.finalPrompt || params.prompt || '';
  const aiModel = draftRecord?.aiModel || params.aiModel || 'gemini-3.6-flash';
  const templateId = draftRecord?.templateId || params.templateId || '';
  const title = draftRecord?.title || params.title || '새 프롬프트';
  const variables = draftRecord?.inputVariables ? JSON.stringify(draftRecord.inputVariables) : (params.variables || '{}');

  // 첨부된 파일 추출
  let attachedFiles: Array<{ id: string; name: string; size: number; type: string; source: 'local' | 'gdrive'; url?: string }> = [];
  if (draftRecord?.inputVariables?._attachedFiles) {
    try {
      attachedFiles = JSON.parse(draftRecord.inputVariables._attachedFiles);
    } catch {}
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userRole = user?.user_metadata?.role || 'editor';
  const userName = user?.user_metadata?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header userRole={userRole} userEmail={user?.email} userName={userName} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href={`/prompts/create?templateId=${templateId}`}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[#45474c]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h2 className="font-bold text-2xl text-[#0b1c30]">프롬프트 실행</h2>
              <p className="text-xs text-[#45474c] mt-0.5">
                변수가 적용된 최종 프롬프트를 확인하고 수정 후 Gemini API를 실행하세요.
              </p>
            </div>
          </div>

          <form action={executePromptAction} className="space-y-6">
            <input type="hidden" name="draftId" value={draftId} />
            <input type="hidden" name="templateId" value={templateId} />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="aiModel" value={aiModel} />
            <input type="hidden" name="inputVariables" value={variables} />

            {/* Prompt Title Display Card */}
            <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] bg-[#e5eeff] text-[#2f2ebe] px-2 py-0.5 rounded-md font-medium">
                프롬프트 제목
              </span>
              <h3 className="font-bold text-lg text-[#0b1c30]">{title}</h3>
            </div>

            {/* Attached Files Section (Requirement 5: 첨부된 파일 리스트 출력 및 다운로드 가능) */}
            {attachedFiles.length > 0 && (
              <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#4648d4]">attach_file</span>
                    <span>첨부된 파일 목록 ({attachedFiles.length}개)</span>
                  </span>
                  <span className="text-[11px] text-[#45474c]">다운로드 및 연동 링크 제공</span>
                </div>

                <div className="space-y-2">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-[#f8f9ff] border border-[#c5c6cd]/50 rounded-xl px-4 py-2.5 text-xs"
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
                        {file.source === 'gdrive' ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                            Google Drive
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#45474c] shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>

                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          download={file.name}
                          className="px-3 py-1 bg-white border border-[#c5c6cd] text-[#0b1c30] hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          <span>다운로드</span>
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Prompt Editor */}
            <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="finalPrompt">
                  최종 프롬프트 (수정 가능)
                </label>
                <span className="text-[11px] bg-[#e5eeff] text-[#2f2ebe] px-2 py-0.5 rounded-full font-medium">
                  {aiModel}
                </span>
              </div>
              <textarea
                id="finalPrompt"
                name="finalPrompt"
                required
                rows={10}
                defaultValue={initialPrompt}
                className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4648d4] leading-relaxed"
              />
            </div>

            {/* Action Button with Loading Spinner */}
            <SubmitButtonWithLoading
              label="Gemini AI 실행하기"
              loadingLabel="Gemini AI 답변 생성 중..."
              overlayMessage="Gemini AI가 답변을 생성하고 있습니다..."
              overlaySubMessage="요청 프롬프트를 분석하고 데이터를 처리하는 중입니다."
              icon="send"
            />
          </form>
        </div>
      </main>
    </div>
  );
}
