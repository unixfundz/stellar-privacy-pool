# Stellar Privacy Pool - Architecture

## Overview

The Stellar Privacy Pool is a non-custodial, privacy-preserving asset transfer protocol built on Stellar. It enables users to make confidential transactions using Zero-Knowledge Proofs (ZKPs) while maintaining full control of their assets.

## Core Components

### 1. Privacy Pool Contract (Soroban)

The smart contract maintains:
- **Merkle Tree** - Stores commitments to transaction amounts
- **Nullifier Set** - Prevents double-spending
- **Accumulator** - Tracks total pool value

### 2. Backend Services (Django)

- **Pool Manager** - Handles deposit/withdraw operations
- **ZK Proof Generator** - Creates confidential transaction proofs
- **Merkle Tree Service** - Manages on-chain/off-chain tree state

### 3. Frontend (React)

- **Wallet Connection** - Stellar wallet integration (Freighter, Albedo)
- **Transaction Builder** - Create confidential transfers
- **Pool Dashboard** - View pool statistics

## Privacy Mechanism

### Pedersen Commitments

Each transaction amount is committed using Pedersen commitments:
```
C = g^amount * h^randomness
```

Where:
- `g` and `h` are generators
- `amount` is the transaction value
- `randomness` is a blinding factor

### Zero-Knowledge Proofs

The system uses Bulletproofs to prove:
1. **Range Proof** - Amount is within valid range [0, MAX]
2. **Balance Proof** - Input = Output (no value creation)
3. **Membership Proof** - Commitment exists in Merkle tree

## Data Flow

```
┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│ Frontend│────▶│   Backend   │────▶│ Contract │
│ Wallet  │     │         │     │   (ZK-PoW)  │     │          │
└─────────┘     └─────────┘     └─────────────┘     └──────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   Stellar   │
                                   │   Network   │
                                   └─────────────┘
```

## Security Considerations

1. **Non-Custodial** - Users sign transactions directly
2. **Slippage Protection** - Minimum pool size enforced
3. **Front-Running Prevention** - Commit-reveal scheme
4. **Upgradeable** - Proxy pattern for contract updates

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pools/create` | Create new privacy pool |
| POST | `/api/pools/{id}/deposit` | Deposit to pool |
| POST | `/api/pools/{id}/withdraw` | Withdraw from pool |
| GET | `/api/pools/{id}/merkle` | Get Merkle tree state |
| GET | `/api/pools/{id}/stats` | Pool statistics |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup instructions.