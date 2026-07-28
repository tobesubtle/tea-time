'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/infrastructure/supabase/server';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 모두 입력해주세요.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: '로그인에 실패했습니다: ' + error.message };
  }

  redirect('/templates');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('user_email');
  cookieStore.delete('user_role');

  redirect('/login');
}
