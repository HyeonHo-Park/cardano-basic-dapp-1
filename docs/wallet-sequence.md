# 지갑 연결 시퀀스 다이어그램

## 지갑 연결 프로세스

```mermaid
sequenceDiagram
    participant User
    participant WalletPage
    participant useWallet
    participant WalletService
    participant Browser
    participant WalletExtension

    User->>WalletPage: 지갑 연결 클릭
    WalletPage->>useWallet: connectWallet()
    useWallet->>WalletService: connectWallet(walletKey)

    WalletService->>Browser: window.cardano[walletKey]
    Browser-->>WalletService: WalletAPI 객체

    WalletService->>WalletExtension: enable()
    WalletExtension-->>User: 연결 승인 요청
    User-->>WalletExtension: 승인
    WalletExtension-->>WalletService: WalletInstance

    WalletService->>WalletExtension: getNetworkId()
    WalletExtension-->>WalletService: Network ID

    alt 네트워크 검증 성공
        WalletService->>WalletExtension: getUsedAddresses()
        WalletService->>WalletExtension: getUnusedAddresses()
        WalletService->>WalletExtension: getChangeAddress()
        WalletService->>WalletExtension: getBalance()

        WalletExtension-->>WalletService: 지갑 정보
        WalletService-->>useWallet: ConnectedWalletInfo
        useWallet-->>WalletPage: 연결 완료
        WalletPage-->>User: 성공 메시지
    else 네트워크 불일치
        WalletService-->>User: "네트워크를 전환해주세요"
    end
```

## 지갑 상태 관리

```mermaid
stateDiagram-v2
    [*] --> Disconnected

    Disconnected --> Connecting: connectWallet()
    Connecting --> Connected: 연결 성공
    Connecting --> Disconnected: 연결 실패/취소

    Connected --> Refreshing: refreshBalance()
    Refreshing --> Connected: 새로고침 완료

    Connected --> Disconnected: disconnectWallet()

    state Connected {
        [*] --> HasBalance
        HasBalance --> HasBalance: 거래 발생
    }
```

## 지갑별 호환성 매트릭스

| 지갑       | CIP-30 지원 | send API | 메타데이터 | 멀티시그 |
| ---------- | ----------- | -------- | ---------- | -------- |
| **Lace**   | ✅          | ❌       | ✅         | ❌       |
| **Nami**   | ✅          | ❌       | ✅         | ❌       |
| **Eternl** | ✅          | ⚠️       | ✅         | ✅       |
| **Flint**  | ✅          | ❌       | ✅         | ❌       |
| **Yoroi**  | ✅          | ❌       | ✅         | ❌       |

**범례**: ✅ 완전 지원, ⚠️ 부분 지원, ❌ 미지원
