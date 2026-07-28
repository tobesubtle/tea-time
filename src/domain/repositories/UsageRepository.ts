import { UsageReport, ViewMode } from '../entities/usage';

export interface UsageRepository {
  getUsageReport(mode: ViewMode, targetDate: Date): Promise<UsageReport>;
}
