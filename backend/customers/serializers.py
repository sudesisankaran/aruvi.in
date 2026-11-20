from rest_framework import serializers
from .models import CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='firebase_uid', required=False)

    class Meta:
        model = CustomerProfile
        fields = [
            'id',
            'user_id',
            'firebase_uid',
            'email',
            'full_name',
            'phone',
            'avatar_url',
            'avatar_storage_path',
            'preferred_fit',
            'bust_size',
            'waist_size',
            'hip_size',
            'height_cm',
            'measurements',
            'shipping_address',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
