export type ViewMode = 'monthly' | 'daily';

export interface UsageSummary {
  totalCalls: number;
  callsChangePercent: number; // e.g. 12.5 for +12.5%
  totalTokens: number; // e.g. 45200000 (45.2M)
  tokensChangePercent: number; // e.g. 8.2 for +8.2%
}

export interface UserUsageDetail {
  userId: string;
  userName: string;
  userEmail: string;
  initials: string;
  tokenUsage: number; // e.g. 12500000 (12.5M)
  formattedTokenUsage: string; // e.g. "12.5M"
  tokenPercentage: number; // e.g. 45 (%)
  callCount: number; // e.g. 342000
  formattedCallCount: string; // e.g. "342k"
}

export interface UsageReport {
  periodLabel: string; // e.g. "2024년 5월"
  summary: UsageSummary;
  userDetails: UserUsageDetail[];
}
