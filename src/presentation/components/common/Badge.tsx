'use client';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'primary', size = 'sm', className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-[#dce9ff] text-[#2f2ebe] dark:bg-indigo-950/60 dark:text-indigo-300',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
    success: 'bg-green-100 text-green-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-rose-950/60 dark:text-rose-300',
    neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
