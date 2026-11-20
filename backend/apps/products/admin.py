from django.contrib import admin
from .models import Category, Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'sku', 'category', 'price', 'stock', 'status', 'is_featured', 'created_at')
    list_filter = ('category', 'status', 'is_featured')
    search_fields = ('title', 'sku', 'description', 'fabric')
    inlines = [ProductImageInline]
