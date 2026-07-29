'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/presentation/components/common/LoadingOverlay';
import {
  updateTemplateAction,
  deleteTemplateAction,
  duplicateTemplateAction,
} from '@/presentation/actions/templateActions';

interface TemplateItem {
  id: string;
  title: string;
  description?: string;
  content: string;
}

interface TemplateActionHeaderProps {
  template: TemplateItem;
  userRole?: string;
}

export function TemplateActionHeader({ template, userRole }: TemplateActionHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canManage = userRole === 'editor' || userRole === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(template.title);
  const [editDescription, setEditDescription] = useState(template.description || '');
  const [editContent, setEditContent] = useState(template.content);
  const [copyToast, setCopyToast] = useState(false);

  // 1. 클립보드 복사
  const handleCopyContent = () => {
    navigator.clipboard.writeText(template.content);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  // 2. 템플릿 복제 (DB 신규 생성)
  const handleDuplicate = () => {
    if (!confirm(`'${template.title}' 템플릿을 복제하시겠습니까?`)) return;

    startTransition(async () => {
      const res = await duplicateTemplateAction(template.id);
      if (res.success && res.newTemplateId) {
        router.push(`/prompts/create?templateId=${res.newTemplateId}`);
        router.refresh();
      } else {
        alert(res.message || '템플릿 복제 중 오류가 발생했습니다.');
      }
    });
  };

  // 3. 템플릿 삭제
  const handleDelete = () => {
    if (!confirm(`정말 '${template.title}' 템플릿을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`)) return;

    startTransition(async () => {
      const res = await deleteTemplateAction(template.id);
      if (res.success) {
        alert('템플릿이 삭제되었습니다.');
        router.push('/prompts/create');
        router.refresh();
      } else {
        alert(res.message || '템플릿 삭제 중 오류가 발생했습니다.');
      }
    });
  };

  // 4. 템플릿 수정 저장
  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 템플릿 본문은 필수 입력 사항입니다.');
      return;
    }

    startTransition(async () => {
      const res = await updateTemplateAction(template.id, {
        title: editTitle,
        description: editDescription,
        content: editContent,
      });

      if (res.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(res.message || '템플릿 수정 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-4 right-4 bg-zinc-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
          <span>템플릿 원본 텍스트가 클립보드에 복사되었습니다!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e5eeff] text-[#4648d4] flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#4648d4]">선택된 템플릿</span>
            </div>
            <h3 className="font-bold text-base text-[#0b1c30]">{template.title}</h3>
            {template.description && (
              <p className="text-xs text-[#45474c] line-clamp-1">{template.description}</p>
            )}
          </div>
        </div>

        {/* Template Action Buttons (수정 / 복사 / 삭제) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyContent}
            title="본문 클립보드 복사"
            className="px-2.5 py-1.5 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#c5c6cd]/60 text-[#0b1c30] rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">content_copy</span>
            <span>복사</span>
          </button>

          {canManage && (
            <>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isPending}
                title="새 템플릿으로 복제"
                className="px-2.5 py-1.5 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#c5c6cd]/60 text-[#0b1c30] rounded-xl text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm text-purple-600 ${isPending ? 'animate-spin' : ''}`}>
                  {isPending ? 'sync' : 'file_copy'}
                </span>
                <span>복제</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                title="템플릿 수정"
                className="px-2.5 py-1.5 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#c5c6cd]/60 text-[#0b1c30] rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm text-amber-600">edit</span>
                <span>{isEditing ? '취소' : '수정'}</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                title="템플릿 삭제"
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm ${isPending ? 'animate-spin' : ''}`}>
                  {isPending ? 'sync' : 'delete'}
                </span>
                <span>삭제</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading Overlay when operation in progress */}
      <LoadingOverlay
        isLoading={isPending}
        message="템플릿 작업을 처리하고 있습니다..."
        subMessage="잠시만 기다려 주세요."
      />

      {/* Inline Edit Form */}
      {isEditing && (
        <div className="pt-3 border-t border-[#c5c6cd]/40 space-y-3 bg-[#f8f9ff] p-4 rounded-xl">
          <h4 className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-amber-600">edit_note</span>
            <span>템플릿 정보 수정</span>
          </h4>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white border border-[#c5c6cd] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">설명</label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-white border border-[#c5c6cd] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                프롬프트 본문 ({'{{변수}}'} 포함)
              </label>
              <textarea
                rows={5}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white border border-[#c5c6cd] rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-white border border-[#c5c6cd] text-[#45474c] rounded-lg text-xs font-medium"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isPending}
              className="px-4 py-1.5 bg-[#4648d4] text-white rounded-lg text-xs font-medium hover:bg-[#3b3dbf] transition-colors"
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
