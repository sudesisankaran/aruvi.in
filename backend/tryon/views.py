from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings

from .models import TryOnSession
from .serializers import TryOnSessionSerializer
from .tasks import process_virtual_tryon, purge_expired_tryon_photos
from core.firebase_service import upload_image_to_firebase, delete_file_from_firebase

MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_FORMATS = {'image/jpeg', 'image/png', 'image/webp', 'image/jpg'}

class TryOnSessionViewSet(viewsets.ModelViewSet):
    queryset = TryOnSession.objects.all()
    serializer_class = TryOnSessionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        # Security: restrict to own sessions if user_id or auth token is present
        user_id = self.request.query_params.get('user_id') or self.request.query_params.get('firebase_uid')
        if user_id:
            qs = qs.filter(firebase_uid=user_id)
        elif self.request.user and self.request.user.is_authenticated and not self.request.user.is_staff:
            qs = qs.filter(firebase_uid=self.request.user.username)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Customer AI Virtual Try-On Initiation:
        1. Validates uploaded customer photo (format & size <= 10MB).
        2. Uploads securely to Firebase Cloud Storage (tryons/uploads/{user_id}/...).
        3. Saves session & image metadata to database.
        4. Dispatches Celery task for AI drape rendering.
        5. Returns session details with live polling endpoint.
        """
        user_id = (
            request.data.get('user_id') or
            request.data.get('firebase_uid') or
            (request.user.username if request.user.is_authenticated else 'patron_guest')
        )
        garment_id = request.data.get('garment_id', 'look_bridal_emerald')
        garment_title = request.data.get('garment_title', 'Bridal Heritage Silk')
        garment_image_url = request.data.get('garment_image_url', '')
        product_id = request.data.get('product_id')

        photo_file = request.FILES.get('photo') or request.FILES.get('file')
        customer_photo_url = request.data.get('customer_photo_url')
        customer_photo_path = ''

        if photo_file:
            # Step 1: Validate file size
            if photo_file.size > MAX_PHOTO_SIZE_BYTES:
                return Response(
                    {'error': 'Customer photo exceeds the 10MB file size limit.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Step 2: Validate content type
            content_type = getattr(photo_file, 'content_type', '')
            if content_type and content_type.lower() not in ALLOWED_FORMATS:
                return Response(
                    {'error': f'Invalid image format ({content_type}). Please upload a JPEG, PNG, or WebP photo.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Step 3: Secure upload to Firebase Storage
            try:
                upload_res = upload_image_to_firebase(
                    file_obj=photo_file,
                    destination_folder=f"tryons/uploads/{user_id}",
                    convert_to_webp=True,
                    make_public=True
                )
                customer_photo_url = upload_res['url']
                customer_photo_path = upload_res['storage_path']
            except Exception as e:
                return Response(
                    {'error': f'Failed to upload customer photo to Firebase: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        if not customer_photo_url:
            return Response(
                {'error': 'Either a photo file upload or a valid customer_photo_url is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 4 & 5: Store reference and metadata in database
        session = TryOnSession.objects.create(
            firebase_uid=user_id,
            product_id=product_id if product_id else None,
            garment_id=garment_id,
            garment_title=garment_title,
            garment_image_url=garment_image_url,
            customer_photo_url=customer_photo_url,
            customer_photo_path=customer_photo_path,
            status='queued'
        )

        # Step 6: Dispatch AI Virtual Try-On Task to Celery
        try:
            if getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False):
                # Run inline for instant response
                task_res = process_virtual_tryon(str(session.id))
                session.refresh_from_db()
            else:
                task = process_virtual_tryon.delay(str(session.id))
                session.task_id = task.id
                session.save(update_fields=['task_id'])
        except Exception as e:
            # Fallback inline processing if Celery broker is temporarily unreachable
            print(f"[TryOnView] Celery async dispatch fallback to inline: {e}")
            process_virtual_tryon(str(session.id))
            session.refresh_from_db()

        return Response(TryOnSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Poll the AI Virtual Try-On status and preview result."""
        session = self.get_object()
        return Response({
            'id': str(session.id),
            'status': session.status,
            'result_image_url': session.result_image_url,
            'customer_photo_url': session.customer_photo_url,
            'fit_score': session.fit_score,
            'fit_analysis': session.fit_analysis,
            'error_message': session.error_message,
            'is_completed': session.status == 'completed'
        })

    @action(detail=False, methods=['post'])
    def purge_retention(self, request):
        """Administrative trigger to enforce photo retention and delete expired photos."""
        res = purge_expired_tryon_photos()
        return Response({
            'message': 'Photo retention cleanup completed.',
            'purged_count': res.get('purged_count', 0)
        })
