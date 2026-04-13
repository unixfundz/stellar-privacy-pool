# 🌑 Stellar Privacy Pool

> Zero-Knowledge Proof based confidential transactions on Stellar

![Stellar Privacy Pool Banner](https://img.shields.io/badge/Stellar-Soroban-blue?style=for-the-badge&logo=stellar)
![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue?style=for-the-badge&logo=python)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange?style=for-the-badge&logo=rust)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=for-the-badge&logo=typescript)

## 🌟 About

**Stellar Privacy Pool** is a revolutionary **privacy-preserving DeFi protocol** that enables confidential, non-custodial asset transfers on the Stellar network using advanced Zero-Knowledge Proof (ZKP) cryptography.

### How It Works

When you deposit funds into the pool, your transaction amount is hidden using **Pedersen Commitments** - a cryptographic scheme that allows you to prove you know a value without revealing it. Your funds enter a privacy pool with many other deposits, making it impossible to trace the source of any particular withdrawal.

1. **Deposit**: Generate a cryptographic commitment (hash) of your amount + random blinding factor
2. **Pool**: Your commitment joins thousands of others in a Merkle tree
3. **Withdraw**: Prove you own a valid commitment without revealing which one

### Why It Matters

- 🔒 **Financial Privacy**: Hide transaction amounts from prying eyes
- 🌐 **Non-Custodial**: You retain full control - no middleman holds your funds
- ⚡ **Fast**: Built on Stellar's 3-5 second finality network
- 🔗 **Interoperable**: Works with any Stellar asset (XLM, USDC, BTC, etc.)

### Security Model

- **Zero-Knowledge Proofs**: Prove transaction validity without revealing amounts
- **Merkle Trees**: Efficient membership verification
- **Nullifiers**: Prevent double-spending attacks
- **Non-Custodial**: Sign transactions directly from your wallet (Freighter)

> ⚠️ **Note**: This is a proof-of-concept for educational purposes. Do NOT use with real funds without proper security audits.

## 🔐 Features

- 🔒 **Confidential Transactions** - Zero-knowledge proofs hide transaction amounts while maintaining verifiability
- 🌐 **Non-Custodial** - Users retain full control of their assets at all times
- ⚡ **Fast Settlement** - Built on Stellar's high-performance network
- 🔗 **Cross-Asset Privacy** - Support for multiple Stellar assets (XLM, USDC, BTC, ETH)
- 📊 **Audit-Friendly** - Verifiable encryption allows third-party audits without revealing amounts

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Smart Contract Reference](docs/CONTRACTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Considerations](docs/SECURITY.md)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/stellar-privacy-pool/stellar-privacy-pool.git
cd stellar-privacy-pool

# Start local development environment
docker-compose up -d

# Access the dashboard at http://localhost:3000
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    http://localhost:3000                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                    Backend (Django + Celery)                   │
│                    http://localhost:8000                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pool      │  │  Merkle     │  │   ZK Proof Generator   │  │
│  │   Manager   │  │   Tree      │  │   & Verifier           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Soroban RPC
┌──────────────────────────▼──────────────────────────────────────┐
│              Soroban Smart Contracts (Rust)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PrivacyPool │  │  Token      │  │   MerkleTree            │  │
│  │  Contract   │  │  Wrapper    │  │   Contract              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Horizon API
┌──────────────────────────▼──────────────────────────────────────┐
│                     Stellar Network                             │
│              (Public/Testnet/Futurenet)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
stellar-privacy-pool/
├── django-backend/          # REST API & pool management
│   ├── privacy_pool/        # Django project
│   │   ├── api/            # REST endpoints
│   │   ├── pool/           # Pool logic & ZK integration
│   │   └── zk/             # Zero-knowledge proof utilities
│   ├── tests/
│   └── manage.py
├── soroban-contracts/       # Smart contracts
│   └── privacy_pool_core/  # Core privacy pool contract
├── frontend/                # React + TypeScript UI
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript types
│   └── package.json
├── k8s/                     # Kubernetes manifests
├── docker-compose.yml       # Local development
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Django 4.2, Celery, PostgreSQL, Redis |
| **Blockchain** | Soroban, Rust, Stellar SDK |
| **Cryptography** | Bulletproofs, Pedersen Commitments |
| **Infrastructure** | Docker, Kubernetes, Prometheus |

## 📄 License

Licensed under the Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

<p align="center">Built with 🔥 on Stellar</p>