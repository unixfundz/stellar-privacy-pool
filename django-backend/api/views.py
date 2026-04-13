"""Views for the API."""

import hashlib
import secrets
from decimal import Decimal

from rest_framework import status, viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg

from privacy_pool.models import (
    PrivacyPool, Commitment, MerkleNode, Transaction, PoolStatistic
)
from .serializers import (
    PrivacyPoolSerializer, CommitmentSerializer, TransactionSerializer,
    DepositRequestSerializer, WithdrawRequestSerializer,
    PoolStatsSerializer, CreatePoolSerializer, MerkleTreeSerializer
)


class PrivacyPoolViewSet(viewsets.ModelViewSet):
    """ViewSet for managing privacy pools."""
    
    queryset = PrivacyPool.objects.all()
    serializer_class = PrivacyPoolSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new privacy pool."""
        serializer = CreatePoolSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # In a real implementation, this would deploy a Soroban contract
        # For now, we generate a mock contract address
        contract_address = self._generate_contract_address(
            serializer.validated_data['name']
        )
        
        pool = PrivacyPool.objects.create(
            name=serializer.validated_data['name'],
            asset_code=serializer.validated_data['asset_code'],
            asset_issuer=serializer.validated_data.get('asset_issuer', ''),
            contract_address=contract_address,
            merkle_depth=serializer.validated_data.get('merkle_depth', 32),
            min_deposit=serializer.validated_data.get('min_deposit', Decimal('10.0')),
            min_withdrawal=serializer.validated_data.get('min_withdrawal', Decimal('1.0')),
            max_amount=serializer.validated_data.get('max_amount', Decimal('1000000.0')),
        )
        
        # Create initial empty Merkle tree
        self._initialize_merkle_tree(pool)
        
        return Response(
            PrivacyPoolSerializer(pool).data,
            status=status.HTTP_201_CREATED
        )
    
    def _generate_contract_address(self, name: str) -> str:
        """Generate a mock contract address."""
        data = f"{name}:{secrets.token_hex(16)}"
        return hashlib.sha256(data.encode()).hexdigest()[:56]
    
    def _initialize_merkle_tree(self, pool: PrivacyPool):
        """Initialize empty Merkle tree for a pool."""
        # Create root node (empty tree)
        MerkleNode.objects.create(
            pool=pool,
            index=0,
            level=0,
            hash=hashlib.sha256(b'empty').hexdigest()
        )
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get pool statistics."""
        pool = self.get_object()
        
        # Aggregate transaction data
        deposits = pool.transactions.filter(
            transaction_type=Transaction.TransactionType.DEPOSIT,
            status=Transaction.TransactionStatus.CONFIRMED
        ).aggregate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount')
        )
        
        withdrawals = pool.transactions.filter(
            transaction_type=Transaction.TransactionType.WITHDRAWAL,
            status=Transaction.TransactionStatus.CONFIRMED
        ).aggregate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount')
        )
        
        active_notes = pool.commitments.filter(spent=False).count()
        total_transactions = pool.transactions.count()
        
        stats = {
            'total_deposits': deposits['total'] or Decimal('0'),
            'total_withdrawals': withdrawals['total'] or Decimal('0'),
            'total_volume': (deposits['total'] or Decimal('0')) + (withdrawals['total'] or Decimal('0')),
            'active_notes': active_notes,
            'total_transactions': total_transactions,
            'avg_deposit_size': deposits['avg'] or Decimal('0'),
            'avg_withdrawal_size': withdrawals['avg'] or Decimal('0'),
        }
        
        return Response(PoolStatsSerializer(stats).data)
    
    @action(detail=True, methods=['get'])
    def merkle_tree(self, request, pk=None):
        """Get Merkle tree state for a pool."""
        pool = self.get_object()
        
        nodes = pool.merkle_nodes.all()
        
        # Get root (highest level node)
        root = nodes.order_by('-level').first()
        
        if not root:
            return Response(
                {'error': 'Merkle tree not initialized'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = {
            'root': root.hash,
            'depth': pool.merkle_depth,
            'nodes': MerkleNodeSerializer(nodes, many=True).data,
            'leaf_count': pool.commitments.filter(spent=False).count()
        }
        
        return Response(MerkleTreeSerializer(data).data)


class DepositView(APIView):
    """View for handling deposits to privacy pools."""
    
    def post(self, request):
        """Create a deposit to a privacy pool."""
        serializer = DepositRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            pool = PrivacyPool.objects.get(id=serializer.validated_data['pool_id'])
        except PrivacyPool.DoesNotExist:
            return Response(
                {'error': 'Pool not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate amount against pool limits
        amount = serializer.validated_data['amount']
        if amount < pool.min_deposit:
            return Response(
                {'error': f'Amount must be at least {pool.min_deposit}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if amount > pool.max_amount:
            return Response(
                {'error': f'Amount cannot exceed {pool.max_amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate commitment
        randomness = secrets.token_hex(32)
        commitment_hash, _ = Commitment.generate_commitment(amount, randomness)
        nullifier, secret = Commitment.generate_nullifier(commitment_hash)
        
        # Get next leaf index
        leaf_count = pool.commitments.count()
        
        # Create the commitment (not saved yet - will be confirmed on-chain)
        commitment = Commitment(
            pool=pool,
            commitment=commitment_hash,
            blinding_factor=randomness,
            amount=amount,
            nullifier=nullifier,
            leaf_index=leaf_count,
            commitment_type=Commitment.CommitmentType.DEPOSIT,
            transaction_hash='',  # Will be set on confirmation
        )
        
        # Create pending transaction
        transaction = Transaction.objects.create(
            pool=pool,
            transaction_type=Transaction.TransactionType.DEPOSIT,
            public_key=serializer.validated_data['public_key'],
            amount=amount,
            status=Transaction.TransactionStatus.PENDING
        )
        
        # Return the transaction data that the frontend needs to sign
        return Response({
            'transaction_id': transaction.id,
            'commitment': commitment_hash,
            'nullifier': nullifier,
            'blinding_factor': randomness,  # NOTE: In production, this should be encrypted!
            'leaf_index': leaf_count,
            'pool_contract_address': pool.contract_address,
            'amount': str(amount),
            'asset_code': pool.asset_code,
            'asset_issuer': pool.asset_issuer or '',
        })


class WithdrawView(APIView):
    """View for handling withdrawals from privacy pools."""
    
    def post(self, request):
        """Create a withdrawal from a privacy pool."""
        serializer = WithdrawRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            pool = PrivacyPool.objects.get(id=serializer.validated_data['pool_id'])
        except PrivacyPool.DoesNotExist:
            return Response(
                {'error': 'Pool not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify the commitment exists and is unspent
        commitment_str = serializer.validated_data['commitment']
        try:
            commitment = Commitment.objects.get(
                pool=pool,
                commitment=commitment_str,
                spent=False
            )
        except Commitment.DoesNotExist:
            return Response(
                {'error': 'Commitment not found or already spent'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate the nullifier
        nullifier = serializer.validated_data['nullifier']
        if nullifier != commitment.nullifier:
            return Response(
                {'error': 'Invalid nullifier'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark commitment as spent
        commitment.spent = True
        commitment.save()
        
        # Create withdrawal transaction
        transaction = Transaction.objects.create(
            pool=pool,
            transaction_type=Transaction.TransactionType.WITHDRAWAL,
            public_key=serializer.validated_data['recipient_public_key'],
            amount=serializer.validated_data['amount'],
            commitment=commitment,
            status=Transaction.TransactionStatus.PENDING
        )
        
        # Return withdrawal data
        return Response({
            'transaction_id': transaction.id,
            'recipient': serializer.validated_data['recipient_public_key'],
            'amount': str(serializer.validated_data['amount']),
            'nullifier_hash': hashlib.sha256(nullifier.encode()).hexdigest(),
        })


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing transactions."""
    
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by pool
        pool_id = self.request.query_params.get('pool_id')
        if pool_id:
            queryset = queryset.filter(pool_id=pool_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by type
        tx_type = self.request.query_params.get('type')
        if tx_type:
            queryset = queryset.filter(transaction_type=tx_type)
        
        return queryset


class CommitmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing commitments."""
    
    queryset = Commitment.objects.all()
    serializer_class = CommitmentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by pool
        pool_id = self.request.query_params.get('pool_id')
        if pool_id:
            queryset = queryset.filter(pool_id=pool_id)
        
        # Filter by spent status
        spent = self.request.query_params.get('spent')
        if spent is not None:
            queryset = queryset.filter(spent=spent.lower() == 'true')
        
        return queryset