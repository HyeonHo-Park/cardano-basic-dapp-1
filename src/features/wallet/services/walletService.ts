import { WalletInstance, ConnectedWalletInfo } from '../types/walletTypes';
import {
  SUPPORTED_WALLETS,
  CURRENT_NETWORK,
} from '../../../shared/utils/constants';

export class WalletService {
  /**
   * 사용 가능한 지갑들을 검색합니다 (클라이언트 전용)
   */
  static getAvailableWallets() {
    // SSR 동안에는 빈 배열 반환하여 hydration mismatch 방지
    if (typeof window === 'undefined') {
      return SUPPORTED_WALLETS.map(wallet => ({
        ...wallet,
        isInstalled: false,
        api: undefined,
      }));
    }

    return SUPPORTED_WALLETS.map(wallet => ({
      ...wallet,
      isInstalled: !!window.cardano?.[wallet.key],
      api: window.cardano?.[wallet.key],
    }));
  }

  /**
   * 특정 지갑이 설치되어 있는지 확인합니다
   */
  static isWalletInstalled(walletKey: string): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.cardano?.[walletKey];
  }

  /**
   * 지갑에 연결합니다
   */
  static async connectWallet(walletKey: string): Promise<ConnectedWalletInfo> {
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 사용할 수 있습니다');
    }

    const walletApi = window.cardano?.[walletKey];
    if (!walletApi) {
      throw new Error(`${walletKey} 지갑이 설치되지 않았습니다`);
    }

    try {
      // 지갑 연결 요청
      const walletInstance = await walletApi.enable();

      // 네트워크 ID 확인
      const networkId = await walletInstance.getNetworkId();
      if (networkId !== CURRENT_NETWORK.id) {
        throw new Error(
          `잘못된 네트워크입니다. ${CURRENT_NETWORK.displayName}로 전환해주세요.`
        );
      }

      // 지갑 정보 가져오기
      const [usedAddresses, unusedAddresses, changeAddress, balance] =
        await Promise.all([
          walletInstance.getUsedAddresses(),
          walletInstance.getUnusedAddresses(),
          walletInstance.getChangeAddress(),
          walletInstance.getBalance(),
        ]);

      // 주소 우선순위: usedAddresses > unusedAddresses > changeAddress
      let address: string;
      if (usedAddresses && usedAddresses.length > 0) {
        address = usedAddresses[0];
      } else if (unusedAddresses && unusedAddresses.length > 0) {
        address = unusedAddresses[0];
      } else if (changeAddress) {
        address = changeAddress;
      } else {
        throw new Error(
          '지갑 주소를 찾을 수 없습니다. 지갑이 비어있거나 올바르게 설정되지 않았습니다.'
        );
      }

      // 잔액을 ADA 단위로 변환 (lovelace -> ADA)
      const balanceInAda = this.lovelaceToAda(balance);

      return {
        name: walletApi.name,
        address,
        balance: balanceInAda,
        networkId,
        api: walletInstance,
      };
    } catch (error) {
      console.error('지갑 연결 실패:', error);
      throw error;
    }
  }

  /**
   * 지갑 연결이 활성화되어 있는지 확인합니다
   */
  static async isWalletEnabled(walletKey: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const walletApi = window.cardano?.[walletKey];
    if (!walletApi) return false;

    try {
      return await walletApi.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * lovelace를 ADA로 변환합니다
   */
  static lovelaceToAda(lovelace: string): string {
    try {
      if (!lovelace || lovelace === '0') {
        return '0.000000';
      }

      let lovelaceAmount: bigint;

      // CBOR 형식 처리 (예: 1b00000002540be400)
      if (lovelace.startsWith('1b') && lovelace.length === 18) {
        const hexValue = lovelace.substring(2);
        lovelaceAmount = BigInt('0x' + hexValue);
      }
      // 16진수 형식
      else if (lovelace.startsWith('0x') || /^[0-9a-fA-F]+$/.test(lovelace)) {
        const hex = lovelace.startsWith('0x') ? lovelace : '0x' + lovelace;
        lovelaceAmount = BigInt(hex);
      }
      // 10진수 형식
      else {
        lovelaceAmount = BigInt(lovelace);
      }

      const adaAmount = Number(lovelaceAmount) / 1_000_000;
      return adaAmount.toFixed(6);
    } catch (error) {
      console.error('lovelace 변환 실패:', error, '값:', lovelace);
      return '0.000000';
    }
  }

  /**
   * ADA를 lovelace로 변환합니다
   */
  static adaToLovelace(ada: number): string {
    const lovelaceAmount = BigInt(Math.floor(ada * 1_000_000));
    return lovelaceAmount.toString();
  }

  /**
   * 잔액을 새로고침합니다
   */
  static async refreshBalance(walletInstance: WalletInstance): Promise<string> {
    try {
      const balance = await walletInstance.getBalance();
      return this.lovelaceToAda(balance);
    } catch (error) {
      console.error('잔액 새로고침 실패:', error);
      throw new Error('잔액을 새로고침할 수 없습니다');
    }
  }
}
