---
trigger: always_on
---

# Next.js (App Router) 기반 클린 아키텍처 가이드

이 문서는 `shop-dashboard` 프로젝트에 클린 아키텍처(Clean Architecture) 원칙을 적용하기 위한 폴더 구조 및 계층별 가이드라인입니다.

## 1. 아키텍처 개요
클린 아키텍처의 핵심은 **관심사의 분리(Separation of Concerns)**와 **의존성 역전 원칙(Dependency Inversion Principle)**을 통해 비즈니스 로직을 외부 기술(프레임워크, DB 등)로부터 격리하는 것입니다. 의존성은 항상 바깥쪽(프레임워크, UI, DB)에서 안쪽(핵심 비즈니스 로직)으로 향해야 합니다.

## 2. 권장 폴더 구조
프로젝트 루트 하위에 `src` 폴더를 구성하여 클린 아키텍처의 계층을 명확히 나눕니다.

```text
shop-dashboard/
├── app/                        # [Framework Layer] Next.js App Router (진입점)
│   ├── (routes)/               # 페이지 컴포넌트 (page.tsx, layout.tsx 등)
│   └── api/                    # Next.js API Routes (필요 시)
│
├── src/                        # [Clean Architecture 핵심 계층]
│   │
│   ├── domain/                 # [Domain Layer] 핵심 비즈니스 로직 (외부 의존성 없음)
│   │   ├── entities/           # 비즈니스 모델, 순수 데이터 구조 (예: User, Product)
│   │   ├── repositories/       # 저장소 인터페이스 (추상화된 Interface/Type)
│   │   └── usecases/           # 애플리케이션 비즈니스 규칙 (예: GetProductsUseCase)
│   │
│   ├── infrastructure/         # [Infrastructure Layer] 외부 시스템 구현체
│   │   ├── api/                # 외부 API 클라이언트 래핑 (Axios 등)
│   │   ├── db/                 # 데이터베이스 연결 설정 (Prisma, Drizzle 등)
│   │   └── repositories/       # domain/repositories 인터페이스의 실제 구현체
│   │
│   ├── presentation/           # [Presentation Layer] UI 계층
│   │   ├── components/         # 순수 React UI 컴포넌트
│   │   ├── hooks/              # 커스텀 React 훅 (Usecase 연동)
│   │   └── store/              # 전역 상태 관리 (Zustand 등)
│   │
│   └── shared/                 # [Shared] 공통 유틸리티
│       ├── utils/              # 유틸리티 함수
│       ├── constants/          # 상수 모음
│       └── errors/             # 공통 에러 객체
```

## 3. 계층별 상세 설명

### 3.1 Domain Layer (`src/domain/`)
* **특징**: 애플리케이션의 심장부입니다. 어떠한 외부 기술(React, Next.js, DB 등)에도 의존하지 않는 순수한 TypeScript(또는 JavaScript) 코드로만 작성됩니다.
* **Entities**: 도메인 객체를 정의합니다.
* **Usecases**: 애플리케이션의 실제 동작(예: 장바구니에 담기, 상품 목록 조회)을 오케스트레이션합니다.
* **Repositories (인터페이스)**: 외부 시스템과 통신하기 위한 **규약(계약서)**만을 정의합니다. 실제 데이터를 어떻게 가져올지는 전혀 관심이 없습니다.

### 3.2 Infrastructure Layer (`src/infrastructure/`)
* **특징**: 기술적인 세부 사항을 다루는 곳입니다. DB나 외부 API와의 실제 통신을 담당합니다.
* **Repositories (구현체)**: `domain/repositories`에 정의된 인터페이스를 받아와서 **실제로 구현**합니다. 예를 들어 DB 통신을 위한 로직(Prisma Client 연동 등)이 여기에 위치합니다. 
* **왜 분리하는가?**: 도메인 로직을 수정하지 않고도 데이터베이스나 외부 연동 서비스를 쉽게 교체(Prisma -> TypeORM 등)할 수 있도록 하기 위함입니다.

### 3.3 Presentation Layer (`src/presentation/`)
* **특징**: 화면을 그리는 역할에 집중합니다. `domain` 계층의 Usecase를 호출하여 데이터를 가져오거나 넘겨줍니다.
* Next.js의 고유 기능(라우팅 등)보다는 순수 React에 가깝게 작성하여, 컴포넌트의 재사용성과 테스트 용이성을 높입니다.

### 3.4 Framework Layer (`app/`)
* **특징**: Next.js App Router의 진입점입니다. 
* `presentation` 계층의 컴포넌트들을 조합하여 페이지를 구성하고 라우팅을 처리합니다. 최대한 얇은 계층으로 유지하여 프레임워크 종속성을 최소화합니다.

## 4. 예시: 저장소 추상화 (의존성 역전)

**Domain 계층 (계약서)**: `src/domain/repositories/ProductRepository.ts`
```typescript
// 어떤 라이브러리(DB)를 쓰는지 몰라도 됩니다.
export interface ProductRepository {
  getProductById(id: string): Promise<Product | null>;
}
```

**Infrastructure 계층 (실제 구현)**: `src/infrastructure/repositories/PrismaProductRepository.ts`
```typescript
import { ProductRepository } from '@/domain/repositories/ProductRepository';
import prisma from '@/infrastructure/db/prisma'; // 특정 DB 기술(Prisma)에 의존

// 'ProductRepository' 계약을 따르겠다고 선언(implements)합니다.
export class PrismaProductRepository implements ProductRepository {
  async getProductById(id: string): Promise<Product | null> {
    const data = await prisma.product.findUnique({ where: { id } });
    return data ? new Product(...) : null;
  }
}
```

Usecase는 오직 `ProductRepository` 인터페이스만 바라보고 작업하므로, 실제 데이터가 어디서 오는지 몰라도 완벽하게 동작할 수 있습니다.