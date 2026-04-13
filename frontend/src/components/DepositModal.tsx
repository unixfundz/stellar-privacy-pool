/**
 * Deposit Modal Component
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { depositApi, privacyPoolApi } from '../services/api';

interface DepositModalProps {
  poolId: number;
  publicKey: string;
  onClose: () => void;
}

export default function DepositModal({ poolId, publicKey, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'sign' | 'confirm' | 'success'>('input');
  const [depositData, setDepositData] = useState<any>(null);

  const { data: pool } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: () => privacyPoolApi.getPool(poolId),
  });

  const depositMutation = useMutation({
    mutationFn: depositApi.createDeposit,
    onSuccess: (data) => {
      setDepositData(data);
      setStep('sign');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create deposit');
    },
  });

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (pool && Number(amount) < Number(pool.min_deposit)) {
      alert(`Minimum deposit is ${pool.min_deposit}`);
      return;
    }
    
    depositMutation.mutate({
      pool_id: poolId,
      amount,
      public_key: publicKey,
    });
  };

  const handleSignAndSubmit = async () => {
    // In a real implementation, this would:
    // 1. Sign the transaction with Freighter
    // 2. Submit to Stellar network
    // 3. Wait for confirmation
    // 4. Update the backend
    
    setStep('confirm');
    
    // Simulate confirmation
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Deposit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {step === 'input' && pool && (
          <>
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Pool</div>
              <div className="text-white font-medium">
                {pool.name} ({pool.asset_code})
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
                min={pool.min_deposit}
                max={pool.max_amount}
              />
              <div className="mt-2 text-sm text-gray-500">
                Min: {pool.min_deposit} • Max: {pool.max_amount}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Your Address</div>
              <div className="text-white text-sm font-mono truncate">
                {publicKey}
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={depositMutation.isPending}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50"
            >
              {depositMutation.isPending ? 'Creating...' : 'Continue'}
            </button>
          </>
        )}

        {step === 'sign' && depositData && (
          <>
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Commitment (Public)</div>
              <div className="text-white text-xs font-mono break-all bg-white/5 p-3 rounded">
                {depositData.commitment}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Blinding Factor (Secret)</div>
              <div className="text-orange-400 text-xs font-mono break-all bg-orange-500/10 p-3 rounded border border-orange-500/30">
                {depositData.blinding_factor}
              </div>
              <div className="mt-2 text-xs text-orange-400">
                ⚠️ Save this! You'll need it to withdraw.
              </div>
            </div>

            <button
              onClick={handleSignAndSubmit}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all"
            >
              Sign with Wallet
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-white font-medium mb-2">Confirming...</div>
            <div className="text-gray-400 text-sm">Waiting for blockchain confirmation</div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-white font-medium mb-2">Deposit Successful!</div>
            <div className="text-gray-400 text-sm">Your funds are now in the privacy pool</div>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Add useQuery import
import { useQuery } from '@tanstack/react-query';