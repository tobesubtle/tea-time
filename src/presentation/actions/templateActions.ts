'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseTemplateRepository } from '@/infrastructure/repositories/SupabaseTemplateRepository';

const templateRepository = new SupabaseTemplateRepository();

async function verifyCanManageTemplate() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요한 기능입니다.');
  }

  const role = user.user_metadata?.role || user.app_metadata?.role || 'user';

  if (role === 'user') {
    throw new Error('템플릿 생성/수정/삭제 권한이 없습니다. (편집자 또는 관리자 권한이 필요합니다.)');
  }

  return user;
}

export async function createTemplateAction(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const aiModel = formData.get('aiModel') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    return { error: '제목과 프롬프트 내용은 필수 항목입니다.' };
  }

  try {
    await verifyCanManageTemplate();
    await templateRepository.createTemplate({
      title,
      aiModel: aiModel || 'gemini-3.6-flash',
      category: category || '보고서',
      description,
      content,
    });
  } catch (err: any) {
    return { error: err.message || '템플릿 생성 실패' };
  }

  revalidatePath('/templates');
  redirect('/templates');
}

export async function updateTemplateAction(id: string, data: { title?: string; description?: string; content?: string }) {
  if (!id) {
    return { success: false, message: '템플릿 ID가 누락되었습니다.' };
  }

  try {
    await verifyCanManageTemplate();
    await templateRepository.updateTemplate(id, data);
    revalidatePath('/prompts/create');
    revalidatePath('/templates');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || '템플릿 수정 실패' };
  }
}

export async function deleteTemplateAction(id: string) {
  if (!id) {
    return { success: false, message: '템플릿 ID가 누락되었습니다.' };
  }

  try {
    await verifyCanManageTemplate();
    await templateRepository.deleteTemplate(id);
    revalidatePath('/prompts/create');
    revalidatePath('/templates');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || '템플릿 삭제 실패' };
  }
}

export async function duplicateTemplateAction(id: string) {
  if (!id) {
    return { success: false, message: '템플릿 ID가 누락되었습니다.' };
  }

  try {
    await verifyCanManageTemplate();
    const template = await templateRepository.getTemplateById(id);
    if (!template) {
      return { success: false, message: '템플릿을 찾을 수 없습니다.' };
    }

    const newTemplate = await templateRepository.createTemplate({
      title: `${template.title} (복사본)`,
      content: template.content,
      description: template.description,
      category: template.category,
      aiModel: template.aiModel,
    });

    revalidatePath('/prompts/create');
    revalidatePath('/templates');
    return { success: true, newTemplateId: newTemplate.id };
  } catch (err: any) {
    return { success: false, message: err.message || '템플릿 복제 실패' };
  }
}
