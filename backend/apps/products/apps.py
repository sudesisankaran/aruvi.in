from django.apps import AppConfig
from django.db.models.signals import post_migrate

def seed_default_categories(sender, **kwargs):
    if sender.name != 'apps.products':
        return
    try:
        from .views import ensure_all_default_categories
        ensure_all_default_categories()
    except Exception:
        pass

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.products'
    label = 'products'

    def ready(self):
        post_migrate.connect(seed_default_categories, sender=self)
        try:
            from .views import ensure_all_default_categories
            ensure_all_default_categories()
        except Exception:
            pass
