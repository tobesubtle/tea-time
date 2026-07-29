'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-xl shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#091426] text-white hover:bg-[#1e293b] dark:bg-indigo-600 dark:hover:bg-indigo-700',
    secondary: 'bg-[#4648d4] text-white hover:bg-[#3b3dbf]',
    outline: 'bg-white border border-[#c5c6cd] text-[#091426] hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-none',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
      ) : typeof icon === 'string' ? (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      ) : (
        icon
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
