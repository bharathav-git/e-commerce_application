import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { cart, loading, updateCartItem, removeCartItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <p>Please login to view your cart.</p>
        <Link className="btn-primary btn-large" to="/login">Login</Link>
      </div>
    );
  }

  if (loading) return <p className="loading-text">Loading cart...</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your cart is empty.</p>
        <Link className="btn-primary btn-large" to="/">Browse Products</Link>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, quantity);
    } catch {
      toast.error('Could not update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
      toast.info('Item removed from cart.');
    } catch {
      toast.error('Could not remove item.');
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cart.items.map((item) => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-image">
              {item.product.image ? (
                <img src={item.product.image} alt={item.product.name} />
              ) : (
                <div className="product-image-placeholder">{item.product.name[0]}</div>
              )}
            </div>
            <div className="cart-item-info">
              <Link to={`/products/${item.product.slug}`} className="cart-item-name">
                {item.product.name}
              </Link>
              <p className="cart-item-price">₹{item.product.price} each</p>
            </div>
            <div className="cart-item-qty">
              <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-subtotal">₹{item.subtotal}</div>
            <button className="remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Total items:</span>
          <span>{cart.total_items}</span>
        </div>
        <div className="cart-summary-row cart-total">
          <span>Total:</span>
          <span>₹{cart.total_price}</span>
        </div>
        <button className="btn-primary btn-large" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
