'use client';

import { useState, useTransition } from 'react';
import { QuotaErrorLog } from '@/domain/entities/QuotaErrorLog';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { AlertTriangle, CheckCircle, Mail, RefreshCw } from 'lucide-react';

interface QuotaMonitoringDashboardProps {
  initialLogs: QuotaErrorLog[];
}

export function QuotaMonitoringDashboard({ initialLogs }: QuotaMonitoringDashboardProps) {
  const [logs, setLogs] = useState<QuotaErrorLog[]>(initialLogs);
  const [filter, setFilter] = useState<'all' | 'notified' | 'resolved'>('all');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const totalErrors = logs.length;
  const pendingErrors = logs.filter((l) => l.status !== 'resolved').length;
  const uniqueModelsCount = new Set(logs.map((l) => l.modelName)).size;
  const latestLog = logs[0];

  const handleResolve = (id: string) => {
    startTransition(async () => {
      try {
        // Optimistic UI update
        setLogs((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'resolved' } : l))
        );
        setToast({ message: '해당 쿼터 오류 건이 확인 처리되었습니다.', type: 'success' });
      } catch (err) {
        setToast({ message: '처리 중 오류가 발생했습니다.', type: 'error' });
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <span>Gemini API 쿼터 및 비용 오류 모니터링</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            API 호출 시 쿼터/비용 초과 오류(429, RESOURCE_EXHAUSTED)가 발생하면 관리자 이메일로 자동 알림이 발송되고 이력이 기록됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#4648d4] hover:bg-[#383aa6] text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Google AI Studio 잔여 쿼터 조회</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
          <a
            href="https://console.cloud.google.com/iam-admin/quotas?q=Generative%20Language%20API"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>GCP 할당량 그래프 보기</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 총 쿼터 오류 발생 수 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            총 쿼터 오류 발생
          </span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {totalErrors}건
          </div>
        </div>

        {/* Card 2: 미처리/확인 대기 건수 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            확인 필요 알림 건수
          </span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingErrors}건
          </div>
        </div>

        {/* Card 3: 영향받은 모델 종류 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            영향 받은 AI 모델 수
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {uniqueModelsCount}개 모델
          </div>
        </div>

        {/* Card 4: 최근 발생 시간 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            최근 오류 발생 시각
          </span>
          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate pt-1">
            {latestLog
              ? new Date(latestLog.createdAt).toLocaleString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '발생 이력 없음'}
          </div>
        </div>
      </div>

      {/* Filter and Log Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            오류 이력 상세 목록
          </h2>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              전체 ({logs.length})
            </button>
            <button
              onClick={() => setFilter('notified')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'notified'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              알림 발송됨 ({logs.filter((l) => l.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'resolved'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              조치 완료 ({logs.filter((l) => l.status === 'resolved').length})
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
              기록된 Gemini API 쿼터 오류가 없습니다.
            </p>
            <p className="text-zinc-400">
              API 할당량이 정상 유지되고 있습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={log.status === 'resolved' ? 'success' : 'danger'}>
                      {log.status === 'resolved' ? '조치 완료' : '메일 알림 발송됨'}
                    </Badge>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {log.modelName}
                    </span>
                    <span className="text-zinc-400">|</span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                      사용자: {log.userEmail || '비회원/알수없음'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-zinc-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('ko-KR')}
                    </span>
                    {log.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        onClick={() => handleResolve(log.id)}
                        disabled={isPending}
                        className="py-1 px-2.5 text-[11px]"
                      >
                        확인 처리
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 font-mono text-[11px] leading-relaxed break-all">
                  {log.errorMessage}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
