from django.urls import path
from .views import VirtualTryOnView

urlpatterns = [
    path('try-on/', VirtualTryOnView.as_view(), name='virtual-try-on'),
]
