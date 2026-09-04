import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './Orders.css';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}/`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading-text">Loading order...</p>;
  if (!order) return <p className="loading-text">Order not found.</p>;

  return (
    <div className="orders-page">
      <Link to="/orders" className="back-link">&larr; Back to orders</Link>
      <h1>Order #{order.id}</h1>
      <span className={`order-status status-${order.status}`}>{order.status}</span>

      <div className="order-detail-section">
        <h3>Shipping Info</h3>
        <p>{order.full_name}</p>
        <p>{order.address}, {order.city} - {order.postal_code}</p>
        <p>{order.phone_number}</p>
      </div>

      <div className="order-detail-section">
        <h3>Payment</h3>
        <p>
          {order.is_paid
            ? `Paid via ${order.payment_method}`
            : 'Payment pending — gateway integration coming soon.'}
        </p>
      </div>

      <div className="order-detail-section">
        <h3>Items</h3>
        {order.items.map((item) => (
          <div className="order-item-row" key={item.id}>
            <span>{item.product_name} x {item.quantity}</span>
            <span>₹{item.subtotal}</span>
          </div>
        ))}
        <div className="order-item-row order-total-row">
          <span>Total</span>
          <span>₹{order.total_amount}</span>
        </div>
      </div>
    </div>
  );
}
