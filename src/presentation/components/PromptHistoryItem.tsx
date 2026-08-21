'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deletePromptHistoryAction } from '@/presentation/actions/promptActions';

interface PromptHistoryItemProps {
  item: {
    id: string;
    title?: string;
    templateId?: string;
    aiModel?: string;
    finalPrompt?: string;
    createdAt?: string;
    likeCount?: number;
    userId?: string;
  };
  templateTitle?: string;
  currentUserId?: string;
}

export default function PromptHistoryItem({ item, templateTitle }: PromptHistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('정말 이 프롬프트 실행 내역을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    const res = await deletePromptHistoryAction(item.id);
    if (!res.success) {
      alert(res.message || '삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return null;
  }

  return (
    <div className="relative bg-white border border-[#c5c6cd]/40 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/prompts/result/${item.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#e5eeff] text-[#4648d4] flex items-center justify-center font-bold shrink-0 mt-0.5">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {item.title ? (
              <>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#4648d4] transition-colors leading-snug break-keep">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium break-keep">
                  <span className="text-slate-400 font-normal">템플릿:</span> {templateTitle || (item.templateId ? '(삭제된 템플릿)' : '일반')}
                </p>
              </>
            ) : (
              <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#4648d4] transition-colors leading-snug break-keep">
                <span className="text-slate-400 font-normal">템플릿:</span> {templateTitle || (item.templateId ? '(삭제된 템플릿)' : '일반')}
              </h3>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          title="삭제"
          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      <Link href={`/prompts/result/${item.id}`} className="block space-y-3">
        <p className="text-xs text-[#45474c] line-clamp-2 bg-[#f8f9ff] p-3 rounded-xl font-mono leading-relaxed">
          {item.finalPrompt}
        </p>

        <div className="flex justify-between items-center text-xs text-[#45474c] pt-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : ''}
          </span>

          <div className="flex items-center gap-3">
            {item.likeCount && item.likeCount > 0 ? (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <span className="material-symbols-outlined text-sm">favorite</span>
                {item.likeCount}
              </span>
            ) : null}
            <span className="text-[#4648d4] font-medium group-hover:underline">
              결과 보기 →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
