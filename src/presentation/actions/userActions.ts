'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository';
import { UserRole } from '@/domain/entities/User';

const userRepository = new SupabaseUserRepository();

export async function createUserAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = (formData.get('role') as UserRole) || 'editor';

  if (!email) {
    return { error: '이메일 주소는 필수입니다.' };
  }

  try {
    await userRepository.createUser({
      name,
      email,
      role,
    });
  } catch (err: any) {
    return { error: err.message || '사용자 생성 중 오류가 발생했습니다.' };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function deleteUserAction(formData: FormData) {
  const userId = formData.get('userId') as string;

  if (!userId) return;

  try {
    await userRepository.deleteUser(userId);
    revalidatePath('/admin/users');
  } catch (err: any) {
    console.error('Failed to delete user:', err);
  }
}

export async function updateSelfProfileAction(formData: FormData) {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '인증되지 않은 사용자입니다.' };
  }

  try {
    const updateData: { password?: string; data?: { name: string } } = {
      data: { name },
    };

    if (password && password.trim().length >= 6) {
      updateData.password = password.trim();
    }

    const { error: authError } = await supabase.auth.updateUser(updateData);
    if (authError) {
      return { success: false, error: authError.message };
    }

    // Also update users table if entry exists
    await supabase.from('users').update({ name }).eq('id', user.id);

    revalidatePath('/', 'layout');
    return { success: true, message: '프로필 정보가 성공적으로 수정되었습니다.' };
  } catch (err: any) {
    return { success: false, error: err.message || '프로필 수정 중 오류가 발생했습니다.' };
  }
}
