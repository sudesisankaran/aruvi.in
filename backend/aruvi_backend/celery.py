import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module for 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aruvi_backend.settings')

app = Celery('aruvi_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Periodic automated tasks (Photo retention policy cleanup)
app.conf.beat_schedule = {
    'daily-photo-retention-cleanup': {
        'task': 'tryon.tasks.purge_expired_tryon_photos',
        'schedule': crontab(hour=2, minute=0),  # Run every night at 2:00 AM
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
