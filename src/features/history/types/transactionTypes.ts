// 거래 관련 타입 정의

export interface Transaction {
  hash: string;
  type: 'sent' | 'received';
  amount: number;
  fee: number;
  address: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  block?: number;
  memo?: string;
  confirmations?: number;
}

export interface TransactionInput {
  address: string;
  amount: number;
  tx_hash: string;
  output_index: number;
}

export interface TransactionOutput {
  address: string;
  amount: number;
}

export interface BlockfrostTransaction {
  hash: string;
  block: string;
  block_height: number;
  block_time: number;
  slot: number;
  index: number;
  output_amount: Array<{
    unit: string;
    quantity: string;
  }>;
  fees: string;
  deposit: string;
  size: number;
  invalid_before?: string;
  invalid_hereafter?: string;
  utxo_count: number;
  withdrawal_count: number;
  mir_cert_count: number;
  delegation_count: number;
  stake_cert_count: number;
  pool_update_count: number;
  pool_retire_count: number;
  asset_mint_or_burn_count: number;
  redeemer_count: number;
  valid_contract: boolean;
}

export interface BlockfrostTransactionUtxo {
  hash: string;
  inputs: Array<{
    address: string;
    amount: Array<{
      unit: string;
      quantity: string;
    }>;
    tx_hash: string;
    output_index: number;
    data_hash?: string;
    inline_datum?: string;
    reference_script_hash?: string;
    collateral: boolean;
    reference: boolean;
  }>;
  outputs: Array<{
    address: string;
    amount: Array<{
      unit: string;
      quantity: string;
    }>;
    output_index: number;
    data_hash?: string;
    inline_datum?: string;
    collateral: boolean;
    reference_script_hash?: string;
  }>;
}

export interface TransactionFilter {
  type?: 'all' | 'sent' | 'received';
  status?: 'all' | 'pending' | 'confirmed' | 'failed';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TransactionHistory {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}
