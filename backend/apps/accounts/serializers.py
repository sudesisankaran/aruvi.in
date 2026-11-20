from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AdminProfile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'role']

    def get_role(self, obj):
        if hasattr(obj, 'admin_profile'):
            return obj.admin_profile.role
        return 'super_admin' if obj.is_superuser else 'staff'

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
