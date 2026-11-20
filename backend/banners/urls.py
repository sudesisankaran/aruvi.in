from rest_framework.routers import DefaultRouter
from .views import PromotionalBannerViewSet

router = DefaultRouter()
router.register(r'banners', PromotionalBannerViewSet, basename='banner')

urlpatterns = router.urls
