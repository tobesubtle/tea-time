'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { hardDeletePromptHistoriesAction } from '@/presentation/actions/promptActions';

interface PromptHistoryItem {
  id: string;
  userId?: string;
  templateId?: string;
  title?: string;
  finalPrompt: string;
  resultText?: string;
  aiModel?: string;
  createdAt?: string;
  isDeleted?: boolean;
}

interface UserItem {
  id: string;
  email: string;
  name?: string;
}

interface TemplateItem {
  id: string;
  title: string;
}

interface DeletedPromptListProps {
  initialHistories: PromptHistoryItem[];
  users: UserItem[];
  templates: TemplateItem[];
}

export function DeletedPromptList({ initialHistories, users, templates }: DeletedPromptListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [histories, setHistories] = useState<PromptHistoryItem[]>(initialHistories);

  // 필터링 적용
  const filteredHistories = histories.filter((item) => {
    // 1. 사용자 필터
    if (selectedUserId !== 'all' && item.userId !== selectedUserId) {
      return false;
    }
    // 2. 템플릿 필터
    if (selectedTemplateId !== 'all' && item.templateId !== selectedTemplateId) {
      return false;
    }
    // 3. 검색어 필터
    if (appliedSearch.trim() !== '') {
      const q = appliedSearch.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const promptMatch = item.finalPrompt?.toLowerCase().includes(q);
      const resultMatch = item.resultText?.toLowerCase().includes(q);
      if (!titleMatch && !promptMatch && !resultMatch) {
        return false;
      }
    }
    return true;
  });

  // 전체 선택 / 해제
  const isAllSelected =
    filteredHistories.length > 0 &&
    filteredHistories.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredHistories.map((h) => h.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allFilteredIds])));
    } else {
      const filteredIdSet = new Set(filteredHistories.map((h) => h.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIdSet.has(id)));
    }
  };

  // 개별 선택 토글
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 영구 삭제 처리
  const handleHardDelete = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;

    const confirmMsg =
      targetIds.length === 1
        ? '정말 이 항목을 영구 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.'
        : `선택한 ${targetIds.length}개의 항목을 영구 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.`;

    if (!confirm(confirmMsg)) {
      return;
    }

    startTransition(async () => {
      const res = await hardDeletePromptHistoriesAction(targetIds);
      if (res.success) {
        setHistories((prev) => prev.filter((h) => !targetIds.includes(h.id)));
        setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
        router.refresh();
      } else {
        alert(res.message || '영구 삭제 중 오류가 발생했습니다.');
      }
    });
  };

  // 헬퍼: 사용자 이름/이메일 가져오기
  const getUserLabel = (userId?: string) => {
    if (!userId) return '알 수 없음';
    const u = users.find((user) => user.id === userId);
    if (!u) return userId;
    return u.name ? `${u.name} (${u.email})` : u.email;
  };

  // 헬퍼: 템플릿 제목 가져오기
  const getTemplateLabel = (templateId?: string) => {
    if (!templateId) return '일반';
    const t = templates.find((tpl) => tpl.id === templateId);
    return t ? t.title : '기타';
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            소프트 삭제된 프롬프트 관리
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            사용자가 삭제(숨김) 처리한 프롬프트 이력을 조회하고 실제 DB에서 영구 삭제(Hard Delete)할 수 있습니다.
          </p>
        </div>

        {/* Batch Action Button */}
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => handleHardDelete(selectedIds)}
            disabled={isPending}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            <span>선택한 {selectedIds.length}개 영구 삭제</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 md:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search Input with Search Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearch(searchInput);
          }}
          className="sm:col-span-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목 또는 프롬프트 검색..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            <span>검색</span>
          </button>
        </form>

        {/* User Filter */}
        <div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full py-2 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 사용자</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ? `${user.name} (${user.email})` : user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Template Filter */}
        <div>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full py-2 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 템플릿</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              전체 선택 ({filteredHistories.filter((item) => selectedIds.includes(item.id)).length}개)
            </span>
          </div>

          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            총 {filteredHistories.length}개 목록
          </span>
        </div>

        {filteredHistories.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-600">
              auto_delete
            </span>
            <p className="text-sm font-medium">삭제 처리된 프롬프트 이력이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredHistories.map((item) => {
              const isChecked = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 md:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isChecked ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(item.id)}
                      className="mt-1 w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                          {item.title || '제목 없음'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                          템플릿: {getTemplateLabel(item.templateId)}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-mono">
                          {item.aiModel || 'gemini-3.6-flash'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg line-clamp-2">
                        {item.finalPrompt}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                        <span>작성자: {getUserLabel(item.userId)}</span>
                        <span>
                          생성일: {item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 md:pl-4">
                    <button
                      type="button"
                      onClick={() => handleHardDelete([item.id])}
                      disabled={isPending}
                      className="px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>영구 삭제</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
