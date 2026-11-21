from django.apps import AppConfig
from django.db.models.signals import post_migrate

def seed_default_categories(sender, **kwargs):
    if sender.name != 'apps.products':
        return
    try:
        from .models import Category
        default_categories = [
            {"name": "Salwar", "slug": "salwar", "icon": "✨"},
            {"name": "Sharara", "slug": "sharara", "icon": "✨"},
            {"name": "Ethnic Wear", "slug": "ethnic-wear", "icon": "✨"},
            {"name": "Maxis", "slug": "maxis", "icon": "✨"},
            {"name": "Co-ordsets", "slug": "co-ordsets", "icon": "✨"},
            {"name": "Casual Tops", "slug": "casual-tops", "icon": "✨"},
            {"name": "Western Wear", "slug": "western-wear", "icon": "✨"},
            {"name": "Jeans & Pants", "slug": "jeans-pants", "icon": "✨"},
            {"name": "Kids Wear", "slug": "kids-wear", "icon": "✨"},
        ]
        for cat in default_categories:
            Category.objects.get_or_create(
                slug=cat['slug'],
                defaults={
                    'name': cat['name'],
                    'icon': cat['icon'],
                    'image': 'assets/images/kanjivaram_green.jpg',
                    'is_active': True
                }
            )
    except Exception:
        pass

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.products'
    label = 'products'

    def ready(self):
        post_migrate.connect(seed_default_categories, sender=self)
