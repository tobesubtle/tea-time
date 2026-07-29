import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseQuotaErrorRepository } from '@/infrastructure/repositories/SupabaseQuotaErrorRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { QuotaMonitoringDashboard } from '@/presentation/components/admin/QuotaMonitoringDashboard';

export const metadata = {
  title: '쿼터/에러 모니터링 | 관리자 | 티타임은 즐거워',
  description: 'Gemini API 쿼터 및 비용 초과 에러 모니터링 대시보드입니다.',
};

export default async function AdminQuotaPage() {
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

  const quotaRepo = new SupabaseQuotaErrorRepository();
  const quotaLogs = await quotaRepo.getRecentLogs(50);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="quota" />
      <main className="flex-1 pb-8">
        <QuotaMonitoringDashboard initialLogs={quotaLogs} />
      </main>
    </div>
  );
}
