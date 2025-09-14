# Cardano dApp Basic

Cardano 블록체인 기반 탈중앙화 애플리케이션(dApp) 기본 템플릿입니다.

## 프로젝트 특징

### 🏗️ Feature-based 구조

```
src/
├── features/           # 기능별 모듈
│   ├── wallet/        # 지갑 관련 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   ├── send/          # 송금 관련 기능
│   └── history/       # 거래내역 관련 기능
└── shared/            # 공통 모듈
    ├── components/
    ├── hooks/
    ├── services/
    ├── styles/
    └── utils/
```

각 기능(feature)은 독립적으로 관리되며, 컴포넌트, 훅, 서비스, 스타일, 타입이 함께 구성됩니다.

### 🎨 tweakcn CSS 테마 시스템

- **CSS 변수 기반**: `theme.css`를 [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme)에서 직접 복사하여 사용
- **완전한 테마 통합**: 모든 컴포넌트가 CSS 변수를 참조하여 일관된 테마 적용
- **다크/라이트 모드**: 간단한 클래스 변경으로 테마 전환 가능
- **Ant Design 호환**: Ant Design 컴포넌트도 테마 변수 사용

### .env 세팅

```shell
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=previewxxxxxxxxxx
NEXT_PUBLIC_NETWORK=Preview
```
