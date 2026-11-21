from rest_framework import serializers
from .models import Category, Product, ProductImage

class AutoCreateCategorySlugField(serializers.SlugRelatedField):
    """
    Resilient Category Field:
    Resolves by slug, name, or creates on the fly with its correct cover image.
    Never fails product creation.
    """
    def to_internal_value(self, data):
        slug = str(data or 'salwar').strip().lower()
        if not slug or slug in ['null', 'undefined']:
            slug = 'salwar'

        # 1. Exact slug match
        cat = Category.objects.filter(slug__iexact=slug).first()
        if cat:
            return cat

        # 2. Case-insensitive Name match
        cat = Category.objects.filter(name__iexact=str(data).strip()).first()
        if cat:
            return cat

        # 3. Cleaned title match
        clean_name = slug.replace('-', ' ').replace('_', ' ').title()
        cat = Category.objects.filter(name__iexact=clean_name).first()
        if cat:
            return cat

        # 4. Auto-create category in database with dedicated cover
        cat_img = f"assets/images/category_{slug.replace('-', '_')}.jpg"
        if slug in ['western-wear', 'western']:
            cat_img = 'assets/images/category_western.jpg'
        elif slug in ['co-ordsets', 'coordsets']:
            cat_img = 'assets/images/category_coordsets.jpg'

        try:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': clean_name,
                    'icon': '✨',
                    'image': cat_img,
                    'is_active': True
                }
            )
            return cat
        except Exception:
            cat = Category.objects.first()
            if cat:
                return cat
            return Category.objects.create(
                slug='salwar',
                name='Salwar',
                icon='👗',
                image='assets/images/category_salwar.jpg',
                is_active=True
            )

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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        img = data.get('image')
        slug = (instance.slug or '').replace('-', '_')
        if not img or 'kanjivaram_green.jpg' in str(img):
            data['image'] = f"assets/images/category_{slug}.jpg"
        return data

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
            default_cat = Category.objects.filter(slug='salwar').first()
            if not default_cat:
                default_cat = Category.objects.create(
                    slug='salwar',
                    name='Salwar',
                    icon='👗',
                    image='assets/images/category_salwar.jpg',
                    is_active=True
                )
            validated_data['category'] = default_cat

        # Ensure product.image is set to the primary uploaded image URL or data URL
        primary_url = None
        for img in images_data:
            if img.get('is_primary') and img.get('image_url'):
                primary_url = img.get('image_url')
                break
        if not primary_url and images_data:
            primary_url = images_data[0].get('image_url')

        if primary_url and (not validated_data.get('image') or 'kanjivaram_green.jpg' in validated_data.get('image', '')):
            validated_data['image'] = primary_url

        product = Product.objects.create(**validated_data)
        for idx, img_data in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image_url=img_data.get('image_url', ''),
                storage_path=img_data.get('storage_path', ''),
                alt_text=img_data.get('alt_text', product.title),
                is_primary=bool(img_data.get('is_primary', idx == 0)),
                display_order=int(img_data.get('display_order', idx))
            )
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)

        if images_data is not None:
            primary_url = None
            for img in images_data:
                if img.get('is_primary') and img.get('image_url'):
                    primary_url = img.get('image_url')
                    break
            if not primary_url and len(images_data) > 0:
                primary_url = images_data[0].get('image_url')

            if primary_url:
                validated_data['image'] = primary_url

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for idx, img_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image_url=img_data.get('image_url', ''),
                    storage_path=img_data.get('storage_path', ''),
                    alt_text=img_data.get('alt_text', instance.title),
                    is_primary=bool(img_data.get('is_primary', idx == 0)),
                    display_order=int(img_data.get('display_order', idx))
                )

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure image always reflects the genuine uploaded image from gallery if available
        if not data.get('image') or 'kanjivaram_green.jpg' in str(data.get('image')):
            primary_img = instance.images.filter(is_primary=True).first() or instance.images.first()
            if primary_img and primary_img.image_url:
                data['image'] = primary_img.image_url
            elif primary_img and primary_img.storage_path and primary_img.storage_path.startswith('data:image/'):
                data['image'] = primary_img.storage_path
        return data
