'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'indigo' | 'slate';
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-t-[#4648d4] border-slate-200 dark:border-zinc-700',
    indigo: 'border-t-indigo-600 border-indigo-100 dark:border-indigo-900',
    white: 'border-t-white border-white/30',
    slate: 'border-t-slate-700 border-slate-200 dark:border-zinc-700',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label={label || '로딩 중'}
      />
      {label && <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">{label}</span>}
    </div>
  );
}
