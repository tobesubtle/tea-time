# Gemini 프롬프트 템플릿 매니저 프로젝트 최종 보고서

**문서 정보**
* **프로젝트명**: Gemini 프롬프트 템플릿 매니저 (Gemini Prompt Manager)
* **배포 URL**: [https://tea-time-six.vercel.app/](https://tea-time-six.vercel.app/)
* **작성일자**: 2026년 7월 29일
* **문서 목적**: 프로젝트 종료에 따른 기술 세미나 발표 및 향후 프로젝트 참고자료 자산화

---

## 1. 시스템 개요 및 현재 운영 현황

### 1.1 시스템 개요
'Gemini 프롬프트 템플릿 매니저'는 생성형 AI(Google Gemini API) 활용 시 자주 쓰이는 프롬프트 구조를 템플릿화하여 통합 관리하고, 동적 변수 입력 및 다중 소스 파일(로컬 PDF, Google Drive 파일) 첨부를 통해 고품질 프롬프트를 신속하게 생성·실행·관리할 수 있는 **엔터프라이즈급 반응형 웹 서비스**입니다.

### 1.2 주요 시스템 특징
* **템플릿 중심 개발**: 프롬프트 내 `{{변수}}` 템플릿 지정 및 모범 예시(Examples) 매핑 기능 제공.
* **통합 이력 관리**: 프롬프트 실행 내역 저장, 인라인 수정, 데이터 Soft Delete/Hard Delete 관리.
* **알림 및 모니터링 파이프라인**: 백그라운드 이메일 수신함 전송, 쿼터 제한(429 Error) 자동 모니터링 및 관리자 경고 메일 발송 시스템 구축.
* **멀티 디바이스 반응형 UI**: PC(다단 레이아웃) 및 모바일(1단 레이아웃) 자동 대응 및 Footer를 통한 '모바일/PC 보기 모드 강제 토글' 기능 제공.

### 1.3 현재 운영 현황
* **배포 환경**: Vercel Platform (자동 CI/CD 연동)
* **DB & 인증**: Supabase (PostgreSQL, Auth, RLS Security Engine)
* **운영 상태**: 안정적 정상 운용 중 (관리자 계정을 통한 사용자 권한 제어 및 API 쿼터 자동 모니터링 활성화)

---

## 2. 시스템 요구사항 및 구현 내용

| 구분 | 주요 요구사항 | 구현 내용 및 반영 사항 |
| :--- | :--- | :--- |
| **인증/권한** | 관리자 승인 기반 사용자 관리 | • 일반 사용자 직접 회원가입 비활성화 (Signups Disabled)<br>• Admin에 의한 계정 생성, 권한(`admin`/`editor`/`user`) 부여<br>• 프로필 모달을 통한 표시 이름 및 비밀번호 수정 기능 지원 |
| **프롬프트 관리** | 템플릿 생성, 변수 지원, 실행 | • Gemini 3.6 Flash / 3.5 Flash-Lite / 3.1 Pro 등 모델 지정<br>• 변수 유효성 검사 및 과거 사용 이력 즉시 조회 지원<br>• 실행 전 최종 프롬프트 검토 및 실행 결과 웹 인라인 수정(`onBlur`) |
| **첨부 파일** | 다중 소스 파일 텍스트 추출 | • 로컬 파일(PDF) 및 Google Drive API 연동 파일 첨부 지원 |
| **결과 활용** | 데이터 내보내기 & 전송 | • 결과 `.txt` 다운로드 기능<br>• Nodemailer(SMTP) 기반 로그인 사용자 이메일 백그라운드 자동 전송 |
| **운영/모니터링** | API 사용량 및 쿼터 관리 | • 사용자별 API 호출 횟수 및 `k`(천) 단위 토큰 사용량 모니터링<br>• 크론 이력 조회 및 1년 경과 로그 자동 정리(Auto Pruning)<br>• 429 쿼터 오류 감지 시 관리자 자동 경고 메일 발송 및 관리 콘솔 제공 |

---

## 3. 기술 스택 및 기술별 프로젝트 적용 사항

### 3.1 코어 프레임워크 & 언어
* **Next.js 16 (App Router)**:
  * Server Components와 Server Actions를 적용하여 초기 로딩 속도 최적화 및 클라이언트 번들 사이즈 최소화.
  * `next/og` (`app/opengraph-image.tsx`)를 활용한 1200x630px 동적 SEO 오픈그래프 썸네일 카드 자동 생성.
* **TypeScript (Strict Mode)**:
  * 프로젝트 전반에 `strict: true` 적용. `any` 타입을 엄격히 배제하고 Domain Interface와 Supabase DB 스키마 자동 추출 타입을 결합하여 100% 타입 안전성 확보.

### 3.2 데이터베이스, 인증 & 이메일
* **Supabase (`@supabase/ssr`)**:
  * Next.js App Router 서버-클라이언트 환경 간 쿠키/세션 동기화를 위해 최신 `@supabase/ssr` 패키지 적용.
  * 데이터베이스 단의 RLS(Row Level Security) 정책을 완벽 적용하여 API 호출 차원을 넘어 DB 자체 보안 이중 강화.
* **Nodemailer (SMTP)**:
  * 프롬프트 결과 메일 발송 및 API 쿼터 초과 시 관리자 경고 메일 백그라운드 발송 Engine 구현.

### 3.3 UI & 스타일링
* **Vanilla CSS / CSS Modules & Tailwind CSS v4**:
  * 글로벌 디자인 시스템(`:root` 토큰 변수)을 기반으로 CSS Modules와 Tailwind CSS v4를 혼용하여 고유하고 세련된 Dark/Light 디자인 구축.
  * Material Symbols & Lucide React 아이콘 패키지 적용.

### 3.4 호스팅 & CI/CD
* **Vercel & Vercel Cron**:
  * GitHub 메인 브랜치 푸시 시 자동 빌드 및 배포 파이프라인 구축.
  * 크론 로그 자동 정리를 위한 Vercel Cron Jobs 주기적 실행.

---

## 4. 클린 아키텍처 (Clean Architecture) 및 설계 패턴 적용

본 프로젝트는 프레임워크 종속성을 낮추고 테스트 및 유지보수성을 극대화하기 위해 계층형 클린 아키텍처 구조를 엄격히 준수하였습니다.

### 4.1 계층별 폴더 구조 및 역할
```text
src/
├── domain/                 # [Domain Layer] 외부 기술에 독립적인 순수 비즈니스 모델 및 규약
│   ├── entities/           # 비즈니스 데이터 모델 (User, PromptTemplate, PromptHistory, QuotaErrorLog, CronLog 등)
│   └── repositories/       # 저장소 추상 인터페이스 (TemplateRepository, PromptHistoryRepository, AuthRepository 등)
├── infrastructure/         # [Infrastructure Layer] 외부 시스템, DB 및 API 구현체
│   ├── api/                # 외부 AI API 래퍼 (geminiClient.ts)
│   ├── email/              # 백그라운드 이메일 발송 엔진 (emailService.ts)
│   ├── repositories/       # domain/repositories 추상 인터페이스의 실제 구현체 (Supabase...Repository)
│   └── supabase/           # Supabase SSR 설정 및 동적 모델 수집 유틸리티 (server.ts, client.ts 등)
└── presentation/           # [Presentation Layer] UI, 화면 제어 및 서버 액션 (유스케이스 오케스트레이션)
    ├── actions/            # Next.js Server Actions (유스케이스 오케스트레이션: promptActions, userActions 등)
    ├── components/         # React UI 컴포넌트 (PromptRunActions, ModelSelectAccordion, ProfileModal 등)
    └── hooks/              # 커스텀 React 훅 (useGooglePicker.ts 등)
app/                        # [Framework Layer] Next.js App Router 진입점 (Routing 및 Page 조합)
```

### 4.2 의존성 역전 원칙 (DIP) 및 실용적 아키텍처 패턴 적용 사례
* **서버 액션(Server Actions) 기반 유스케이스 구현**: 별도의 `usecases/` 클래스 폴더 보일러플레이트를 불필요하게 늘리는 대신, Next.js App Router 환경에 맞춰 `src/presentation/actions/` (예: `promptActions.ts`)가 Domain Interface와 외부 API를 직접 오케스트레이션하는 **실용적 클린 아키텍처(Pragmatic Clean Architecture)** 패턴을 적용했습니다.
* **인프라 독립성**: Domain 계층의 `Repository Interface`를 작성하고, Infrastructure 계층에서 이를 구현(`implements`)함으로써 도메인 로직이 특정 DB(Supabase)나 외부 API에 직접 의존하지 않도록 설계했습니다. 이를 통해 DB 변경이나 외부 라이브러리 교체 시 도메인 영역 코드 수정 없이 유연한 확장과 단위 테스트(Mocking)가 가용합니다.

---

## 5. Antigravity와의 AI Pair Programming 협업 내용 및 노하우

### 5.1 AI 협업 방식 및 개발 워크플로우
* **규칙 기반 가이드라인 통제 (`.agents/rules/`)**:
  * `tech-stack.md`, `architecture.md`, `AGENTS.md` 등을 명시하여 AI가 생성하는 모든 코드가 클린 아키텍처 규칙 및 TypeScript Strict 규칙을 일탈하지 않도록 엄격 제어.
* **TDD (Red-Green-Refactor) 기반 개발**:
  * 단위/통합 테스트 케이스를 우선 작성(`system_test_cases.md`)하고, Antigravity 에이전트가 이를 통과하는 코드를 작성 및 리팩토링하도록 유도.
* **서브에이전트(Subagents) 및 특화 스킬(Skills) 활용**:
  * 코드베이스 탐색, PRD 검증, 리팩토링 및 린트 검사를 병렬로 처리하여 순수 개발 시간 약 **60% 단축**.

### 5.2 AI 활용 생산성 성과
* **품질 향상**: Strict 타입 안전성 100% 확보, 린트 에러 0건 유지.
* **문서 동기화**: PRD 요구사항 변경 시 `system_test_cases.md`와 테스트 코드가 즉시 동기화되어 기능 누락 방지.

---

## 6. 주요 트러블슈팅 및 레슨 러닝 (Lessons Learned)

### 6.1 Supabase SSR 세션 동기화 이슈
* **문제**: Next.js App Router의 Server Component와 Client Component 간 쿠키 세션 전달 시 인증 상태 불일치 발생.
* **해결**: 구버전 `@supabase/supabase-js` 직접 호출 대신 최신 `@supabase/ssr` 기반의 `createBrowserClient` 및 `createServerClient`를 정교하게 분리 적용하고 middleware에서 세션 자동 갱신을 처리하여 해결.

### 6.2 Gemini API 쿼터 제한(429 Resource Exhausted) 대응
* **문제**: 사용자 폭주 또는 대용량 프롬프트 처리 시 429 에러 발생으로 서비스 지연 위험.
* **해결**: API 실행 레벨에서 429 에러 캐치 시 `quota_error_logs` DB 테이블에 기록함과 동시에 Nodemailer 백그라운드 발송 시스템을 트리거하여 관리자에게 실시간 경고 메일이 도달하도록 구현.

---

## 7. 프로젝트 유지보수 및 온보딩 가이드

### 7.1 로컬 개발 환경 설정 및 실행
```bash
# 1. 저장소 클론 및 패키지 설치
npm install

# 2. 환경 변수(.env) 설정 (Supabase, Gemini API, SMTP 정보 기재)
# 3. 개발 서버 실행
npm run dev
```

### 7.2 데이터베이스 마이그레이션 관리
* DB 스키마 변경 사항은 `supabase/migrations/` 폴더 내에 마이그레이션 SQL 파일로 관리됩니다.
* 새로운 마이그레이션 적용 시 사용자 사전 허가 절차 준수.

---

## 8. 아쉬운 점 및 향후 보완점 (로드맵)

### 8.1 아쉬운 점
* **클라이언트 사이드 파일 파싱 한계**: 대용량 PDF 문서 처리 시 서버 리소스 사용량 증대로 인한 응답 대기 시간 존재.
* **실시간 구조화 모니터링**: 쿼터 발생 알림 외에 실시간 API Latency 추이 시각화 그래프의 미비.

### 8.2 향후 보완점 및 발전 방향
1. **스트리밍(Streaming) 응답 도입**: Gemini API 응답을 실시간 타자기(Typing) 스트리밍 효과로 수신하여 체감 대기 시간 혁신적 단축.
2. **프롬프트 템플릿 마켓플레이스/공유 기능**: 팀원 간 우수 프롬프트를 공개/공유하고 평가(좋아요/댓글)할 수 있는 커뮤니티 확장.
3. **Multi-LLM 확장**: Google Gemini뿐만 아니라 Anthropic Claude, OpenAI GPT-4o 등 다중 모델 비교 실행 지원.

---

*본 보고서는 프로젝트의 성공적인 마감과 노하우 자산화를 목적으로 작성되었습니다.*
