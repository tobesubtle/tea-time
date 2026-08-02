import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';

export const metadata = {
  title: '관리자 - 프로젝트 최종 보고서 | 티타임은 즐거워',
  description: '시스템 설계, 아키텍처 및 세부 구현 사항에 대한 최종 프로젝트 보고서를 열람합니다.',
};

export default async function AdminReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const currentUserEmail = user.email;
  const userRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
  const userName = user.user_metadata?.name || user.email?.split('@')[0];

  if (userRole !== 'admin') {
    redirect('/templates');
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="report" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <span>📄 프로젝트 최종 보고서</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                관리자 전용
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              시스템 기능 구현 사항, 클린 아키텍처 및 유지보수 가이드 자산화 보고서입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/api/admin/report"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>새 탭에서 열기</span>
            </a>
          </div>
        </div>

        {/* Secure Embedded Report Frame */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <iframe
            src="/api/admin/report"
            title="최종 프로젝트 보고서"
            className="w-full h-[85vh] border-0"
          />
        </div>
      </main>
    </div>
  );
}
