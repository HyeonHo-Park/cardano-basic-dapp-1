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
        useWallet->>useWallet: setState (지갑 상태 업데이트)
        useWallet-->>WalletPage: 연결 완료
        WalletPage-->>User: 성공 메시지
    else 네트워크 불일치
        WalletService-->>User: "네트워크를 전환해주세요"
    end
```

## 지갑 상태 관리 (useState 기반)

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
        HasBalance --> HasBalance: 거래 발생 시 자동 갱신
    }
```

## useWallet Hook 내부 구조

```mermaid
flowchart TD
    UseWallet[useWallet Hook] --> UseState[useState]
    UseWallet --> UseEffect[useEffect]
    UseWallet --> UseCallback[useCallback]

    UseState --> WalletState[WalletState]
    UseState --> IsClient[isClient]
    UseState --> WalletInstance[walletInstance]

    UseEffect --> ClientMount[클라이언트 마운트 감지]
    UseEffect --> AutoReconnect[자동 재연결]
    UseEffect --> BalanceUpdate[잔액 자동 갱신]

    UseCallback --> ConnectWallet[connectWallet]
    UseCallback --> DisconnectWallet[disconnectWallet]
    UseCallback --> RefreshBalance[refreshBalance]
```

## 지갑별 호환성 매트릭스

| 지갑       | CIP-30 지원 | send API | 메타데이터 | 멀티시그 | 테스트 결과 |
| ---------- | ----------- | -------- | ---------- | -------- | ----------- |
| **Lace**   | ✅          | ❌       | ✅         | ❌       | ✅          |
| **Nami**   | ✅          | ❌       | ✅         | ❌       | ✅          |
| **Eternl** | ✅          | ⚠️       | ✅         | ✅       | ✅          |

**범례**: ✅ 완전 지원, ⚠️ 부분 지원, ❌ 미지원

## 에러 처리 시나리오

```mermaid
sequenceDiagram
    participant User
    participant WalletService
    participant WalletExtension

    alt 지갑 미설치
        User->>WalletService: 연결 시도
        WalletService-->>User: "지갑이 설치되지 않았습니다"
    else 사용자 연결 거부
        WalletService->>WalletExtension: enable()
        WalletExtension-->>User: 승인 요청
        User-->>WalletExtension: 거부
        WalletService-->>User: "지갑 연결을 승인해주세요"
    else 네트워크 불일치
        WalletService->>WalletExtension: getNetworkId()
        WalletExtension-->>WalletService: 다른 네트워크 ID
        WalletService-->>User: "Preview 테스트넷으로 전환해주세요"
    else 지갑 액세스 실패
        WalletService->>WalletExtension: getBalance()
        WalletExtension-->>WalletService: 에러
        WalletService-->>User: "지갑 정보를 가져올 수 없습니다"
    end
```

## 로컬 스토리지 연동

```mermaid
flowchart LR
    ConnectWallet[지갑 연결] --> SaveToStorage[로컬 스토리지 저장]
    SaveToStorage --> AutoReconnect[페이지 새로고침 시 자동 재연결]

    AutoReconnect --> ValidateStored[저장된 정보 검증]
    ValidateStored --> RestoreState[상태 복원]

    DisconnectWallet[지갑 연결 해제] --> ClearStorage[로컬 스토리지 정리]
```
