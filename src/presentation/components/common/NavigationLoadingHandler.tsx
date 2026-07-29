'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationLoadingHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Path / SearchParams 변동 시 로딩 상태 해제
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // 페이지 이동 링크 및 폼 제출 클릭 이벤트 감지
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // 외부 링크나 새 탭 열기 제외
      if (!href || href.startsWith('#') || href.startsWith('http') || targetAttr === '_blank') return;

      // 현재 경로와 동일한 링크 클릭 제외
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      if (href === currentUrl) return;

      setIsNavigating(true);
    };

    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form && !form.getAttribute('target')) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    document.addEventListener('submit', handleFormSubmit);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <>
      {/* Upper Thin Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#e5eeff] dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#4648d4] via-indigo-400 to-[#4648d4] animate-pulse w-full" />
      </div>

      {/* Floating Bottom Navigation Badge */}
      <div className="fixed bottom-6 right-6 z-50 bg-[#091426]/90 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xs flex items-center gap-2.5 animate-in fade-in duration-150 border border-white/10">
        <span className="material-symbols-outlined text-sm animate-spin text-[#4648d4] dark:text-indigo-400">
          sync
        </span>
        <span>화면 전환 중...</span>
      </div>
    </>
  );
}
