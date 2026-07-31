'use server';

import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';

const authRepo = new SupabaseAuthRepository();

export async function loginAction(email: string, password: string) {
  try {
    const res = await authRepo.login(email, password);
    if (!res) {
      return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
    return { success: false, message: errorMessage };
  }

  redirect('/templates');
}

export async function logoutAction() {
  await authRepo.logout();
  redirect('/login');
}
