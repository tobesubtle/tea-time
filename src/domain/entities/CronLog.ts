export interface CronLog {
  id: string;
  jobName: string;
  status: 'success' | 'failed';
  message?: string;
  updatedCount: number;
  executionTimeMs: number;
  createdAt: string;
}
