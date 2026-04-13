/**
 * Dashboard component for the Privacy Pool application
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { privacyPoolApi } from '../services/api';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

interface DashboardProps {
  publicKey: string;
}

export default function Dashboard({ publicKey }: DashboardProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedPool, setSelectedPool] = useState<number | null>(null);

  const { data: pools, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: privacyPoolApi.getPools,
  });

  const handleDeposit = (poolId: number) => {
    setSelectedPool(poolId);
    setShowDeposit(true);
  };

  const handleWithdraw = (poolId: number) => {
    setSelectedPool(poolId);
    setShowWithdraw(true);
  };

  if (poolsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading pools...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">Total Pools</div>
          <div className="text-3xl font-bold text-white">{pools?.length || 0}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">Total Value Locked</div>
          <div className="text-3xl font-bold text-white">$0.00</div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">Your Deposits</div>
          <div className="text-3xl font-bold text-white">$0.00</div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">Active Notes</div>
          <div className="text-3xl font-bold text-white">0</div>
        </div>
      </div>

      {/* Pool List */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Available Pools</h2>
        </div>
        
        {pools && pools.length > 0 ? (
          <div className="divide-y divide-white/10">
            {pools.map((pool: any) => (
              <div key={pool.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl">
                    {pool.asset_code === 'XLM' ? '✦' : pool.asset_code === 'USDC' ? '$' : '🪙'}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">{pool.name}</div>
                    <div className="text-gray-400 text-sm">
                      {pool.asset_code}
                      {pool.asset_issuer && ` • ${pool.asset_issuer.slice(0, 8)}...`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-white font-medium">{Number(pool.total_deposits).toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Deposits</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">{pool.total_notes}</div>
                    <div className="text-gray-400 text-sm">Active Notes</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeposit(pool.id)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:from-purple-500 hover:to-cyan-500 transition-all"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => handleWithdraw(pool.id)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🌊</div>
            <div className="text-white font-medium mb-2">No Pools Available</div>
            <div className="text-gray-400">There are no privacy pools currently available.</div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDeposit && selectedPool && (
        <DepositModal
          poolId={selectedPool}
          publicKey={publicKey}
          onClose={() => {
            setShowDeposit(false);
            setSelectedPool(null);
          }}
        />
      )}

      {showWithdraw && selectedPool && (
        <WithdrawModal
          poolId={selectedPool}
          publicKey={publicKey}
          onClose={() => {
            setShowWithdraw(false);
            setSelectedPool(null);
          }}
        />
      )}
    </div>
  );
}