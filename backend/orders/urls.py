from django.urls import path

from .views import (
    CartView,
    CartItemView,
    OrderListCreateView,
    OrderDetailView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView
)


urlpatterns = [

    path(
        'cart/',
        CartView.as_view(),
        name='cart'
    ),

    path(
        'cart/items/',
        CartItemView.as_view(),
        name='cart-item-add'
    ),

    path(
        'cart/items/<int:item_id>/',
        CartItemView.as_view(),
        name='cart-item-detail'
    ),

    path(
        '',
        OrderListCreateView.as_view(),
        name='order-list-create'
    ),

    path(
        'payment/create/',
        CreateRazorpayOrderView.as_view(),
        name='create-razorpay-order'
    ),

    path(
        'payment/verify/',
        VerifyRazorpayPaymentView.as_view(),
        name='verify-razorpay-payment'
    ),

    path(
        '<int:pk>/',
        OrderDetailView.as_view(),
        name='order-detail'
    ),
]