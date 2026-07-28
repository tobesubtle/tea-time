'use client';

import Link from 'next/link';
import { logoutAction } from '@/presentation/actions/authActions';

interface HeaderProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
  activeTab?: 'templates' | 'prompts' | 'admin';
}

export default function Header({ userRole, userEmail, userName, activeTab }: HeaderProps) {
  const isAdmin = userRole === 'admin';
  const displayName = isAdmin ? '관리자' : (userName || userEmail?.split('@')[0] || '사용자');

  return (
    <header className="bg-white text-[#091426] w-full top-0 border-b border-[#c5c6cd]/40 flex justify-between items-center px-4 md:px-8 h-16 sticky z-40">
      <div className="flex items-center gap-4">
        <Link href="/templates" className="font-bold text-lg md:text-xl text-[#091426] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4648d4]">auto_awesome</span>
          <span>티타임은 즐거워</span>
        </Link>
      </div>

      <nav className="hidden md:flex gap-6 h-full items-center text-sm font-medium">
        <Link
          href="/templates"
          className={`h-full flex items-center px-2 transition-colors ${
            activeTab === 'templates'
              ? 'text-[#4648d4] border-b-2 border-[#4648d4] font-semibold'
              : 'text-[#45474c] hover:text-[#091426]'
          }`}
        >
          템플릿
        </Link>
        <Link
          href="/prompts"
          className={`h-full flex items-center px-2 transition-colors ${
            activeTab === 'prompts'
              ? 'text-[#4648d4] border-b-2 border-[#4648d4] font-semibold'
              : 'text-[#45474c] hover:text-[#091426]'
          }`}
        >
          히스토리
        </Link>
        {isAdmin && (
          <Link
            href="/admin/users"
            className={`h-full flex items-center px-2 transition-colors ${
              activeTab === 'admin'
                ? 'text-[#4648d4] border-b-2 border-[#4648d4] font-semibold'
                : 'text-[#45474c] hover:text-[#091426]'
            }`}
          >
            관리자
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#6063ee] text-white flex items-center justify-center font-bold text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-slate-600 hidden sm:inline">{displayName}</span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
