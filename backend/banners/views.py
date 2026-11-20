from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import PromotionalBanner
from .serializers import PromotionalBannerSerializer
from core.permissions import IsAdminOrReadOnly
from core.firebase_service import upload_image_to_firebase, delete_file_from_firebase

class PromotionalBannerViewSet(viewsets.ModelViewSet):
    queryset = PromotionalBanner.objects.all()
    serializer_class = PromotionalBannerSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_banner(self, request):
        """
        Uploads a promotional banner image directly to Firebase Storage.
        Converts to optimized WebP.
        Creates PostgreSQL PromotionalBanner record.
        """
        file_obj = request.FILES.get('image') or request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Banner image file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title', 'Festive Collection Drop')
        subtitle = request.data.get('subtitle', '')
        tag = request.data.get('tag', 'EXCLUSIVE DROP')
        link_url = request.data.get('link_url', '/shop')
        button_text = request.data.get('button_text', 'Shop Look')

        try:
            result = upload_image_to_firebase(
                file_obj=file_obj,
                destination_folder='banners',
                convert_to_webp=True,
                make_public=True
            )

            banner = PromotionalBanner.objects.create(
                title=title,
                subtitle=subtitle,
                tag=tag,
                image_url=result['url'],
                storage_path=result['storage_path'],
                link_url=link_url,
                button_text=button_text,
                is_active=True,
            )

            return Response(PromotionalBannerSerializer(banner).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to upload banner: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
