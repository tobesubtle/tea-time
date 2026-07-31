'use client';

import React, { useState } from 'react';
import { SubmitButtonWithLoading } from '@/presentation/components/common/SubmitButtonWithLoading';
import { Toast } from '@/presentation/components/common/Toast';
import { ModelSelectAccordion } from '@/presentation/components/ModelSelectAccordion';
import { GeminiModel } from '@/domain/entities/GeminiModel';

interface AIService {
  name: string;
  url: string;
  bgClass: string;
  hoverClass: string;
}

const AI_SERVICES: AIService[] = [
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    bgClass: 'from-[#4648d4] to-[#2f2ebe]',
    hoverClass: 'hover:from-[#3b3dbf] hover:to-[#2524a7]',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    bgClass: 'from-[#d97706] to-[#b45309]',
    hoverClass: 'hover:from-[#c2410c] hover:to-[#9a3412]',
  },
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    bgClass: 'from-[#10b981] to-[#059669]',
    hoverClass: 'hover:from-[#047857] hover:to-[#065f46]',
  },
];

interface PromptRunActionsProps {
  models?: GeminiModel[];
  defaultModelId?: string;
}

export function PromptRunActions({ models, defaultModelId = 'gemini-3.6-flash' }: PromptRunActionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyAndOpenWeb = (serviceName: string, url: string) => {
    const textarea = document.getElementById('finalPrompt') as HTMLTextAreaElement | null;
    const promptText = textarea ? textarea.value : '';

    if (!promptText.trim()) {
      setToastMessage('복사할 프롬프트 내용이 없습니다.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    navigator.clipboard
      .writeText(promptText)
      .then(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setToastMessage(`📋 프롬프트가 복사되었습니다! ${serviceName} 웹에서 Ctrl+V로 붙여넣으세요.`);
        setTimeout(() => setToastMessage(null), 4000);
      })
      .catch((err) => {
        console.error('클립보드 복사 실패:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
        setToastMessage(`${serviceName} 웹창이 열렸습니다. 프롬프트 내용을 직접 복사해서 사용하세요.`);
        setTimeout(() => setToastMessage(null), 4000);
      });
  };

  return (
    <div className="space-y-4 pt-2">
      {/* 1. 프롬프트 복사 후 AI 웹 바로가기 3종 버튼 (Gemini, Claude, ChatGPT 한 행에 나란히 배치) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#4648d4]">content_copy</span>
            <span>프롬프트 복사 후 AI 웹 바로가기</span>
          </label>
          <span className="text-[11px] text-[#45474c]">원클릭 복사 + 새 탭 열기</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {AI_SERVICES.map((service) => (
            <button
              key={service.name}
              type="button"
              onClick={() => handleCopyAndOpenWeb(service.name, service.url)}
              className={`bg-gradient-to-r ${service.bgClass} ${service.hoverClass} text-white font-semibold rounded-xl h-12 px-2 text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
                content_copy
              </span>
              <span className="font-medium truncate">{service.name}</span>
              <span className="material-symbols-outlined text-xs opacity-70 hidden sm:inline">
                open_in_new
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#45474c] text-center pt-0.5">
          버튼 클릭 시 프롬프트가 복사되고 해당 AI 웹이 열립니다. (Ctrl + V로 실행)
        </p>
      </div>

      {/* 구분선 */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] text-[#45474c] font-medium bg-[#f8f9ff] px-2">
          또는 앱 내에서 직접 실행
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* 2. 앱 내 API 직접 실행 버튼 (요청대로 문구 수정) */}
      <SubmitButtonWithLoading
        label="⚡ Gemini API로 즉시 실행하기"
        loadingLabel="Gemini API 답변 생성 중..."
        overlayMessage="Gemini AI가 답변을 생성하고 있습니다..."
        overlaySubMessage="요청 프롬프트를 분석하고 데이터를 처리하는 중입니다."
        icon="bolt"
        className="w-full bg-[#091426] text-white rounded-xl h-12 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors cursor-pointer"
      />

      {/* 3. AI 모델 선택하기 (API 실행 버튼 바로 아래 위치) */}
      {models && models.length > 0 && (
        <div className="pt-2">
          <ModelSelectAccordion models={models} defaultModelId={defaultModelId} />
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
