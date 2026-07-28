'use client';

import { useState } from 'react';
import { GeminiModel } from '@/domain/entities/GeminiModel';

interface ModelSelectAccordionProps {
  models: GeminiModel[];
  defaultModelId?: string;
}

export function ModelSelectAccordion({ models, defaultModelId = 'gemini-3.5-flash-lite' }: ModelSelectAccordionProps) {
  // 기본 선택 모델 설정 (지정된 defaultModelId가 목록에 있으면 우선 적용, 없으면 첫번째)
  const initialSelected = models.find((m) => m.id === defaultModelId)?.id || models[0]?.id || 'gemini-3.5-flash-lite';
  const [selectedId, setSelectedId] = useState<string>(initialSelected);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const currentModel = models.find((m) => m.id === selectedId) || models[0];

  return (
    <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
      {/* Hidden input for form submission */}
      <input type="hidden" name="aiModel" value={selectedId} />

      {/* Accordion Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#4648d4]">tune</span>
          <label className="text-xs font-semibold text-[#0b1c30]">AI 모델 선택</label>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs text-[#4648d4] font-medium hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isOpen ? '모델 옵션 접기' : '모델 변경 / 상세 보기'}</span>
          <span className="material-symbols-outlined text-sm">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {/* Selected Model Preview Card (Always visible) */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between bg-[#f8f9ff] border border-[#c5c6cd]/60 rounded-xl p-3.5 cursor-pointer hover:bg-[#eff4ff] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#4648d4] text-base">smart_toy</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0b1c30]">
                {currentModel?.name || 'Gemini 3.5 Flash-Lite'}
              </span>
              {currentModel?.badge && (
                <span className="text-[10px] bg-[#dce9ff] text-[#2f2ebe] px-1.5 py-0.5 rounded font-medium">
                  {currentModel.badge}
                </span>
              )}
            </div>
            {!isOpen && currentModel?.description && (
              <p className="text-[11px] text-[#45474c] mt-0.5 line-clamp-1">
                {currentModel.description}
              </p>
            )}
          </div>
        </div>

        <span className="text-[11px] text-[#45474c] font-medium shrink-0">
          {selectedId === 'gemini-3.5-flash-lite' ? '(기본값)' : '선택됨'}
        </span>
      </div>

      {/* Collapsible Model Details Grid */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {models.map((model) => {
            const isSelected = selectedId === model.id;

            return (
              <div
                key={model.id}
                onClick={() => setSelectedId(model.id)}
                className={`relative flex cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all ${
                  isSelected
                    ? 'border-[#4648d4] bg-[#eff4ff] ring-1 ring-[#4648d4]'
                    : 'border-[#c5c6cd] bg-[#f8f9ff] hover:bg-slate-50'
                }`}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#0b1c30]">{model.name}</span>
                      {model.badge && (
                        <span className="text-[10px] bg-[#dce9ff] text-[#2f2ebe] px-1.5 py-0.5 rounded font-medium">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-[11px] text-[#45474c] leading-snug">{model.description}</p>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="aiModelRadio"
                    checked={isSelected}
                    onChange={() => setSelectedId(model.id)}
                    className="mt-0.5 h-4 w-4 border-[#c5c6cd] text-[#4648d4] focus:ring-[#4648d4]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
