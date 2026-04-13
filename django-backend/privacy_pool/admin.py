"""Django admin configuration for Privacy Pool models."""

from django.contrib import admin
from .models import (
    PrivacyPool, Commitment, MerkleNode, Transaction, PoolStatistic
)


@admin.register(PrivacyPool)
class PrivacyPoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_code', 'status', 'total_deposits', 'total_notes', 'created_at']
    list_filter = ['status', 'asset_code']
    search_fields = ['name', 'contract_address']
    readonly_fields = ['contract_address', 'created_at', 'updated_at']


@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    list_display = ['commitment', 'pool', 'amount', 'leaf_index', 'spent', 'commitment_type', 'created_at']
    list_filter = ['spent', 'commitment_type', 'pool']
    search_fields = ['commitment', 'nullifier']
    readonly_fields = ['created_at', 'spent_at']


@admin.register(MerkleNode)
class MerkleNodeAdmin(admin.ModelAdmin):
    list_display = ['pool', 'index', 'level', 'hash', 'created_at']
    list_filter = ['pool', 'level']
    search_fields = ['hash']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'pool', 'transaction_type', 'amount', 'status', 'public_key', 'created_at']
    list_filter = ['status', 'transaction_type', 'pool']
    search_fields = ['public_key', 'stellar_transaction_hash']
    readonly_fields = ['created_at', 'confirmed_at']


@admin.register(PoolStatistic)
class PoolStatisticAdmin(admin.ModelAdmin):
    list_display = ['pool', 'date', 'deposits_count', 'deposits_volume', 'withdrawals_count', 'withdrawals_volume', 'active_notes']
    list_filter = ['pool', 'date']
    date_hierarchy = 'date'