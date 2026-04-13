import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import WalletConnect from './components/WalletConnect';
import './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing wallet connection on mount
    const checkWallet = async () => {
      try {
        if (window.freighterApi) {
          const { publicKey } = await window.freighterApi.getPublicKey();
          if (publicKey) {
            setPublicKey(publicKey);
          }
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    };
    checkWallet();
  }, []);

  const handleConnect = async () => {
    try {
      if (!window.freighterApi) {
        setWalletError('Freighter wallet not detected. Please install Freighter wallet.');
        return;
      }
      
      const { publicKey } = await window.freighterApi.getPublicKey();
      if (publicKey) {
        setPublicKey(publicKey);
        setWalletError(null);
      }
    } catch (error) {
      setWalletError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Stellar Privacy Pool
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {publicKey ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">
                    {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                  </span>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/25"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

        {walletError && (
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
              {walletError}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8">
          {publicKey ? (
            <Dashboard publicKey={publicKey} />
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🌑</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Private Transactions on Stellar
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Make confidential transactions using Zero-Knowledge Proofs. 
                Your amounts are hidden, but verifiably correct.
              </p>
              <div className="flex justify-center gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl mb-2">🔐</div>
                  <div className="text-white font-semibold">Zero-Knowledge</div>
                  <div className="text-gray-400 text-sm">Proves correctness without revealing data</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="text-white font-semibold">Non-Custodial</div>
                  <div className="text-gray-400 text-sm">You control your assets always</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-white font-semibold">Fast</div>
                  <div className="text-gray-400 text-sm">Built on Stellar's high-speed network</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-white/10 mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
            <p>Built with Soroban • Privacy-preserving DeFi on Stellar</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

// Extend window for Freighter API
declare global {
  interface Window {
    freighterApi?: {
      getPublicKey: () => Promise<{ publicKey: string }>;
      signTransaction: (transaction: string) => Promise<{ signature: string }>;
    };
  }
}

export default App;
