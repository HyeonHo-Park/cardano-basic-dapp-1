import { useState, useEffect, useCallback } from 'react';
import { WalletState, WalletInstance } from '../types/walletTypes';
import { WalletService } from '../services/walletService';
import { SUPPORTED_WALLETS } from '../../../shared/utils/constants';

const STORAGE_KEY = 'cardano-wallet-connection';

export function useWallet() {
  const [isClient, setIsClient] = useState(false);
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    connectedWallet: null,
    address: null,
    balance: null,
    networkId: null,
    error: null,
  });

  const [walletInstance, setWalletInstance] = useState<WalletInstance | null>(
    null
  );

  // 클라이언트 사이드 마운트 감지
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * 지갑에 연결합니다
   */
  const connectWallet = useCallback(async (walletKey: string) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const walletInfo = await WalletService.connectWallet(walletKey);

      setState({
        isConnected: true,
        isConnecting: false,
        connectedWallet: walletInfo.name,
        address: walletInfo.address,
        balance: walletInfo.balance,
        networkId: walletInfo.networkId,
        error: null,
      });

      setWalletInstance(walletInfo.api);

      // 연결 정보를 로컬 스토리지에 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ walletKey }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '지갑 연결에 실패했습니다';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  // 로컬 스토리지에서 지갑 연결 정보 복원 (클라이언트에서만)
  useEffect(() => {
    if (!isClient) return;

    const savedWallet = localStorage.getItem(STORAGE_KEY);
    if (savedWallet) {
      const { walletKey } = JSON.parse(savedWallet);
      // 자동 재연결 시도
      WalletService.isWalletEnabled(walletKey)
        .then(isEnabled => {
          if (isEnabled) {
            connectWallet(walletKey);
          }
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
        });
    }
  }, [isClient, connectWallet]);

  /**
   * 지갑 연결을 해제합니다
   */
  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      connectedWallet: null,
      address: null,
      balance: null,
      networkId: null,
      error: null,
    });

    setWalletInstance(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * 잔액을 새로고침합니다
   */
  const refreshBalance = useCallback(async () => {
    if (!walletInstance) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    try {
      const newBalance = await WalletService.refreshBalance(walletInstance);
      setState(prev => ({ ...prev, balance: newBalance }));
      return newBalance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '잔액 새로고침에 실패했습니다';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [walletInstance]);

  /**
   * 사용 가능한 지갑 목록을 가져옵니다
   */
  const getAvailableWallets = useCallback(() => {
    if (!isClient) {
      // SSR 중에는 기본값 반환
      return SUPPORTED_WALLETS.map(wallet => ({
        ...wallet,
        isInstalled: false,
        api: undefined,
      }));
    }
    return WalletService.getAvailableWallets();
  }, [isClient]);

  /**
   * 에러를 초기화합니다
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // 상태
    ...state,
    walletInstance,

    // 액션
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getAvailableWallets,
    clearError,
  };
}
