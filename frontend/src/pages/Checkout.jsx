import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import './Auth.css';
import './Checkout.css';

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone_number: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      // --------------------------------
      // STEP 1: Create Django Order
      // --------------------------------

      const { data: order } = await api.post(
        '/orders/',
        form
      );

      console.log('Django Order:', order);

      // --------------------------------
      // STEP 2: Create Razorpay Order
      // --------------------------------

      const { data: razorpayOrder } = await api.post(
        '/orders/payment/create/',
        {
          order_id: order.id,
        }
      );

      console.log(
        'Razorpay Order:',
        razorpayOrder
      );

      // --------------------------------
      // STEP 3: Razorpay Checkout Options
      // --------------------------------

      const options = {
        key: razorpayOrder.key,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: 'E-Commerce Store',

        description: 'Order Payment',

        order_id: razorpayOrder.razorpay_order_id,

        prefill: {
          name: form.full_name,
          contact: form.phone_number,
        },

        notes: {
          django_order_id: order.id,
        },

        theme: {
          color: '#3399cc',
        },

        // --------------------------------
        // STEP 4: Payment Success
        // --------------------------------

        handler: async function (response) {
          console.log(
            'Razorpay Payment Response:',
            response
          );

          try {
            // --------------------------------
            // STEP 5: Verify Payment
            // --------------------------------

            const { data: verification } =
              await api.post(
                '/orders/payment/verify/',
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            console.log(
              'Payment Verification:',
              verification
            );

            toast.success(
              'Payment successful!'
            );

            // --------------------------------
            // STEP 6: Go to Order Details
            // --------------------------------

            navigate(
              `/orders/${verification.order_id}`
            );

          } catch (error) {
            console.error(
              'Payment verification error:',
              error
            );

            toast.error(
              error.response?.data?.detail ||
              'Payment verification failed.'
            );
          }
        },

        // --------------------------------
        // Payment Modal Dismissed
        // --------------------------------

        modal: {
          ondismiss: function () {
            toast.info(
              'Payment cancelled.'
            );

            setSubmitting(false);
          },
        },
      };

      // --------------------------------
      // STEP 7: Open Razorpay
      // --------------------------------

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        'payment.failed',
        function (response) {
          console.error(
            'Payment Failed:',
            response.error
          );

          toast.error(
            response.error?.description ||
            'Payment failed.'
          );

          setSubmitting(false);
        }
      );

      razorpay.open();

    } catch (err) {
      console.error(
        'Checkout error:',
        err
      );

      toast.error(
        err.response?.data?.detail ||
        'Could not place order.'
      );

      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <p className="loading-text">
        Your cart is empty. Add some products first.
      </p>
    );
  }

  return (
    <div className="auth-page">
      <form
        className="auth-form checkout-form"
        onSubmit={handleSubmit}
      >
        <h2>Shipping Details</h2>

        <label>Full Name</label>

        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <label>Address</label>

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <label>City</label>

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          required
        />

        <label>Postal Code</label>

        <input
          name="postal_code"
          value={form.postal_code}
          onChange={handleChange}
          required
        />

        <label>Phone Number</label>

        <input
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          required
        />

        <div className="checkout-summary">
          <span>Order Total:</span>

          <span>
            ₹{cart.total_price}
          </span>
        </div>

        <div className="payment-placeholder">
          Payment method:
          <strong> Razorpay</strong>
        </div>

        <button
          className="btn-primary btn-large"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Opening Payment...'
            : 'Pay with Razorpay'}
        </button>
      </form>
    </div>
  );
}