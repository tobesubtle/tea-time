'use client';

import { Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/presentation/actions/authActions';

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4 md:px-8 h-16 w-full sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button className="md:hidden flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/admin/users" className="text-xl md:text-2xl font-bold text-[#162839] dark:text-white tracking-tight">
          티타임은 즐거워
        </Link>
      </div>

      {/* Desktop Main Navigation */}
      <nav className="hidden md:flex items-center h-full gap-2 text-sm">
        <Link
          href="/templates"
          className="h-full flex items-center text-zinc-500 hover:text-zinc-900 px-4 transition-colors font-medium"
        >
          템플릿
        </Link>
        <Link
          href="/prompts"
          className="h-full flex items-center text-zinc-500 hover:text-zinc-900 px-4 transition-colors font-medium"
        >
          히스토리
        </Link>
        <Link
          href="/admin/users"
          className="h-full flex items-center text-[#4648d4] border-b-2 border-[#4648d4] font-bold px-4"
        >
          관리자
        </Link>
      </nav>

      {/* User Profile Avatar & Logout */}
      <div className="flex items-center gap-3">
        <form action={logoutAction}>
          <button
            type="submit"
            title="로그아웃"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </form>

        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs shadow-sm">
          {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'UP'}
        </div>
      </div>
    </header>
  );
}
