# 거래내역 시퀀스 다이어그램

## 거래내역 조회 프로세스

```mermaid
sequenceDiagram
    participant User
    participant HistoryPage[features/history/pages]
    participant useTransaction[features/history/hooks]
    participant TransactionService[features/history/services]
    participant Blockfrost
    participant CardanoUtils[shared/utils]

    User->>HistoryPage: 페이지 접속
    HistoryPage->>useTransaction: fetchTransactions()
    useTransaction->>TransactionService: getTransactionHistory()

    TransactionService->>CardanoUtils: formatAddressForAPI()
    CardanoUtils-->>TransactionService: 포맷된 주소

    TransactionService->>Blockfrost: /addresses/{address}/transactions
    Blockfrost-->>TransactionService: 거래 해시 목록

    loop 각 거래 해시
        TransactionService->>Blockfrost: /txs/{hash}
        TransactionService->>Blockfrost: /txs/{hash}/utxos
        Blockfrost-->>TransactionService: 거래 상세 정보
    end

    TransactionService->>TransactionService: analyzeTransaction() (송금/수신 분석)
    TransactionService-->>useTransaction: Transaction[]
    useTransaction->>useTransaction: setTransactions() (useState)
    useTransaction-->>HistoryPage: 거래내역 표시
    HistoryPage-->>User: TransactionList 컴포넌트로 렌더링
```

## 거래내역 페이지 컴포넌트 구조

```mermaid
flowchart TD
    HistoryPage[features/history/pages/HistoryPage.tsx] --> TransactionList[features/history/components/TransactionList.tsx]
    HistoryPage --> TransactionFilter[features/history/components/TransactionFilter.tsx]

    TransactionList --> TransactionCard[features/history/components/TransactionCard.tsx]
    TransactionFilter --> FilterOptions[필터 옵션]

    TransactionCard --> TxDetails[거래 상세 정보]
    TransactionCard --> TxStatus[거래 상태]
    TransactionCard --> TxAmount[금액 표시]

    FilterOptions --> TypeFilter[유형 필터]
    FilterOptions --> SearchFilter[검색 필터]
```

## 거래 분석 로직

```mermaid
flowchart TD
    Start([Blockfrost 거래 데이터 수신]) --> GetIOData[입력/출력 데이터 추출]
    GetIOData --> CalcUserInputs[사용자 입력 ADA 계산]
    CalcUserInputs --> CalcUserOutputs[사용자 출력 ADA 계산]
    CalcUserOutputs --> CalcNetChange[순 변화량 = 출력 - 입력]

    CalcNetChange --> CheckNetChange{순 변화량 > 0?}
    CheckNetChange -->|Yes| SetReceived[거래 유형: 수신]
    CheckNetChange -->|No| SetSent[거래 유형: 송금]

    SetReceived --> CalcReceivedAmount[수신 금액 = 순 변화량]
    SetSent --> CalcSentAmount[송금 금액 = |순 변화량|]

    CalcReceivedAmount --> FindSender[발신자 주소 찾기]
    CalcSentAmount --> FindReceiver[수신자 주소 찾기]

    FindSender --> ExtractMetadata[메타데이터 추출]
    FindReceiver --> ExtractMetadata
    ExtractMetadata --> CreateTransaction[Transaction 객체 생성]
    CreateTransaction --> End([반환])
```

## 페이지네이션 및 무한 스크롤

```mermaid
sequenceDiagram
    participant User
    participant HistoryPage
    participant useTransaction
    participant TransactionService

    User->>HistoryPage: 페이지 로드
    HistoryPage->>useTransaction: 첫 페이지 요청
    useTransaction->>TransactionService: getTransactionHistory(page=1)
    TransactionService-->>useTransaction: 첫 10개 거래

    User->>HistoryPage: 스크롤 다운
    HistoryPage->>useTransaction: loadMoreTransactions()
    useTransaction->>TransactionService: getTransactionHistory(page=2)
    TransactionService-->>useTransaction: 다음 10개 거래
    useTransaction->>useTransaction: addTransactions() (기존 목록에 추가)

    Note over useTransaction: hasMore가 false가 될 때까지 반복
```

## 거래 상태별 처리

| 상태       | 표시 텍스트 | 색상   | 아이콘 | 처리 방식               |
| ---------- | ----------- | ------ | ------ | ----------------------- |
| **확인됨** | Confirmed   | 초록색 | ✅     | 정상 표시               |
| **대기중** | Pending     | 노란색 | ⏳     | 주기적 상태 확인        |
| **실패**   | Failed      | 빨간색 | ❌     | 에러 메시지와 함께 표시 |

## 필터링 및 검색

```mermaid
flowchart LR
    AllTx[전체 거래] --> TypeFilter{유형 필터}
    TypeFilter -->|송금| SentTx[송금 거래만]
    TypeFilter -->|수신| ReceivedTx[수신 거래만]
    TypeFilter -->|전체| SearchFilter[검색 필터]

    SentTx --> SearchFilter
    ReceivedTx --> SearchFilter

    SearchFilter --> TextSearch{텍스트 검색}
    TextSearch -->|주소 검색| AddressMatch[주소 일치 항목]
    TextSearch -->|해시 검색| HashMatch[해시 일치 항목]
    TextSearch -->|메모 검색| MemoMatch[메모 일치 항목]

    AddressMatch --> DisplayResult[필터링된 결과 표시]
    HashMatch --> DisplayResult
    MemoMatch --> DisplayResult
```

## useTransaction Hook 구조

```mermaid
flowchart TD
    UseTransaction[useTransaction Hook] --> UseState[useState]
    UseTransaction --> UseCallback[useCallback]
    UseTransaction --> UseEffect[useEffect]

    UseState --> Transactions[transactions 배열]
    UseState --> Loading[loading 상태]
    UseState --> Error[error 상태]
    UseState --> HasMore[hasMore 플래그]
    UseState --> CurrentPage[currentPage 번호]
    UseState --> Filter[filter 설정]

    UseCallback --> FetchTransactions[fetchTransactions]
    UseCallback --> LoadMore[loadMoreTransactions]
    UseCallback --> ApplyFilter[applyFilter]
    UseCallback --> RefreshTransactions[refreshTransactions]

    UseEffect --> AutoLoad[지갑 연결 시 자동 로드]
```

## 에러 처리 및 재시도

```mermaid
sequenceDiagram
    participant useTransaction
    participant TransactionService
    participant Blockfrost
    participant User

    useTransaction->>TransactionService: getTransactionHistory()

    alt Blockfrost API 에러
        TransactionService->>Blockfrost: API 요청
        Blockfrost-->>TransactionService: 네트워크 에러
        TransactionService-->>useTransaction: Error
        useTransaction-->>User: "거래내역을 불러올 수 없습니다"
    else 주소 형식 에러
        TransactionService->>TransactionService: formatAddressForAPI()
        TransactionService-->>useTransaction: Address Format Error
        useTransaction-->>User: "올바르지 않은 주소 형식입니다"
    else API 키 없음
        TransactionService-->>useTransaction: No API Key Error
        useTransaction-->>User: "Blockfrost API 키가 설정되지 않았습니다"
    end
```
