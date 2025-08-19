// 지갑 관련 타입 정의

export interface WalletApi {
  enable(): Promise<WalletInstance>;
  isEnabled(): Promise<boolean>;
  name: string;
  icon: string;
  apiVersion: string;
}

export interface WalletInstance {
  getNetworkId(): Promise<number>;
  getUtxos(): Promise<string[] | undefined>;
  getBalance(): Promise<string>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  signData(
    address: string,
    payload: string
  ): Promise<{ signature: string; key: string }>;
  submitTx(tx: string): Promise<string>;

  // 확장 API (일부 지갑에서 지원)
  experimental?: {
    send?: (request: {
      outputs: Array<{
        address: string;
        amount: { ada: string } | string;
      }>;
      metadata?: Record<string, string>;
    }) => Promise<string>;
  };

  // 기본 송금 API (일부 지갑에서 지원)
  send?: (request: {
    outputs: Array<{
      address: string;
      amount: string;
    }>;
    metadata?: Record<string, string>;
  }) => Promise<string>;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  connectedWallet: string | null;
  address: string | null;
  balance: string | null;
  networkId: number | null;
  error: string | null;
}

export interface ConnectedWalletInfo {
  name: string;
  address: string;
  balance: string;
  networkId: number;
  api: WalletInstance;
}

// 윈도우 객체에 지갑 API들 추가
declare global {
  interface Window {
    cardano?: {
      lace?: WalletApi;
      [key: string]: WalletApi | undefined;
    };
  }
}
