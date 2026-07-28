import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository';
import { SupabaseTemplateRepository } from '@/infrastructure/repositories/SupabaseTemplateRepository';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { AdminSubNav } from '@/presentation/components/admin/AdminSubNav';
import { DeletedPromptList } from '@/presentation/components/admin/DeletedPromptList';
import { BottomNav } from '@/presentation/components/admin/BottomNav';

export const metadata = {
  title: '소프트 삭제된 프롬프트 관리 | 관리자 | 티타임은 즐거워',
  description: '사용자가 삭제 처리한 프롬프트 실행 내역 조회 및 영구 삭제',
};

export default async function AdminPromptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserEmail = user?.email;
  let userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';

  if (!user) {
    redirect('/login');
  }

  // 일반 사용자가 관리자 페이지 진입 시 차단 및 초기화면으로 이동
  if (userRole === 'user') {
    redirect('/templates');
  }

  const historyRepo = new SupabasePromptHistoryRepository();
  const deletedHistories = await historyRepo.getDeletedPromptHistories();

  const userRepo = new SupabaseUserRepository();
  const users = await userRepo.getUsers();

  const templateRepo = new SupabaseTemplateRepository();
  const templates = await templateRepo.getTemplates();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col font-sans">
      <AdminHeader userEmail={currentUserEmail} />
      <AdminSubNav activeTab="prompts" />
      <main className="flex-1 pb-20 md:pb-8">
        <DeletedPromptList
          initialHistories={deletedHistories}
          users={users}
          templates={templates}
        />
      </main>
      <BottomNav />
    </div>
  );
}
