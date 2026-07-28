'use client';

import Link from 'next/link';
import { FileText, History, ShieldCheck } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-xl shadow-lg">
      <Link
        href="/templates"
        className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 p-2 rounded-lg w-16"
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-medium">템플릿</span>
      </Link>
      <Link
        href="/prompts"
        className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 p-2 rounded-lg w-16"
      >
        <History className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-medium">프롬프트</span>
      </Link>
      <Link
        href="/admin/users"
        className="flex flex-col items-center justify-center text-[#4648d4] font-bold p-2 rounded-lg w-16"
      >
        <ShieldCheck className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-bold">관리자</span>
      </Link>
    </nav>
  );
}
