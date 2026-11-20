from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import ProtectedError
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured', 'fabric']
    search_fields = ['title', 'sku', 'description', 'fabric', 'badge']
    ordering_fields = ['price', 'created_at', 'stock', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        base_qs = Product.objects.all().select_related('category').prefetch_related('images')

        # Admin user sees all products (including inactive/drafts)
        if user and user.is_authenticated and (user.email or '').strip().lower() == AUTHORIZED_ADMIN_EMAIL:
            return base_qs

        # All public customers and guests only see active products
        return base_qs.filter(status='active')

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
