import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseUsageRepository } from '@/infrastructure/repositories/SupabaseUsageRepository';
import { SupabaseCronLogRepository } from '@/infrastructure/repositories/SupabaseCronLogRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { UsageDashboard } from '@/presentation/components/admin/UsageDashboard';
import { BottomNav } from '@/presentation/components/admin/BottomNav';

export const metadata = {
  title: '관리자 - 사용량 통계 | 티타임은 즐거워',
  description: '시스템 전반의 API 호출 및 토큰 사용 현황을 확인합니다.',
};

export default async function AdminUsagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserEmail = user?.email;
  let userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';
  let userName = user?.user_metadata?.name || user?.email?.split('@')[0];

  if (!user) {
    redirect('/login');
  }

  if (userRole === 'user') {
    redirect('/templates');
  }

  const usageRepo = new SupabaseUsageRepository();
  const initialReport = await usageRepo.getUsageReport('monthly', new Date());

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="usage" />
      <main className="flex-1">
        <UsageDashboard initialReport={initialReport} />
      </main>
      <BottomNav />
    </div>
  );
}
