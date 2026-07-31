import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (props.name ? `field-${props.name}` : undefined);

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:ring-slate-800 dark:focus:ring-slate-400'
        } rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{helperText}</p>}
    </div>
  );
};
