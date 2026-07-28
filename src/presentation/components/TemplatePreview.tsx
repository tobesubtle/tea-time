'use client';

import { useState } from 'react';

interface TemplatePreviewProps {
  content: string;
}

export default function TemplatePreview({ content }: TemplatePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-[#0b1c30]">
          템플릿 원본 미리보기
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#4648d4] font-medium hover:underline flex items-center gap-1"
        >
          <span>{isExpanded ? '접기' : '전체 내용 확인'}</span>
          <span className="material-symbols-outlined text-xs">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      <div
        className={`p-3.5 bg-[#f8f9ff] rounded-xl text-xs font-mono text-[#45474c] whitespace-pre-wrap leading-relaxed transition-all ${
          isExpanded ? '' : 'line-clamp-5 max-h-36 overflow-hidden'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
