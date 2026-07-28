import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { UserList } from '@/presentation/components/admin/UserList';
import { BottomNav } from '@/presentation/components/admin/BottomNav';

export const metadata = {
  title: '사용자 관리 | 관리자 | 티타임은 즐거워',
  description: '시스템 사용자 및 계정 권한 관리',
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Supabase Auth 세션이 없는 경우 mock 쿠키 세션 확인
  let currentUserEmail = user?.email;
  let userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';

  if (!user) {
    // 세션이 없는 비로그인 유저는 로그인 페이지로 리다이렉트
    redirect('/login');
  }

  // 일반 사용자가 관리자 페이지 진입 시 차단 및 초기화면으로 이동
  if (userRole === 'user') {
    redirect('/templates');
  }

  const userRepo = new SupabaseUserRepository();
  const users = await userRepo.getUsers();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} />
      <AdminSubNav activeTab="users" />
      <main className="flex-1 pb-20 md:pb-8">
        <UserList initialUsers={users} />
      </main>
      <BottomNav />
    </div>
  );
}
