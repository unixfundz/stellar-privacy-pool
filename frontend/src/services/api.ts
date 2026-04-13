/**
 * API service for communicating with the backend
 */

import axios from 'axios';
import type { 
  PrivacyPool, 
  PoolStats, 
  Transaction, 
  DepositRequest, 
  DepositResponse,
  WithdrawRequest,
  WithdrawResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Privacy Pool API
export const privacyPoolApi = {
  // Get all pools
  getPools: async (): Promise<PrivacyPool[]> => {
    const response = await api.get('/pools/');
    return response.data;
  },

  // Get single pool
  getPool: async (id: number): Promise<PrivacyPool> => {
    const response = await api.get(`/pools/${id}/`);
    return response.data;
  },

  // Get pool statistics
  getPoolStats: async (id: number): Promise<PoolStats> => {
    const response = await api.get(`/pools/${id}/stats/`);
    return response.data;
  },

  // Get Merkle tree
  getMerkleTree: async (id: number) => {
    const response = await api.get(`/pools/${id}/merkle_tree/`);
    return response.data;
  },

  // Create a new pool (admin)
  createPool: async (data: {
    name: string;
    asset_code: string;
    asset_issuer?: string;
    merkle_depth?: number;
    min_deposit?: string;
    min_withdrawal?: string;
    max_amount?: string;
  }): Promise<PrivacyPool> => {
    const response = await api.post('/pools/', data);
    return response.data;
  },
};

// Deposit API
export const depositApi = {
  // Create a deposit
  createDeposit: async (data: DepositRequest): Promise<DepositResponse> => {
    const response = await api.post('/deposit/', data);
    return response.data;
  },

  // Confirm a deposit (after on-chain confirmation)
  confirmDeposit: async (transactionId: number, stellarTxHash: string) => {
    const response = await api.post(`/deposit/${transactionId}/confirm/`, {
      stellar_transaction_hash: stellarTxHash,
    });
    return response.data;
  },
};

// Withdraw API
export const withdrawApi = {
  // Create a withdrawal
  createWithdraw: async (data: WithdrawRequest): Promise<WithdrawResponse> => {
    const response = await api.post('/withdraw/', data);
    return response.data;
  },
};

// Transaction API
export const transactionApi = {
  // Get all transactions
  getTransactions: async (params?: {
    pool_id?: number;
    status?: string;
    type?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },
};

export default api;