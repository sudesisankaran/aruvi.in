import os
import time
import re
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import ProtectedError
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer
from apps.accounts.permissions import IsStrictAdminUser, IsStrictAdminOrReadOnly, AUTHORIZED_ADMIN_EMAIL

def ensure_all_default_categories():
    """
    Auto-seeds and auto-heals all 9 boutique categories with their matching AI covers.
    Runs on category/product listings and creations to guarantee zero missing categories.
    """
    default_categories = [
        {"name": "Salwar", "slug": "salwar", "icon": "👗"},
        {"name": "Sharara", "slug": "sharara", "icon": "✨"},
        {"name": "Ethnic Wear", "slug": "ethnic-wear", "icon": "🪡"},
        {"name": "Maxis", "slug": "maxis", "icon": "💃"},
        {"name": "Co-ordsets", "slug": "co-ordsets", "icon": "👚"},
        {"name": "Casual Tops", "slug": "casual-tops", "icon": "👕"},
        {"name": "Western Wear", "slug": "western-wear", "icon": "🧥"},
        {"name": "Jeans & Pants", "slug": "jeans-pants", "icon": "👖"},
        {"name": "Kids Wear", "slug": "kids-wear", "icon": "👶"},
    ]
    for cat in default_categories:
        img_name = f"assets/images/category_{cat['slug'].replace('-', '_')}.jpg"
        c = Category.objects.filter(slug__iexact=cat['slug']).first()
        if not c:
            c = Category.objects.filter(name__iexact=cat['name']).first()
        if not c:
            try:
                Category.objects.create(
                    slug=cat['slug'],
                    name=cat['name'],
                    icon=cat['icon'],
                    image=img_name,
                    is_active=True
                )
            except Exception:
                pass
        else:
            changed = False
            if not c.image or 'kanjivaram_green.jpg' in c.image:
                c.image = img_name
                changed = True
            if c.slug != cat['slug']:
                c.slug = cat['slug']
                changed = True
            if changed:
                try:
                    c.save()
                except Exception:
                    pass

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStrictAdminOrReadOnly]
    lookup_field = 'slug'

    def list(self, request, *args, **kwargs):
        ensure_all_default_categories()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            product_count = instance.products.count()
            return Response(
                {"error": f"Cannot delete category '{instance.name}' because {product_count} product(s) are assigned to it. Reassign or delete those products first."},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsStrictAdminOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured', 'fabric']
    search_fields = ['title', 'sku', 'description', 'fabric', 'badge']
    ordering_fields = ['price', 'created_at', 'stock', 'rating']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        ensure_all_default_categories()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        ensure_all_default_categories()
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "This product cannot be deleted because it is referenced in an active order."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['delete', 'post'], permission_classes=[IsStrictAdminUser])
    def clear_all(self, request):
        count = Product.objects.count()
        Product.objects.all().delete()
        return Response({"message": f"All {count} products deleted successfully.", "deleted_count": count})

    def get_queryset(self):
        user = self.request.user
        base_qs = Product.objects.all().select_related('category').prefetch_related('images')

        # Admin user sees all products (including inactive/drafts)
        if user and user.is_authenticated and ((user.email or user.username or '').strip().lower() == AUTHORIZED_ADMIN_EMAIL or user.is_staff or user.is_superuser):
            return base_qs

        # All public customers and guests only see active products
        return base_qs.filter(status='active')

    @action(detail=False, methods=['post'], permission_classes=[IsStrictAdminUser], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        uploaded_file = request.FILES.get('file') or request.FILES.get('image')
        if not uploaded_file:
            return Response({"error": "No image file provided in 'file' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in allowed_extensions:
            return Response(
                {"error": f"Unsupported file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.splitext(uploaded_file.name)[0])
        filename = f"{int(time.time())}_{clean_name}{ext}"
        
        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_products_dir, exist_ok=True)
        
        file_path = os.path.join(media_products_dir, filename)
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
                
        media_url = f"{settings.MEDIA_URL}products/{filename}"
        full_url = request.build_absolute_uri(media_url)
        if request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https' or 'onrender.com' in full_url:
            full_url = full_url.replace('http://', 'https://')
        
        return Response({
            "message": "Image uploaded successfully.",
            "url": full_url,
            "relative_url": media_url,
            "filename": filename
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsStrictAdminUser])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        new_stock = request.data.get('stock')
        if new_stock is None:
            return Response({"error": "Stock field is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product.stock = max(0, int(new_stock))
            product.save(update_fields=['stock', 'updated_at'])
            return Response({"message": "Stock updated successfully.", "stock": product.stock})
        except ValueError:
            return Response({"error": "Invalid stock value."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsStrictAdminUser])
    def toggle_status(self, request, pk=None):
        product = self.get_object()
        product.status = 'inactive' if product.status == 'active' else 'active'
        product.save(update_fields=['status', 'updated_at'])
        return Response({"message": f"Product status set to {product.status}.", "status": product.status})

class AdminProductViewSet(viewsets.ModelViewSet):
    """
    Dedicated Admin Products ViewSet:
    Routes strictly to /api/admin/products/
    Requires IsStrictAdminUser (aruvicollections.25@gmail.com) for ALL actions.
    """
    queryset = Product.objects.all().select_related('category').prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [IsStrictAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured', 'fabric', 'status']
    search_fields = ['title', 'sku', 'description', 'fabric', 'badge']
    ordering_fields = ['price', 'created_at', 'stock', 'rating']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        ensure_all_default_categories()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        ensure_all_default_categories()
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "This product cannot be deleted because it is referenced in an active order."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['delete', 'post'], permission_classes=[IsStrictAdminUser])
    def clear_all(self, request):
        count = Product.objects.count()
        Product.objects.all().delete()
        return Response({"message": f"All {count} products deleted successfully.", "deleted_count": count})

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        uploaded_file = request.FILES.get('file') or request.FILES.get('image')
        if not uploaded_file:
            return Response({"error": "No image file provided in 'file' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in allowed_extensions:
            return Response(
                {"error": f"Unsupported file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.splitext(uploaded_file.name)[0])
        filename = f"{int(time.time())}_{clean_name}{ext}"
        
        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_products_dir, exist_ok=True)
        
        file_path = os.path.join(media_products_dir, filename)
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
                
        media_url = f"{settings.MEDIA_URL}products/{filename}"
        full_url = request.build_absolute_uri(media_url)
        if request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https' or 'onrender.com' in full_url:
            full_url = full_url.replace('http://', 'https://')
        
        return Response({
            "message": "Image uploaded successfully.",
            "url": full_url,
            "relative_url": media_url,
            "filename": filename
        }, status=status.HTTP_201_CREATED)
