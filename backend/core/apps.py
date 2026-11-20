from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Initialize Firebase Admin SDK when Django starts
        try:
            from core.firebase_service import get_firebase_storage_bucket
            get_firebase_storage_bucket()
        except Exception as e:
            print(f"[CoreConfig] Firebase initialization deferred: {e}")
