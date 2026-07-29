'use client';

import { useState } from 'react';
import { CronLog } from '@/domain/entities/CronLog';
import { Clock, CheckCircle2, XCircle, Activity, Server, ShieldCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/presentation/components/common/Badge';
import { Button } from '@/presentation/components/common/Button';

interface CronMonitoringDashboardProps {
  initialLogs: CronLog[];
}

export function CronMonitoringDashboard({ initialLogs }: CronMonitoringDashboardProps) {
  const [logs, setLogs] = useState<CronLog[]>(initialLogs);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (filterStatus === 'success') return log.status === 'success';
    if (filterStatus === 'failed') return log.status === 'failed';
    return true;
  });

  const totalCount = logs.length;
  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  const avgDuration =
    totalCount > 0
      ? Math.round(logs.reduce((acc, curr) => acc + curr.executionTimeMs, 0) / totalCount)
      : 0;

  const latestLog = logs[0];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/cron/sync-gemini-models', { cache: 'no-store' });
      if (res.ok) {
        // 새로고침 완료 후 페이지 리로드
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to trigger cron manually:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#4648d4] font-semibold text-xs mb-1">
            <Server className="w-4 h-4" />
            <span>Vercel Cron Automation & Monitoring</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
            크론 실행 및 자동 동기화 모니터링
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gemini AI 모델 자동 수집 및 데이터베이스 동기화 실행 이력을 모니터링합니다. (1년 경과 로그 자동 삭제)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon="refresh"
          isLoading={isRefreshing}
          onClick={handleRefresh}
        >
          {isRefreshing ? '수동 실행 중...' : '지금 수동 동기화 실행'}
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Last Status */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>최근 실행 상태</span>
            <Activity className="w-4 h-4 text-[#4648d4]" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {latestLog?.status === 'success' ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">성공</span>
              </>
            ) : latestLog?.status === 'failed' ? (
              <>
                <XCircle className="w-6 h-6 text-rose-500" />
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">실패</span>
              </>
            ) : (
              <span className="text-sm font-medium text-zinc-400">이력 없음</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            {latestLog
              ? new Date(latestLog.createdAt).toLocaleString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-'}
          </p>
        </div>

        {/* Card 2: Total Executions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>총 실행 기록 수</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white pt-1">
            {totalCount} <span className="text-xs font-normal text-zinc-500">건</span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            성공: {successCount}건 / 실패: {failedCount}건
          </p>
        </div>

        {/* Card 3: Average Duration */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>평균 실행 소요 시간</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white pt-1">
            {avgDuration} <span className="text-xs font-normal text-zinc-500">ms</span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">API 응답 지연 평균값</p>
        </div>

        {/* Card 4: Retention Policy */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>보관 및 정리 정책</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white pt-1">
            1년 보관 (Auto Prune)
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">365일 초과 로그 자동 삭제</p>
        </div>
      </div>

      {/* Logs Table / List Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="font-bold text-base text-zinc-900 dark:text-white">
            실행 이력 상세 목록 ({filteredLogs.length}건)
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              전체 ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('success')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              성공 ({successCount})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'failed'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              실패 ({failedCount})
            </button>
          </div>
        </div>

        {/* Log List */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
            조건에 맞는 크론 실행 기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800 gap-3 transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {log.jobName}
                      </span>
                      <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                        {log.status === 'success' ? '성공' : '실패'}
                      </Badge>
                      {log.updatedCount > 0 && (
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-md font-medium">
                          {log.updatedCount}개 모델 동기화
                        </span>
                      )}
                    </div>
                    {log.message && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                        {log.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-zinc-500 dark:text-zinc-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200/50 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {new Date(log.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">
                    소요시간: {log.executionTimeMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
