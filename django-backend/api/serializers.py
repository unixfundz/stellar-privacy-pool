"""Serializers for the API."""

from decimal import Decimal

from rest_framework import serializers
from django.conf import settings

from privacy_pool.models import (
    PrivacyPool, Commitment, MerkleNode, Transaction, PoolStatistic
)


class PrivacyPoolSerializer(serializers.ModelSerializer):
    """Serializer for PrivacyPool model."""
    
    # Computed fields
    total_volume = serializers.SerializerMethodField()
    active_notes = serializers.SerializerMethodField()
    
    class Meta:
        model = PrivacyPool
        fields = [
            'id', 'name', 'asset_code', 'asset_issuer', 'contract_address',
            'merkle_depth', 'min_deposit', 'min_withdrawal', 'max_amount',
            'total_deposits', 'total_withdrawals', 'total_notes',
            'status', 'created_at', 'updated_at',
            'total_volume', 'active_notes'
        ]
        read_only_fields = [
            'id', 'contract_address', 'total_deposits', 'total_withdrawals',
            'total_notes', 'created_at', 'updated_at'
        ]
    
    def get_total_volume(self, obj):
        return float(obj.total_deposits + obj.total_withdrawals)
    
    def get_active_notes(self, obj):
        return obj.commitments.filter(spent=False).count()


class CommitmentSerializer(serializers.ModelSerializer):
    """Serializer for Commitment model."""
    
    pool_name = serializers.CharField(source='pool.name', read_only=True)
    
    class Meta:
        model = Commitment
        fields = [
            'id', 'pool', 'pool_name', 'commitment', 'leaf_index',
            'spent', 'commitment_type', 'transaction_hash',
            'created_at', 'spent_at'
        ]
        read_only_fields = ['id', 'leaf_index', 'spent', 'created_at', 'spent_at']
    
    def validate(self, data):
        """Validate commitment data."""
        # Check amount constraints via pool
        if 'pool' in data:
            amount = data.get('amount', Decimal('0'))
            if amount < data['pool'].min_deposit:
                raise serializers.ValidationError(
                    f"Amount must be at least {data['pool'].min_deposit}"
                )
            if amount > data['pool'].max_amount:
                raise serializers.ValidationError(
                    f"Amount cannot exceed {data['pool'].max_amount}"
                )
        return data


class MerkleNodeSerializer(serializers.ModelSerializer):
    """Serializer for MerkleNode model."""
    
    class Meta:
        model = MerkleNode
        fields = [
            'id', 'index', 'level', 'hash',
            'left_child', 'right_child', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MerkleTreeSerializer(serializers.Serializer):
    """Serializer for Merkle tree structure."""
    
    root = serializers.CharField()
    depth = serializers.IntegerField()
    nodes = MerkleNodeSerializer(many=True)
    leaf_count = serializers.IntegerField()


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    
    pool_name = serializers.CharField(source='pool.name', read_only=True)
    pool_asset = serializers.CharField(source='pool.asset_code', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'pool', 'pool_name', 'pool_asset',
            'transaction_type', 'public_key', 'amount',
            'status', 'stellar_transaction_hash', 'soroban_transaction_hash',
            'error_message', 'created_at', 'confirmed_at'
        ]
        read_only_fields = [
            'id', 'status', 'stellar_transaction_hash',
            'soroban_transaction_hash', 'error_message',
            'created_at', 'confirmed_at'
        ]


class DepositRequestSerializer(serializers.Serializer):
    """Serializer for deposit request."""
    
    pool_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=20, decimal_places=7,
        min_value=Decimal('0.0000001')
    )
    public_key = serializers.CharField(max_length=56)
    
    def validate_amount(self, value):
        if value < Decimal(settings.PRIVACY_POOL_MIN_DEPOSIT):
            raise serializers.ValidationError(
                f"Minimum deposit is {settings.PRIVACY_POOL_MIN_DEPOSIT}"
            )
        return value


class WithdrawRequestSerializer(serializers.Serializer):
    """Serializer for withdrawal request."""
    
    pool_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=20, decimal_places=7,
        min_value=Decimal('0.0000001')
    )
    recipient_public_key = serializers.CharField(max_length=56)
    
    # The commitment data (from the user's note)
    commitment = serializers.CharField(max_length=128)
    nullifier = serializers.CharField(max_length=128)
    proof = serializers.CharField()
    
    def validate_amount(self, value):
        if value < Decimal(settings.PRIVACY_POOL_MIN_AMOUNT):
            raise serializers.ValidationError(
                f"Minimum withdrawal is {settings.PRIVACY_POOL_MIN_AMOUNT}"
            )
        return value


class PoolStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for PoolStatistic model."""
    
    class Meta:
        model = PoolStatistic
        fields = [
            'id', 'date',
            'deposits_count', 'deposits_volume',
            'withdrawals_count', 'withdrawals_volume',
            'active_notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PoolStatsSerializer(serializers.Serializer):
    """Serializer for pool statistics summary."""
    
    total_deposits = serializers.DecimalField(max_digits=20, decimal_places=7)
    total_withdrawals = serializers.DecimalField(max_digits=20, decimal_places=7)
    total_volume = serializers.DecimalField(max_digits=20, decimal_places=7)
    active_notes = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    avg_deposit_size = serializers.DecimalField(max_digits=20, decimal_places=7)
    avg_withdrawal_size = serializers.DecimalField(max_digits=20, decimal_places=7)


class CreatePoolSerializer(serializers.Serializer):
    """Serializer for creating a new privacy pool."""
    
    name = serializers.CharField(max_length=255)
    asset_code = serializers.CharField(max_length=12)
    asset_issuer = serializers.CharField(max_length=56, required=False, allow_blank=True)
    merkle_depth = serializers.IntegerField(
        default=32, min_value=8, max_value=64
    )
    min_deposit = serializers.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('10.0'), min_value=Decimal('0.0000001')
    )
    min_withdrawal = serializers.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('1.0'), min_value=Decimal('0.0000001')
    )
    max_amount = serializers.DecimalField(
        max_digits=20, decimal_places=7,
        default=Decimal('1000000.0'), min_value=Decimal('0.0000001')
    )