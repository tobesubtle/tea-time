import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import { LoginForm } from '@/src/presentation/components/auth/LoginForm';

export const metadata = {
  title: '로그인 | 티타임은 즐거워',
  description: '워크스페이스에 접속하기 위해 로그인하세요',
};

export default async function LoginPage() {
  try {
    const authRepo = new SupabaseAuthRepository();
    const currentUser = await authRepo.getCurrentUser();

    // 이미 로그인되어 있는 경우 초기화면(템플릿 목록)으로 이동
    if (currentUser) {
      redirect('/templates');
    }
  } catch (e: any) {
    if (e?.digest?.startsWith('NEXT_REDIRECT')) {
      throw e;
    }
    console.error('LoginPage auth check error:', e);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <LoginForm />
    </main>
  );
}
