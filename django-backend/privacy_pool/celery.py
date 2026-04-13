"""Celery configuration for Privacy Pool project."""

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'privacy_pool.settings')

app = Celery('privacy_pool')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')