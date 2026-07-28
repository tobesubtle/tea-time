---
trigger: always_on
---

# 기술 스택 (Tech Stack) 가이드라인

이 프로젝트에서 사용되는 주요 기술 스택과 각 기술을 사용할 때 지켜야 할 핵심 원칙입니다.

## 1. 코어 프레임워크: Next.js (App Router) & React
* **버전 및 방식:** Next.js App Router 방식을 기본으로 사용하며, 서버 컴포넌트(Server Components)와 서버 액션(Server Actions)을 적극 활용합니다.
* **관련 규칙:** Next.js와 관련된 상세한 코드 작성 규칙은 `nextjs-framework.md` 룰 파일을 따릅니다.

## 2. 언어: TypeScript
* **엄격한 타입 검사 (Strict Mode):** TypeScript는 항상 엄격한 설정(`strict: true`)을 유지합니다.
* **`any` 지양:** `any` 타입의 사용을 엄격히 금지합니다. 데이터 모델은 명확히 `interface`나 `type`으로 정의하며, 함수의 매개변수와 반환 타입을 항상 명시하여 타입 안정성을 확보합니다.

## 3. 데이터베이스 및 인증 (BaaS): Supabase
* **Next.js SSR 호환 패키지 사용:** Next.js App Router 환경에서는 서버와 클라이언트 간의 쿠키/세션 동기화가 매우 중요하므로, 구버전 패키지가 아닌 반드시 최신 **`@supabase/ssr`** 패키지를 사용하여 클라이언트를 초기화합니다.
* **데이터베이스 타입 제너레이션:** 데이터베이스 통신 시 `any`나 임의의 타입을 사용하지 않고, Supabase CLI를 활용해 데이터베이스 스키마에서 **TypeScript 타입을 추출(Generate)**하여 적용합니다. (예: `supabase> type`)
* **데이터 계층 보안 (Row Level Security):** API 라우트에서 인증 상태를 체크하는 것과 더불어, 데이터베이스 테이블 자체에 **RLS (Row Level Security)** 정책을 확실하게 설정하여 데이터를 이중으로 보호합니다.
* ** 1.4 마이그레이션 (Migration):** supabase/migrations 폴더에 위치, 마이그레이션을 수정, 삭제, 신규생성할 때는 항상 사용자의 허가 받기

## 4. 스타일링 (Styling): CSS Modules / Vanilla CSS
* **기본 원칙:** 최대의 유연성과 제어권을 확보하기 위해 Tailwind CSS와 같은 유틸리티 프레임워크 대신 **Vanilla CSS** 또는 **CSS Modules**(`.module.css`)를 기본 스타일링 도구로 사용합니다.
* **디자인 시스템 구축:** 일관된 디자인(색상, 여백, 타이포그래피)을 유지하기 위해 글로벌 CSS 변수(`:root { --primary-color: #... }`)를 적극 활용합니다.

## 5. 상태 관리 (State Management)
* **서버 상태 우선:** Next.js 서버 컴포넌트에서의 데이터 직접 페칭(fetch)을 우선하여 불필요한 클라이언트 전역 상태를 만들지 않습니다.
* **가벼운 클라이언트 상태 관리:** UI 조작(모달, 토글 등)을 위한 클라이언트 사이드 전역 상태 관리가 반드시 필요한 경우, 보일러플레이트가 적고 가벼운 **Zustand**를 사용하는 것을 권장합니다.
