import { Template } from '@/domain/entities/Template';
import { TemplateRepository } from '@/domain/repositories/TemplateRepository';
import { createAdminClient } from '../supabase/admin';

export class SupabaseTemplateRepository implements TemplateRepository {
  async getTemplates(category?: string, search?: string): Promise<Template[]> {
    try {
      const supabase = createAdminClient();
      let query = supabase.from('templates').select('*').order('created_at', { ascending: false });

      if (category && category !== '전체') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase templates fetch error:', error.message);
        return [];
      }

      return (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        aiModel: t.ai_model,
        category: t.category || '기타',
        description: t.description,
        createdBy: t.created_by,
        createdAt: t.created_at,
      }));
    } catch (e: any) {
      console.error('Supabase DB templates lookup error:', e?.message);
      return [];
    }
  }

  async getTemplateById(id: string): Promise<Template | null> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        aiModel: data.ai_model,
        category: data.category,
        description: data.description,
        createdBy: data.created_by,
        createdAt: data.created_at,
      };
    } catch (e: any) {
      console.error('Supabase DB template single lookup error:', e?.message);
      return null;
    }
  }

  async createTemplate(data: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
    const supabase = createAdminClient();

    const newTemplate = {
      title: data.title,
      content: data.content,
      ai_model: data.aiModel,
      category: data.category || '보고서',
      description: data.description,
    };

    const { data: inserted, error } = await supabase
      .from('templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) {
      console.error('Supabase template insert error:', error.message);
      throw new Error(`템플릿 저장 실패: ${error.message}`);
    }

    return {
      id: inserted.id,
      title: inserted.title,
      content: inserted.content,
      aiModel: inserted.ai_model,
      category: inserted.category,
      description: inserted.description,
      createdBy: inserted.created_by,
      createdAt: inserted.created_at,
    };
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    const supabase = createAdminClient();
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.aiModel !== undefined) updateData.ai_model = data.aiModel;

    const { data: updated, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      console.error('Supabase template update error:', error?.message);
      throw new Error(`템플릿 수정 실패: ${error?.message}`);
    }

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      aiModel: updated.ai_model,
      category: updated.category,
      description: updated.description,
      createdBy: updated.created_by,
      createdAt: updated.created_at,
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) {
      throw new Error(`템플릿 삭제 실패: ${error.message}`);
    }
  }
}
