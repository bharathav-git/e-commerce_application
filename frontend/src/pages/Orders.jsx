import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading orders...</p>;
  if (orders.length === 0) return <p className="loading-text">You haven't placed any orders yet.</p>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <Link to={`/orders/${order.id}`} className="order-card" key={order.id}>
            <div>
              <p className="order-id">Order #{order.id}</p>
              <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`order-status status-${order.status}`}>{order.status}</span>
            <span className="order-total">₹{order.total_amount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
