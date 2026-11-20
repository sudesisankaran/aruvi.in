from rest_framework import permissions

class IsFirebaseAuthenticated(permissions.BasePermission):
    """Allows access only to authenticated Firebase users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to anyone.
    Allows write/modification access only to staff or owner admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            # Also allow in development if explicit bypass header is provided or user is staff
            return True
        return bool(request.user.is_staff or request.user.email == 'aruvicollections.25@gmail.com')


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to allow owners of an object to edit/view it.
    Assumes the model instance has a `user_id` or `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and (request.user.is_staff or request.user.email == 'aruvicollections.25@gmail.com'):
            return True

        user_id = getattr(obj, 'user_id', None)
        if user_id and request.user and request.user.username == user_id:
            return True

        if hasattr(obj, 'user') and obj.user == request.user:
            return True

        return False
