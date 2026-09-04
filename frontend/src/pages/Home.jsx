import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/categories/').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;

    api
      .get('/products/', { params })
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Could not load products.'))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart.');
      return;
    }
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Could not add item to cart.');
    }
  };

  return (
    <div className="home">
      <div className="home-header">
        <h1>Discover Products</h1>
        <input
          className="search-input"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="category-filters">
        <button
          className={activeCategory === '' ? 'active' : ''}
          onClick={() => setActiveCategory('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={activeCategory === cat.slug ? 'active' : ''}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="loading-text">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/products/${product.slug}`} className="product-image-wrap">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">{product.name[0]}</div>
                )}
              </Link>
              <div className="product-info">
                <Link to={`/products/${product.slug}`} className="product-name">
                  {product.name}
                </Link>
                <p className="product-category">{product.category?.name}</p>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button
                    className="btn-primary"
                    disabled={!product.in_stock}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
