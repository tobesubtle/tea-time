import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseTemplateRepository } from '@/infrastructure/repositories/SupabaseTemplateRepository';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';
import { getActiveGeminiModels } from '@/infrastructure/supabase/getGeminiModels';
import Header from '@/presentation/components/Header';
import TemplatePreview from '@/presentation/components/TemplatePreview';
import { TemplateActionHeader } from '@/presentation/components/TemplateActionHeader';
import { HistoryList } from '@/presentation/components/HistoryList';
import { ModelSelectAccordion } from '@/presentation/components/ModelSelectAccordion';
import { FileUploadSection } from '@/presentation/components/FileUploadSection';
import { preparePromptAction } from '@/presentation/actions/promptActions';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    templateId?: string;
    historyId?: string;
  }>;
}

export default async function PromptCreatePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const templateRepo = new SupabaseTemplateRepository();
  const historyRepo = new SupabasePromptHistoryRepository();

  const allTemplates = await templateRepo.getTemplates();
  const selectedTemplate = allTemplates.find((t) => t.id === params.templateId) || allTemplates[0];

  // DB에서 활성화된 Gemini 최신 모델 목록 가져오기
  const availableModels = await getActiveGeminiModels();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';
  const userName = user?.user_metadata?.name;

  // 과거 이력 가져오기
  const recentHistory = selectedTemplate && user
    ? await historyRepo.getRecentHistoryByTemplateId(selectedTemplate.id, user.id)
    : [];

  // 특정 이력이 선택된 경우 해당 이력의 변수 값 불러오기
  const selectedHistory = params.historyId
    ? recentHistory.find((h) => h.id === params.historyId) || null
    : null;

  const defaultVariables = selectedHistory?.inputVariables || {};

  // {{변수}} 추출 정규식
  const variableMatches = selectedTemplate ? selectedTemplate.content.match(/{{\s*([^}]+)\s*}}/g) || [] : [];
  const variables = Array.from(new Set(variableMatches.map((m) => m.replace(/{{\s*|\s*}}/g, ''))));

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header activeTab="templates" userRole={userRole} userEmail={user?.email} userName={userName} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
        <div className="space-y-6">
          {/* Section Title */}
          <div>
            <h2 className="font-bold text-2xl text-[#0b1c30]">프롬프트 작성</h2>
            <p className="text-xs text-[#45474c] mt-1">
              선택한 템플릿의 변수 값을 입력하고 AI 모델을 지정하여 프롬프트를 완성하세요.
            </p>
          </div>

          {/* 삭제된 템플릿 접근 예외 처리 경고 */}
          {params.templateId && !allTemplates.some((t) => t.id === params.templateId) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
              <span>요청하신 템플릿이 삭제되었거나 존재하지 않아 기본 템플릿으로 연결되었습니다.</span>
            </div>
          )}

          {/* Template Action Card (수정 / 복사 / 삭제 기능) */}
          {selectedTemplate && <TemplateActionHeader template={selectedTemplate} />}

          {/* 요구사항 3: 템플릿 원본 미리보기는 선택된 템플릿 바로 아래 위치 */}
          {selectedTemplate && <TemplatePreview content={selectedTemplate.content} />}

          {/* Form Fields */}
          {selectedTemplate && (
            <form action={preparePromptAction} className="space-y-6">
              <input type="hidden" name="templateId" value={selectedTemplate.id} />
              <input type="hidden" name="templateContent" value={selectedTemplate.content} />

              {/* 프롬프트 제목 (필수 항목) */}
              <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5" htmlFor="title">
                    <span className="material-symbols-outlined text-sm text-[#4648d4]">edit_note</span>
                    <span>프롬프트 제목 *</span>
                  </label>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">필수 항목</span>
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={selectedHistory?.title || `${selectedTemplate.title} 실행`}
                  placeholder="예: 2분기 마케팅 기획서 생성 (필수)"
                  className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>

              {/* Input Variables (Required 제거) */}
              <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4648d4]">tune</span>
                  <span>입력 변수</span>
                </h3>

                {variables.length === 0 ? (
                  <p className="text-xs text-[#45474c]">
                    이 템플릿에는 지정된 변수가 없습니다. 바로 실행하실 수 있습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variables.map((vName) => (
                      <div key={vName} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label
                            className="block text-xs font-semibold text-[#0b1c30]"
                            htmlFor={`var_${vName}`}
                          >
                            {`{{${vName}}}`}
                          </label>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            선택 (미입력 시 변수명 출력)
                          </span>
                        </div>
                        <textarea
                          id={`var_${vName}`}
                          name={`var_${vName}`}
                          rows={3}
                          defaultValue={defaultVariables[vName] || ''}
                          placeholder={`${vName} 입력 (여러 줄 입력 가능, 선택사항)`}
                          className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] resize-y min-h-[80px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 파일 첨부 (로컬 / 구글 드라이브) */}
              <FileUploadSection />
              <HistoryList 
                recentHistory={recentHistory as any} 
                selectedTemplate={selectedTemplate} 
                selectedHistoryId={selectedHistory?.id} 
              />

              {/* 최하단 위치: AI 모델 선택 (Gemini 3.5 Flash-Lite 기본 선택, 상세 감춤) */}
              <ModelSelectAccordion models={availableModels} defaultModelId="gemini-3.5-flash-lite" />

              {/* Action Button */}
              <button
                type="submit"
                className="w-full bg-[#091426] text-white rounded-xl h-12 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors"
              >
                <span>완성된 프롬프트 검토 및 실행</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
