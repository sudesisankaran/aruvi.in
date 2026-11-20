from rest_framework import serializers
from .models import PromotionalBanner

class PromotionalBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalBanner
        fields = [
            'id',
            'title',
            'subtitle',
            'tag',
            'image_url',
            'storage_path',
            'link_url',
            'button_text',
            'is_active',
            'display_order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
