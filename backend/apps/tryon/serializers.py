from rest_framework import serializers
from .models import TryOnSession
from apps.products.models import Product

class TryOnGenerateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    model_image = serializers.CharField(required=True, allow_blank=False)
    category = serializers.ChoiceField(
        choices=['auto', 'tops', 'bottoms', 'one-pieces'],
        default='auto',
        required=False
    )
    mode = serializers.ChoiceField(
        choices=['balanced', 'performance', 'quality'],
        default='balanced',
        required=False
    )
    consent_given = serializers.BooleanField(required=True)
    cover_feet = serializers.BooleanField(default=False, required=False)
    adjust_hands = serializers.BooleanField(default=False, required=False)

    def validate_consent_given(self, value):
        if not value:
            raise serializers.ValidationError(
                "Customer consent is required before processing photographs with FASHN AI."
            )
        return value

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Product with ID {value} does not exist.")
        return value

class TryOnSessionSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_category = serializers.CharField(source='product.category.slug', read_only=True)

    class Meta:
        model = TryOnSession
        fields = [
            'id', 'prediction_id', 'status', 'category', 'mode',
            'model_image_url', 'garment_image_url', 'result_image_url',
            'permanent_result_url', 'error_message', 'is_saved', 'consent_given',
            'product_id', 'product_title', 'product_price', 'product_image',
            'product_category', 'created_at', 'updated_at'
        ]

class TryOnSaveSerializer(serializers.Serializer):
    prediction_id = serializers.CharField(required=True)

class AdminTryOnStatsSerializer(serializers.Serializer):
    provider = serializers.CharField()
    model = serializers.CharField()
    api_configured = serializers.BooleanField()
    total_requests = serializers.IntegerField()
    successful = serializers.IntegerField()
    failed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    recent_sessions = TryOnSessionSerializer(many=True)
