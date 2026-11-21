from rest_framework.permissions import BasePermission

AUTHORIZED_ADMIN_EMAIL = 'aruvicollections.25@gmail.com'

class IsStrictAdminUser(BasePermission):
    """
    Strict server-side authorization:
    Only authenticated users whose email is strictly 'aruvicollections.25@gmail.com'
    and/or who possess staff/superuser credentials can access admin endpoints.
    """
    message = "Access denied. Only aruvicollections.25@gmail.com is authorized for administrator access."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        user_email = (request.user.email or request.user.username or '').strip().lower()
        return user_email == AUTHORIZED_ADMIN_EMAIL or bool(request.user.is_staff or request.user.is_superuser)

class IsStrictAdminOrReadOnly(BasePermission):
    """
    Public safe read methods (GET, HEAD, OPTIONS) allowed for all visitors.
    Write methods (POST, PUT, PATCH, DELETE) strictly restricted to aruvicollections.25@gmail.com.
    """
    message = "Access denied. Only aruvicollections.25@gmail.com can create, edit, or delete store products."

    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        if not (request.user and request.user.is_authenticated):
            return False
        user_email = (request.user.email or request.user.username or '').strip().lower()
        return user_email == AUTHORIZED_ADMIN_EMAIL or bool(request.user.is_staff or request.user.is_superuser)
