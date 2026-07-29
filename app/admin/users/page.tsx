import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { UserList } from '@/presentation/components/admin/UserList';

export const metadata = {
  title: '사용자 관리 | 관리자 | 티타임은 즐거워',
  description: '시스템 사용자 및 계정 권한 관리',
};

export default async function AdminUsersPage() {
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

  const userRepo = new SupabaseUserRepository();
  const users = await userRepo.getUsers();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} userName={userName} userRole={userRole} />
      <AdminSubNav activeTab="users" />
      <main className="flex-1 pb-8">
        <UserList initialUsers={users} />
      </main>
    </div>
  );
}
