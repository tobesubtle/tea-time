'use client';

import { useState } from 'react';
import { ViewMode, UsageReport } from '@/domain/entities/usage';
import { ChevronLeft, ChevronRight, TrendingUp, Cpu, PieChart, ChevronDown } from 'lucide-react';

interface UsageDashboardProps {
  initialReport: UsageReport;
}

export function UsageDashboard({ initialReport }: UsageDashboardProps) {
  const [mode, setMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1)); // 2024년 5월
  const [report, setReport] = useState<UsageReport>(initialReport);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // 날짜 변경 함수
  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (mode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);

    // 가상 데이터 계산/업데이트
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    const periodLabel = mode === 'monthly' ? `${year}년 ${month}월` : `${year}년 ${month}월 ${day}일`;

    const delta = (month + day) % 5;
    const callsDelta = (delta - 2) * 8000;
    const tokensDelta = (delta - 2) * 400000;

    setReport({
      periodLabel,
      summary: {
        totalCalls: Math.max(100000, initialReport.summary.totalCalls + callsDelta),
        callsChangePercent: +(initialReport.summary.callsChangePercent + (delta - 2) * 0.4).toFixed(1),
        totalTokens: Math.max(10000000, initialReport.summary.totalTokens + tokensDelta),
        tokensChangePercent: +(initialReport.summary.tokensChangePercent + (delta - 2) * 0.3).toFixed(1),
      },
      userDetails: initialReport.userDetails,
    });
  };

  const handleModeToggle = (newMode: ViewMode) => {
    setMode(newMode);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const periodLabel = newMode === 'monthly' ? `${year}년 ${month}월` : `${year}년 ${month}월 ${day}일`;

    setReport((prev) => ({
      ...prev,
      periodLabel,
    }));
  };

  const displayedUsers = showAllUsers ? report.userDetails : report.userDetails.slice(0, 3);

  const getAvatarBg = (initials: string) => {
    switch (initials) {
      case 'SJ':
        return 'bg-[#ffdcbd] text-[#7a532a]';
      case 'EM':
        return 'bg-[#2c3e50] text-[#96a9be]';
      case 'BG':
        return 'bg-[#3b3f25] text-[#a6aa89]';
      default:
        return 'bg-zinc-200 text-zinc-700';
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6 pb-24 md:pb-8">
      {/* Header & Mode Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1d] dark:text-white tracking-tight">
            관리자 - 사용량 통계
          </h1>
          <p className="text-sm text-[#43474c] dark:text-zinc-400 mt-1">
            시스템 전반의 API 호출 및 토큰 사용 현황을 확인합니다.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-[#f3f4f5] dark:bg-zinc-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleModeToggle('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              mode === 'monthly'
                ? 'bg-white dark:bg-zinc-900 text-[#162839] dark:text-white shadow-sm font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            월별 조회
          </button>
          <button
            onClick={() => handleModeToggle('daily')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              mode === 'daily'
                ? 'bg-white dark:bg-zinc-900 text-[#162839] dark:text-white shadow-sm font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            일별 조회
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 w-fit mx-auto shadow-sm">
        <button
          onClick={() => handleDateChange('prev')}
          className="flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full p-1 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-base text-zinc-900 dark:text-white px-3">
          {report.periodLabel}
        </span>
        <button
          onClick={() => handleDateChange('next')}
          className="flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full p-1 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 총 호출 횟수 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              총 호출 횟수
            </span>
            <div className="bg-[#2c3e50] text-[#96a9be] p-2 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#162839] dark:text-white tracking-tight">
              {report.summary.totalCalls.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[#7d562d] font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>+{report.summary.callsChangePercent}% vs 지난달</span>
            </div>
          </div>
        </div>

        {/* Card 2: 총 토큰 사용량 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              총 토큰 사용량
            </span>
            <div className="bg-[#2c3e50] text-[#96a9be] p-2 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#162839] dark:text-white tracking-tight">
              {(report.summary.totalTokens / 1000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}k
            </span>
            <div className="flex items-center gap-1 mt-1 text-[#7d562d] font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>+{report.summary.tokensChangePercent}% vs 지난달</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown Table / List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          사용자별 사용량 상세
        </h2>

        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2 px-2">
            <div className="col-span-5 md:col-span-4">사용자</div>
            <div className="col-span-4 md:col-span-6">사용 비중 (토큰)</div>
            <div className="col-span-3 md:col-span-2 text-right">호출 수</div>
          </div>

          {/* User Row Items */}
          {displayedUsers.map((user) => (
            <div
              key={user.userId}
              className="grid grid-cols-12 gap-2 items-center py-2.5 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <div className="col-span-5 md:col-span-4 flex items-center gap-3 truncate">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(
                    user.initials
                  )}`}
                >
                  {user.initials}
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  {user.userName}
                </span>
              </div>

              <div className="col-span-4 md:col-span-6 flex items-center gap-3">
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#7d562d] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${user.tokenPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500 font-medium hidden md:inline-block w-12 text-right">
                  {user.formattedTokenUsage}
                </span>
              </div>

              <div className="col-span-3 md:col-span-2 text-right text-sm font-medium text-zinc-900 dark:text-white">
                {user.formattedCallCount}
              </div>
            </div>
          ))}
        </div>

        {/* Expand / Collapse Button */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showAllUsers ? '접기' : '더 보기'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showAllUsers ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
