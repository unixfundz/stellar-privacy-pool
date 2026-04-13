"""URL configuration for API."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PrivacyPoolViewSet, TransactionViewSet, CommitmentViewSet,
    DepositView, WithdrawView
)

router = DefaultRouter()
router.register(r'pools', PrivacyPoolViewSet, basename='pool')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'commitments', CommitmentViewSet, basename='commitment')

urlpatterns = [
    path('', include(router.urls)),
    path('deposit/', DepositView.as_view(), name='deposit'),
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
]