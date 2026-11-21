from rest_framework import serializers
from .models import Category, Product, ProductImage

class AutoCreateCategorySlugField(serializers.SlugRelatedField):
    """
    Resilient Category Field:
    Resolves by slug or name; if missing, automatically creates the category
    so product publishing never fails due to unseeded categories.
    """
    def to_internal_value(self, data):
        if not data:
            category, _ = Category.objects.get_or_create(
                slug='salwar',
                defaults={'name': 'Salwar', 'icon': '✨', 'is_active': True}
            )
            return category
        slug = str(data).strip().lower()
        category = Category.objects.filter(slug=slug).first()
        if not category:
            category = Category.objects.filter(name__iexact=data).first()
        if not category:
            name = slug.replace('-', ' ').replace('_', ' ').title()
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'icon': '✨',
                    'image': 'assets/images/kanjivaram_green.jpg',
                    'is_active': True
                }
            )
        return category

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
    category = AutoCreateCategorySlugField(
        slug_field='slug',
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
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
        # If category wasn't provided, default to Salwar
        if 'category' not in validated_data or not validated_data.get('category'):
            default_cat, _ = Category.objects.get_or_create(
                slug='salwar',
                defaults={'name': 'Salwar', 'icon': '✨', 'is_active': True}
            )
            validated_data['category'] = default_cat
        product = Product.objects.create(**validated_data)
        for img_data in images_data:
            ProductImage.objects.create(product=product, **img_data)
        return product
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
