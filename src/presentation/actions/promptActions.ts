'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';
import { runGeminiPrompt } from '@/infrastructure/api/geminiClient';

const historyRepo = new SupabasePromptHistoryRepository();

// 1. 변수를 치환하여 완성된 프롬프트로 /prompts/run으로 이동
export async function preparePromptAction(formData: FormData) {
  const templateId = formData.get('templateId') as string;
  const templateContent = formData.get('templateContent') as string;
  const title = (formData.get('title') as string) || '새 프롬프트';
  const aiModel = formData.get('aiModel') as string;
  const attachedFilesJson = (formData.get('attachedFilesJson') as string) || '[]';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const variables: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('var_')) {
      const varName = key.replace('var_', '');
      variables[varName] = value as string;
    }
  }

  // 첨부파일 JSON도 variables에 보관
  variables['_attachedFiles'] = attachedFilesJson;

  // {{변수}} 치환 (입력되지 않은 변수는 {{변수명}} 원본 유지)
  let finalPrompt = templateContent;
  Object.entries(variables).forEach(([varName, val]) => {
    if (varName !== '_attachedFiles' && val && val.trim() !== '') {
      const regex = new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
      finalPrompt = finalPrompt.replace(regex, val);
    }
  });

  let draftId = '';
  if (user) {
    const draftRecord = await historyRepo.createPromptHistory({
      userId: user.id,
      templateId: templateId || undefined,
      title: title,
      inputVariables: variables,
      finalPrompt,
      resultText: '',
      aiModel: aiModel || 'gemini-3.6-flash',
    });
    draftId = draftRecord.id;
  }

  const queryParams = new URLSearchParams({
    draftId,
    templateId: templateId || '',
    title: title,
    aiModel: aiModel || 'gemini-3.6-flash',
  });

  redirect(`/prompts/run?${queryParams.toString()}`);
}

// 2. 최종 프롬프트 실행 및 Gemini API 호출 후 결과 페이지(/prompts/result/[id])로 이동
export async function executePromptAction(formData: FormData) {
  const draftId = formData.get('draftId') as string;
  const templateId = formData.get('templateId') as string;
  const title = formData.get('title') as string;
  const finalPrompt = formData.get('finalPrompt') as string;
  const aiModel = formData.get('aiModel') as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!finalPrompt) {
    throw new Error('프롬프트 내용을 입력해주세요.');
  }

  const variablesRaw = formData.get('inputVariables') as string;
  let inputVariables: Record<string, string> = {};
  if (variablesRaw) {
    try {
      inputVariables = JSON.parse(variablesRaw);
    } catch {}
  }

  // Gemini API 호출
  const resultText = await runGeminiPrompt(finalPrompt, aiModel, user.email);

  let recordId = draftId;

  if (draftId) {
    // 기존 임시 이력 업데이트
    await historyRepo.updatePromptHistory(draftId, {
      title: title || '새 프롬프트 실행',
      finalPrompt,
      resultText,
      aiModel: aiModel || 'gemini-3.6-flash',
    });
  } else {
    // 신규 이력 생성
    const record = await historyRepo.createPromptHistory({
      userId: user.id,
      templateId: templateId || undefined,
      title: title || '새 프롬프트 실행',
      inputVariables,
      finalPrompt,
      resultText,
      aiModel: aiModel || 'gemini-3.6-flash',
    });
    recordId = record.id;
  }

  revalidatePath('/prompts/result/' + recordId);
  redirect(`/prompts/result/${recordId}`);
}

// 3. 결과 텍스트 수정 및 좋아요 업데이트
export async function updatePromptResultAction(formData: FormData) {
  const historyId = formData.get('historyId') as string;
  const resultText = formData.get('resultText') as string;
  const likeCountStr = formData.get('likeCount') as string;

  if (!historyId) return;

  const updateData: any = {};
  if (resultText !== null && resultText !== undefined) {
    updateData.resultText = resultText;
  }
  if (likeCountStr !== null && likeCountStr !== undefined) {
    updateData.likeCount = parseInt(likeCountStr, 10);
  }

  await historyRepo.updatePromptHistory(historyId, updateData);
  revalidatePath(`/prompts/result/${historyId}`);
}

// 4. 프롬프트 이력 삭제 (Soft Delete)
export async function deletePromptHistoryAction(id: string) {
  if (!id) {
    return { success: false, message: '삭제할 ID가 없습니다.' };
  }

  try {
    await historyRepo.deletePromptHistory(id);
    revalidatePath('/prompts');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '삭제 중 오류 발생' };
  }
}

// 5. 프롬프트 이력 영구 삭제 (Hard Delete)
export async function hardDeletePromptHistoriesAction(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { success: false, message: '삭제할 대상이 선택되지 않았습니다.' };
  }

  try {
    await historyRepo.hardDeletePromptHistories(ids);
    revalidatePath('/admin/prompts');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || '영구 삭제 중 오류가 발생했습니다.' };
  }
}
