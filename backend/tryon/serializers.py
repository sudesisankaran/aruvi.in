from rest_framework import serializers
from .models import TryOnSession

class TryOnSessionSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='firebase_uid', required=False)

    class Meta:
        model = TryOnSession
        fields = [
            'id',
            'user_id',
            'firebase_uid',
            'product',
            'garment_id',
            'garment_title',
            'garment_image_url',
            'customer_photo_url',
            'customer_photo_path',
            'result_image_url',
            'result_storage_path',
            'status',
            'task_id',
            'fit_score',
            'fit_analysis',
            'error_message',
            'created_at',
            'updated_at',
            'expires_at',
        ]
        read_only_fields = [
            'id',
            'result_image_url',
            'result_storage_path',
            'status',
            'task_id',
            'fit_score',
            'fit_analysis',
            'error_message',
            'created_at',
            'updated_at',
            'expires_at',
        ]
