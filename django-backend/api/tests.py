"""Tests for the Privacy Pool API."""

from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from privacy_pool.models import PrivacyPool, Commitment, Transaction


class PrivacyPoolModelTest(TestCase):
    """Tests for PrivacyPool model."""

    def setUp(self):
        self.pool = PrivacyPool.objects.create(
            name="Test Pool",
            asset_code="XLM",
            asset_issuer="",
            contract_address="TEST123",
            merkle_depth=32,
            min_deposit=Decimal("10.0"),
            min_withdrawal=Decimal("1.0"),
            max_amount=Decimal("1000000.0"),
        )

    def test_pool_creation(self):
        """Test that a pool is created correctly."""
        self.assertEqual(self.pool.name, "Test Pool")
        self.assertEqual(self.pool.asset_code, "XLM")
        self.assertEqual(self.pool.status, PrivacyPool.Status.ACTIVE)

    def test_pool_str(self):
        """Test the string representation."""
        self.assertEqual(str(self.pool), "Test Pool (XLM)")


class CommitmentModelTest(TestCase):
    """Tests for Commitment model."""

    def setUp(self):
        self.pool = PrivacyPool.objects.create(
            name="Test Pool",
            asset_code="XLM",
            contract_address="TEST123",
        )
        self.commitment = Commitment.objects.create(
            pool=self.pool,
            commitment="abc123",
            blinding_factor="secret123",
            amount=Decimal("100.0"),
            nullifier="nullifier123",
            leaf_index=0,
            commitment_type=Commitment.CommitmentType.DEPOSIT,
            transaction_hash="tx123",
        )

    def test_commitment_creation(self):
        """Test commitment is created correctly."""
        self.assertEqual(self.commitment.amount, Decimal("100.0"))
        self.assertFalse(self.commitment.spent)

    def test_commitment_spent(self):
        """Test marking commitment as spent."""
        self.commitment.spent = True
        self.commitment.save()
        self.assertTrue(self.commitment.spent)


class PoolAPITest(APITestCase):
    """Tests for the Pool API endpoints."""

    def setUp(self):
        self.pool = PrivacyPool.objects.create(
            name="XLM Pool",
            asset_code="XLM",
            contract_address="CONTRACT123",
            min_deposit=Decimal("10.0"),
            max_amount=Decimal("1000000.0"),
        )

    def test_list_pools(self):
        """Test listing all pools."""
        response = self.client.get('/api/pools/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_pool_detail(self):
        """Test getting pool detail."""
        response = self.client.get(f'/api/pools/{self.pool.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'XLM Pool')

    def test_get_pool_stats(self):
        """Test getting pool statistics."""
        response = self.client.get(f'/api/pools/{self.pool.id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_deposits', response.data)


class DepositAPITest(APITestCase):
    """Tests for the Deposit API."""

    def setUp(self):
        self.pool = PrivacyPool.objects.create(
            name="XLM Pool",
            asset_code="XLM",
            contract_address="CONTRACT123",
            min_deposit=Decimal("10.0"),
            max_amount=Decimal("1000000.0"),
        )

    def test_create_deposit(self):
        """Test creating a deposit."""
        data = {
            'pool_id': self.pool.id,
            'amount': '100.0',
            'public_key': 'GABC123XYZ',
        }
        response = self.client.post('/api/deposit/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('commitment', response.data)
        self.assertIn('blinding_factor', response.data)

    def test_deposit_amount_too_small(self):
        """Test deposit with amount below minimum."""
        data = {
            'pool_id': self.pool.id,
            'amount': '5.0',
            'public_key': 'GABC123XYZ',
        }
        response = self.client.post('/api/deposit/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class WithdrawAPITest(APITestCase):
    """Tests for the Withdraw API."""

    def setUp(self):
        self.pool = PrivacyPool.objects.create(
            name="XLM Pool",
            asset_code="XLM",
            contract_address="CONTRACT123",
        )
        self.commitment = Commitment.objects.create(
            pool=self.pool,
            commitment="test_commitment",
            blinding_factor="test_blinding",
            amount=Decimal("100.0"),
            nullifier="test_nullifier",
            leaf_index=0,
            commitment_type=Commitment.CommitmentType.DEPOSIT,
            transaction_hash="tx123",
        )

    def test_create_withdrawal(self):
        """Test creating a withdrawal."""
        data = {
            'pool_id': self.pool.id,
            'amount': '50.0',
            'recipient_public_key': 'GRECIPIENT123',
            'commitment': 'test_commitment',
            'nullifier': 'test_nullifier',
            'proof': 'test_proof',
        }
        response = self.client.post('/api/withdraw/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_withdraw_invalid_commitment(self):
        """Test withdrawal with invalid commitment."""
        data = {
            'pool_id': self.pool.id,
            'amount': '50.0',
            'recipient_public_key': 'GRECIPIENT123',
            'commitment': 'invalid_commitment',
            'nullifier': 'invalid_nullifier',
            'proof': 'test_proof',
        }
        response = self.client.post('/api/withdraw/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)