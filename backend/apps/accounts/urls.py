from django.urls import path
from .views import LoginView, LogoutView, VerifyAdminView, CurrentUserView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('verify-admin/', VerifyAdminView.as_view(), name='verify_admin'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
