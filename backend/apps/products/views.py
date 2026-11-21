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

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStrictAdminOrReadOnly]
    lookup_field = 'slug'

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
        
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
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

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        uploaded_file = request.FILES.get('file') or request.FILES.get('image')
        if not uploaded_file:
            return Response({"error": "No image file provided in 'file' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
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
