import uuid
import datetime
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.conf import settings
from products.models import Product
from core.firebase_service import delete_file_from_firebase

User = get_user_model()

STATUS_CHOICES = [
    ('queued', 'Queued'),
    ('processing', 'Processing AI Drape'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
]

def default_expiry():
    days = getattr(settings, 'PHOTO_RETENTION_DAYS', 7)
    return timezone.now() + datetime.timedelta(days=days)

class TryOnSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firebase_uid = models.CharField(max_length=128, db_index=True, help_text="Firebase User UID or Anonymous Patron Session")
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='tryon_sessions')
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL, related_name='tryon_sessions')
    garment_id = models.CharField(max_length=64, blank=True, default='')
    garment_title = models.CharField(max_length=255, default='Boutique Ensemble')
    garment_image_url = models.TextField(blank=True, default='')
    
    # Customer uploaded photograph
    customer_photo_url = models.TextField(help_text="Firebase Storage Download URL")
    customer_photo_path = models.CharField(max_length=512, blank=True, default='', help_text="Storage path: tryons/uploads/{uid}/{id}.webp")
    
    # AI Virtual Try-On Rendered Output
    result_image_url = models.TextField(blank=True, default='', help_text="Firebase Storage Result Download URL")
    result_storage_path = models.CharField(max_length=512, blank=True, default='', help_text="Storage path: tryons/results/{uid}/{id}.webp")
    
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='queued', db_index=True)
    task_id = models.CharField(max_length=128, blank=True, default='')
    fit_score = models.FloatField(default=98.5)
    fit_analysis = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(default=default_expiry, db_index=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def user_id(self):
        return self.firebase_uid

    def __str__(self):
        return f"TryOn {self.id} ({self.status}) for {self.firebase_uid}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


@receiver(post_delete, sender=TryOnSession)
def cleanup_tryon_storage_files(sender, instance, **kwargs):
    """Clean up customer uploaded photo and AI rendered result from Firebase when session is deleted."""
    if instance.customer_photo_path:
        delete_file_from_firebase(instance.customer_photo_path)
    if instance.result_storage_path:
        delete_file_from_firebase(instance.result_storage_path)
