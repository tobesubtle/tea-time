'use client';

import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = '처리 중입니다...',
  subMessage = '잠시만 기다려 주세요.',
  fullScreen = true,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4'
    : 'absolute inset-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4 rounded-2xl';

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="relative flex items-center justify-center">
          {/* Pulsing background circle */}
          <div className="absolute w-16 h-16 rounded-full bg-[#4648d4]/10 dark:bg-indigo-500/20 animate-ping opacity-75" />
          {/* Main spinner circle */}
          <div className="w-14 h-14 rounded-full border-4 border-slate-100 dark:border-zinc-800 border-t-[#4648d4] dark:border-t-indigo-500 animate-spin shadow-inner" />
          <span className="material-symbols-outlined text-[#4648d4] dark:text-indigo-400 absolute text-xl animate-pulse">
            auto_awesome
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {message}
          </h3>
          {subMessage && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {subMessage}
            </p>
          )}
        </div>

        {/* Progress bar animation effect */}
        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#4648d4] via-indigo-400 to-[#4648d4] h-full w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
