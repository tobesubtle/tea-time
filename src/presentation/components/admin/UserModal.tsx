'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/domain/entities/User';
import { createUserAction, updateUserAction } from '@/app/auth/actions';
import { Modal } from '@/presentation/components/common/Modal';
import { Button } from '@/presentation/components/common/Button';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserModal({ isOpen, onClose, userToEdit }: UserModalProps) {
  const router = useRouter();
  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [role, setRole] = useState<UserRole>(userToEdit?.role || 'user');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      setName(userToEdit?.name || '');
      setEmail(userToEdit?.email || '');
      setRole(userToEdit?.role || 'user');
      setPassword('');
      setErrorMsg(null);
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      if (isEditMode && userToEdit) {
        const res = await updateUserAction({
          id: userToEdit.id,
          name,
          role,
          password: password || undefined,
        });
        if (res.success) {
          router.refresh();
          onClose();
        } else {
          setErrorMsg(res.message || '사용자 정보 수정 실패');
        }
      } else {
        const res = await createUserAction({
          email,
          name,
          role,
          password: password || undefined,
        });
        if (res.success) {
          router.refresh();
          onClose();
        } else {
          setErrorMsg(res.message || '사용자 생성 실패');
        }
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '사용자 정보 수정' : '신규 사용자 계정 추가'}
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              이메일
            </label>
            <input
              type="email"
              required={!isEditMode}
              disabled={isEditMode}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@domain.com"
              className={`w-full px-3.5 py-2 border rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4] ${
                isEditMode
                  ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 cursor-not-allowed border-zinc-200 dark:border-zinc-700'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
              }`}
            />
          </div>

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
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              권한 (역할)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            >
              <option value="user">일반 사용자</option>
              <option value="editor">편집자</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              비밀번호 {isEditMode ? '(변경 시에만 입력)' : '(미입력 시 TempPassword123!)'}
            </label>
            <input
              type="password"
              required={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditMode ? '새 비밀번호' : '미입력 시 TempPassword123! 적용'}
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isPending}>
              {isEditMode ? '수정 완료' : '사용자 추가'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

