import { createClient } from '../supabase/server';
import { QuotaErrorLog } from '@/domain/entities/QuotaErrorLog';
import { QuotaErrorRepository } from '@/domain/repositories/QuotaErrorRepository';

export class SupabaseQuotaErrorRepository implements QuotaErrorRepository {
  async createLog(log: Omit<QuotaErrorLog, 'id' | 'createdAt'>): Promise<QuotaErrorLog> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('quota_error_logs')
      .insert([
        {
          user_email: log.userEmail || null,
          model_name: log.modelName,
          error_message: log.errorMessage,
          status: log.status || 'notified',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert quota error log:', error);
      return {
        id: 'fallback-id',
        userEmail: log.userEmail,
        modelName: log.modelName,
        errorMessage: log.errorMessage,
        status: log.status || 'notified',
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      userEmail: data.user_email,
      modelName: data.model_name,
      errorMessage: data.error_message,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async getRecentLogs(limit = 50): Promise<QuotaErrorLog[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('quota_error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('Failed to fetch quota error logs:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      userEmail: item.user_email,
      modelName: item.model_name,
      errorMessage: item.error_message,
      status: item.status,
      createdAt: item.created_at,
    }));
  }

  async resolveLog(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('quota_error_logs')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      console.error('Failed to resolve quota log:', error);
      return false;
    }

    return true;
  }
}
