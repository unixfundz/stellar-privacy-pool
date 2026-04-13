/**
 * About Page - Explains the Stellar Privacy Pool protocol
 */

import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Stellar Privacy Pool
              </h1>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <span className="text-white font-medium">About</span>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="text-6xl mb-6">🌑</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Private Transactions on Stellar
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A revolutionary protocol enabling confidential, non-custodial asset transfers using Zero-Knowledge Proofs
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Deposit</h3>
              <p className="text-gray-400">
                Generate a cryptographic commitment (hash) of your amount plus a random blinding factor. 
                Your funds join the pool with many other deposits.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Pool</h3>
              <p className="text-gray-400">
                Your commitment is added to a Merkle tree - a data structure that allows 
                efficient and secure verification of membership.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Withdraw</h3>
              <p className="text-gray-400">
                Prove you own a valid commitment without revealing which one. 
                The pool mixes your funds with others, ensuring privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Cryptography */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">The Cryptography</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🔐 Pedersen Commitments</h3>
              <p className="text-gray-300 mb-4">
                A commitment scheme that hides the value while allowing verification:
              </p>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-cyan-400 overflow-x-auto">
                C = g<sup>amount</sup> × h<sup>randomness</sup> (mod p)
              </div>
              <p className="text-gray-400 mt-4">
                The commitment is computed by raising two generators to the power of the amount 
                and a random blinding factor. You can prove knowledge without revealing the value.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🌳 Merkle Trees</h3>
              <p className="text-gray-300 mb-4">
                Efficiently verify membership in the pool without revealing which commitment is yours.
              </p>
              <p className="text-gray-400">
                Every commitment is a leaf in a binary tree. The root hash represents all deposits. 
                Prove your commitment exists in the tree by providing a path from leaf to root.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🚫 Nullifiers</h3>
              <p className="text-gray-300 mb-4">
                Prevent double-spending - the same note can only be withdrawn once.
              </p>
              <p className="text-gray-400">
                Each commitment has a unique nullifier derived from its secret data. 
                The contract maintains a set of used nullifiers. Attempting to withdraw 
                with a previously-used nullifier will fail.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Security Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="text-lg font-bold text-white">Non-Custodial</h3>
                <p className="text-gray-400 text-sm mt-1">
                  You sign transactions directly with your wallet. We never hold your funds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl">🛡️</div>
              <div>
                <h3 className="text-lg font-bold text-white">Zero-Knowledge</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Prove transaction validity without revealing amounts or addresses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-lg font-bold text-white">Fast Finality</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Built on Stellar's 3-5 second transaction finality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl">🌐</div>
              <div>
                <h3 className="text-lg font-bold text-white">Interoperable</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Works with any Stellar asset - XLM, USDC, BTC, ETH, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Warning */}
        <section className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Important Security Notice</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            This software is provided for educational and development purposes. 
            <strong> Do NOT use with real funds</strong> without proper security audits, 
            formal verification of cryptographic implementations, and professional review.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Built with Soroban • Privacy-preserving DeFi on Stellar</p>
        </div>
      </footer>
    </div>
  );
}