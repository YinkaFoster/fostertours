import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  CreditCard, Lock, CheckCircle, Loader2, AlertCircle,
  Shield, ArrowLeft, X
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const PaystackMockPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('card'); // card, otp, processing, success
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [otp, setOtp] = useState('');

  const reference = searchParams.get('reference');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const email = searchParams.get('email');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/dashboard');
    }
  }, [isAuthenticated, reference, navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardInput = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      setCardDetails(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'expiryDate') {
      setCardDetails(prev => ({ ...prev, [name]: formatExpiry(value) }));
    } else if (name === 'cvv') {
      setCardDetails(prev => ({ ...prev, [name]: value.slice(0, 3) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitCard = (e) => {
    e.preventDefault();
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast.error('Please fill in all card details');
      return;
    }
    setStep('otp');
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete the mock payment
      const response = await axios.post(
        `${API}/payments/paystack/mock-complete?reference=${reference}`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data.status) {
        setStep('success');
        toast.success('Payment successful!');
        
        // Redirect to success page after delay
        setTimeout(() => {
          navigate(`/booking/success?booking_id=${bookingId}&reference=${reference}`);
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setStep('card');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-teal-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Paystack</CardTitle>
                <p className="text-teal-100 text-sm">Test Mode</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleCancel}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Amount Display */}
          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm">Amount to Pay</p>
            <p className="text-3xl font-bold text-slate-900">${amount.toFixed(2)}</p>
            <p className="text-slate-500 text-sm">{email}</p>
          </div>

          <Badge className="w-full justify-center bg-orange-100 text-orange-700 mb-6">
            <AlertCircle className="w-4 h-4 mr-2" />
            This is a test payment - No real charges will be made
          </Badge>

          <Separator className="mb-6" />

          {/* Card Details Step */}
          {step === 'card' && (
            <form onSubmit={handleSubmitCard} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInput}
                    placeholder="4084 0840 8408 4081"
                    className="pl-10"
                    maxLength={19}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Test card: 4084 0840 8408 4081</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInput}
                    placeholder="MM/YY"
                    className="mt-1"
                    maxLength={5}
                  />
                  <p className="text-xs text-slate-500 mt-1">Any future date</p>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={handleCardInput}
                    placeholder="•••"
                    className="mt-1"
                    maxLength={3}
                  />
                  <p className="text-xs text-slate-500 mt-1">Any 3 digits</p>
                </div>
              </div>

              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleCardInput}
                  placeholder="JOHN DOE"
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Continue
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleSubmitOtp} className="space-y-4">
              <div className="text-center mb-4">
                <Lock className="w-12 h-12 text-teal-600 mx-auto mb-2" />
                <p className="text-slate-700 font-medium">Enter OTP</p>
                <p className="text-slate-500 text-sm">
                  A one-time password has been sent to your phone
                </p>
              </div>

              <div>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-slate-500 mt-2 text-center">Test OTP: Any 4+ digits</p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Pay'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('card')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Card Details
              </Button>
            </form>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-teal-600 mx-auto animate-spin mb-4" />
              <p className="text-slate-700 font-medium">Processing Payment...</p>
              <p className="text-slate-500 text-sm">Please wait, do not close this page</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-slate-900 font-bold text-xl mb-2">Payment Successful!</p>
              <p className="text-slate-500">Reference: {reference}</p>
              <p className="text-slate-500 text-sm mt-4">Redirecting to confirmation page...</p>
            </div>
          )}

          {/* Security Footer */}
          <div className="mt-6 pt-4 border-t flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Secured by Paystack</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaystackMockPage;
