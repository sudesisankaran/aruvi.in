from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import WebsiteSettings
from .serializers import WebsiteSettingsSerializer
from apps.accounts.permissions import IsStrictAdminUser

class WebsiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsStrictAdminUser()]

    def get(self, request):
        settings = WebsiteSettings.get_settings()
        serializer = WebsiteSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        settings = WebsiteSettings.get_settings()
        serializer = WebsiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
