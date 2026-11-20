import random
from datetime import datetime
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, OrderNote
from .serializers import OrderSerializer, CreateOrderInputSerializer
from apps.products.models import Product

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items', 'internal_notes')
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['order_id', 'customer_name', 'customer_phone', 'city']
    ordering_fields = ['created_at', 'total', 'status']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return [AllowAny()]  # Can be tightened to [IsAdminUser()] in full auth mode

    def create(self, request, *args, **kwargs):
        input_serializer = CreateOrderInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = input_serializer.validated_data
        raw_items = data.get('items', [])

        if not raw_items:
            return Response({"error": "Order must contain at least one item."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            subtotal = 0
            order_items_to_create = []

            # 1. Validate stock and calculate prices
            for it in raw_items:
                product_id = it.get('id')
                qty = int(it.get('quantity', 1))
                size = it.get('selectedSize', 'M')

                prod = Product.objects.select_for_update().filter(id=product_id).first()
                if not prod:
                    return Response({"error": f"Product with ID {product_id} not found."}, status=status.HTTP_404_NOT_FOUND)

                if prod.stock < qty:
                    return Response({
                        "error": f"Insufficient stock for '{prod.title}'. Only {prod.stock} piece(s) available."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Deduct stock
                prod.stock -= qty
                prod.save(update_fields=['stock', 'updated_at'])

                unit_price = prod.price
                line_total = unit_price * qty
                subtotal += line_total

                order_items_to_create.append({
                    'product': prod,
                    'product_title': prod.title,
                    'selected_size': size,
                    'quantity': qty,
                    'unit_price': unit_price,
                    'total_price': line_total
                })

            # 2. Shipping & Total calculation
            shipping_fee = 0 if subtotal >= 999 else 99
            discount = 0
            total = subtotal - discount + shipping_fee

            # 3. Unique Order ID
            year = datetime.now().year
            rand_code = random.randint(1000, 9999)
            order_id = f"ORD-{year}-{rand_code}"

            order = Order.objects.create(
                order_id=order_id,
                customer_name=data['name'].strip(),
                customer_phone=data['phone'].strip(),
                customer_email=data.get('email', '').strip(),
                shipping_address=data['address'].strip(),
                city=data['city'].strip(),
                state=data.get('state', 'Tamil Nadu').strip(),
                pincode=data['pincode'].strip(),
                payment_method=data.get('payment_method', 'upi'),
                subtotal=subtotal,
                discount=discount,
                shipping_fee=shipping_fee,
                total=total,
                status='Pending'
            )

            for item_dict in order_items_to_create:
                OrderItem.objects.create(order=order, **item_dict)

            OrderNote.objects.create(
                order=order,
                text=f"Order placed via {data.get('payment_method', 'upi').upper()}. Awaiting WhatsApp confirmation.",
                author='System'
            )

        output_serializer = OrderSerializer(order)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return Response({"message": f"Order #{order.order_id} status updated to {new_status}."})

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        order = self.get_object()
        text = request.data.get('text', '').strip()
        author = request.data.get('author', 'Admin')
        if not text:
            return Response({"error": "Note text cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        note = OrderNote.objects.create(order=order, text=text, author=author)
        return Response({
            "id": note.id,
            "text": note.text,
            "author": note.author,
            "created_at": note.created_at
        }, status=status.HTTP_201_CREATED)
