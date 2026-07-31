'use client';

import { useState, useTransition } from 'react';
import { Lock, ArrowRight, Coffee, Loader2 } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';
import { FormField } from '@/src/presentation/components/common/FormField';
import { FormErrorAlert } from '@/src/presentation/components/common/FormErrorAlert';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await loginAction(email, password);
      if (res && !res.success) {
        setErrorMsg(res.message || '로그인에 실패했습니다.');
      }
    });
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg flex flex-col items-center">
        {/* Logo Card */}
        <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col items-center justify-center p-2 mb-6 shadow-sm">
          <Coffee className="w-8 h-8 text-zinc-700 mb-1" />
          <span className="text-[9px] leading-tight font-medium text-zinc-600 text-center">
            Enjoy a<br />Teatime
          </span>
        </div>

        {/* Header Titles */}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
          Enjoy your teatime
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 text-center">
          워크스페이스에 접속하기 위해 로그인하세요
        </p>

        {/* Error Notification */}
        <FormErrorAlert message={errorMsg} className="mb-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <FormField
            label="이메일 주소"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
          />

          <FormField
            label="비밀번호"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 bg-[#122338] hover:bg-[#1c324e] active:scale-[0.99] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <span>로그인</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Lock Label */}
        <div className="w-full border-t border-zinc-100 dark:border-zinc-800 mt-8 pt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500">
          <Lock className="w-3.5 h-3.5" />
          <span>관리자</span>
        </div>
      </div>
    </div>
  );
}
