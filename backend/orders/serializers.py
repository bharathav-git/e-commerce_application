from rest_framework import serializers
from core.serializers import ProductSerializer
from core.models import Product
from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items']


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
    'id',
    'full_name',
    'address',
    'city',
    'postal_code',
    'phone_number',

    'status',

    'payment_method',
    'payment_reference',

    'razorpay_order_id',
    'razorpay_payment_id',

    'is_paid',
    'paid_at',

    'total_amount',
    'items',
    'created_at',
]
        read_only_fields = [
    'status',
    'payment_method',
    'payment_reference',

    'razorpay_order_id',
    'razorpay_payment_id',

    'is_paid',
    'paid_at',
    'total_amount',
]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Used when placing an order from the current cart."""

    class Meta:
        model = Order
        fields = ['full_name', 'address', 'city', 'postal_code', 'phone_number']
