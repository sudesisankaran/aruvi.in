from rest_framework import serializers
from .models import Order, OrderItem, OrderNote
from apps.products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'selected_size', 'quantity', 'unit_price', 'total_price']

class OrderNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderNote
        fields = ['id', 'text', 'author', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    internal_notes = OrderNoteSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer_name', 'customer_phone', 'customer_email',
            'shipping_address', 'city', 'state', 'pincode', 'payment_method',
            'subtotal', 'discount', 'shipping_fee', 'total', 'status',
            'items', 'internal_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CreateOrderInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=25)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100, default='Tamil Nadu')
    pincode = serializers.CharField(max_length=20)
    payment_method = serializers.CharField(default='upi')
    items = serializers.ListField(child=serializers.DictField())
