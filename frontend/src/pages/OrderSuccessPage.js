import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="order-success-page">
      <Card className="max-w-md w-full border-0 shadow-soft">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h1 className="font-serif text-3xl mb-4">Order Confirmed!</h1>
          
          <p className="text-muted-foreground mb-2">
            Thank you for your purchase
          </p>
          
          {orderId && (
            <p className="text-sm text-muted-foreground mb-6">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}

          <div className="p-4 rounded-lg bg-muted/50 mb-6">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Package className="w-5 h-5 text-primary" />
              <span>You'll receive a confirmation email shortly</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="w-full btn-pill bg-primary" data-testid="view-orders-btn">
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/store">
              <Button variant="outline" className="w-full" data-testid="continue-shopping-btn">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccessPage;
