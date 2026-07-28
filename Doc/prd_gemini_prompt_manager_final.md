# PRD: Gemini 프롬프트 템플릿 매니저 (최종본)

## 1. 프로젝트 개요 (Overview)
* **목표**: Gemini API를 이용해 자주 쓰는 프롬프트를 템플릿화하여 관리하고, 변수 입력 및 파일(로컬/구글 드라이브) 첨부를 통해 효율적으로 프롬프트를 생성·실행·관리할 수 있는 반응형 웹 서비스 구축.
* **기술 스택**: 
  * **Framework**: Next.js (최신 버전, App Router 사용 `npx create-next-app@latest .`)
  * **BaaS / DB**: Supabase (PostgreSQL, Auth, Storage)
  * **UI Components**: shadcn/ui, Tailwind CSS
  * **Hosting & CI/CD**: Vercel

## 2. 배포, SEO 및 반응형 최적화 (Deployment, SEO & Responsive)
* **Vercel 배포 관리**: 
  * GitHub 저장소 연동을 통한 Vercel 자동 배포(CI/CD) 파이프라인 구축.
  * 환경 변수(Supabase, Gemini API, Google Drive API 등) Vercel 대시보드 관리.
* **오픈그래프(Open Graph) 및 SEO 설정**: 
  * Next.js App Router의 내장 `Metadata` API와 `opengraph-image`를 활용해 슬랙, 카카오톡 등에 링크 공유 시 프로젝트 성격이 잘 보이도록 OG 태그(제목, 설명, 썸네일) 설정.
* **PC 및 모바일 반응형 최적화 (Responsive Web Design)**: 
  * Tailwind CSS의 반응형 유틸리티(`sm`, `md`, `lg`)를 적극 활용하여 다양한 디바이스 화면 크기에 완벽하게 대응.
  * **PC 화면**: 화면을 넓게 활용하여 좌측 폼, 우측 과거 이력 조회 등 다단(Multi-column) 레이아웃 적용.
  * **모바일 화면**: 상하 스크롤 위주의 1단(Single-column) 레이아웃으로 자동 전환. 터치 친화적인 넉넉한 버튼 크기(Minimum 44px) 확보 및 가독성 높은 모바일 UI(하단 고정 액션 바 등) 적용.

## 3. 사용자 및 인증 관리 (User & Auth Management)
* **회원가입 제한**: 사용자가 직접 회원가입 불가 (Supabase Auth 'Enable Signups' 비활성화).
* **사용자 권한**: 관리자(Admin)만 새로운 사용자 추가, 수정, 삭제 가능.
* **로그인 방식**: 이메일과 비밀번호 기반 로그인 전용으로, 소셜 로그인은 절대 사용하지 않음.

---

## 4. 핵심 기능 요구사항 (Core Features)

### 4.1 사용자 기능 (User Features)
* **신규 템플릿 추가 및 관리**:
  * 제목 및 프롬프트 기본 내용 작성.
  * **구글 AI 모델 지정**: 템플릿을 생성할 때 해당 템플릿에서 구동할 AI 모델(예: Gemini 1.5 Pro, Gemini 1.5 Flash 등)을 선택 및 지정.
  * **변수 설정**: 템플릿 내 변수(예: `{{주제}}`) 지정 및 활용 가이드 작성.
  * **예시(Examples) 관리**: 변수에 들어갈 모범 예시 데이터 다수 등록 기능.
* **프롬프트 생성 및 실행 전 검토**:
  * **과거 사용 이력 조회**: 템플릿 선택 시, 과거에 해당 템플릿을 어떻게 사용했는지 이력을 즉시 확인 가능.
  * **최종 프롬프트 확인 및 수정**: 변수가 채워진 최종 프롬프트를 API 실행 전 미리 확인 및 **수정** 가능.
  * **다중 소스 파일 첨부**: 필요시 로컬 파일(PDF 등) 및 구글 드라이브(Google Drive) 파일 첨부 가능.
    * *로컬 파일*: Supabase Storage 업로드 후 텍스트 추출.
    * *구글 드라이브 (인증 자동화)*: 최초 1회 인증(OAuth Offline Access) 시 발급받은 Refresh Token을 DB에 저장하여, 이후에는 추가 인증 절차 없이 원활하게 구글 드라이브 파일 선택 및 텍스트 추출 가능.
* **프롬프트 실행 및 결과 처리**:
  * **API 실행**: 프롬프트(+첨부파일 텍스트)를 Gemini API로 전송 후 결과 확인.
  * **결과 수정**: 반환된 결과 텍스트를 웹상에서 인라인으로 직접 수정.
  * **TXT 저장 및 메일 송부**: 최종 텍스트를 `.txt` 파일로 다운로드하거나, 해당 `.txt` 파일을 첨부하여 이메일로 발송. (디폴트 수신 메일은 현재 로그인한 본인의 이메일 주소.)
