import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-zinc-800 border-t-[#4648d4] dark:border-t-indigo-500 animate-spin" />
        <span className="material-symbols-outlined text-[#4648d4] dark:text-indigo-400 absolute text-2xl animate-pulse">
          smart_toy
        </span>
      </div>

      <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100 mb-1">
        페이지를 불러오는 중입니다...
      </h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
        잠시만 기다려 주세요. 데이터를 준비하고 있습니다.
      </p>
    </div>
  );
}
