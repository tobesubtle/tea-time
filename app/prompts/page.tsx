import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseTemplateRepository } from '@/infrastructure/repositories/SupabaseTemplateRepository';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';
import Header from '@/presentation/components/Header';
import PromptTemplateFilter from '@/presentation/components/PromptTemplateFilter';
import PromptHistoryItem from '@/presentation/components/PromptHistoryItem';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    templateId?: string;
  }>;
}

export default async function PromptsListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params.search || '';
  const selectedTemplateId = params.templateId || 'all';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';
  const userName = user?.user_metadata?.name;

  const templateRepo = new SupabaseTemplateRepository();
  const allTemplates = await templateRepo.getTemplates();

  const historyRepo = new SupabasePromptHistoryRepository();
  const histories = await historyRepo.getUserPromptHistories(undefined, selectedTemplateId, searchQuery);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header activeTab="prompts" userRole={userRole} userEmail={user?.email} userName={userName} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-6 pb-32">
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-bold text-2xl text-[#0b1c30]">생성된 프롬프트 목록</h2>
            <p className="text-xs text-[#45474c] mt-1">
              모든 사용자가 실행하고 공유한 전체 프롬프트 히스토리 내역을 확인하고 검색할 수 있습니다.
            </p>
          </div>

          <Link
            href="/prompts/create"
            className="bg-[#091426] text-white rounded-xl px-5 h-11 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>새 프롬프트 작성</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-4">
          <form className="grid grid-cols-1 sm:grid-cols-3 gap-4" action="/prompts" method="GET">
            {/* Search Input with Submit Button */}
            <div className="sm:col-span-2 relative flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-[#45474c] text-sm">
                  search
                </span>
                <input
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="제목, 프롬프트 내용 또는 결과 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#091426] text-white px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-[#1e293b] transition-colors flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                <span>검색</span>
              </button>
            </div>

            {/* Template Filter Select */}
            <div>
              <PromptTemplateFilter
                templates={allTemplates}
                selectedTemplateId={selectedTemplateId}
                searchQuery={searchQuery}
              />
            </div>
          </form>
        </div>

        {/* List Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-[#0b1c30]">전체 실행 내역</span>
            <span className="text-xs text-[#45474c]">총 {histories.length}개</span>
          </div>

          {histories.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#c5c6cd]/40 space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#8590a6]">article</span>
              <p className="text-sm font-medium text-[#45474c]">생성된 프롬프트 내역이 없습니다.</p>
              <p className="text-xs text-[#8590a6]">
                템플릿을 선택하여 첫 프롬프트를 작성하고 실행해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {histories.map((item) => {
                const tpl = allTemplates.find((t) => t.id === item.templateId);

                return (
                  <PromptHistoryItem
                    key={item.id}
                    item={item}
                    templateTitle={tpl?.title}
                    currentUserId={user?.id}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
