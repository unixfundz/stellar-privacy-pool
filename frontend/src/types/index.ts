/**
 * TypeScript types for the Stellar Privacy Pool
 */

// Pool types
export interface PrivacyPool {
  id: number;
  name: string;
  asset_code: string;
  asset_issuer: string | null;
  contract_address: string;
  merkle_depth: number;
  min_deposit: string;
  min_withdrawal: string;
  max_amount: string;
  total_deposits: string;
  total_withdrawals: string;
  total_notes: number;
  status: PoolStatus;
  created_at: string;
  updated_at: string;
  total_volume?: number;
  active_notes?: number;
}

export type PoolStatus = 'active' | 'paused' | 'closed';

// Transaction types
export interface Transaction {
  id: number;
  pool: number;
  pool_name: string;
  pool_asset: string;
  transaction_type: TransactionType;
  public_key: string;
  amount: string;
  status: TransactionStatus;
  stellar_transaction_hash: string | null;
  soroban_transaction_hash: string | null;
  error_message: string;
  created_at: string;
  confirmed_at: string | null;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// Commitment types
export interface Commitment {
  id: number;
  pool: number;
  pool_name: string;
  commitment: string;
  leaf_index: number;
  spent: boolean;
  commitment_type: CommitmentType;
  transaction_hash: string;
  created_at: string;
  spent_at: string | null;
}

export type CommitmentType = 'deposit' | 'withdrawal';

// Merkle tree types
export interface MerkleNode {
  id: number;
  index: number;
  level: number;
  hash: string;
  left_child: number | null;
  right_child: number | null;
  created_at: string;
}

export interface MerkleTree {
  root: string;
  depth: number;
  nodes: MerkleNode[];
  leaf_count: number;
}

// API Request/Response types
export interface PoolStats {
  total_deposits: string;
  total_withdrawals: string;
  total_volume: string;
  active_notes: number;
  total_transactions: number;
  avg_deposit_size: string;
  avg_withdrawal_size: string;
}

export interface DepositRequest {
  pool_id: number;
  amount: string;
  public_key: string;
}

export interface DepositResponse {
  transaction_id: number;
  commitment: string;
  nullifier: string;
  blinding_factor: string;
  leaf_index: number;
  pool_contract_address: string;
  amount: string;
  asset_code: string;
  asset_issuer: string;
}

export interface WithdrawRequest {
  pool_id: number;
  amount: string;
  recipient_public_key: string;
  commitment: string;
  nullifier: string;
  proof: string;
}

export interface WithdrawResponse {
  transaction_id: number;
  recipient: string;
  amount: string;
  nullifier_hash: string;
}

export interface CreatePoolRequest {
  name: string;
  asset_code: string;
  asset_issuer?: string;
  merkle_depth?: number;
  min_deposit?: string;
  min_withdrawal?: string;
  max_amount?: string;
}

// Wallet types
export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  error: string | null;
}

// Note: This is the encrypted note that the user receives
// It should be stored securely in their wallet
export interface PrivacyNote {
  commitment: string;
  nullifier: string;
  blinding_factor: string; // Secret - should be encrypted
  leaf_index: number;
  amount: string;
  pool_id: number;
  created_at: string;
}