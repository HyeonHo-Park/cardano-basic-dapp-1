import {
  Transaction,
  TransactionHistory,
  TransactionFilter,
  BlockfrostTransaction,
  BlockfrostTransactionUtxo,
} from '../types/transaction';
import { formatAddressForAPI } from '../utils/cardano';

// Blockfrost API 설정
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'preview';
const BLOCKFROST_BASE_URL = `https://cardano-${NETWORK.toLowerCase()}.blockfrost.io/api/v0`;
const BLOCKFROST_PROJECT_ID = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;

export class TransactionService {
  /**
   * 주소의 거래내역을 조회합니다
   */
  static async getTransactionHistory(
    address: string,
    page: number = 1,
    count: number = 10,
    filter?: TransactionFilter
  ): Promise<TransactionHistory> {
    try {
      // 주소를 API 호출에 적합한 형식으로 변환
      const formattedAddress = await formatAddressForAPI(address);

      // API 키가 없으면 오류 반환
      if (!BLOCKFROST_PROJECT_ID) {
        throw new Error('Blockfrost API 키가 설정되지 않았습니다.');
      }

      // Blockfrost API를 통해 주소의 거래내역 조회
      const response = await fetch(
        `${BLOCKFROST_BASE_URL}/addresses/${formattedAddress}/transactions?page=${page}&count=${count}&order=desc`,
        {
          headers: {
            project_id: BLOCKFROST_PROJECT_ID || '',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // 주소에 거래내역이 없는 경우
          return {
            transactions: [],
            totalCount: 0,
            hasMore: false,
          };
        }
        throw new Error(`Blockfrost API 오류: ${response.status}`);
      }

      const transactionHashes: Array<{
        tx_hash: string;
        block_height: number;
      }> = await response.json();

      if (!transactionHashes || transactionHashes.length === 0) {
        return {
          transactions: [],
          totalCount: 0,
          hasMore: false,
        };
      }

      // 각 거래의 상세 정보를 병렬로 조회
      const transactionPromises = transactionHashes.map(({ tx_hash }) =>
        this.getTransactionDetails(tx_hash, formattedAddress)
      );

      const transactionResults = await Promise.all(transactionPromises);
      const transactions = transactionResults.filter(
        (tx): tx is Transaction => tx !== null
      );

      // 필터 적용
      const filteredTransactions = this.applyFilter(transactions, filter);

      return {
        transactions: filteredTransactions,
        totalCount: filteredTransactions.length,
        hasMore: transactionHashes.length === count,
      };
    } catch (error) {
      console.error('거래내역 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 거래의 상세 정보를 조회합니다
   */
  static async getTransactionDetails(
    txHash: string,
    userAddress: string
  ): Promise<Transaction | null> {
    try {
      // 거래 기본 정보 조회
      const [txResponse, utxoResponse] = await Promise.all([
        fetch(`${BLOCKFROST_BASE_URL}/txs/${txHash}`, {
          headers: { project_id: BLOCKFROST_PROJECT_ID || '' },
        }),
        fetch(`${BLOCKFROST_BASE_URL}/txs/${txHash}/utxos`, {
          headers: { project_id: BLOCKFROST_PROJECT_ID || '' },
        }),
      ]);

      if (!txResponse.ok || !utxoResponse.ok) {
        throw new Error('거래 정보 조회 실패');
      }

      const txData: BlockfrostTransaction = await txResponse.json();
      const utxoData: BlockfrostTransactionUtxo = await utxoResponse.json();

      // 사용자 주소와 관련된 입출력 분석
      const userInputs = utxoData.inputs.filter(
        input => input.address === userAddress
      );
      const userOutputs = utxoData.outputs.filter(
        output => output.address === userAddress
      );

      // 거래 유형 및 금액 계산
      let type: 'sent' | 'received';
      let amount: number;
      let counterpartyAddress: string;

      // 입력과 출력에서 사용자 ADA 계산
      const userInputAda = userInputs.reduce((sum, input) => {
        const adaAmount = input.amount.find(a => a.unit === 'lovelace');
        return sum + (adaAmount ? parseInt(adaAmount.quantity) : 0);
      }, 0);

      const userOutputAda = userOutputs.reduce((sum, output) => {
        const adaAmount = output.amount.find(a => a.unit === 'lovelace');
        return sum + (adaAmount ? parseInt(adaAmount.quantity) : 0);
      }, 0);

      // 순 금액 변화로 거래 유형 결정
      const netChange = userOutputAda - userInputAda;

      if (netChange > 0) {
        // 수신: 사용자가 받은 거래
        type = 'received';
        amount = netChange / 1_000_000;
        counterpartyAddress =
          utxoData.inputs.find(input => input.address !== userAddress)
            ?.address || '';
      } else if (netChange < 0) {
        // 송금: 사용자가 보낸 거래 (수수료 포함)
        type = 'sent';
        amount = netChange / 1_000_000; // 이미 음수
        counterpartyAddress =
          utxoData.outputs.find(output => output.address !== userAddress)
            ?.address || '';
      } else {
        // 변화 없음 (자신에게 송금 등)
        type = 'sent';
        amount = 0;
        counterpartyAddress = userAddress;
      }

      const fee = parseInt(txData.fees) / 1_000_000;
      const timestamp = new Date(txData.block_time * 1000).toLocaleString(
        'ko-KR'
      );

      return {
        hash: txHash,
        type,
        amount,
        fee,
        address: counterpartyAddress,
        timestamp,
        status: 'confirmed',
        block: txData.block_height,
        confirmations: 1000, // 임시값
      };
    } catch (error) {
      console.error(`거래 ${txHash} 상세 정보 조회 실패:`, error);
      return null;
    }
  }

  /**
   * 거래내역에 필터를 적용합니다
   */
  static applyFilter(
    transactions: Transaction[],
    filter?: TransactionFilter
  ): Transaction[] {
    if (!filter) return transactions;

    return transactions.filter(tx => {
      // 거래 유형 필터
      if (filter.type && filter.type !== 'all' && tx.type !== filter.type) {
        return false;
      }

      // 상태 필터
      if (
        filter.status &&
        filter.status !== 'all' &&
        tx.status !== filter.status
      ) {
        return false;
      }

      // 날짜 범위 필터
      if (filter.dateRange) {
        const txDate = new Date(tx.timestamp);
        if (txDate < filter.dateRange.start || txDate > filter.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 거래 해시로 블록체인 탐색기 URL을 생성합니다
   */
  static getExplorerUrl(txHash: string): string {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'preview';
    const subdomain =
      network.toLowerCase() === 'mainnet' ? '' : `${network.toLowerCase()}.`;
    return `https://${subdomain}cardanoscan.io/transaction/${txHash}`;
  }

  /**
   * 주소로 블록체인 탐색기 URL을 생성합니다
   */
  static getAddressExplorerUrl(address: string): string {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'preview';
    const subdomain =
      network.toLowerCase() === 'mainnet' ? '' : `${network.toLowerCase()}.`;
    return `https://${subdomain}cardanoscan.io/address/${address}`;
  }
}
