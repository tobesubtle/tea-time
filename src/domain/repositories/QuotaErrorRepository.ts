import { QuotaErrorLog } from '../entities/QuotaErrorLog';

export interface QuotaErrorRepository {
  createLog(log: Omit<QuotaErrorLog, 'id' | 'createdAt'>): Promise<QuotaErrorLog>;
  getRecentLogs(limit?: number): Promise<QuotaErrorLog[]>;
  resolveLog(id: string): Promise<boolean>;
}
