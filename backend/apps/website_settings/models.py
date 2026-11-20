from django.db import models

class WebsiteSettings(models.Model):
    business_name = models.CharField(max_length=200, default='Aruvi Collections')
    tagline = models.CharField(max_length=255, default='Tradition In Every Thread, Elegance In Every Drape')
    whatsapp_number = models.CharField(max_length=30, default='918610638978')
    phone = models.CharField(max_length=30, default='+91 86106 38978')
    email = models.EmailField(default='concierge@aruvicollections.com')
    address = models.TextField(default='Aruvi Heritage Square, Cathedral Road, Chennai, Tamil Nadu 600086, India')
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=999)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=99)
    order_prefix = models.CharField(max_length=20, default='ORD')
    gstin = models.CharField(max_length=50, default='33AAAAA0000A1Z5')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Website Settings'

    def __str__(self):
        return f"{self.business_name} Settings"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
