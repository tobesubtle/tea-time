# PRD: Gemini 프롬프트 템플릿 매니저 (최종본)

## 1. 프로젝트 개요 (Overview)
* **목표**: Gemini API를 이용해 자주 쓰는 프롬프트를 템플릿화하여 관리하고, 변수 입력 및 파일(로컬/구글 드라이브) 첨부를 통해 효율적으로 프롬프트를 생성·실행·관리할 수 있는 반응형 웹 서비스 구축.
* **배포 URL**: `https://tea-time-six.vercel.app/`
* **기술 스택**: 
  * **Framework**: Next.js 16 (App Router)
  * **BaaS / DB**: Supabase (PostgreSQL, Auth, Storage)
  * **Email Engine**: Nodemailer (SMTP 기반 백그라운드 직접 발송)
  * **UI / Styling**: Vanilla CSS, Tailwind CSS v4, Lucide React, Material Symbols
  * **Hosting & CI/CD**: Vercel (Cron Jobs 연동)

---

## 2. 배포, SEO 및 반응형 최적화 (Deployment, SEO & Responsive)
* **Vercel 배포 관리**: 
  * GitHub 저장소 연동을 통한 Vercel 자동 배포(CI/CD) 파이프라인 구축.
  * 환경 변수(Supabase, Gemini API, Google Drive Client ID, SMTP, `CRON_SECRET` 등) Vercel 대시보드 관리.
* **오픈그래프(Open Graph) 및 SEO 설정**: 
  * Next.js App Router의 내장 `Metadata` API와 `opengraph-image`를 활용해 슬랙, 카카오톡 등에 링크 공유 시 프로젝트 성격이 잘 보이도록 OG 태그(제목, 설명, 썸네일) 설정.
* **PC 및 모바일 반응형 최적화 (Responsive Web Design)**: 
  * Tailwind CSS의 반응형 유틸리티(`sm`, `md`, `lg`)를 적극 활용하여 다양한 디바이스 화면 크기에 완벽하게 대응.
  * **PC 화면**: 화면을 넓게 활용하여 좌측 폼, 우측 과거 이력 조회 등 다단(Multi-column) 레이아웃 적용.
  * **모바일 화면**: 상하 스크롤 위주의 1단(Single-column) 레이아웃으로 자동 전환. 하단 고정 내비게이션(`BottomNav`) 적용.

---

## 3. 사용자 및 인증 관리 (User & Auth Management)
* **회원가입 제한**: 사용자가 직접 회원가입 불가 (Supabase Auth 'Enable Signups' 비활성화).
* **사용자 권한**: 관리자(Admin)만 새로운 사용자 추가, 수정, 삭제 가능.
* **로그인 방식**: 이메일과 비밀번호 기반 로그인 전용으로, 소셜 로그인은 사용하지 않음.

---

## 4. 핵심 기능 요구사항 (Core Features)

### 4.1 사용자 기능 (User Features)
* **신규 템플릿 추가 및 관리**:
  * 제목 및 프롬프트 기본 내용 작성.
  * **구글 AI 모델 지정**: 템플릿을 생성할 때 해당 템플릿에서 구동할 최신 AI 모델(Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro 등)을 선택 및 지정.
  * **변수 설정**: 템플릿 내 변수(예: `{{주제}}`) 지정 및 활용 가이드 작성.
  * **예시(Examples) 관리**: 변수에 들어갈 모범 예시 데이터 다수 등록 기능.
* **프롬프트 생성 및 실행 전 검토**:
  * **과거 사용 이력 조회**: 템플릿 선택 시, 과거에 해당 템플릿을 어떻게 사용했는지 이력을 즉시 확인 가능.
  * **최종 프롬프트 확인 및 수정**: 변수가 채워진 최종 프롬프트를 API 실행 전 미리 확인 및 **수정** 가능.
  * **다중 소스 파일 첨부**: 필요시 로컬 파일(PDF 등) 및 구글 드라이브(Google Drive) 파일 첨부 가능.
    * *로컬 파일*: Supabase Storage 업로드 후 텍스트 추출 및 히스토리 연결.
    * *구글 드라이브*: Google Drive Picker API를 통해 문서 링크 및 파일 동적 연동.
* **프롬프트 실행 및 결과 처리**:
  * **API 실행**: 프롬프트(+첨부파일 텍스트)를 Gemini API로 전송 후 결과 확인.
  * **결과 인라인 수정**: 반환된 결과 텍스트를 웹상에서 인라인으로 직접 수정 및 DB 저장(`onBlur`).
  * **TXT 저장 및 백그라운드 메일 발송**:
    * `.txt` 파일 다운로드 기능.
    * **백그라운드 직접 이메일 전송**: `mailto:` 이메일 앱 팝업 없이 백엔드 API (`POST /api/email/send`)를 통해 로그인된 사용자의 이메일로 결과를 즉시 발송 (`isSendingEmail` 로딩 스피너 및 Toast 알림 제공).
