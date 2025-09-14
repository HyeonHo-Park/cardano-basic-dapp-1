import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilter } from '../types/transactionTypes';
import { TransactionService } from '../services/transactionService';

interface UseTransactionOptions {
  pageSize?: number;
}

export function useTransaction(
  address: string | null,
  options: UseTransactionOptions = {}
) {
  const { pageSize = 10 } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filter, setFilter] = useState<TransactionFilter | undefined>();

  /**
   * 거래내역을 조회합니다
   */
  const fetchTransactions = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (!address) {
        setTransactions([]);
        setHasMore(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await TransactionService.getTransactionHistory(
          address,
          page,
          pageSize,
          filter
        );

        setTransactions(prev =>
          reset ? result.transactions : [...prev, ...result.transactions]
        );
        setHasMore(result.hasMore);
        setCurrentPage(page);
        setLoading(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '거래내역 조회에 실패했습니다';
        setError(errorMessage);
        setLoading(false);
      }
    },
    [address, pageSize, filter]
  );

  /**
   * 첫 페이지를 새로고침합니다
   */
  const refreshTransactions = useCallback(() => {
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  /**
   * 다음 페이지를 로드합니다
   */
  const loadMoreTransactions = useCallback(() => {
    if (hasMore && !loading) {
      fetchTransactions(currentPage + 1, false);
    }
  }, [fetchTransactions, hasMore, loading, currentPage]);

  /**
   * 필터를 적용합니다
   */
  const applyFilter = useCallback((newFilter?: TransactionFilter) => {
    setFilter(newFilter);
    setTransactions([]);
    setCurrentPage(1);
  }, []);

  /**
   * 에러를 초기화합니다
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 특정 거래의 상세 정보를 조회합니다
   */
  const getTransactionDetails = useCallback(
    async (txHash: string) => {
      if (!address) return null;

      try {
        return await TransactionService.getTransactionDetails(txHash, address);
      } catch (error) {
        console.error('거래 상세 정보 조회 실패:', error);
        return null;
      }
    },
    [address]
  );

  /**
   * 거래 해시로 블록체인 탐색기 URL을 생성합니다
   */
  const getExplorerUrl = useCallback((txHash: string) => {
    return TransactionService.getExplorerUrl(txHash);
  }, []);

  /**
   * 주소로 블록체인 탐색기 URL을 생성합니다
   */
  const getAddressExplorerUrl = useCallback((address: string) => {
    return TransactionService.getAddressExplorerUrl(address);
  }, []);

  // 주소가 변경되면 거래내역을 새로 조회
  useEffect(() => {
    if (address) {
      refreshTransactions();
    }
  }, [address, refreshTransactions]);

  // 필터가 변경되면 첫 페이지부터 다시 조회
  useEffect(() => {
    if (address && transactions.length === 0) {
      fetchTransactions(1, true);
    }
  }, [filter, address, fetchTransactions, transactions.length]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    refreshTransactions,
    loadMoreTransactions,
    applyFilter,
    clearError,
    getTransactionDetails,
    getExplorerUrl,
    getAddressExplorerUrl,
  };
}

/**
 * 거래내역 통계를 계산하는 훅
 */
export function useTransactionStats(transactions: Transaction[]) {
  const stats = {
    totalTransactions: transactions.length,
    totalSent: 0,
    totalReceived: 0,
    totalFees: 0,
    sentCount: 0,
    receivedCount: 0,
  };

  transactions.forEach(tx => {
    if (tx.type === 'sent') {
      stats.totalSent += Math.abs(tx.amount);
      stats.totalFees += tx.fee;
      stats.sentCount++;
    } else if (tx.type === 'received') {
      stats.totalReceived += tx.amount;
      stats.receivedCount++;
    }
  });

  return stats;
}
