import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import CreateTemplateClientView from './CreateTemplateClientView';

export const revalidate = 0;

export default async function CreateTemplatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = user.user_metadata?.role || user.app_metadata?.role || 'user';

  // 일반 사용자(user)는 템플릿 생성 페이지 접근 차단
  if (role === 'user') {
    redirect('/templates');
  }

  return <CreateTemplateClientView />;
}
