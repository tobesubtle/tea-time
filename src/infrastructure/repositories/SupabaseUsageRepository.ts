import { UsageRepository } from '@/domain/repositories/UsageRepository';
import { UsageReport, ViewMode, UserUsageDetail } from '@/domain/entities/usage';
import { createAdminClient } from '../supabase/admin';

export class SupabaseUsageRepository implements UsageRepository {
  async getUsageReport(mode: ViewMode, targetDate: Date): Promise<UsageReport> {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    const periodLabel = mode === 'monthly' ? `${year}년 ${month}월` : `${year}년 ${month}월 ${day}일`;

    try {
      const adminClient = createAdminClient();

      // 1. 실제 사용자 목록 가져오기 (Supabase Auth Admin)
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const users = usersData?.users || [];

      // 2. 실제 프롬프트 실행 이력 가져오기 (prompt_history DB)
      const { data: historyData } = await adminClient
        .from('prompt_history')
        .select('*')
        .eq('is_deleted', false);

      const histories = historyData || [];

      // 3. 사용자별 통계 집계
      let grandTotalTokens = 0;
      let grandTotalCalls = histories.length;

      const userStatsMap: Record<string, { callCount: number; tokenUsage: number }> = {};

      histories.forEach((item) => {
        const uId = item.user_id;
        if (!userStatsMap[uId]) {
          userStatsMap[uId] = { callCount: 0, tokenUsage: 0 };
        }
        userStatsMap[uId].callCount += 1;

        // 프롬프트 글자 수 및 결과 글자 수 기반 추정 토큰 계산 (1자당 약 0.75 토큰)
        const promptLength = (item.final_prompt || '').length;
        const resultLength = (item.result_text || '').length;
        const estimatedTokens = Math.ceil((promptLength + resultLength) * 0.75);

        userStatsMap[uId].tokenUsage += estimatedTokens;
        grandTotalTokens += estimatedTokens;
      });

      // 4. UserUsageDetail 배열 생성
      const userDetails: UserUsageDetail[] = users.map((u) => {
        const uId = u.id;
        const stats = userStatsMap[uId] || { callCount: 0, tokenUsage: 0 };
        const name = u.user_metadata?.name || u.email?.split('@')[0] || '사용자';
        const email = u.email || '';

        const tokenPercentage = grandTotalTokens > 0
          ? Math.round((stats.tokenUsage / grandTotalTokens) * 100)
          : 0;

        return {
          userId: uId,
          userName: name,
          userEmail: email,
          initials: name.slice(0, 2).toUpperCase(),
          tokenUsage: stats.tokenUsage,
          formattedTokenUsage: stats.tokenUsage >= 1000
            ? `${(stats.tokenUsage / 1000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}k`
            : `${stats.tokenUsage}`,
          tokenPercentage: tokenPercentage,
          callCount: stats.callCount,
          formattedCallCount: stats.callCount >= 1000
            ? `${(stats.callCount / 1000).toFixed(1)}k`
            : `${stats.callCount}`,
        };
      });

      // 호출 수 기준으로 정렬
      userDetails.sort((a, b) => b.callCount - a.callCount);

      return {
        periodLabel,
        summary: {
          totalCalls: grandTotalCalls,
          callsChangePercent: 0,
          totalTokens: grandTotalTokens,
          tokensChangePercent: 0,
        },
        userDetails,
      };
    } catch (error) {
      console.error('Error fetching real usage report:', error);
      return {
        periodLabel,
        summary: {
          totalCalls: 0,
          callsChangePercent: 0,
          totalTokens: 0,
          tokensChangePercent: 0,
        },
        userDetails: [],
      };
    }
  }
}
