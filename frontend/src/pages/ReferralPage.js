import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Gift, Users, Copy, Share2, CheckCircle, ArrowRight,
  Twitter, Facebook, MessageCircle, Mail, Loader2, Award
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ReferralPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReferralData();
    }
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchReferralData = async () => {
    try {
      const [codeRes, historyRes] = await Promise.all([
        axios.get(`${API}/referral/code`, { headers: getAuthHeaders() }),
        axios.get(`${API}/referral/history`, { headers: getAuthHeaders() })
      ]);
      setReferralData(codeRes.data);
      setHistory(historyRes.data.referrals || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareOnSocial = (platform) => {
    const message = `Join me on Foster Tours and get amazing travel deals! Use my code ${referralData?.referral_code} to sign up. ${referralData?.referral_link}`;
    const encodedMessage = encodeURIComponent(message);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      email: `mailto:?subject=Join Foster Tours&body=${encodedMessage}`
    };
    
    window.open(urls[platform], '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Gift className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Refer & Earn</h1>
            <p className="text-slate-600 mb-8">Sign in to get your referral code and start earning rewards!</p>
            <Link to="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
              <Gift className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Refer Friends & Earn
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-8">
              Share the joy of travel! Earn {referralData?.reward_per_referral || 500} reward points 
              for every friend who signs up and makes their first booking.
            </p>
          </div>
        </div>
      </section>

      {/* Referral Code Section */}
      <section className="py-12 -mt-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                  Your Referral Code
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Share this code with friends and family
                </p>
              </div>

              {/* Referral Code Display */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl md:text-4xl font-bold text-teal-600 tracking-widest">
                    {referralData?.referral_code}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => copyToClipboard(referralData?.referral_code)}
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="mb-8">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Or share your referral link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={referralData?.referral_link || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralData?.referral_link)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => shareOnSocial('whatsapp')}
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => shareOnSocial('twitter')}
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => shareOnSocial('facebook')}
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => shareOnSocial('email')}
                >
                  <Mail className="w-5 h-5 text-slate-600" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {referralData?.stats?.total_referrals || 0}
                </p>
                <p className="text-sm text-slate-500">Total Referrals</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {referralData?.stats?.completed_referrals || 0}
                </p>
                <p className="text-sm text-slate-500">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {referralData?.stats?.pending_referrals || 0}
                </p>
                <p className="text-sm text-slate-500">Pending</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {referralData?.stats?.total_points_earned?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-slate-500">Points Earned</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Share Your Code', description: 'Send your unique referral code to friends and family' },
              { step: '2', title: 'Friend Signs Up', description: 'They create an account using your referral code' },
              { step: '3', title: 'Both Earn Rewards', description: `You both get ${referralData?.reward_per_referral || 500} points after their first booking` },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral History */}
      {history.length > 0 && (
        <section className="py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
              Referral History
            </h2>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {history.map((referral, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          referral.status === 'rewarded' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <Users className={`w-5 h-5 ${
                            referral.status === 'rewarded' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {referral.referred_name || 'Invited Friend'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={referral.status === 'rewarded' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                        }>
                          {referral.status === 'rewarded' ? 'Completed' : 'Pending'}
                        </Badge>
                        {referral.status === 'rewarded' && (
                          <p className="text-sm text-green-600 mt-1">+{referral.reward_points} pts</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready to Earn More?
          </h2>
          <p className="text-orange-100 mb-6">
            Check your rewards balance and redeem points for discounts on your next booking!
          </p>
          <Link to="/rewards">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              View Rewards
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReferralPage;
