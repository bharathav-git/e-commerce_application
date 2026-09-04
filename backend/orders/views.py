from django.db import transaction
from django.conf import settings
from django.utils import timezone

import razorpay
import hmac
import hashlib

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    OrderCreateSerializer
)


class CartView(generics.RetrieveAPIView):
    """GET /api/orders/cart/ - returns the logged-in user's cart."""
    
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart


class CartItemView(APIView):
    """
    POST /api/orders/cart/items/
    PATCH /api/orders/cart/items/<id>/
    DELETE /api/orders/cart/items/<id>/
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )

        serializer = CartItemSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = serializer.validated_data['product']

        quantity = serializer.validated_data.get(
            'quantity',
            1
        )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={
                'quantity': quantity
            }
        )

        if not created:
            item.quantity += quantity
            item.save()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED
        )

    def patch(self, request, item_id):

        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )

        try:
            item = cart.items.get(
                id=item_id
            )
        except CartItem.DoesNotExist:

            return Response(
                {
                    'detail': 'Cart item not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        quantity = request.data.get(
            'quantity'
        )

        if quantity is None or int(quantity) < 1:

            return Response(
                {
                    'detail': 'quantity must be at least 1.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        item.quantity = int(quantity)

        item.save()

        return Response(
            CartSerializer(cart).data
        )

    def delete(self, request, item_id):

        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )

        cart.items.filter(
            id=item_id
        ).delete()

        return Response(
            CartSerializer(cart).data
        )


class OrderListCreateView(
    generics.ListCreateAPIView
):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_serializer_class(self):

        if self.request.method == 'GET':
            return OrderSerializer

        return OrderCreateSerializer

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        )

    def create(self, request, *args, **kwargs):

        cart = Cart.objects.filter(
            user=request.user
        ).first()

        if not cart or not cart.items.exists():

            return Response(
                {
                    'detail': 'Your cart is empty.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrderCreateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        with transaction.atomic():

            order = Order.objects.create(
                user=request.user,
                total_amount=cart.total_price,
                **serializer.validated_data
            )

            for cart_item in cart.items.select_related(
                'product'
            ):

                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    price=cart_item.product.price,
                    quantity=cart_item.quantity,
                )

            # IMPORTANT:
            # We are NOT deleting the cart here.
            #
            # Cart will be deleted only after
            # successful Razorpay payment verification.

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class CreateRazorpayOrderView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        order_id = request.data.get(
            'order_id'
        )

        if not order_id:

            return Response(
                {
                    'detail': 'order_id is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            order = Order.objects.get(
                id=order_id,
                user=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'detail': 'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if order.is_paid:

            return Response(
                {
                    'detail': 'Order is already paid.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        razorpay_order = client.order.create(
            {
                'amount': int(
                    order.total_amount * 100
                ),
                'currency': 'INR',
                'receipt': f'order_{order.id}',
            }
        )

        order.razorpay_order_id = (
            razorpay_order['id']
        )

        order.payment_method = 'razorpay'

        order.save()

        return Response(
            {
                'razorpay_order_id':
                    razorpay_order['id'],

                'amount':
                    razorpay_order['amount'],

                'currency':
                    razorpay_order['currency'],

                'key':
                    settings.RAZORPAY_KEY_ID,

                'order_id':
                    order.id,
            }
        )


class VerifyRazorpayPaymentView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        razorpay_order_id = request.data.get(
            'razorpay_order_id'
        )

        razorpay_payment_id = request.data.get(
            'razorpay_payment_id'
        )

        razorpay_signature = request.data.get(
            'razorpay_signature'
        )

        if not all([
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):

            return Response(
                {
                    'detail':
                    'Payment details are required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        generated_signature = hmac.new(

            settings.RAZORPAY_KEY_SECRET.encode(),

            (
                f'{razorpay_order_id}|'
                f'{razorpay_payment_id}'
            ).encode(),

            hashlib.sha256

        ).hexdigest()

        if not hmac.compare_digest(
            generated_signature,
            razorpay_signature
        ):

            return Response(
                {
                    'detail':
                    'Payment verification failed.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            order = Order.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    'detail':
                    'Order not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        order.razorpay_payment_id = (
            razorpay_payment_id
        )

        order.payment_reference = (
            razorpay_payment_id
        )

        order.payment_method = 'razorpay'

        order.is_paid = True

        order.status = 'paid'

        order.paid_at = timezone.now()

        order.save()

        # Clear cart only AFTER
        # successful payment verification.

        cart = Cart.objects.filter(
            user=request.user
        ).first()

        if cart:

            cart.items.all().delete()

        return Response(
            {
                'message':
                    'Payment verified successfully.',

                'order_id':
                    order.id
            }
        )


class OrderDetailView(
    generics.RetrieveAPIView
):

    serializer_class = OrderSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        )