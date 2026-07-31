import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorAlertProps {
  message?: string | null;
  className?: string;
}

export const FormErrorAlert: React.FC<FormErrorAlertProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`w-full p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2 ${className}`}
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
