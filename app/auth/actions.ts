'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository';
import { CreateUserInput, UpdateUserInput } from '@/domain/entities/User';

const authRepo = new SupabaseAuthRepository();
const userRepo = new SupabaseUserRepository();

export async function loginAction(email: string, password: string) {
  try {
    const res = await authRepo.login(email, password);
    if (!res) {
      return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '로그인 중 오류가 발생했습니다.' };
  }

  redirect('/templates');
}

export async function logoutAction() {
  await authRepo.logout();
  redirect('/login');
}

export async function createUserAction(input: CreateUserInput) {
  try {
    await userRepo.createUser(input);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '사용자 계정 생성 실패' };
  }
}

export async function updateUserAction(input: UpdateUserInput) {
  try {
    await userRepo.updateUser(input);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '사용자 정보 수정 실패' };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await userRepo.deleteUser(id);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '사용자 삭제 실패' };
  }
}
