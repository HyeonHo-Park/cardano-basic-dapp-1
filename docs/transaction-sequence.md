# 거래내역 시퀀스 다이어그램

## 거래내역 조회 프로세스

```mermaid
sequenceDiagram
    participant User
    participant HistoryPage
    participant useTransaction
    participant TransactionService
    participant Blockfrost
    participant CardanoUtils

    User->>HistoryPage: 페이지 접속
    HistoryPage->>useTransaction: 거래내역 요청
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

    TransactionService->>TransactionService: 거래 분석 (송금/수신)
    TransactionService-->>useTransaction: Transaction[]
    useTransaction-->>HistoryPage: 거래내역 표시
    HistoryPage-->>User: 거래내역 테이블
```

## 거래 분석 로직

```mermaid
flowchart TD
    Start([거래 데이터 수신]) --> GetIOData[입력/출력 데이터 추출]
    GetIOData --> CalcUserInputs[사용자 입력 ADA 계산]
    CalcUserInputs --> CalcUserOutputs[사용자 출력 ADA 계산]
    CalcUserOutputs --> CalcNetChange[순 변화량 계산]

    CalcNetChange --> CheckNetChange{순 변화량 > 0?}
    CheckNetChange -->|Yes| SetReceived[거래 유형: 수신]
    CheckNetChange -->|No| SetSent[거래 유형: 송금]

    SetReceived --> CalcReceivedAmount[수신 금액 = 순 변화량]
    SetSent --> CalcSentAmount[송금 금액 = |순 변화량|]

    CalcReceivedAmount --> FindSender[발신자 주소 찾기]
    CalcSentAmount --> FindReceiver[수신자 주소 찾기]

    FindSender --> ExtractMetadata[메타데이터 추출]
    FindReceiver --> ExtractMetadata
    ExtractMetadata --> End([거래 객체 반환])
```

## 거래 상태별 처리

| 상태       | 표시      | 색상   | 아이콘 |
| ---------- | --------- | ------ | ------ |
| **확인됨** | Confirmed | 초록색 | ✅     |
| **대기중** | Pending   | 노란색 | ⏳     |
| **실패**   | Failed    | 빨간색 | ❌     |

## 필터링 및 검색

```mermaid
flowchart LR
    AllTx[전체 거래] --> TypeFilter{유형 필터}
    TypeFilter -->|송금| SentTx[송금 거래]
    TypeFilter -->|수신| ReceivedTx[수신 거래]
    TypeFilter -->|전체| SearchFilter

    SentTx --> SearchFilter[검색 필터]
    ReceivedTx --> SearchFilter

    SearchFilter --> TextSearch{텍스트 검색}
    TextSearch -->|주소| AddressMatch[주소 일치]
    TextSearch -->|해시| HashMatch[해시 일치]
    TextSearch -->|메모| MemoMatch[메모 일치]

    AddressMatch --> DisplayResult[결과 표시]
    HashMatch --> DisplayResult
    MemoMatch --> DisplayResult
```
