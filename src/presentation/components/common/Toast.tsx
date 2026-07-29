'use client';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const iconName = type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle';
  const bgColor =
    type === 'error'
      ? 'bg-red-900/90 text-red-100'
      : type === 'info'
      ? 'bg-[#162839] text-slate-100'
      : 'bg-[#213145] text-white';

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 ${bgColor} px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 z-[100] animate-bounce transition-all border border-white/10`}
    >
      <span className="material-symbols-outlined text-sm">{iconName}</span>
      <span>{message}</span>
    </div>
  );
}
