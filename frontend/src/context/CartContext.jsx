import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/orders/cart/');
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/orders/cart/items/', { product_id: productId, quantity });
    setCart(data);
    return data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const { data } = await api.patch(`/orders/cart/items/${itemId}/`, { quantity });
    setCart(data);
    return data;
  };

  const removeCartItem = async (itemId) => {
    const { data } = await api.delete(`/orders/cart/items/${itemId}/`);
    setCart(data);
    return data;
  };

  const cartCount = cart?.total_items || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, addToCart, updateCartItem, removeCartItem, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
