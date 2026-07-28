'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  title?: string;
  createdAt?: string;
  finalPrompt?: string;
}

interface Template {
  id: string;
}

interface HistoryListProps {
  recentHistory: HistoryItem[];
  selectedTemplate: Template;
  selectedHistoryId?: string | null;
}

export function HistoryList({ recentHistory, selectedTemplate, selectedHistoryId }: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  if (!recentHistory || recentHistory.length === 0) {
    return null;
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const visibleHistory = recentHistory.slice(0, visibleCount);
  const hasMore = visibleCount < recentHistory.length;

  return (
    <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#4648d4]">history</span>
          <span>이전 사용 내역에서 값 불러오기</span>
        </label>
        <span className="text-[11px] text-[#45474c]">클릭 시 해당 내용으로 자동 입력됩니다</span>
      </div>

      <div className="space-y-2">
        {visibleHistory.map((item) => (
          <Link
            key={item.id}
            href={`/prompts/create?templateId=${selectedTemplate.id}&historyId=${item.id}`}
            className={`block p-3 rounded-xl border text-xs transition-all ${
              selectedHistoryId === item.id
                ? 'border-[#4648d4] bg-[#eff4ff] ring-1 ring-[#4648d4]'
                : 'border-[#c5c6cd]/40 bg-[#f8f9ff] hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[#0b1c30]">
                {item.title || '과거 실행 내역'}
              </span>
              <span className="text-[10px] text-[#45474c]">
                {item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : ''}
              </span>
            </div>
            <p className="text-[#45474c] line-clamp-1 font-mono text-[11px]">
              {item.finalPrompt}
            </p>
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="w-full mt-2 py-2 text-xs font-medium text-[#4648d4] bg-[#eff4ff] rounded-xl hover:bg-[#e0eaff] transition-colors flex items-center justify-center gap-1"
        >
          <span>더보기</span>
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      )}
    </div>
  );
}
