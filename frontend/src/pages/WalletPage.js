import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Wallet, Plus, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const WalletPage = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(`${API}/wallet`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setWalletData(response.data);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 5) {
      toast.error('Minimum top-up amount is $5');
      return;
    }

    setProcessing(true);
    try {
      if (paymentMethod === 'stripe') {
        const response = await axios.post(
          `${API}/payments/stripe/checkout`,
          {
            amount: amount,
            booking_type: 'wallet',
            origin_url: window.location.origin
          },
          { headers: getAuthHeaders(), withCredentials: true }
        );

        if (response.data.url) {
          window.location.href = response.data.url;
        }
      } else {
        toast.info(`${paymentMethod} integration coming soon!`);
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-background" data-testid="wallet-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <h1 className="font-serif text-3xl md:text-4xl mb-8">My Wallet</h1>

          {/* Balance Card */}
          <Card className="border-0 shadow-soft mb-8 bg-gradient-to-br from-primary to-primary/80 text-white" data-testid="balance-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Available Balance</p>
                  <p className="text-5xl font-bold">${user?.wallet_balance?.toFixed(2) || walletData.balance.toFixed(2)}</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-10 h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Up Section */}
          <Card className="border-0 shadow-soft mb-8" data-testid="topup-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Top Up Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Amounts */}
              <div>
                <Label className="mb-3 block">Quick Select</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={topUpAmount === String(amount) ? 'default' : 'outline'}
                      onClick={() => setTopUpAmount(String(amount))}
                      className="h-12"
                      data-testid={`quick-amount-${amount}`}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="amount">Or enter custom amount</Label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="pl-8 h-12"
                    min="5"
                    data-testid="custom-amount-input"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-3 block">Payment Method</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'stripe', name: 'Card (Stripe)', icon: CreditCard },
                    { id: 'paypal', name: 'PayPal', icon: CreditCard },
                    { id: 'paystack', name: 'Paystack', icon: CreditCard },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      data-testid={`payment-method-${method.id}`}
                    >
                      <method.icon className="w-6 h-6" />
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full h-12 btn-pill bg-primary"
                onClick={handleTopUp}
                disabled={processing || !topUpAmount}
                data-testid="topup-btn"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Top Up ${topUpAmount || '0'}
              </Button>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-0 shadow-soft" data-testid="transactions-section">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : walletData.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletData.transactions.map((tx, index) => (
                    <div
                      key={tx.transaction_id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                      data-testid={`transaction-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.transaction_type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {tx.transaction_type === 'credit' ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.transaction_type === 'credit' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {tx.transaction_type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletPage;
