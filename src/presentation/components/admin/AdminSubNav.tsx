'use client';

import Link from 'next/link';

interface AdminSubNavProps {
  activeTab: 'users' | 'usage' | 'prompts' | 'cron' | 'quota' | 'report' | 'email';
}

export function AdminSubNav({ activeTab }: AdminSubNavProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-8">
      <div className="flex gap-6 text-sm font-semibold max-w-[1280px] mx-auto overflow-x-auto">
        <Link
          href="/admin/users"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          사용자
        </Link>
        <Link
          href="/admin/usage"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'usage'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          사용량
        </Link>
        <Link
          href="/admin/prompts"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'prompts'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          프롬프트 관리
        </Link>
        <Link
          href="/admin/cron"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cron'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          크론 모니터링
        </Link>
        <Link
          href="/admin/quota"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quota'
              ? 'border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>쿼터/에러 모니터링</span>
        </Link>
        <Link
          href="/admin/email"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'email'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>📧 이메일 발송</span>
        </Link>
        <Link
          href="/admin/report"
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'report'
              ? 'border-[#4338ca] text-[#4338ca] font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>📄 최종 보고서</span>
        </Link>
      </div>
    </div>
  );
}
