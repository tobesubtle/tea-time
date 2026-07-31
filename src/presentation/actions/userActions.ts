'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/src/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/src/infrastructure/repositories/SupabaseUserRepository';
import { CreateUserInput, UpdateUserInput, UserRole } from '@/src/domain/entities/User';

const userRepository = new SupabaseUserRepository();

export async function createUserAction(inputOrPrevState: CreateUserInput | unknown, formData?: FormData) {
  try {
    if (formData instanceof FormData) {
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const role = (formData.get('role') as UserRole) || 'editor';

      if (!email) {
        return { error: '이메일 주소는 필수입니다.' };
      }

      await userRepository.createUser({ name, email, role });
      revalidatePath('/admin/users');
      redirect('/admin/users');
    } else {
      const input = inputOrPrevState as CreateUserInput;
      await userRepository.createUser(input);
      revalidatePath('/admin/users');
      return { success: true };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '사용자 생성 중 오류가 발생했습니다.';
    return { success: false, error: errorMsg, message: errorMsg };
  }
}

export async function updateUserAction(input: UpdateUserInput) {
  try {
    await userRepository.updateUser(input);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '사용자 정보 수정 실패';
    return { success: false, message: errorMsg };
  }
}

export async function deleteUserAction(idOrFormData: string | FormData) {
  try {
    let userId: string;
    if (idOrFormData instanceof FormData) {
      userId = idOrFormData.get('userId') as string;
    } else {
      userId = idOrFormData;
    }

    if (!userId) return { success: false, message: '사용자 ID가 필요합니다.' };

    await userRepository.deleteUser(userId);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '사용자 삭제 실패';
    return { success: false, message: errorMsg };
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '프로필 수정 중 오류가 발생했습니다.';
    return { success: false, error: errorMsg };
  }
}