* **기존 프롬프트 액션 (히스토리 리스트)**:
  * **재실행 (Re-run)**: 기존 내역을 불러와 내용/변수 수정 후 재실행.
  * **Copy**: 결과/프롬프트 클립보드 복사 (복사 완료 피드백 Toast 제공).
  * **ThumbsUp (좋아요)**: 결과 만족도를 표시하는 토글형 좋아요 카운터 연동.
* **데이터 관리 (본인 소유 권한 및 Soft Delete)**:
  * 사용자는 **본인이 생성한 템플릿 및 프롬프트 히스토리만 삭제 가능.**
  * 일반 사용자가 삭제 시 화면에서만 숨기는 **Soft Delete** 처리 수행 (`is_deleted = true`).

---

### 4.2 관리자 기능 (Admin Features)
* **상단 헤더 통일**: 일반 사용자 헤더([Header.tsx](file:///c:/Users/niceg/OneDrive/문서/Antigravity/my-prompt/src/presentation/components/Header.tsx))와 관리자 헤더([AdminHeader.tsx](file:///c:/Users/niceg/OneDrive/문서/Antigravity/my-prompt/src/presentation/components/admin/AdminHeader.tsx))의 로고, 프로필 아바타(`bg-[#6063ee]`), 이름 표시("관리자"), 로그아웃 버튼 스타일을 100% 동일하게 일원화.
* **사용자 계정 관리 (`/admin/users`)**: 
  * 새로운 사용자 계정 추가(UserModal), 권한(`admin`/`editor`/`user`) 수정 및 계정 삭제 기능 제공.
* **API 사용량 모니터링 (`/admin/usage`)**:
  * 대시보드를 통해 **사용자별 AI API 호출에 따른 월별/일별 사용량(호출 횟수, 토큰 소비량)**을 조회.
* **프롬프트 영구 삭제 (`/admin/prompts`)**:
  * 일반 사용자가 삭제(숨김) 처리한 프롬프트 목록을 별도 조회하고 최종 영구 삭제(Hard Delete) 수행.
* **Vercel 크론 모니터링 탭 (`/admin/cron`) ⭐ (신규)**:
  * Vercel Cron을 통한 Gemini AI 모델 자동 수집/동기화 이력(`cron_logs`) 모니터링.
  * 실행 상태(성공/실패 배지), 소요 시간(ms), 실행 일시 및 수동 동기화 실행 기능 제공.
  * **1년 경과 크론 로그 자동 정리 삭제 (Auto Pruning)**: 실행 시 1년(365일)이 지난 오래된 크론 로그를 DB에서 자동 cleanup 삭제.

---

## 5. 데이터베이스 아키텍처 (Supabase Schema)
* **`users` 테이블** (auth.users 연동): 
  * `id` (UUID), `email`, `role` ('admin' | 'user'), `name`.
* **`templates` 테이블**:
  * `id` (UUID), `title`, `content`, `variables_guide` (JSON), `examples` (JSON), `ai_model` (Text), `created_by` (UUID, FK).
* **`prompts_history` 테이블**: 
  * `id` (UUID), `user_id` (FK), `template_id` (FK), `input_variables` (JSON), `attached_file_path` (Text), `google_drive_file_id` (Text), `final_prompt` (Text), `result_text` (Text), `like_count` (Int), `is_deleted` (Boolean).
* **`gemini_models` 테이블**:
  * `id` (Text, PK), `name` (Text), `description` (Text), `badge` (Text), `is_active` (Boolean), `is_latest` (Boolean), `updated_at` (Timestamp).
* **`cron_logs` 테이블 ⭐ (신규)**:
  * `id` (UUID, PK), `job_name` (Text), `status` ('success' | 'failed'), `message` (Text), `updated_count` (Int), `execution_time_ms` (Int), `created_at` (Timestamp).

---

## 6. 공통 디자인 시스템 (Common Components)
`src/presentation/components/common/` 하위에 위치하여 시스템 전체의 UI/UX 일관성과 재사용성을 보장하는 원자 컴포넌트:

1. **`Toast.tsx`**: 글로벌/지역 단위 알림 토스트 UI (성공/오류/안내)
2. **`Modal.tsx`**: 배경 딤 처리, ESC 닫기, 스크롤 잠금이 적용된 대화상자 래퍼
3. **`Badge.tsx`**: 모델 라인업, 역할(`admin`/`user`), 실행 상태 태그/배지
4. **`Button.tsx`**: 표준 버튼 (`primary`, `outline`, `ghost`, `danger`) 및 로딩 애니메이션(`isLoading`) 지원
