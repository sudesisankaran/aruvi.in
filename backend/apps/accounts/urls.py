from django.urls import path
from .views import AdminLoginView, AdminLogoutView, CurrentUserView

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', AdminLogoutView.as_view(), name='admin_logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
