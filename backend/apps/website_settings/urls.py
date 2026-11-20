from django.urls import path
from .views import WebsiteSettingsView

urlpatterns = [
    path('', WebsiteSettingsView.as_view(), name='website_settings'),
]
