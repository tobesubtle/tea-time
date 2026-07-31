import Link from 'next/link';
import { CreateUserForm } from '@/src/presentation/components/admin/CreateUserForm';

export const metadata = {
  title: '사용자 추가 | 관리자 | 티타임은 즐거워',
  description: '새로운 팀 멤버를 시스템에 추가하고 역할을 지정하세요.',
};

export default function CreateUserPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      {/* Header */}
      <header className="bg-white border-b border-[#c5c6cd]/40 w-full top-0 sticky z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/admin/users"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dce9ff] transition-colors text-[#45474c]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-semibold text-lg text-[#091426] flex-1 text-center md:text-left truncate">
            사용자 추가
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
        <CreateUserForm />
      </main>
    </div>
  );
}
