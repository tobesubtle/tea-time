'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/presentation/actions/authActions';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
  activeTab?: 'templates' | 'prompts' | 'admin';
}

export default function Header({ userRole, userEmail, userName, activeTab }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isAdmin = userRole === 'admin';
  const displayName = isAdmin ? '관리자' : (userName || userEmail?.split('@')[0] || '사용자');

  return (
    <>
      <header className="bg-white text-[#091426] w-full sticky top-0 z-40 border-b border-[#c5c6cd]/40 shadow-xs">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/templates" className="font-bold text-base md:text-xl text-[#091426] flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[#4648d4] text-xl md:text-2xl">auto_awesome</span>
              <span>티타임은 즐거워</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer text-left"
              title="프로필 수정"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#6063ee] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-800 dark:text-zinc-200 font-semibold max-w-[90px] sm:max-w-[120px] truncate group-hover:text-[#4648d4] transition-colors">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  프로필 수정
                </span>
              </div>
            </button>

            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg px-2 sm:px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Bar (Visible on Mobile screens md:hidden) */}
        <nav className="md:hidden flex border-t border-slate-100 px-2 bg-slate-50/90 justify-around text-xs font-semibold text-[#45474c]">
          <Link
            href="/templates"
            className={`py-2 px-3 flex items-center gap-1 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-[#4648d4] text-[#4648d4] font-bold'
                : 'border-transparent hover:text-[#091426]'
            }`}
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>템플릿</span>
          </Link>
          <Link
            href="/prompts"
            className={`py-2 px-3 flex items-center gap-1 border-b-2 transition-colors ${
              activeTab === 'prompts'
                ? 'border-[#4648d4] text-[#4648d4] font-bold'
                : 'border-transparent hover:text-[#091426]'
            }`}
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>히스토리</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/users"
              className={`py-2 px-3 flex items-center gap-1 border-b-2 transition-colors ${
                activeTab === 'admin'
                  ? 'border-[#4648d4] text-[#4648d4] font-bold'
                  : 'border-transparent hover:text-[#091426]'
              }`}
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>관리자</span>
            </Link>
          )}
        </nav>
      </header>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userEmail={userEmail}
        userName={userName}
        userRole={userRole}
      />
    </>
  );
}
