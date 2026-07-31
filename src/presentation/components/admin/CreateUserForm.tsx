'use client';

import { useActionState } from 'react';
import { createUserAction } from '@/src/presentation/actions/userActions';
import { FormField } from '@/src/presentation/components/common/FormField';
import { FormErrorAlert } from '@/src/presentation/components/common/FormErrorAlert';

export function CreateUserForm() {
  const [state, action, isPending] = useActionState(createUserAction, null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#c5c6cd]/40 overflow-hidden">
      <div className="p-6 space-y-6">
        <p className="text-sm text-[#45474c]">
          새로운 팀 멤버를 시스템에 초대합니다. 역할을 지정하여 권한을 제어하세요.
        </p>

        <FormErrorAlert message={state?.error} />

        <form action={action} className="space-y-6">
          {/* Name Field */}
          <FormField
            label="이름"
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
          />

          {/* Email Field */}
          <FormField
            label="이메일 주소"
            id="email"
            name="email"
            type="email"
            required
            placeholder="hong@company.com"
          />

          {/* Role Selection (Radio Group) */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-[#0b1c30]">역할 부여</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Editor Role */}
              <label className="relative flex cursor-pointer rounded-xl border border-[#c5c6cd] bg-[#f8f9ff] p-4 shadow-sm hover:bg-[#eff4ff] transition-colors has-[:checked]:border-[#4648d4] has-[:checked]:ring-1 has-[:checked]:ring-[#4648d4]">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dce9ff] text-[#45474c]">
                      <span className="material-symbols-outlined">edit_document</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30]">편집자</p>
                      <p className="text-xs text-[#45474c] mt-0.5">콘텐츠 작성 및 수정 권한</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="editor"
                    defaultChecked
                    className="h-5 w-5 border-[#c5c6cd] text-[#4648d4] focus:ring-[#4648d4]"
                  />
                </div>
              </label>

              {/* Admin Role */}
              <label className="relative flex cursor-pointer rounded-xl border border-[#c5c6cd] bg-[#f8f9ff] p-4 shadow-sm hover:bg-[#eff4ff] transition-colors has-[:checked]:border-[#4648d4] has-[:checked]:ring-1 has-[:checked]:ring-[#4648d4]">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8ddff] text-[#21005e]">
                      <span className="material-symbols-outlined">shield_person</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30]">관리자</p>
                      <p className="text-xs text-[#45474c] mt-0.5">모든 시스템 접근 및 설정</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    className="h-5 w-5 border-[#c5c6cd] text-[#4648d4] focus:ring-[#4648d4]"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Invitation Option */}
          <div className="pt-4 border-t border-[#c5c6cd]/40">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-6 items-center">
                <input
                  id="send_invite"
                  name="send_invite"
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-[#c5c6cd] text-[#4648d4] focus:ring-[#4648d4]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0b1c30] group-hover:text-[#4648d4] transition-colors">
                  이메일로 초대 링크 전송
                </span>
                <span className="text-xs text-[#45474c] mt-0.5">
                  선택 시 사용자가 초대 이메일로 비밀번호를 설정하게 됩니다. (미선택 시 임시 비밀번호 설정)
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#091426] text-white rounded-xl h-12 font-medium text-sm flex items-center justify-center space-x-2 shadow-sm hover:bg-[#1e293b] transition-colors disabled:opacity-50"
            >
              <span>{isPending ? '처리 중...' : '사용자 추가 완료'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
