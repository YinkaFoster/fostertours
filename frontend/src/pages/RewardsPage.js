import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  Gift, Star, Trophy, Crown, Zap, ArrowRight, Check,
  TrendingUp, History, Sparkles, Award, ChevronRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const RewardsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRewardsData();
    }
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRewardsData = async () => {
    try {
      const [profileRes, tiersRes] = await Promise.all([
        axios.get(`${API}/rewards/profile`, { headers: getAuthHeaders() }),
        axios.get(`${API}/rewards/tiers`)
      ]);
      setProfile(profileRes.data);
      setTiers(tiersRes.data.tiers);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tierName) => {
    switch (tierName) {
      case 'Bronze': return <Star className="w-6 h-6" />;
      case 'Silver': return <Trophy className="w-6 h-6" />;
      case 'Gold': return <Award className="w-6 h-6" />;
      case 'Platinum': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierName) => {
    switch (tierName) {
      case 'Bronze': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Silver': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Gold': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Platinum': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTierGradient = (tierName) => {
    switch (tierName) {
      case 'Bronze': return 'from-orange-500 to-orange-600';
      case 'Silver': return 'from-slate-400 to-slate-500';
      case 'Gold': return 'from-yellow-500 to-yellow-600';
      case 'Platinum': return 'from-purple-500 to-purple-600';
      default: return 'from-teal-500 to-teal-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Gift className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Foster Tours Rewards</h1>
            <p className="text-slate-600 mb-8">Sign in to access your rewards and start earning points!</p>
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

  const currentTier = profile?.tier || tiers[0];
  const progressToNextTier = profile?.next_tier 
    ? ((profile.points - currentTier.min_points) / (profile.next_tier.min_points - currentTier.min_points)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className={`relative pt-24 pb-16 bg-gradient-to-br ${getTierGradient(currentTier?.name)}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
              {getTierIcon(currentTier?.name)}
            </div>
            <Badge className="bg-white/20 text-white mb-4">{currentTier?.name} Member</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {profile?.points?.toLocaleString() || 0} Points
            </h1>
            <p className="text-lg opacity-90 mb-6">
              {currentTier?.multiplier}x points multiplier on all bookings
            </p>
            {profile?.next_tier && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span>{currentTier?.name}</span>
                  <span>{profile.next_tier.name}</span>
                </div>
                <Progress value={progressToNextTier} className="h-3 bg-white/30" />
                <p className="text-sm mt-2 opacity-80">
                  {profile.points_to_next_tier.toLocaleString()} points to {profile.next_tier.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/referral">
              <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Gift className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="font-medium">Refer Friends</p>
                  <p className="text-xs text-slate-500">Earn 500 points</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/flights">
              <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-medium">Book & Earn</p>
                  <p className="text-xs text-slate-500">1 point per $1</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="font-medium">Redeem</p>
                <p className="text-xs text-slate-500">100 pts = $1</p>
              </CardContent>
            </Card>
            <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="font-medium">History</p>
                <p className="text-xs text-slate-500">View all</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Benefits */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                Your {currentTier?.name} Benefits
              </h2>
              <Card className="border-0 shadow-lg mb-8">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentTier?.benefits?.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  {profile?.recent_transactions?.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recent_transactions.map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.transaction_type === 'earn' ? 'bg-green-100' : 'bg-orange-100'
                            }`}>
                              {tx.transaction_type === 'earn' 
                                ? <TrendingUp className="w-5 h-5 text-green-600" />
                                : <Gift className="w-5 h-5 text-orange-600" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            tx.points > 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {tx.points > 0 ? '+' : ''}{tx.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No activity yet. Start booking to earn points!</p>
                      <Link to="/flights">
                        <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tiers Sidebar */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                Reward Tiers
              </h2>
              <div className="space-y-4">
                {tiers.map((tier, idx) => (
                  <Card 
                    key={idx} 
                    className={`border-2 ${
                      tier.name === currentTier?.name 
                        ? getTierColor(tier.name) + ' ring-2 ring-offset-2 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTierIcon(tier.name)}
                          <span className="font-semibold">{tier.name}</span>
                        </div>
                        {tier.name === currentTier?.name && (
                          <Badge className="bg-teal-600">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {tier.min_points.toLocaleString()}+ points
                      </p>
                      <p className="text-sm font-medium text-teal-600">
                        {tier.multiplier}x points multiplier
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Earn */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            How to Earn Points
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '✈️', title: 'Book Flights', points: '1 pt per $1 spent' },
              { icon: '🏨', title: 'Book Hotels', points: '1 pt per $1 spent' },
              { icon: '🎫', title: 'Book Events', points: '1 pt per $1 spent' },
              { icon: '👥', title: 'Refer Friends', points: '500 pts per referral' },
            ].map((item, idx) => (
              <Card key={idx} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-teal-600 font-medium">{item.points}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RewardsPage;
