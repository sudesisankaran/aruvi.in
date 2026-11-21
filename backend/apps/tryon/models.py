from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class TryOnSession(models.Model):
    STATUS_CHOICES = [
        ('starting', 'Starting'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    CATEGORY_CHOICES = [
        ('auto', 'Auto-Detect'),
        ('tops', 'Tops & Blouses'),
        ('bottoms', 'Bottoms & Pants'),
        ('one-pieces', 'One-Pieces & Dresses'),
    ]

    MODE_CHOICES = [
        ('balanced', 'Balanced (Recommended)'),
        ('performance', 'Performance (Fast)'),
        ('quality', 'Quality (High Detail)'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tryon_sessions')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='tryon_sessions')
    prediction_id = models.CharField(max_length=120, unique=True, db_index=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='starting')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='auto')
    mode = models.CharField(max_length=30, choices=MODE_CHOICES, default='balanced')
    
    # Model photo (customer) & Garment photo (original product image)
    model_image_url = models.TextField(help_text="Customer photograph URL or data URI")
    garment_image_url = models.TextField(help_text="Genuine product image URL")
    
    # Generated Output from FASHN AI (tryon-v1.6)
    result_image_url = models.TextField(blank=True, default='', help_text="Generated try-on output URL")
    permanent_result_url = models.TextField(blank=True, default='', help_text="Permanent storage URL for saved looks")
    
    error_message = models.TextField(blank=True, default='')
    consent_given = models.BooleanField(default=True)
    is_saved = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Virtual Try-On Session'
        verbose_name_plural = 'Virtual Try-On Sessions'

    def __str__(self):
        prod_title = self.product.title if self.product else 'Garment'
        return f"TryOn {self.prediction_id} - {prod_title} ({self.status})"
