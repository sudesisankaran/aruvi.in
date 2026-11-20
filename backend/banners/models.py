from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from core.firebase_service import delete_file_from_firebase

class PromotionalBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, default='')
    tag = models.CharField(max_length=64, blank=True, default='FESTIVE SALE')
    image_url = models.TextField(help_text="Firebase Storage Download URL")
    storage_path = models.CharField(max_length=512, blank=True, default='', help_text="banners/{id}.webp")
    link_url = models.CharField(max_length=255, blank=True, default='/shop')
    button_text = models.CharField(max_length=64, default='Explore Drop')
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"Banner: {self.title} (Active: {self.is_active})"


@receiver(post_delete, sender=PromotionalBanner)
def cleanup_banner_storage(sender, instance, **kwargs):
    """Clean up banner image from Firebase Cloud Storage upon deletion."""
    if instance.storage_path:
        delete_file_from_firebase(instance.storage_path)
