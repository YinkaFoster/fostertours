import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Calendar, MapPin, Clock, Users, Ticket, Star, Music,
  ArrowRight, ArrowLeft, CheckCircle, Info, Shield, CreditCard,
  Plus, Minus, Share2, Heart
} from 'lucide-react';
import { toast } from 'sonner';

const EventDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedTier, setSelectedTier] = useState(0);
  const [attendeeInfo, setAttendeeInfo] = useState({ name: '', email: '', phone: '' });

  const eventData = {
    eventId: searchParams.get('eventId') || 'EV' + Date.now(),
    title: searchParams.get('title') || 'Dubai Desert Safari Experience',
    image: searchParams.get('image') || 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
    category: searchParams.get('category') || 'Adventure',
    date: searchParams.get('date') || '2025-02-20',
    time: searchParams.get('time') || '3:00 PM - 10:00 PM',
    location: searchParams.get('location') || 'Dubai Desert Conservation Reserve',
    address: searchParams.get('address') || 'Al Maha Road, Dubai, UAE',
    rating: parseFloat(searchParams.get('rating') || '4.8'),
    reviewCount: parseInt(searchParams.get('reviews') || '1256'),
    duration: searchParams.get('duration') || '7 hours',
    description: 'Experience the magic of the Arabian desert with our premium safari package. Enjoy dune bashing, camel rides, sandboarding, henna painting, BBQ dinner, and live entertainment under the stars.',
    highlights: ['4x4 Dune Bashing', 'Camel Riding', 'Sandboarding', 'BBQ Dinner', 'Belly Dance Show', 'Henna Painting'],
    included: ['Hotel pickup & drop-off', 'Professional guide', 'All activities', 'Dinner & refreshments', 'Traditional costumes for photos'],
  };

  const ticketTiers = [
    { name: 'Standard', price: 75, perks: ['All basic activities', 'BBQ dinner', 'Shared vehicle'] },
    { name: 'Premium', price: 120, perks: ['All activities', 'Premium BBQ', 'Semi-private vehicle', 'VIP seating'] },
    { name: 'VIP', price: 200, perks: ['Private vehicle', 'Gourmet dinner', 'Priority access', 'Photo package', 'Souvenir'] },
  ];

  const ticketPrice = ticketTiers[selectedTier].price;
  const totalPrice = ticketPrice * ticketCount;
  const serviceFee = totalPrice * 0.08;
  const grandTotal = totalPrice + serviceFee;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (!attendeeInfo.name || !attendeeInfo.email) {
      toast.error('Please enter attendee details');
      return;
    }

    const checkoutParams = new URLSearchParams({
      type: 'event',
      itemId: eventData.eventId,
      price: grandTotal.toString(),
      title: eventData.title,
      description: `${ticketTiers[selectedTier].name} Ticket × ${ticketCount}`,
      image: eventData.image,
      date: eventData.date,
      location: eventData.location,
      guests: ticketCount.toString(),
      ticketType: ticketTiers[selectedTier].name,
      eventTime: eventData.time,
      attendeeName: attendeeInfo.name,
    });

    navigate(`/booking/checkout?${checkoutParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-16">
        <div className="h-[450px] overflow-hidden">
          <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto px-6">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Badge className="bg-purple-600 mb-4">{eventData.category}</Badge>
              <h1 className="text-4xl font-serif font-bold text-white mb-4">{eventData.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {eventData.date}</span>
                <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> {eventData.time}</span>
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> {eventData.location}</span>
                <span className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> {eventData.rating} ({eventData.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About This Experience</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">{eventData.description}</p>
                  
                  <h3 className="font-semibold mb-3">Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {eventData.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">{h}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-semibold mb-3">What's Included</h3>
                  <div className="space-y-2">
                    {eventData.included.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Selection */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedTier === idx ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedTier(idx)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedTier === idx ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                          }`}>
                            {selectedTier === idx && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <h3 className="font-semibold text-lg">{tier.name}</h3>
                          {idx === 1 && <Badge className="bg-orange-500">Popular</Badge>}
                        </div>
                        <span className="text-xl font-bold text-purple-600">${tier.price}<span className="text-sm font-normal text-slate-500">/person</span></span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-8">
                        {tier.perks.map((perk, pidx) => (
                          <Badge key={pidx} variant="outline" className="text-xs">{perk}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Quantity */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mt-4">
                    <span className="font-medium">Number of Tickets</span>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-xl font-bold w-8 text-center">{ticketCount}</span>
                      <Button variant="outline" size="icon" onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendee Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Attendee Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Full Name *</Label>
                      <Input value={attendeeInfo.name} onChange={(e) => setAttendeeInfo({...attendeeInfo, name: e.target.value})} placeholder="Primary attendee name" className="mt-1" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={attendeeInfo.email} onChange={(e) => setAttendeeInfo({...attendeeInfo, email: e.target.value})} placeholder="For ticket confirmation" className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={attendeeInfo.phone} onChange={(e) => setAttendeeInfo({...attendeeInfo, phone: e.target.value})} placeholder="+234 xxx xxx xxxx" className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="font-medium">{eventData.title}</p>
                      <p className="text-sm text-slate-500">{eventData.date} • {eventData.time}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">{ticketTiers[selectedTier].name} × {ticketCount}</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-medium">${serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-purple-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700" size="lg" onClick={handleBookNow}>
                    Get Tickets <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>Instant confirmation</span>
                  </div>
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

export default EventDetailPage;
