import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post(`${API}/cart/add`, 
        { product_id: productId, quantity },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      setItems(response.data.items || []);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setItems(prev => prev.filter(item => item.product_id !== productId));
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      itemCount,
      fetchCart,
      addToCart,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
