import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { AdminEmailForm } from '@/presentation/components/admin/AdminEmailForm';

export const metadata = {
  title: '관리자 - 이메일 및 txt 파일 발송 | 티타임은 즐거워',
  description: '텍스트를 입력하여 현재 관리자 이메일로 본문과 txt 첨부파일을 전송합니다.',
};

export default async function AdminEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const currentUserEmail = user.email || '';
  const userRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
  const userName = user.user_metadata?.name || user.email?.split('@')[0];

  if (userRole !== 'admin') {
    redirect('/templates');
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="email" />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        <AdminEmailForm userEmail={currentUserEmail} />
      </main>
    </div>
  );
}
