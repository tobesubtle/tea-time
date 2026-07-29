'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createTemplateAction } from '@/presentation/actions/templateActions';

export default function CreateTemplateClientView() {
  const [state, action, isPending] = useActionState(createTemplateAction, null);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      {/* Header */}
      <header className="bg-white border-b border-[#c5c6cd]/40 w-full top-0 sticky z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[#45474c]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-bold text-lg text-[#091426]">템플릿 생성</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pb-32">
        <div className="bg-white rounded-2xl shadow-sm border border-[#c5c6cd]/40 overflow-hidden p-6 md:p-8 space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="title">
                  템플릿 제목 *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="예: 주간 업무 요약 보고서"
                  className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="category">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue="보고서"
                  className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] cursor-pointer"
                >
                  <option value="티타임">티타임</option>
                  <option value="보고서">보고서</option>
                  <option value="코드">코드</option>
                  <option value="이메일">이메일</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="description">
                템플릿 설명
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="템플릿의 용도나 사용 방법에 대한 간단한 설명을 입력하세요."
                className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>

            {/* Prompt Content */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="content">
                  프롬프트 내용 *
                </label>
                <span className="text-[11px] text-[#4648d4] font-medium">
                  💡 변수는 <code className="bg-[#e5eeff] px-1 rounded text-[#21005e]">{`{{변수명}}`}</code> 형태로 입력하세요
                </span>
              </div>
              <textarea
                id="content"
                name="content"
                required
                rows={8}
                placeholder={`다음 {{주제}} 분야의 트렌드를 정리해줘:\n\n1. 주요 이슈: {{이슈}}\n2. 타겟층: {{타겟}}`}
                className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4648d4] leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3">
              <Link
                href="/templates"
                className="px-5 h-11 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#091426] text-white rounded-xl px-6 h-11 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors disabled:opacity-50"
              >
                <span>{isPending ? '저장 중...' : '템플릿 저장'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
