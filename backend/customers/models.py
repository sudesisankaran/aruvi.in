from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from core.firebase_service import delete_file_from_firebase

User = get_user_model()

class CustomerProfile(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True, help_text="Firebase User UID")
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE, related_name='profile')
    email = models.EmailField(blank=True, default='')
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=32, blank=True, default='')
    
    # Profile avatar stored in Firebase Storage
    avatar_url = models.TextField(blank=True, default='')
    avatar_storage_path = models.CharField(max_length=512, blank=True, default='', help_text="Firebase path: profiles/{uid}/avatar.webp")
    
    # AI Try-on & Fitting Preferences
    preferred_fit = models.CharField(max_length=64, default='Regular Fit', choices=[
        ('Slim Fit', 'Slim Fit'),
        ('Regular Fit', 'Regular Fit'),
        ('Relaxed Fit', 'Relaxed Fit'),
        ('Bridal Tailored', 'Bridal Tailored'),
    ])
    bust_size = models.CharField(max_length=32, blank=True, default='')
    waist_size = models.CharField(max_length=32, blank=True, default='')
    hip_size = models.CharField(max_length=32, blank=True, default='')
    height_cm = models.PositiveIntegerField(null=True, blank=True, default=165)
    measurements = models.JSONField(default=dict, blank=True)
    
    shipping_address = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def user_id(self):
        return self.firebase_uid

    def __str__(self):
        return f"Profile of {self.full_name or self.email or self.firebase_uid}"


@receiver(post_delete, sender=CustomerProfile)
def cleanup_customer_avatar(sender, instance, **kwargs):
    """Clean up avatar from Firebase Cloud Storage when customer profile is deleted."""
    if instance.avatar_storage_path:
        delete_file_from_firebase(instance.avatar_storage_path)
