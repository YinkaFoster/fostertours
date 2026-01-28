import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const pollPaymentStatus = async (attempts = 0) => {
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/dashboard');
        return;
      }

      const maxAttempts = 5;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        toast.warning('Payment verification timed out. Please check your email for confirmation.');
        navigate('/dashboard');
        return;
      }

      try {
        const response = await axios.get(`${API}/payments/stripe/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          toast.success('Payment successful! Your wallet has been credited.');
          setTimeout(() => navigate('/wallet'), 2000);
        } else if (response.data.status === 'expired') {
          toast.error('Payment session expired. Please try again.');
          navigate('/wallet');
        } else {
          // Continue polling
          setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      }
    };

    pollPaymentStatus();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" data-testid="payment-success-page">
      <Card className="max-w-md w-full border-0 shadow-soft">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <h1 className="font-serif text-2xl mb-4">Processing Payment</h1>
          <p className="text-muted-foreground mb-6">
            Please wait while we confirm your payment...
          </p>
          <p className="text-sm text-muted-foreground">
            Do not close this window.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" data-testid="payment-cancel-page">
      <Card className="max-w-md w-full border-0 shadow-soft">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl mb-4">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled. No charges were made.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/wallet')}>
              Back to Wallet
            </Button>
            <Button className="bg-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { PaymentSuccess, PaymentCancel };
