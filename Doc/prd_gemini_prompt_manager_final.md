# PRD: Gemini 프롬프트 템플릿 매니저 (최종본)

## 1. 프로젝트 개요 (Overview)
* **목표**: Gemini API를 이용해 자주 쓰는 프롬프트를 템플릿화하여 관리하고, 변수 입력 및 파일(로컬/구글 드라이브) 첨부를 통해 효율적으로 프롬프트를 생성·실행·관리할 수 있는 반응형 웹 서비스 구축.
* **배포 URL**: `https://tea-time-six.vercel.app/`
* **기술 스택**: 
  * **Framework**: Next.js 16 (App Router)
  * **BaaS / DB**: Supabase (PostgreSQL, Auth, Storage)
  * **Email Engine**: Nodemailer (SMTP 기반 백그라운드 및 쿼터 경고 메일 자동 발송)
  * **UI / Styling**: Vanilla CSS, Tailwind CSS v4, Lucide React, Material Symbols
  * **Hosting & CI/CD**: Vercel (Cron Jobs & Open Graph Edge Engine)

---

## 2. 배포, SEO 및 반응형 최적화 (Deployment, SEO & Responsive)
* **Vercel 배포 관리**: 
  * GitHub 저장소 연동을 통한 Vercel 자동 배포(CI/CD) 파이프라인 구축.
  * 환경 변수(Supabase, Gemini API, Google Drive Client ID, SMTP, `CRON_SECRET` 등) Vercel 대시보드 관리.
* **오픈그래프(Open Graph) 및 SEO 설정**: 
  * Next.js App Router의 내장 `Metadata` API와 `next/og` (`app/opengraph-image.tsx`)를 활용해 슬랙, 카카오톡 등에 링크 공유 시 1200x630px 고화질 동적 썸네일 카드(제목, 설명, 썸네일, 기술 배지) 자동 생성.
