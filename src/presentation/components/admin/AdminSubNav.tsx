'use client';

import Link from 'next/link';

interface AdminSubNavProps {
  activeTab: 'users' | 'usage' | 'prompts';
}

export function AdminSubNav({ activeTab }: AdminSubNavProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-8">
      <div className="flex gap-6 text-sm font-semibold max-w-[1280px] mx-auto">
        <Link
          href="/admin/users"
          className={`py-3.5 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          사용자
        </Link>
        <Link
          href="/admin/usage"
          className={`py-3.5 border-b-2 transition-all ${
            activeTab === 'usage'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          사용량
        </Link>
        <Link
          href="/admin/prompts"
          className={`py-3.5 border-b-2 transition-all ${
            activeTab === 'prompts'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          프롬프트 관리
        </Link>
      </div>
    </div>
  );
}
