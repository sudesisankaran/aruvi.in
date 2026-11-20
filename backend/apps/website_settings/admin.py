from django.contrib import admin
from .models import WebsiteSettings

@admin.register(WebsiteSettings)
class WebsiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'whatsapp_number', 'phone', 'email', 'updated_at')
