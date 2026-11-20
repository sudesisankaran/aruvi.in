from rest_framework import serializers
from .models import WebsiteSettings

class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = [
            'business_name', 'tagline', 'whatsapp_number', 'phone', 'email',
            'address', 'free_shipping_threshold', 'shipping_fee', 'order_prefix',
            'gstin', 'updated_at'
        ]
