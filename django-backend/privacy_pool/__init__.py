"""Privacy Pool application configuration."""

from django.apps import AppConfig


class PrivacyPoolConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'privacy_pool'
    verbose_name = 'Privacy Pool'
    
    def ready(self):
        """Initialize app when Django starts."""
        pass