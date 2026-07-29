import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseCronLogRepository } from '@/infrastructure/repositories/SupabaseCronLogRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { CronMonitoringDashboard } from '@/presentation/components/admin/CronMonitoringDashboard';
import { BottomNav } from '@/presentation/components/admin/BottomNav';

export const metadata = {
  title: '크론 모니터링 | 관리자 | 티타임은 즐거워',
  description: 'Vercel Cron 실행 및 자동 동기화 이력을 모니터링합니다.',
};

export default async function AdminCronPage() {
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

  const cronLogRepo = new SupabaseCronLogRepository();
  const cronLogs = await cronLogRepo.getRecentLogs(50);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="cron" />
      <main className="flex-1 pb-20 md:pb-8">
        <CronMonitoringDashboard initialLogs={cronLogs} />
      </main>
      <BottomNav />
    </div>
  );
}
