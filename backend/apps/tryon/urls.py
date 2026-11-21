from django.urls import path, re_path
from .views import (
    GenerateTryOnView,
    TryOnStatusView,
    SaveTryOnView,
    DeleteTryOnView,
    TryOnHistoryView,
    AdminTryOnStatsView
)

urlpatterns = [
    path('generate/', GenerateTryOnView.as_view(), name='tryon-generate'),
    path('generate', GenerateTryOnView.as_view(), name='tryon-generate-noslash'),
    
    path('status/<str:prediction_id>/', TryOnStatusView.as_view(), name='tryon-status'),
    path('status/<str:prediction_id>', TryOnStatusView.as_view(), name='tryon-status-noslash'),
    
    path('save/', SaveTryOnView.as_view(), name='tryon-save'),
    path('save', SaveTryOnView.as_view(), name='tryon-save-noslash'),
    
    path('history/', TryOnHistoryView.as_view(), name='tryon-history'),
    path('history', TryOnHistoryView.as_view(), name='tryon-history-noslash'),
    
    path('admin-stats/', AdminTryOnStatsView.as_view(), name='tryon-admin-stats'),
    path('admin-stats', AdminTryOnStatsView.as_view(), name='tryon-admin-stats-noslash'),
    
    path('<str:pk>/', DeleteTryOnView.as_view(), name='tryon-delete-by-id'),
    path('<str:pk>', DeleteTryOnView.as_view(), name='tryon-delete-by-id-noslash'),
]
