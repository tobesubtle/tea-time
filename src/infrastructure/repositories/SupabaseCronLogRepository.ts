import { createAdminClient } from '@/infrastructure/supabase/admin';
import { CronLog } from '@/domain/entities/CronLog';

export class SupabaseCronLogRepository {
  private getClient() {
    return createAdminClient();
  }

  // 1. 크론 실행 로그 추가
  async saveLog(params: {
    jobName: string;
    status: 'success' | 'failed';
    message?: string;
    updatedCount?: number;
    executionTimeMs?: number;
  }): Promise<boolean> {
    try {
      const client = this.getClient();
      const { error } = await client.from('cron_logs').insert({
        job_name: params.jobName,
        status: params.status,
        message: params.message || '',
        updated_count: params.updatedCount || 0,
        execution_time_ms: params.executionTimeMs || 0,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to insert cron log:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving cron log:', err);
      return false;
    }
  }

  // 2. 1년 지난 오래된 로그 자동 삭제 (Auto Cleanup)
  async pruneLogsOlderThanOneYear(): Promise<{ deletedCount: number }> {
    try {
      const client = this.getClient();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await client
        .from('cron_logs')
        .delete()
        .lt('created_at', oneYearAgo.toISOString())
        .select();

      if (error) {
        console.error('Failed to prune old cron logs:', error);
        return { deletedCount: 0 };
      }

      return { deletedCount: data?.length || 0 };
    } catch (err) {
      console.error('Error pruning old cron logs:', err);
      return { deletedCount: 0 };
    }
  }

  // 3. 관리자 모니터링용 최근 크론 로그 조회
  async getRecentLogs(limit = 20): Promise<CronLog[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('cron_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map((row) => ({
        id: row.id,
        jobName: row.job_name,
        status: row.status,
        message: row.message,
        updatedCount: row.updated_count,
        executionTimeMs: row.execution_time_ms,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Error fetching recent cron logs:', err);
      return [];
    }
  }
}