* **PC 및 모바일 반응형 최적화 & 화면 보기 모드 토글 (Responsive & View Mode)**: 
  * Tailwind CSS 유틸리티 기반의 PC(다단) 및 모바일(1단) 레이아웃 자동 변환.
  * **전역 보기 모드 스위치 ([Footer.tsx](file:///c:/Users/niceg/OneDrive/문서/Antigravity/my-prompt/src/presentation/components/Footer.tsx))**: 하단 Footer에서 **`[ 기본 (자동) | 모바일로 보기 | PC로 보기 ]`** 버튼을 누르면 스마트폰에서도 데스크톱 대화면 레이아웃(`min-width: 1200px`)으로 시원하게 조회 가능하며 선택 상태는 LocalStorage에 영구 저장됨.

---

## 3. 사용자 및 인증 관리 (User & Auth Management)
* **회원가입 제한**: 사용자가 직접 회원가입 불가 (Supabase Auth 'Enable Signups' 비활성화).
* **사용자 권한**: 관리자(Admin)만 새로운 사용자 추가, 수정, 삭제 가능.
* **로그인 방식**: 이메일과 비밀번호 기반 로그인 전용.
* **내 프로필 수정 모달 ([ProfileModal.tsx](file:///c:/Users/niceg/OneDrive/문서/Antigravity/my-prompt/src/presentation/components/ProfileModal.tsx)) ⭐**:
  * 사용자가 상단 헤더 우측의 자신의 아바타 또는 이름을 클릭하면 대화상자가 팝업.
  * 서비스 내 **표시 이름(Display Name)** 변경 및 **비밀번호 변경**(미입력 시 기존 유지) 가능.
  * 비밀번호 불일치 시 모달 창 내부 최상단에 **인라인 경고 박스** 즉시 표시.

---

## 4. 핵심 기능 요구사항 (Core Features)

### 4.1 사용자 기능 (User Features)
* **신규 템플릿 추가 및 관리**:
  * 제목 및 프롬프트 기본 내용 작성.
  * **구글 AI 모델 지정**: 템플릿 생성 시 Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro 등 최신 AI 모델 선택 지정.
  * **변수 설정**: 템플릿 내 변수(예: `{{주제}}`) 지정 및 활용 가이드 작성.
  * **예시(Examples) 관리**: 변수에 들어갈 모범 예시 데이터 다수 등록 기능.
* **프롬프트 생성 및 실행 전 검토**:
  * **과거 사용 이력 조회**: 템플릿 선택 시 과거 사용 이력을 즉시 확인 가능.
  * **최종 프롬프트 확인 및 수정**: 변수가 채워진 최종 프롬프트를 API 실행 전 미리 확인 및 수정 가능.
  * **다중 소스 파일 첨부**: 로컬 파일(PDF 등) 및 Google Drive 파일 첨부 지원.
* **프롬프트 실행 및 결과 처리**:
  * **API 실행**: 프롬프트(+첨부파일 텍스트)를 Gemini API로 전송 후 결과 확인.
  * **결과 인라인 수정**: 반환된 결과 텍스트를 웹상에서 인라인으로 직접 수정 및 DB 저장(`onBlur`).
  * **TXT 저장 및 백그라운드 메일 발송**: `.txt` 다운로드 및 메일 앱 팝업 없이 백엔드 API (`POST /api/email/send`)를 통해 로그인 사용자 이메일로 수신함 전송.
* **기존 프롬프트 액션 (히스토리 리스트)**:
  * **재실행 (Re-run)**, **Copy (클립보드 복사)**, **ThumbsUp (좋아요)** 기능 지원.
* **데이터 관리 (Soft Delete)**:
  * 사용자는 본 소유 데이터만 삭제 가능하며, 삭제 시 Soft Delete (`is_deleted = true`) 처리.

---

### 4.2 관리자 기능 (Admin Features)
* **상단 헤더 통일**: 일반 사용자 헤더와 관리자 헤더의 프로필 아바타, 이름, 로그아웃 버튼 스타일 100% 동일 일원화.
* **사용자 계정 관리 (`/admin/users`)**: 사용자 계정 추가(UserModal), 권한(`admin`/`editor`/`user`) 수정 및 삭제.
* **API 사용량 모니터링 (`/admin/usage`)**: 사용자별 AI API 호출 수 및 **`k`(천) 단위 토큰 사용량** (예: `45,200k`) 월별/일별 조회.
* **프롬프트 영구 삭제 (`/admin/prompts`)**: 사용자가 Soft Delete한 프롬프트 실행 내역 물리적 Hard Delete 수행.
* **Vercel 크론 모니터링 (`/admin/cron`)**: Vercel Cron 실행 이력 모니터링, 수동 동기화 트리거 및 **1년 경과 크론 로그 자동 정리 삭제 (Auto Pruning)**.
* **Gemini API 쿼터/비용 초과 모니터링 (`/admin/quota`) ⭐ (신규)**:
  * API 호출 중 쿼터/비용 제한(429, `RESOURCE_EXHAUSTED`) 에러 발생 시 **관리자 이메일로 자동 경고 메일 알림 즉시 발송**.
  * 대시보드에서 쿼터 오류 발생 이력, 영향 받은 모델, 사용자 이메일, 에러 전문 조회 및 **[확인 처리] (Resolved)** 상태 관리.
  * **[Google AI Studio 잔여 쿼터 조회]** (`/app/apikey`) 및 **[GCP 할당량 그래프 보기]** 바로가기 콘솔 링크 제공.

---

## 5. 데이터베이스 아키텍처 (Supabase Schema)
* **`users` 테이블**: `id` (UUID), `email`, `role`, `name`.
* **`templates` 테이블**: `id`, `title`, `content`, `variables_guide`, `examples`, `ai_model`, `created_by`.
* **`prompts_history` 테이블**: `id`, `user_id`, `template_id`, `input_variables`, `attached_file_path`, `google_drive_file_id`, `final_prompt`, `result_text`, `like_count`, `is_deleted`.
* **`gemini_models` 테이블**: `id`, `name`, `description`, `badge`, `is_active`, `is_latest`, `updated_at`.
* **`cron_logs` 테이블**: `id`, `job_name`, `status`, `message`, `updated_count`, `execution_time_ms`, `created_at`.
* **`quota_error_logs` 테이블 ⭐ (신규)**:
  * `id` (UUID, PK), `user_email` (Text), `model_name` (Text), `error_message` (Text), `status` ('pending' | 'notified' | 'resolved'), `created_at` (Timestamp).

---

## 6. 공통 디자인 시스템 (Common Components)
`src/presentation/components/common/` 하위 원자 컴포넌트:
1. **`Toast.tsx`**: z-index `z-[100]` 기반의 글로벌/지역 알림 토스트 UI.
2. **`Modal.tsx`**: 배경 딤 처리, ESC 닫기, 스크롤 잠금이 적용된 대화상자 래퍼.
3. **`ProfileModal.tsx`**: 사용자 표시 이름 및 비밀번호 변경 모달 대화상자.
4. **`ViewModeContext.tsx`**: 전역 `auto` / `mobile` / `pc` 보기 모드 콘텍스트 및 LocalStorage 동기화.
5. **`Badge.tsx` & `Button.tsx`**: 표준 태그/배지 및 로딩 지원 버튼.
