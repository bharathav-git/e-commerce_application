import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}/`)
      .then(({ data }) => setProduct(data))
      .catch(() => toast.error('Product not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart.');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch {
      toast.error('Could not add item to cart.');
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!product) return <p className="loading-text">Product not found.</p>;

  return (
    <div className="product-detail">
      <Link to="/" className="back-link">&larr; Back to products</Link>
      <div className="product-detail-content">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-image-placeholder-large">{product.name[0]}</div>
          )}
        </div>
        <div className="product-detail-info">
          <p className="product-detail-category">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-price">₹{product.price}</p>
          <p className="product-detail-description">{product.description}</p>
          <p className={product.in_stock ? 'stock-in' : 'stock-out'}>
            {product.in_stock ? `In stock (${product.stock} available)` : 'Out of stock'}
          </p>

          {product.in_stock && (
            <div className="quantity-row">
              <label htmlFor="qty">Quantity</label>
              <input
                id="qty"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}

          <button
            className="btn-primary btn-large"
            disabled={!product.in_stock}
            onClick={handleAddToCart}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
