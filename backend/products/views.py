from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer
from core.permissions import IsAdminOrReadOnly
from core.firebase_service import upload_image_to_firebase, delete_file_from_firebase

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category.lower().replace(' ', '-'))
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)
        featured = self.request.query_params.get('featured')
        if featured in ('true', '1'):
            qs = qs.filter(is_featured=True)
        return qs

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """
        Upload multiple images for a product to Firebase Storage.
        Converts automatically to optimized WebP format.
        Updates PostgreSQL product image references.
        """
        product = self.get_object()
        files = request.FILES.getlist('images') or request.FILES.getlist('file')
        if not files:
            return Response({'error': 'No image files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        created_images = []
        is_first = not product.images.filter(is_primary=True).exists()

        for idx, file_obj in enumerate(files):
            try:
                # Upload to Firebase Storage in products/{product_id}/...
                folder = f"products/{product.id}"
                result = upload_image_to_firebase(
                    file_obj=file_obj,
                    destination_folder=folder,
                    convert_to_webp=True,
                    make_public=True
                )

                make_primary = is_first and (idx == 0)
                current_count = product.images.count()

                img_obj = ProductImage.objects.create(
                    product=product,
                    image_url=result['url'],
                    storage_path=result['storage_path'],
                    alt_text=request.data.get('alt_text', product.name),
                    is_primary=make_primary,
                    display_order=current_count + idx,
                    width=result.get('width', 0),
                    height=result.get('height', 0),
                    size_bytes=result.get('size_bytes', 0),
                )
                created_images.append(ProductImageSerializer(img_obj).data)
            except Exception as e:
                return Response(
                    {'error': f"Failed to upload image {file_obj.name}: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            'message': f"Successfully uploaded {len(created_images)} images to Firebase Storage.",
            'images': created_images
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        """Designate a specific gallery image as the primary cover image."""
        product = self.get_object()
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'error': 'image_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_image = product.images.get(pk=image_id)
            with transaction.atomic():
                product.images.update(is_primary=False)
                target_image.is_primary = True
                target_image.save(update_fields=['is_primary'])
            return Response({'message': 'Primary image updated successfully.'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found in this product gallery.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reorder_gallery(self, request, pk=None):
        """Update display ordering of gallery images: orders = [{ id: 1, order: 0 }, ...]"""
        product = self.get_object()
        orders = request.data.get('orders', [])
        if not isinstance(orders, list):
            return Response({'error': 'orders must be a list of {id, order}.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in orders:
                img_id = item.get('id')
                new_order = item.get('order', 0)
                if img_id is not None:
                    product.images.filter(pk=img_id).update(display_order=new_order)

        updated = ProductImageSerializer(product.images.all(), many=True).data
        return Response({'message': 'Gallery reordered successfully.', 'images': updated})


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    Direct CRUD for Product Images.
    Supports image replacement, deletion, and gallery updates.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def replace_image(self, request, pk=None):
        """
        Replace an existing image with a new uploaded file.
        Deletes the old file in Firebase Cloud Storage to prevent orphans.
        """
        instance = self.get_object()
        new_file = request.FILES.get('image') or request.FILES.get('file')
        if not new_file:
            return Response({'error': 'New image file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        old_storage_path = instance.storage_path
        try:
            # Upload new image to Firebase
            folder = f"products/{instance.product_id}"
            result = upload_image_to_firebase(new_file, destination_folder=folder, convert_to_webp=True)

            # Update database record
            instance.image_url = result['url']
            instance.storage_path = result['storage_path']
            instance.width = result.get('width', 0)
            instance.height = result.get('height', 0)
            instance.size_bytes = result.get('size_bytes', 0)
            instance.save()

            # Clean up old file
            if old_storage_path and old_storage_path != result['storage_path']:
                delete_file_from_firebase(old_storage_path)

            return Response({
                'message': 'Image replaced successfully in Firebase Storage.',
                'image': ProductImageSerializer(instance).data
            })
        except Exception as e:
            return Response({'error': f"Failed to replace image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
