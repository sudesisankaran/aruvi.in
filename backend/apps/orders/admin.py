from django.contrib import admin
from .models import Order, OrderItem, OrderNote

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_title', 'selected_size', 'quantity', 'unit_price', 'total_price')

class OrderNoteInline(admin.TabularInline):
    model = OrderNote
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer_name', 'customer_phone', 'city', 'total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_id', 'customer_name', 'customer_phone', 'city')
    inlines = [OrderItemInline, OrderNoteInline]
