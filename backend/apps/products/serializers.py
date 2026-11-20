from rest_framework import serializers
from .models import Category, Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'storage_path', 'alt_text', 'is_primary', 'display_order']

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon', 'is_active', 'products_count', 'created_at']

    def get_products_count(self, obj):
        return obj.products.count()

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all(),
        required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'sku', 'category', 'category_id', 'category_slug', 'category_name',
            'price', 'original_price', 'stock', 'fabric', 'badge', 'description',
            'status', 'is_featured', 'image', 'rating', 'reviews_count', 'images',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        # If category wasn't provided, default to first category
        if 'category' not in validated_data:
            validated_data['category'] = Category.objects.first()
        product = Product.objects.create(**validated_data)
        for img_data in images_data:
            ProductImage.objects.create(product=product, **img_data)
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for img_data in images_data:
                ProductImage.objects.create(product=instance, **img_data)

        return instance
