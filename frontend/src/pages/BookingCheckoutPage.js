import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  CreditCard, Wallet, Lock, ArrowLeft, Loader2, CheckCircle,
  User, Mail, Phone, MapPin, Shield, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BookingCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  
  // Guest information form
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  // Get booking data from navigation state first, then URL params
  const stateData = location.state || {};
  const bookingData = {
    type: stateData.type || searchParams.get('type') || 'booking',
    itemId: stateData.itemId || searchParams.get('itemId') || '',
    price: stateData.price || parseFloat(searchParams.get('price') || '0'),
    title: stateData.title || searchParams.get('title') || '',
    description: stateData.description || searchParams.get('description') || '',
    image: stateData.image || searchParams.get('image') || '',
    date: stateData.date || searchParams.get('date') || '',
    location: stateData.location || searchParams.get('location') || '',
    guests: stateData.guests || parseInt(searchParams.get('guests') || '1'),
    // Additional data from state
    flight: stateData.flight || null,
    hotel: stateData.hotel || null,
    event: stateData.event || null,
    vehicle: stateData.vehicle || null,
    visa: stateData.visa || null,
    passengers: stateData.passengers || null,
    payment: stateData.payment || null,
  };

  const totalAmount = bookingData.price;
  const walletDeduction = useWallet ? Math.min(user?.wallet_balance || 0, totalAmount) : 0;
  const finalAmount = totalAmount - walletDeduction;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    // Pre-fill user info
    if (user) {
      setGuestInfo(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    // Get payment config
    fetchPaymentConfig();
  }, [isAuthenticated, user, navigate]);

  const fetchPaymentConfig = async () => {
    try {
      const response = await axios.get(`${API}/payments/config`);
      setPaymentConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch payment config:', error);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!guestInfo.firstName || !guestInfo.lastName) {
      toast.error('Please enter guest name');
      return false;
    }
    if (!guestInfo.email) {
      toast.error('Please enter email address');
      return false;
    }
    if (!guestInfo.phone) {
      toast.error('Please enter phone number');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // First create the booking
      const bookingResponse = await axios.post(
        `${API}/bookings`,
        {
          booking_type: bookingData.type,
          item_id: bookingData.itemId || `item_${Date.now()}`,
          item_details: {
            title: bookingData.title,
            description: bookingData.description,
            date: bookingData.date,
            location: bookingData.location,
            guests: bookingData.guests,
            image: bookingData.image
          },
          total_amount: totalAmount,
          payment_method: paymentMethod,
          guest_info: guestInfo
        },
        { headers: getAuthHeaders() }
      );

      const bookingId = bookingResponse.data.booking_id;

      if (paymentMethod === 'paystack') {
        // Initialize Paystack payment
        const paymentResponse = await axios.post(
          `${API}/payments/paystack/initialize`,
          {
            email: guestInfo.email,
            amount: Math.round(finalAmount * 100), // Convert to kobo
            booking_id: bookingId,
            callback_url: `${window.location.origin}/booking/payment-callback`,
            metadata: {
              booking_type: bookingData.type,
              guest_name: `${guestInfo.firstName} ${guestInfo.lastName}`,
              phone: guestInfo.phone
            }
          },
          { headers: getAuthHeaders() }
        );

        if (paymentResponse.data.status) {
          const { authorization_url, reference, access_code } = paymentResponse.data.data;
          
          if (paymentResponse.data.is_mock) {
            // Mock mode - navigate to mock payment page
            navigate(`/booking/paystack-mock?reference=${reference}&amount=${finalAmount}&email=${guestInfo.email}&booking_id=${bookingId}`);
          } else {
            // Real Paystack - redirect to payment page
            window.location.href = authorization_url;
          }
        } else {
          throw new Error('Failed to initialize payment');
        }
      } else if (paymentMethod === 'wallet') {
        // Wallet payment
        if ((user?.wallet_balance || 0) < totalAmount) {
          toast.error('Insufficient wallet balance');
          setLoading(false);
          return;
        }

        // Process wallet payment
        await axios.post(
          `${API}/wallet/debit`,
          {
            amount: totalAmount,
            description: `Payment for ${bookingData.type} booking`,
            reference: bookingId
          },
          { headers: getAuthHeaders() }
        );

        // Update booking status
        toast.success('Payment successful!');
        navigate(`/booking/success?booking_id=${bookingId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBookingTypeIcon = () => {
    const icons = {
      flight: '✈️',
      hotel: '🏨',
      event: '🎫',
      vehicle: '🚗',
      visa: '📄'
    };
    return icons[bookingData.type] || '📋';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">
                Secure Checkout
              </h1>
              <p className="text-teal-100">Complete your booking payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={guestInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={guestInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={guestInfo.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          value={guestInfo.phone}
                          onChange={handleInputChange}
                          placeholder="+234 xxx xxx xxxx"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Input
                      id="specialRequests"
                      name="specialRequests"
                      value={guestInfo.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Any special requirements..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {/* Paystack */}
                    <div className="flex items-center space-x-3 p-4 border rounded-xl hover:border-teal-500 cursor-pointer transition-colors">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-teal-100 rounded flex items-center justify-center">
                              <span className="text-teal-700 font-bold text-xs">PAYSTACK</span>
                            </div>
                            <div>
                              <p className="font-medium">Pay with Paystack</p>
                              <p className="text-sm text-slate-500">Cards, Bank Transfer, USSD</p>
                            </div>
                          </div>
                          {paymentConfig?.is_mock_mode && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Test Mode
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>

                    {/* Wallet */}
                    <div className="flex items-center space-x-3 p-4 border rounded-xl hover:border-teal-500 cursor-pointer transition-colors mt-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-green-100 rounded flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Pay with Wallet</p>
                              <p className="text-sm text-slate-500">
                                Balance: ${(user?.wallet_balance || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {(user?.wallet_balance || 0) < totalAmount && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Insufficient
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Security Note */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Secure Payment</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your payment information is encrypted and secure. We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-slate-50 dark:bg-slate-800">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Booking Item */}
                  <div className="flex gap-4 mb-6">
                    {bookingData.image ? (
                      <img 
                        src={bookingData.image} 
                        alt={bookingData.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-teal-100 flex items-center justify-center text-3xl">
                        {getBookingTypeIcon()}
                      </div>
                    )}
                    <div className="flex-1">
                      <Badge className="bg-teal-100 text-teal-700 text-xs capitalize mb-1">
                        {bookingData.type}
                      </Badge>
                      <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
                        {bookingData.title || `${bookingData.type.charAt(0).toUpperCase() + bookingData.type.slice(1)} Booking`}
                      </h3>
                      {bookingData.date && (
                        <p className="text-sm text-slate-500 mt-1">{bookingData.date}</p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Base Price</span>
                      <span className="font-medium">${bookingData.price.toFixed(2)}</span>
                    </div>
                    {bookingData.guests > 1 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">× {bookingData.guests} Guests</span>
                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Taxes & Fees</span>
                      <span className="text-green-600">Included</span>
                    </div>
                    {walletDeduction > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Wallet Credit</span>
                        <span>-${walletDeduction.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-teal-600">
                      ${finalAmount.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    onClick={handlePayment}
                    disabled={loading || (paymentMethod === 'wallet' && (user?.wallet_balance || 0) < totalAmount)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay ${finalAmount.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-slate-500 mt-4">
                    By completing this payment, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookingCheckoutPage;
