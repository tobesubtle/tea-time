import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseTemplateRepository } from '@/infrastructure/repositories/SupabaseTemplateRepository';
import Header from '@/presentation/components/Header';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || '전체';
  const searchQuery = params.search || '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
  const userName = user.user_metadata?.name || user.email?.split('@')[0];

  const templateRepo = new SupabaseTemplateRepository();
  const templates = await templateRepo.getTemplates(selectedCategory, searchQuery);

  const categories = ['전체', '티타임', '보고서', '코드', '이메일', '기타'];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header activeTab="templates" userRole={userRole} userEmail={user?.email} userName={userName} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Top Control Bar (Search & Create Button) */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <form className="relative flex-1 max-w-md" action="/templates" method="GET">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-[#45474c]">
              search
            </span>
            <input
              name="search"
              defaultValue={searchQuery}
              placeholder="템플릿 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c5c6cd]/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />
          </form>

          {userRole !== 'user' && (
            <Link
              href="/templates/create"
              className="bg-[#091426] text-white rounded-xl px-5 h-11 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              <span>템플릿 생성</span>
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="w-full overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/templates?category=${encodeURIComponent(cat)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`px-4 h-10 rounded-full text-sm font-medium transition-all flex items-center justify-center ${selectedCategory === cat
                  ? 'bg-[#4648d4] text-white shadow-sm'
                  : 'bg-white text-[#45474c] border border-[#c5c6cd]/50 hover:bg-slate-50'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-end mt-2">
          <h2 className="font-bold text-xl text-[#0b1c30]">추천 템플릿</h2>
          <span className="text-xs text-[#45474c]">총 {templates.length}개</span>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/prompts/create?templateId=${tpl.id}`}
              className="group relative bg-white rounded-2xl border border-[#c5c6cd]/50 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden block"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4648d4] to-[#30037d]"></div>

              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#4648d4]">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base text-[#0b1c30] mb-1.5 group-hover:text-[#4648d4] transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-[#45474c] line-clamp-2 leading-relaxed">
                  {tpl.description || tpl.content}
                </p>
              </div>

              <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#c5c6cd]/30 text-xs">
                <span className="inline-flex items-center gap-1 bg-[#f8f9ff] px-2.5 py-1 rounded-full text-[#45474c]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('ko-KR') : '방금 전'}
                </span>
                <span className="inline-block bg-[#eff4ff] text-[#3c475a] px-2.5 py-1 rounded-full font-medium">
                  {tpl.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
