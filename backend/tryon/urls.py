from rest_framework.routers import DefaultRouter
from .views import TryOnSessionViewSet

router = DefaultRouter()
router.register(r'sessions', TryOnSessionViewSet, basename='tryon-session')

urlpatterns = router.urls
