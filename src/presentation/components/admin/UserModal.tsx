'use client';

import { useState, useTransition } from 'react';
import { User, UserRole } from '@/domain/entities/User';
import { createUserAction, updateUserAction } from '@/app/auth/actions';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserModal({ isOpen, onClose, userToEdit }: UserModalProps) {
  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [role, setRole] = useState<UserRole>(userToEdit?.role || 'user');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const isEditMode = !!userToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      if (isEditMode) {
        const res = await updateUserAction({
          id: userToEdit.id,
          name,
          role,
          password: password || undefined,
        });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.message || '사용자 정보 수정 실패');
        }
      } else {
        const res = await createUserAction({
          email,
          name,
          role,
          password,
        });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.message || '사용자 생성 실패');
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {isEditMode ? '사용자 정보 수정' : '신규 사용자 계정 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md text-sm"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              이름
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              권한 (역할)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white"
            >
              <option value="user">일반 사용자</option>
              <option value="editor">편집자</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              비밀번호 {isEditMode && '(변경 시에만 입력)'}
            </label>
            <input
              type="password"
              required={!isEditMode}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditMode ? '새 비밀번호' : '••••••••'}
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-white bg-[#122338] hover:bg-[#1c324e] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? '저장 중...' : isEditMode ? '수정 완료' : '사용자 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
