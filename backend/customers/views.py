from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import CustomerProfile
from .serializers import CustomerProfileSerializer
from core.firebase_service import upload_image_to_firebase, delete_file_from_firebase

class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user_id') or self.request.query_params.get('firebase_uid')
        if user_id:
            qs = qs.filter(firebase_uid=user_id)
        elif self.request.user and self.request.user.is_authenticated and not self.request.user.is_staff:
            qs = qs.filter(firebase_uid=self.request.user.username)
        return qs

    @action(detail=False, methods=['get', 'post'])
    def me(self, request):
        """Retrieve or update profile for currently authenticated patron or user_id."""
        user_id = (
            request.data.get('user_id') or
            request.data.get('firebase_uid') or
            request.query_params.get('user_id') or
            request.query_params.get('firebase_uid') or
            (request.user.username if request.user.is_authenticated else None)
        )
        if not user_id:
            return Response({'error': 'Authentication or user_id parameter required.'}, status=status.HTTP_400_BAD_REQUEST)

        profile, created = CustomerProfile.objects.get_or_create(
            firebase_uid=user_id,
            defaults={
                'email': request.user.email if request.user.is_authenticated else request.data.get('email', ''),
                'full_name': request.user.get_full_name() if request.user.is_authenticated else request.data.get('full_name', ''),
            }
        )

        if request.method == 'POST':
            serializer = CustomerProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(CustomerProfileSerializer(profile).data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request, pk=None):
        """
        Upload customer profile image securely to Firebase Storage.
        Converts to optimized WebP.
        Deletes old avatar to prevent orphaned storage files.
        """
        profile = self.get_object()
        file_obj = request.FILES.get('avatar') or request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No image file provided for avatar.'}, status=status.HTTP_400_BAD_REQUEST)

        old_storage_path = profile.avatar_storage_path

        try:
            folder = f"profiles/{profile.firebase_uid}"
            result = upload_image_to_firebase(
                file_obj=file_obj,
                destination_folder=folder,
                filename="avatar",
                convert_to_webp=True,
                make_public=True
            )

            profile.avatar_url = result['url']
            profile.avatar_storage_path = result['storage_path']
            profile.save(update_fields=['avatar_url', 'avatar_storage_path'])

            # Remove old avatar if path changed
            if old_storage_path and old_storage_path != result['storage_path']:
                delete_file_from_firebase(old_storage_path)

            return Response({
                'message': 'Avatar uploaded successfully to Firebase Storage.',
                'avatar_url': profile.avatar_url,
                'avatar_storage_path': profile.avatar_storage_path
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to upload avatar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
