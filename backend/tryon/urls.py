from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TryOnSessionViewSet
from .catvton_views import CatVTONGenerateView, CatVTONStatusView, CatVTONResultView

router = DefaultRouter()
router.register(r'sessions', TryOnSessionViewSet, basename='tryon-session')

urlpatterns = [
    # CatVTON Dedicated AI Inference Endpoints
    path('generate/', CatVTONGenerateView.as_view(), name='catvton-generate'),
    path('status/<str:job_id>/', CatVTONStatusView.as_view(), name='catvton-status'),
    path('result/<str:job_id>/', CatVTONResultView.as_view(), name='catvton-result'),
] + router.urls