* **기존 프롬프트 액션 (히스토리 리스트)**:
  * **재실행 (Re-run)**: 기존 내역을 불러와 내용/변수 수정 후 재실행.
  * **Copy**: 결과/프롬프트 클립보드 복사 (복사 완료 피드백 Toast 제공).
  * **이메일 발송**: 과거 히스토리 결과물 다시 메일로 발송.
  * **ThumbsUp (좋아요)**: 결과 만족도를 표시하는 토글형 좋아요 카운터 연동.
* **데이터 관리 (본인 소유 권한 및 Soft Delete)**:
  * 사용자는 **본인이 생성한 템플릿 및 프롬프트 히스토리만 삭제 가능.**
  * 일반 사용자가 삭제 시 화면에서만 숨기는 **Soft Delete** 처리 수행 (`is_deleted = true`). 사용자는 영구 삭제로 인지함.

### 4.2 관리자 기능 (Admin Features)
* **사용자 계정 관리**: 
  * 새로운 사용자 계정 추가, 정보 수정 및 계정 삭제 기능 제공.
* **API 사용량 모니터링 (Usage Dashboard)**:
  * 관리자는 대시보드를 통해 **사용자별 AI API 호출에 따른 월별 사용량(호출 횟수 등)**을 한눈에 조회 가능.
* **프롬프트 실제 삭제 (Hard Delete)**:
  * 실제 DB에서 데이터를 날리는 **Hard Delete** 수행.
  * 일반 사용자가 삭제(숨김) 처리한 프롬프트 목록을 별도 조회하고 최종 영구 삭제 가능.

---

## 5. 데이터베이스 아키텍처 스케치 (Supabase Schema)
* **`users` 테이블** (auth.users 연동): 
  * `id` (UUID), `email`, `role` ('admin' | 'user').
  * `google_refresh_token` (Text) - 구글 드라이브 지속 접근을 위한 토큰 저장.
* **`templates` 테이블**:
  * `id` (UUID), `title`, `content`, `variables_guide` (JSON), `examples` (JSON).
  * `ai_model` (Text) - 해당 템플릿에 지정된 구글 AI 모델 식별자.
  * **`created_by` (UUID, FK)** - 템플릿 생성자 ID (본인 소유 데이터 확인 및 삭제 권한 체크용).
* **`prompts_history` 테이블**: 
  * `id` (UUID), `user_id` (FK), `template_id` (FK), `input_variables` (JSON), `attached_file_path` (Text - 로컬), `google_drive_file_id` (Text - 구글드라이브), `final_prompt` (Text), `result_text` (Text), `like_count` (Int - 좋아요 수), `is_deleted` (Boolean, Default: false).
  * **`created_at` (Timestamp)** - 실행 일시 (관리자의 월별 사용량 통계 조회용).
  * **`token_usage` (Int)** - 해당 프롬프트 실행 시 발생한 토큰 사용량 (사용량 모니터링 목적).

---

## 6. UI/UX 구현 가이드 (shadcn/ui)
* **레이아웃 및 메타데이터**: 최상위 `layout.tsx`에 Open Graph 태그 및 기본 메타데이터 설정. 모바일 뷰포트가 확실히 적용되도록 확인.
* **Login Page**: `Card`, `Input`, `Button`으로 구성된 심플한 폼 구성. 모바일에서 화면 전체 너비를 차지하지 않도록 좌우 여백(Padding) 적용.
* **Prompt Creation Page (반응형 레이아웃)**: 
  * **PC**: 좌측 변수 입력 및 파일 첨부 폼, 우측 과거 이력 아코디언 배치 (`grid-cols-2` 등 활용).
  * **모바일**: 과거 이력 아코디언을 폼 하단으로 내리거나 탭으로 분리하여 세로 스크롤 피로도를 줄임.
* **Template Edit/Create View**: 템플릿 작성 시 사용할 구글 AI 모델을 선택할 수 있는 `Select` 컴포넌트 추가.
* **Result View**: `Textarea`로 결과 수정 지원. 모바일 환경에서는 가상 키보드가 활성화될 때 액션 버튼들이 가려지지 않도록 하단 플로팅 버튼 처리 등 사용성 고려.
* **History Page**: `Table` 형태로 이력 제공. 모바일에서는 데이터가 잘리지 않도록 가로 스크롤(overflow-x-auto)을 제공하거나 리스트(카드) 형태로 뷰 전환. 본인이 작성한 항목에만 삭제 버튼 활성화.
* **Admin Dashboard**: `Tabs`를 활용하여 유저 관리, **월별 사용량 통계(Usage)**, 전체 템플릿 관리, Soft Delete된 프롬프트 관리 탭 분리. 월별 사용량 탭에서는 사용자별 데이터를 차트 또는 표 형태로 제공.
