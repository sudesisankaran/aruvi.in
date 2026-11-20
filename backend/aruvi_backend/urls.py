"""
Root URL Configuration for Aruvi Backend API.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_root_view(request):
    return JsonResponse({
        'brand': 'Aruvi Collections',
        'tagline': 'Tradition In Every Thread, Elegance In Every Drape',
        'status': 'operational',
        'version': '2.0.0',
        'database': 'PostgreSQL' if 'postgresql' in settings.DATABASES['default']['ENGINE'] else 'SQLite (Dev Fallback)',
        'firebase_storage': {
            'bucket': settings.FIREBASE_STORAGE_BUCKET,
            'project_id': settings.FIREBASE_PROJECT_ID,
            'paths': {
                'products': 'products/{productId}/',
                'profiles': 'profiles/{userId}/',
                'tryon_uploads': 'tryons/uploads/{userId}/',
                'tryon_results': 'tryons/results/{userId}/',
                'banners': 'banners/'
            }
        },
        'celery': {
            'broker': settings.CELERY_BROKER_URL,
            'eager_execution': settings.CELERY_TASK_ALWAYS_EAGER
        },
        'endpoints': {
            'products': '/api/products/',
            'product_images': '/api/product-images/',
            'tryon_sessions': '/api/tryon/sessions/',
            'customer_profiles': '/api/customers/profiles/',
            'promotional_banners': '/api/banners/banners/',
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/', include('virtual_tryon.urls')),
    path('api/tryon/', include('tryon.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/banners/', include('banners.urls')),
]

# Serve media files in local development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
