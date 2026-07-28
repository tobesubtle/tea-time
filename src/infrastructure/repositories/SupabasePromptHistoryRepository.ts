import { PromptHistory } from '@/domain/entities/PromptHistory';
import { PromptHistoryRepository } from '@/domain/repositories/PromptHistoryRepository';
import { createAdminClient } from '../supabase/admin';

export class SupabasePromptHistoryRepository implements PromptHistoryRepository {
  async createPromptHistory(data: Omit<PromptHistory, 'id' | 'createdAt'>): Promise<PromptHistory> {
    const supabase = createAdminClient();

    const newRecord = {
      user_id: data.userId,
      template_id: data.templateId || null,
      title: data.title || null,
      input_variables: data.inputVariables || {},
      final_prompt: data.finalPrompt,
      result_text: data.resultText || null,
      ai_model: data.aiModel || 'gemini-3.6-flash',
      like_count: data.likeCount || 0,
      is_deleted: false,
    };

    const { data: inserted, error } = await supabase
      .from('prompt_history')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.warn('DB prompt_history insert fallback:', error.message);
      return {
        id: 'history-' + Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: inserted.id,
      userId: inserted.user_id,
      templateId: inserted.template_id,
      title: inserted.title,
      inputVariables: inserted.input_variables,
      finalPrompt: inserted.final_prompt,
      resultText: inserted.result_text,
      aiModel: inserted.ai_model,
      likeCount: inserted.like_count,
      isDeleted: inserted.is_deleted,
      createdAt: inserted.created_at,
    };
  }

  async getPromptHistoryById(id: string): Promise<PromptHistory | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      templateId: data.template_id,
      title: data.title,
      inputVariables: data.input_variables,
      finalPrompt: data.final_prompt,
      resultText: data.result_text,
      aiModel: data.ai_model,
      likeCount: data.like_count,
      isDeleted: data.is_deleted,
      createdAt: data.created_at,
    };
  }

  async updatePromptHistory(id: string, data: Partial<PromptHistory>): Promise<PromptHistory> {
    const supabase = createAdminClient();
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.finalPrompt !== undefined) updateData.final_prompt = data.finalPrompt;
    if (data.resultText !== undefined) updateData.result_text = data.resultText;
    if (data.likeCount !== undefined) updateData.like_count = data.likeCount;
    if (data.isDeleted !== undefined) updateData.is_deleted = data.isDeleted;

    const { data: updated, error } = await supabase
      .from('prompt_history')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`프롬프트 이력 수정 실패: ${error?.message}`);
    }

    return {
      id: updated.id,
      userId: updated.user_id,
      templateId: updated.template_id,
      title: updated.title,
      inputVariables: updated.input_variables,
      finalPrompt: updated.final_prompt,
      resultText: updated.result_text,
      aiModel: updated.ai_model,
      likeCount: updated.like_count,
      isDeleted: updated.is_deleted,
      createdAt: updated.created_at,
    };
  }

  async deletePromptHistory(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('prompt_history')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Supabase prompt_history delete error:', error.message);
      throw new Error(`프롬프트 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  async getRecentHistoryByTemplateId(templateId: string, _userId: string): Promise<PromptHistory[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      templateId: item.template_id,
      title: item.title,
      inputVariables: item.input_variables,
      finalPrompt: item.final_prompt,
      resultText: item.result_text,
      aiModel: item.ai_model,
      likeCount: item.like_count,
      isDeleted: item.is_deleted,
      createdAt: item.created_at,
    }));
  }

  async getUserPromptHistories(_userId?: string, templateId?: string, search?: string): Promise<PromptHistory[]> {
    const supabase = createAdminClient();
    let query = supabase
      .from('prompt_history')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (templateId && templateId !== 'all') {
      query = query.eq('template_id', templateId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,final_prompt.ilike.%${search}%,result_text.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Supabase prompt_history query error:', error?.message);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      templateId: item.template_id,
      title: item.title,
      inputVariables: item.input_variables,
      finalPrompt: item.final_prompt,
      resultText: item.result_text,
      aiModel: item.ai_model,
      likeCount: item.like_count,
      isDeleted: item.is_deleted,
      createdAt: item.created_at,
    }));
  }

  async getDeletedPromptHistories(userId?: string, templateId?: string, search?: string): Promise<PromptHistory[]> {
    const supabase = createAdminClient();
    let query = supabase
      .from('prompt_history')
      .select('*')
      .eq('is_deleted', true)
      .order('created_at', { ascending: false });

    if (userId && userId !== 'all') {
      query = query.eq('user_id', userId);
    }

    if (templateId && templateId !== 'all') {
      query = query.eq('template_id', templateId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,final_prompt.ilike.%${search}%,result_text.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Supabase deleted prompt_history query error:', error?.message);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      templateId: item.template_id,
      title: item.title,
      inputVariables: item.input_variables,
      finalPrompt: item.final_prompt,
      resultText: item.result_text,
      aiModel: item.ai_model,
      likeCount: item.like_count,
      isDeleted: item.is_deleted,
      createdAt: item.created_at,
    }));
  }

  async hardDeletePromptHistories(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('prompt_history')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Supabase prompt_history hard delete error:', error.message);
      throw new Error(`영구 삭제 실패: ${error.message}`);
    }
  }
}
