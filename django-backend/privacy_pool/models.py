"""Models for Privacy Pool application."""

import hashlib
import secrets
from decimal import Decimal

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings


class PrivacyPool(models.Model):
    """Represents a privacy pool for confidential transactions."""

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        CLOSED = 'closed', 'Closed'

    name = models.CharField(max_length=255)
    asset_code = models.CharField(max_length=12)  # e.g., 'XLM', 'USDC'
    asset_issuer = models.CharField(max_length=56, blank=True, null=True)
    
    # Contract address on Stellar
    contract_address = models.CharField(max_length=56, unique=True)
    
    # Merkle tree configuration
    merkle_depth = models.PositiveIntegerField(default=32)
    
    # Pool limits
    min_deposit = models.DecimalField(
        max_digits=20, decimal_places=7, 
        default=Decimal('10.0')
    )
    min_withdrawal = models.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('1.0')
    )
    max_amount = models.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('1000000.0')
    )
    
    # Pool statistics
    total_deposits = models.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('0.0')
    )
    total_withdrawals = models.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('0.0')
    )
    total_notes = models.PositiveIntegerField(default=0)
    
    status = models.CharField(
        max_length=10, choices=Status.choices,
        default=Status.ACTIVE
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Privacy Pool'
        verbose_name_plural = 'Privacy Pools'

    def __str__(self):
        return f"{self.name} ({self.asset_code})"


class Commitment(models.Model):
    """Represents a Pedersen commitment to a transaction amount."""

    class CommitmentType(models.TextChoices):
        DEPOSIT = 'deposit', 'Deposit'
        WITHDRAWAL = 'withdrawal', 'Withdrawal'

    pool = models.ForeignKey(
        PrivacyPool, on_delete=models.CASCADE,
        related_name='commitments'
    )
    
    # The commitment value (C = g^amount * h^randomness)
    commitment = models.CharField(max_length=128)
    
    # Blinding factor (kept secret, used for withdrawal)
    blinding_factor = models.CharField(max_length=64)
    
    # Original amount (stored encrypted, only for depositor)
    amount = models.DecimalField(max_digits=20, decimal_places=7)
    
    # Nullifier (prevents double-spending)
    nullifier = models.CharField(max_length=128, unique=True)
    
    # Merkle tree index
    leaf_index = models.PositiveIntegerField()
    
    # Whether this commitment has been spent
    spent = models.BooleanField(default=False)
    
    # Type of commitment
    commitment_type = models.CharField(
        max_length=10, choices=CommitmentType.choices
    )
    
    # The Stellar transaction hash that created this commitment
    transaction_hash = models.CharField(max_length=64)
    
    # Note: In a real implementation, the amount would be encrypted
    # and only accessible to the depositor via their wallet key
    encrypted_amount = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    spent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Commitment'
        verbose_name_plural = 'Commitments'

    def __str__(self):
        return f"Commitment {self.commitment[:16]}... ({self.commitment_type})"

    @classmethod
    def generate_commitment(cls, amount: Decimal, randomness: str = None):
        """Generate a Pedersen commitment for an amount."""
        if randomness is None:
            randomness = secrets.token_hex(32)
        
        # In a real implementation, this would use proper cryptographic
        #Pedersen commitment: C = g^amount * h^randomness (mod p)
        # For now, we use a hash-based simulation
        data = f"{amount}:{randomness}"
        commitment = hashlib.sha256(data.encode()).hexdigest()
        
        return commitment, randomness

    @classmethod
    def generate_nullifier(cls, commitment: str, secret: str = None):
        """Generate a nullifier for a commitment."""
        if secret is None:
            secret = secrets.token_hex(32)
        
        data = f"{commitment}:{secret}"
        nullifier = hashlib.sha256(data.encode()).hexdigest()
        
        return nullifier, secret


class MerkleNode(models.Model):
    """Represents a node in the Merkle tree."""

    pool = models.ForeignKey(
        PrivacyPool, on_delete=models.CASCADE,
        related_name='merkle_nodes'
    )
    
    # Node index in the tree
    index = models.PositiveIntegerField()
    
    # Level in the tree (0 = leaf)
    level = models.PositiveIntegerField()
    
    # Hash value
    hash = models.CharField(max_length=128)
    
    # Left and right child indices (for internal nodes)
    left_child = models.PositiveIntegerField(null=True, blank=True)
    right_child = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['pool', 'index', 'level']
        ordering = ['level', 'index']
        verbose_name = 'Merkle Node'
        verbose_name_plural = 'Merkle Nodes'

    def __str__(self):
        return f"Node {self.index} (Level {self.level})"


class Transaction(models.Model):
    """Represents a privacy pool transaction."""

    class TransactionType(models.TextChoices):
        DEPOSIT = 'deposit', 'Deposit'
        WITHDRAWAL = 'withdrawal', 'Withdrawal'
        TRANSFER = 'transfer', 'Transfer'

    class TransactionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        FAILED = 'failed', 'Failed'

    pool = models.ForeignKey(
        PrivacyPool, on_delete=models.CASCADE,
        related_name='transactions'
    )
    
    # Transaction type
    transaction_type = models.CharField(
        max_length=10, choices=TransactionType.choices
    )
    
    # User's public key (for deposits)
    public_key = models.CharField(max_length=56)
    
    # Commitment/nullifier (for verification)
    commitment = models.ForeignKey(
        Commitment, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='transactions'
    )
    
    # Amount (hidden in privacy pool, but stored for internal tracking)
    amount = models.DecimalField(max_digits=20, decimal_places=7)
    
    # Status
    status = models.CharField(
        max_length=10, choices=TransactionStatus.choices,
        default=TransactionStatus.PENDING
    )
    
    # Stellar transaction hash
    stellar_transaction_hash = models.CharField(
        max_length=64, unique=True, null=True, blank=True
    )
    
    # Soroban transaction hash (if applicable)
    soroban_transaction_hash = models.CharField(
        max_length=64, null=True, blank=True
    )
    
    # Error message (if failed)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"


class PoolStatistic(models.Model):
    """Daily statistics for a pool."""

    pool = models.ForeignKey(
        PrivacyPool, on_delete=models.CASCADE,
        related_name='statistics'
    )
    
    date = models.DateField()
    
    # Daily totals
    deposits_count = models.PositiveIntegerField(default=0)
    deposits_volume = models.DecimalField(
        max_digits=20, decimal_places=7, default=Decimal('0.0')
    )
    
    withdrawals_count = models.PositiveIntegerField(default=0)
    withdrawals_volume = models.DecimalField(
        max_digits=20, decimal_places=7, default=Decimal('0.0')
    )
    
    # Active notes (unspent commitments)
    active_notes = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['pool', 'date']
        ordering = ['-date']
        verbose_name = 'Pool Statistic'
        verbose_name_plural = 'Pool Statistics'

    def __str__(self):
        return f"{self.pool.name} - {self.date}"