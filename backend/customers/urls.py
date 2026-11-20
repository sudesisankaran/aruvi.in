from rest_framework.routers import DefaultRouter
from .views import CustomerProfileViewSet

router = DefaultRouter()
router.register(r'profiles', CustomerProfileViewSet, basename='customer-profile')

urlpatterns = router.urls
