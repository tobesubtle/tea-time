'use client';

import { useState, useTransition } from 'react';
import { User } from '@/domain/entities/User';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { UserModal } from './UserModal';
import { deleteUserAction } from '@/app/auth/actions';

interface UserListProps {
  initialUsers: User[];
}

export function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;

    startTransition(async () => {
      const res = await deleteUserAction(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(res.message || '삭제에 실패했습니다.');
      }
    });
  };

  // 이니셜 추출 도우미
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // 역할에 따른 배지 스타일
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium">관리자</span>;
      case 'editor':
        return <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-medium">편집자</span>;
      default:
        return <span className="text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-0.5 rounded-full font-medium">사용자</span>;
    }
  };

  // 아바타 배경색
  const getAvatarBg = (index: number) => {
    const bgs = [
      'bg-indigo-500 text-white',
      'bg-blue-200 text-blue-800',
      'bg-amber-200 text-amber-900',
      'bg-[#2c3e50] text-white',
      'bg-emerald-700 text-white',
    ];
    return bgs[index % bgs.length];
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 py-6 space-y-4">
      {/* Top action bar */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          전체 사용자 목록 ({users.length})
        </h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-[#122338] hover:bg-[#1c324e] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>사용자 추가</span>
        </button>
      </div>

      {/* User Cards List matching admin-users.png */}
      <div className="space-y-3">
        {users.map((user, idx) => (
          <div
            key={user.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-inner ${getAvatarBg(
                  idx
                )}`}
              >
                {getInitials(user.name)}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="font-bold text-zinc-900 dark:text-white text-base leading-tight">
                  {user.name}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </div>
                <div className="pt-0.5">{getRoleBadge(user.role)}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenEditModal(user)}
                title="수정"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={isPending}
                title="삭제"
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
            등록된 사용자가 없습니다.
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
      />
    </div>
  );
}
