'use client';

import { useViewMode } from './common/ViewModeContext';

export default function Footer() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-5 px-4 text-center text-xs text-slate-500 dark:text-zinc-400 space-y-3 mt-auto mb-16 md:mb-0">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="font-semibold text-slate-700 dark:text-zinc-300">화면 보기 모드:</span>
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('auto')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'auto'
                ? 'bg-white dark:bg-zinc-700 text-[#4648d4] dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-xs">aspect_ratio</span>
            <span>기본 (자동)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white dark:bg-zinc-700 text-[#4648d4] dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-xs">smartphone</span>
            <span>모바일로 보기</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('pc')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'pc'
                ? 'bg-white dark:bg-zinc-700 text-[#4648d4] dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-xs">desktop_windows</span>
            <span>PC로 보기</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        © 2026 티타임은 즐거워 (Tea Time Prompt Manager). All rights reserved.
      </p>
    </footer>
  );
}
