import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import {
  CreditCard, Wallet, Lock, ChevronLeft, Loader2, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [useWallet, setUseWallet] = useState(false);

  // Shipping form
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProducts = async () => {
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

        // Pre-fill user info
        if (user) {
          setShippingInfo(prev => ({
            ...prev,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [isAuthenticated, items, user, navigate]);

  const subtotal = cartProducts.reduce((sum, item) => {
    const price = item.sale_price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 9.99;
  const walletDeduction = useWallet ? Math.min(user?.wallet_balance || 0, subtotal + shipping) : 0;
  const total = subtotal + shipping - walletDeduction;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingInfo[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      // Create order first
      const orderResponse = await axios.post(
        `${API}/store/orders`,
        {
          items: cartProducts.map(p => ({
            product_id: p.product_id,
            name: p.name,
            price: p.sale_price || p.price,
            quantity: p.quantity
          })),
          subtotal,
          shipping,
          total,
          shipping_address: shippingInfo,
          payment_method: paymentMethod,
          wallet_used: walletDeduction
        },
        { headers: getAuthHeaders(), withCredentials: true }
      );

      if (paymentMethod === 'stripe' && total > 0) {
        // Redirect to Stripe checkout
        const paymentResponse = await axios.post(
          `${API}/payments/stripe/checkout`,
          {
            amount: total,
            booking_type: 'store_order',
            booking_id: orderResponse.data.order_id,
            origin_url: window.location.origin
          },
          { headers: getAuthHeaders(), withCredentials: true }
        );

        if (paymentResponse.data.url) {
          window.location.href = paymentResponse.data.url;
        }
      } else if (total === 0 || paymentMethod === 'wallet') {
        // Full wallet payment - order is complete
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/store/order-success', { state: { orderId: orderResponse.data.order_id } });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    navigate('/store/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="checkout-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/store/cart')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Cart
          </Button>

          <h1 className="font-serif text-3xl md:text-4xl mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleInputChange}
                        data-testid="first-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleInputChange}
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        data-testid="email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        data-testid="phone-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      data-testid="address-input"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        data-testid="city-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        data-testid="state-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        data-testid="zip-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Option */}
                  {user?.wallet_balance > 0 && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="useWallet"
                            checked={useWallet}
                            onCheckedChange={setUseWallet}
                            data-testid="use-wallet-checkbox"
                          />
                          <label htmlFor="useWallet" className="cursor-pointer">
                            <p className="font-medium">Use Wallet Balance</p>
                            <p className="text-sm text-muted-foreground">
                              Available: ${user.wallet_balance.toFixed(2)}
                            </p>
                          </label>
                        </div>
                        <Wallet className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  {total > 0 && (
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setPaymentMethod('stripe')}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="stripe" id="stripe" />
                            <label htmlFor="stripe" className="flex-1 cursor-pointer">
                              <p className="font-medium">Credit/Debit Card (Stripe)</p>
                              <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                            </label>
                            <CreditCard className="w-6 h-6" />
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setPaymentMethod('paypal')}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <label htmlFor="paypal" className="flex-1 cursor-pointer">
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-muted-foreground">Pay securely with PayPal</p>
                            </label>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            paymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setPaymentMethod('paystack')}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="paystack" id="paystack" />
                            <label htmlFor="paystack" className="flex-1 cursor-pointer">
                              <p className="font-medium">Paystack</p>
                              <p className="text-sm text-muted-foreground">Cards, Bank, Mobile Money</p>
                            </label>
                            <CreditCard className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-soft sticky top-24" data-testid="order-summary">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartProducts.map((item, index) => (
                      <div key={item.product_id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-primary">
                            ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {walletDeduction > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Wallet Credit</span>
                        <span>-${walletDeduction.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="checkout-total">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full h-12 btn-pill bg-primary"
                    onClick={handleCheckout}
                    disabled={processing}
                    data-testid="place-order-btn"
                  >
                    {processing ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    {total === 0 ? 'Place Order' : `Pay $${total.toFixed(2)}`}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Secure SSL encrypted checkout
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
