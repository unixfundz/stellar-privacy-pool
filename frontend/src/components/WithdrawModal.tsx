/**
 * Withdraw Modal Component
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { withdrawApi, privacyPoolApi } from '../services/api';

interface WithdrawModalProps {
  poolId: number;
  publicKey: string;
  onClose: () => void;
}

export default function WithdrawModal({ poolId, publicKey, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState<'input' | 'sign' | 'confirm' | 'success'>('input');
  
  // Form state
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [commitment, setCommitment] = useState('');
  const [blindingFactor, setBlindingFactor] = useState('');
  const [nullifier, setNullifier] = useState('');

  const { data: pool } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: () => privacyPoolApi.getPool(poolId),
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawApi.createWithdraw,
    onSuccess: () => {
      setStep('confirm');
      setTimeout(() => {
        setStep('success');
      }, 2000);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create withdrawal');
    },
  });

  const handleWithdraw = () => {
    if (!amount || !recipient || !commitment || !blindingFactor || !nullifier) {
      alert('Please fill in all fields');
      return;
    }
    
    withdrawMutation.mutate({
      pool_id: poolId,
      amount,
      recipient_public_key: recipient,
      commitment,
      nullifier,
      proof: 'placeholder', // In production, this would be a ZK proof
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Withdraw</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {step === 'input' && pool && (
          <>
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Pool</div>
              <div className="text-white font-medium">
                {pool.name} ({pool.asset_code})
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="G..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Your Note - Commitment</label>
              <input
                type="text"
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
                placeholder="Commitment hash"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Your Note - Blinding Factor</label>
              <input
                type="text"
                value={blindingFactor}
                onChange={(e) => setBlindingFactor(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
                placeholder="Blinding factor (secret)"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Your Note - Nullifier</label>
              <input
                type="text"
                value={nullifier}
                onChange={(e) => setNullifier(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
                placeholder="Nullifier"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50"
            >
              {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
            </button>
          </>
        )}

        {step === 'sign' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✍️</div>
            <div className="text-white font-medium mb-2">Sign with Wallet</div>
            <div className="text-gray-400 text-sm">Please confirm the withdrawal in your wallet</div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-white font-medium mb-2">Processing...</div>
            <div className="text-gray-400 text-sm">Verifying zero-knowledge proof</div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-white font-medium mb-2">Withdrawal Successful!</div>
            <div className="text-gray-400 text-sm">Your funds have been sent to the recipient</div>
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