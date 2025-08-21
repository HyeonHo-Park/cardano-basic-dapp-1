# 카르다노 dApp - 페이지 중심 아키텍처

> 입문/학습용 카르다노 dApp 개발 프로젝트  
> 페이지별 독립 개발을 위한 실용적 아키텍처

## 🎯 페이지 중심 dApp 구조

### 📁 **전체 디렉토리 구조**

```
src/
├── pages/                          # 페이지별 독립 개발
│   ├── index.tsx                       # 홈/대시보드
│   │
│   ├── wallet/                     # 지갑 관리 페이지
│   │   ├── index.tsx                   # 지갑 페이지 메인
│   │   ├── WalletConnect.tsx           # 지갑 연결 (지갑 페이지 전용)
│   │   └── WalletInfo.tsx              # 지갑 정보 (지갑 페이지 전용)
│   │
│   ├── send/                       # 송금 페이지
│   │   ├── index.tsx                   # 송금 페이지 메인
│   │   ├── AddressInput.tsx            # 주소 입력 (송금 페이지 전용)
│   │   ├── AmountInput.tsx             # 금액 입력 (송금 페이지 전용)
│   │   └── SendForm.tsx                # 송금 폼 (송금 페이지 전용)
│   │
│   └── history/                    # 거래내역 페이지
│       ├── index.tsx                   # 거래내역 페이지 메인
│       ├── TransactionCard.tsx         # 거래 카드 (거래내역 페이지 전용)
│       ├── TransactionList.tsx         # 거래 리스트 (거래내역 페이지 전용)
│       └── TransactionFilter.tsx       # 필터 (거래내역 페이지 전용)
│
├── components/
│   └── common/                     # 진짜 공통 컴포넌트만
│       ├── Button/                     # 공통 버튼
│       ├── Card/                       # 공통 카드
│       ├── Modal/                      # 공통 모달
│       ├── Loading/                    # 공통 로딩
│       └── Layout/                     # 공통 레이아웃
│
├── hooks/                          # 공통 비즈니스 로직
│   ├── useWallet.ts                    # 지갑 관련 로직
│   └── useTransaction.ts               # 트랜잭션 관련 로직
│
├── services/                       # API 통신 서비스
│   ├── wallet.ts                       # 지갑 연동 서비스
│   ├── send.ts                         # 송금 서비스
│   └── transaction.ts                  # 트랜잭션 서비스
│
├── store/                          # 전역 상태 관리
│   ├── wallet/                         # 지갑 상태
│   ├── transaction/                    # 트랜잭션 상태
│   └── ui/                             # UI 상태
│
├── utils/                          # 유틸리티 함수들
│   ├── cardano.ts                      # 카르다노 유틸리티
│   └── constants.ts                    # 상수들
│
└── types/                          # 타입 정의들
    ├── wallet.ts                       # 지갑 관련 타입
    └── transaction.ts                  # 트랜잭션 관련 타입
```

## 🔑 **핵심 설계 원칙**

### 1. **페이지별 완전 독립**

- 각 페이지 폴더에 필요한 컴포넌트 모두 포함
- 다른 페이지 컴포넌트 의존성 없음
- 페이지별 독립적 개발 가능

### 2. **진짜 공통만 공통**

- `components/common/`: Button, Card, Modal 등 범용 UI만
- 재사용 걱정 없이 페이지별 컴포넌트 개발

### 3. **빠른 개발 중심**

- 컴포넌트 재사용보다 개발 속도 우선
- 명확한 책임과 간단한 구조

## 🚀 **개발 장점**

- ✅ **빠른 개발**: 다른 페이지 영향 걱정 없음
- ✅ **명확한 구조**: 어디서 뭘 찾을지 명확
- ✅ **쉬운 수정**: 한 페이지 수정이 다른 페이지에 영향 안 줌
- ✅ **독립적 배포**: 페이지별 독립적 개발/테스트 가능
