from rest_framework import serializers
from .models import Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id',
            'product',
            'image_url',
            'storage_path',
            'alt_text',
            'is_primary',
            'display_order',
            'width',
            'height',
            'size_bytes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image_url = serializers.ReadOnlyField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'category',
            'category_display',
            'price',
            'original_price',
            'description',
            'fabric',
            'occasion',
            'care_instructions',
            'badge',
            'in_stock',
            'stock_count',
            'rating',
            'review_count',
            'is_featured',
            'primary_image_url',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
