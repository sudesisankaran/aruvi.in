from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify
from core.firebase_service import delete_file_from_firebase

CATEGORY_CHOICES = [
    ('salwar', 'Salwar'),
    ('sharara', 'Sharara'),
    ('ethnic-wear', 'Ethnic Wear'),
    ('maxis', "Maxi's"),
    ('co-ordsets', 'Co-ordsets'),
    ('casual-tops', 'Casual Tops'),
    ('western-wear', 'Western Wear'),
    ('jeans-pants', 'Jeans & Pants'),
    ('kids-wear', 'Kids Wear'),
]

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    category = models.CharField(max_length=64, choices=CATEGORY_CHOICES, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    fabric = models.CharField(max_length=128, default='Pure Handloom Silk')
    occasion = models.CharField(max_length=128, default='Festive / Celebration')
    care_instructions = models.CharField(max_length=255, default='Dry Clean Only')
    badge = models.CharField(max_length=64, blank=True, default='')
    in_stock = models.BooleanField(default=True)
    stock_count = models.PositiveIntegerField(default=25)
    rating = models.FloatField(default=4.9)
    review_count = models.PositiveIntegerField(default=18)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            candidate = base_slug
            idx = 1
            while Product.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{idx}"
                idx += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    @property
    def primary_image_url(self):
        primary = self.images.filter(is_primary=True).first()
        if primary:
            return primary.image_url
        first = self.images.first()
        return first.image_url if first else ''


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image_url = models.TextField()
    storage_path = models.CharField(max_length=512, blank=True, default='')
    alt_text = models.CharField(max_length=255, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    size_bytes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name} (order: {self.display_order}, primary: {self.is_primary})"

    def save(self, *args, **kwargs):
        # If this image is designated as primary, demote any other primary image for the product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


@receiver(post_delete, sender=ProductImage)
def cleanup_product_image_storage(sender, instance, **kwargs):
    """Clean up orphaned file in Firebase Cloud Storage when ProductImage is deleted."""
    if instance.storage_path:
        delete_file_from_firebase(instance.storage_path)
