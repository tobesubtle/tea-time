'use client';

import { useState, useTransition } from 'react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { Toast } from './common/Toast';
import { updateSelfProfileAction } from '@/presentation/actions/userActions';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export function ProfileModal({ isOpen, onClose, userEmail, userName, userRole }: ProfileModalProps) {
  const [name, setName] = useState(userName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = userRole === 'admin';
  const roleLabel = isAdmin ? '관리자 (Admin)' : '일반 사용자 (User)';
  const displayName = name || userEmail?.split('@')[0] || '사용자';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password.length < 6) {
      setToast({ message: '비밀번호는 최소 6자리 이상이어야 합니다.', type: 'error' });
      return;
    }

    if (password && password !== confirmPassword) {
      setToast({ message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', name);
      if (password) {
        formData.append('password', password);
      }

      const res = await updateSelfProfileAction(formData);
      if (res.success) {
        setToast({ message: res.message || '프로필이 수정되었습니다.', type: 'success' });
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setToast({ message: res.error || '수정 중 오류가 발생했습니다.', type: 'error' });
      }
    });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} title="내 프로필 정보 수정">
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-[#6063ee] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {userEmail}
              </div>
            </div>
            <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0">
              {roleLabel}
            </span>
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              이메일 주소 <span className="text-xs text-slate-400 font-normal">(수정 불가)</span>
            </label>
            <input
              type="text"
              value={userEmail || ''}
              disabled
              className="w-full text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 cursor-not-allowed"
            />
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              표시 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="표시될 이름을 입력하세요"
              className="w-full text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4648d4] focus:outline-none transition-all"
            />
          </div>

          {/* Password Change Divider */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">
              비밀번호 변경 <span className="text-[11px] font-normal text-slate-400">(변경을 원할 때만 입력)</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-zinc-400 block mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 6자리 이상 입력"
                  className="w-full text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4648d4] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-zinc-400 block mb-1">
                  새 비밀번호 재입력
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4648d4] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
            >
              저장하기
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
