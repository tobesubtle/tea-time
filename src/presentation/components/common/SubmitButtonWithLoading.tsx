'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { LoadingOverlay } from './LoadingOverlay';

interface SubmitButtonWithLoadingProps {
  label: string;
  loadingLabel?: string;
  overlayMessage?: string;
  overlaySubMessage?: string;
  icon?: string;
  className?: string;
}

export function SubmitButtonWithLoading({
  label,
  loadingLabel = '처리 중...',
  overlayMessage = 'Gemini AI가 작업을 처리 중입니다...',
  overlaySubMessage = '잠시만 기다려 주세요. 수 초 내로 완료됩니다.',
  icon = 'arrow_forward',
  className = 'w-full bg-[#091426] text-white rounded-xl h-12 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors',
}: SubmitButtonWithLoadingProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className={`${className} ${pending ? 'opacity-80 cursor-wait' : ''}`}
      >
        {pending ? (
          <>
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            <span>{loadingLabel}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
          </>
        )}
      </button>

      {/* Full-screen backdrop overlay spinner when pending */}
      <LoadingOverlay
        isLoading={pending}
        message={overlayMessage}
        subMessage={overlaySubMessage}
      />
    </>
  );
}
