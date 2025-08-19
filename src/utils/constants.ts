// 카르다노 네트워크 상수
export const CARDANO_NETWORKS = {
  MAINNET: {
    id: 1,
    name: 'mainnet',
    displayName: 'Mainnet',
    explorerUrl: 'https://cardanoscan.io',
    faucetUrl: null,
  },
  PREVIEW: {
    id: 0,
    name: 'preview',
    displayName: 'Preview Testnet',
    explorerUrl: 'https://preview.cardanoscan.io',
    faucetUrl: 'https://faucet.preview.world.dev.cardano.org/',
  },
  PREPROD: {
    id: 0,
    name: 'preprod',
    displayName: 'Preprod Testnet',
    explorerUrl: 'https://preprod.cardanoscan.io',
    faucetUrl: 'https://faucet.preprod.world.dev.cardano.org/',
  },
} as const;

// 현재 네트워크 설정
export const CURRENT_NETWORK = CARDANO_NETWORKS.PREVIEW;

// 지원되는 지갑들
export const SUPPORTED_WALLETS = [
  {
    name: 'Lace',
    key: 'lace',
    icon: '🃏',
    downloadUrl: 'https://www.lace.io',
    description: 'IOG에서 개발한 공식 지갑',
  },
] as const;

// 트랜잭션 상수
export const TRANSACTION_CONSTANTS = {
  MIN_ADA: 1, // 최소 ADA 송금량
  MIN_UTXO_ADA: 1.5, // 최소 UTXO ADA
  ESTIMATED_FEE: 0.17, // 예상 수수료 (ADA)
} as const;
