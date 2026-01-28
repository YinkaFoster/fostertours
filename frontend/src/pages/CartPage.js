import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CartPage = () => {
  const { items, removeFromCart, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useLocale();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      await fetchCart();
      
      // Fetch product details for cart items
      try {
        const productPromises = items.map(item =>
          axios.get(`${API}/store/products/${item.product_id}`)
        );
        const responses = await Promise.all(productPromises);
        const products = responses.map((res, index) => ({
          ...res.data,
          quantity: items[index].quantity
        }));
        setCartProducts(products);
      } catch (error) {
        console.error('Failed to load cart products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [isAuthenticated, items.length]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Update locally for now
    setCartProducts(prev =>
      prev.map(p =>
        p.product_id === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const handleRemove = async (productId) => {
    const success = await removeFromCart(productId);
    if (success) {
      setCartProducts(prev => prev.filter(p => p.product_id !== productId));
      toast.success('Item removed from cart');
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'travel10') {
      setDiscount(10);
      toast.success('Promo code applied! 10% discount');
    } else if (promoCode.toLowerCase() === 'adventure20') {
      setDiscount(20);
      toast.success('Promo code applied! 20% discount');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const subtotal = cartProducts.reduce((sum, item) => {
    const price = item.sale_price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discount) / 100;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal - discountAmount + shipping;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background" data-testid="cart-page">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
            <Card className="border-0 shadow-soft">
              <CardContent className="py-16 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-serif text-2xl mb-4">Please Login</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to view your cart and checkout
                </p>
                <Link to="/login">
                  <Button className="btn-pill bg-primary">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="cart-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <h1 className="font-serif text-3xl md:text-4xl mb-8">Shopping Cart</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : cartProducts.length === 0 ? (
            <Card className="border-0 shadow-soft">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-serif text-2xl mb-4">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any items yet
                </p>
                <Link to="/store">
                  <Button className="btn-pill bg-primary">Continue Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartProducts.map((item, index) => (
                  <Card key={item.product_id} className="border-0 shadow-soft" data-testid={`cart-item-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link to={`/store/product/${item.product_id}`}>
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <Link to={`/store/product/${item.product_id}`}>
                                <h3 className="font-semibold hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemove(item.product_id)}
                              data-testid={`remove-item-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              {item.sale_price ? (
                                <div>
                                  <span className="text-lg font-bold text-primary">
                                    {formatPrice(item.sale_price * item.quantity)}
                                  </span>
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Link to="/store">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-soft sticky top-24" data-testid="order-summary">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Promo Code */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="pl-10"
                          data-testid="promo-input"
                        />
                      </div>
                      <Button variant="outline" onClick={applyPromoCode} data-testid="apply-promo">
                        Apply
                      </Button>
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-500">
                          <span>Discount ({discount}%)</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      {subtotal < 50 && (
                        <p className="text-xs text-muted-foreground">
                          Add ${(50 - subtotal).toFixed(2)} more for free shipping
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary" data-testid="cart-total">${total.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full h-12 btn-pill bg-primary"
                      onClick={() => navigate('/store/checkout')}
                      data-testid="checkout-btn"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by Stripe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
