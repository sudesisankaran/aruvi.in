"""
Firebase Token Authentication for Django REST Framework.
"""

from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions
from core.firebase_service import verify_firebase_id_token

User = get_user_model()

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticates requests using Firebase ID tokens passed in the Authorization header.
    Format:
        Authorization: Bearer <firebase_id_token>
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        decoded = verify_firebase_id_token(token)
        if not decoded:
            # If token cannot be verified remotely (e.g. local test mode), we don't block
            # unless endpoint explicitly requires authentication
            return None

        uid = decoded.get('uid')
        email = decoded.get('email', f"{uid}@customer.aruvi.in")
        name = decoded.get('name', 'Patron')

        # Get or create local user record for this Firebase UID
        user, created = User.objects.get_or_create(
            username=uid,
            defaults={
                'email': email,
                'first_name': name[:30],
                'is_active': True,
            }
        )

        # Admin privilege check: aruvicollections.25@gmail.com is owner admin
        if email.lower() == 'aruvicollections.25@gmail.com':
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
                user.save(update_fields=['is_staff', 'is_superuser'])

        return (user, decoded)
