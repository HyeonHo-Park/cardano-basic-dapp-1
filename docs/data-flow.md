# 데이터 플로우 다이어그램

## 전체 데이터 흐름

```mermaid
flowchart TD
    subgraph "Feature Modules"
        WF[features/wallet]
        SF[features/send]
        HF[features/history]
    end

    subgraph "Shared Hooks"
        UW[shared/hooks/useWallet]
        UT[shared/hooks/useTransaction]
        LS[Local State - useState]
    end

    subgraph "Feature Services"
        WS[features/wallet/services]
        SS[features/send/services]
        TS[features/history/services]
    end

    subgraph "External Data Sources"
        CIP30[CIP-30 Wallet API]
        BF[Blockfrost API]
        CSL[Cardano Serialization Lib]
    end

    WF <--> UW
    SF <--> UW
    SF --> SS
    HF <--> UT

    UW <--> WS
    UT <--> TS

    WS <--> CIP30
    SS <--> CIP30
    SS <--> CSL
    TS <--> BF

    UW --> LS
    UT --> LS
```

## 지갑 상태 데이터 플로우

```mermaid
flowchart LR
    WalletAPI[CIP-30 Wallet] --> GetInfo{정보 수집}
    GetInfo --> Address[주소 정보]
    GetInfo --> Balance[잔액 정보]
    GetInfo --> Network[네트워크 정보]
    GetInfo --> UTXO[UTXO 정보]

    Address --> WalletState[(지갑 상태 - useState)]
    Balance --> WalletState
    Network --> WalletState
    UTXO --> WalletState

    WalletState --> UI[UI 컴포넌트들]
    WalletState --> Services[서비스 레이어]
```

## 송금 데이터 변환 과정

```mermaid
flowchart TD
    UserInput[사용자 입력] --> Validation{유효성 검증}
    Validation -->|Valid| Transform[데이터 변환]
    Validation -->|Invalid| Error[에러 표시]

    Transform --> ADAToLovelace[ADA → Lovelace]
    Transform --> AddressValidation[주소 형식 검증]
    Transform --> MetadataEncoding[메타데이터 인코딩]

    ADAToLovelace --> TxBuilder[트랜잭션 빌더]
    AddressValidation --> TxBuilder
    MetadataEncoding --> TxBuilder

    TxBuilder --> SignRequest[서명 요청]
    SignRequest --> Submit[네트워크 제출]
    Submit --> Result[결과 반환]
```

## 상태 업데이트 매트릭스

| 액션              | 지갑 상태 (useState) | 거래 상태 (useState) | UI 상태 (로컬) |
| ----------------- | -------------------- | -------------------- | -------------- |
| **지갑 연결**     | ✅ 업데이트          | ➖ 변화없음          | ✅ 로딩 상태   |
| **잔액 새로고침** | ✅ 잔액만            | ➖ 변화없음          | ✅ 로딩 상태   |
| **송금 실행**     | ➖ 변화없음          | ✅ 진행 상태         | ✅ 로딩 상태   |
| **송금 완료**     | ⏳ 자동 새로고침     | ✅ 완료 상태         | ✅ 성공 메시지 |
| **거래내역 조회** | ➖ 변화없음          | ✅ 업데이트          | ✅ 로딩 상태   |

## 에러 전파 경로

```mermaid
flowchart TD
    ServiceError[Service Layer Error] --> ErrorHandler{에러 핸들러}

    ErrorHandler --> ValidationError[Validation Error]
    ErrorHandler --> NetworkError[Network Error]
    ErrorHandler --> WalletError[Wallet Error]
    ErrorHandler --> UnknownError[Unknown Error]

    ValidationError --> UserMessage1[사용자 친화적 메시지]
    NetworkError --> UserMessage2[네트워크 재시도 안내]
    WalletError --> UserMessage3[지갑 확인 안내]
    UnknownError --> UserMessage4[일반적 에러 메시지]

    UserMessage1 --> UI[UI 에러 표시]
    UserMessage2 --> UI
    UserMessage3 --> UI
    UserMessage4 --> UI
```

## Feature-based React Hook 상태 관리

```mermaid
flowchart TD
    Component[Feature Component] --> UseHook[Feature/Shared Hook]
    UseHook --> UseState[useState]
    UseHook --> UseEffect[useEffect]
    UseHook --> Service[Feature Service]

    UseState --> LocalState[Local State]
    UseEffect --> SideEffects[Side Effects]
    Service --> ExternalAPI[External APIs]

    LocalState --> Render[Component Re-render]
    SideEffects --> StateUpdate[State Update]
    StateUpdate --> Render
```
