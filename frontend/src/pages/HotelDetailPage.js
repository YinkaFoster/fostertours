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
  Hotel, Calendar, Users, MapPin, Star, Wifi, Car, Coffee,
  Utensils, Dumbbell, Waves, ArrowRight, ArrowLeft, CheckCircle,
  Info, Shield, CreditCard, Clock, Bed, Bath, Maximize
} from 'lucide-react';
import { toast } from 'sonner';

const HotelDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [guestInfo, setGuestInfo] = useState({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });

  const hotelData = {
    hotelId: searchParams.get('hotelId') || 'HT' + Date.now(),
    name: searchParams.get('name') || 'Burj Al Arab Jumeirah',
    image: searchParams.get('image') || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    location: searchParams.get('location') || 'Dubai, UAE',
    address: searchParams.get('address') || 'Jumeirah Beach Road, Dubai',
    rating: parseFloat(searchParams.get('rating') || '4.9'),
    reviewCount: parseInt(searchParams.get('reviews') || '2450'),
    stars: parseInt(searchParams.get('stars') || '5'),
    checkIn: searchParams.get('checkIn') || '2025-02-15',
    checkOut: searchParams.get('checkOut') || '2025-02-18',
    guests: parseInt(searchParams.get('guests') || '2'),
    description: searchParams.get('description') || 'Experience unparalleled luxury at the world\'s most iconic hotel. The Burj Al Arab offers exceptional service, stunning views, and world-class amenities.',
  };

  const rooms = [
    { name: 'Deluxe Suite', price: 850, size: '170 sqm', beds: '1 King', view: 'Sea View', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400' },
    { name: 'Panoramic Suite', price: 1200, size: '220 sqm', beds: '1 King', view: 'Panoramic Sea', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
    { name: 'Royal Suite', price: 2500, size: '780 sqm', beds: '2 King', view: '360° Views', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
  ];

  const amenities = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Car, label: 'Free Parking' },
    { icon: Coffee, label: 'Breakfast Included' },
    { icon: Utensils, label: 'Restaurant' },
    { icon: Dumbbell, label: 'Fitness Center' },
    { icon: Waves, label: 'Swimming Pool' },
  ];

  const nights = Math.ceil((new Date(hotelData.checkOut) - new Date(hotelData.checkIn)) / (1000 * 60 * 60 * 24));
  const roomPrice = rooms[selectedRoom].price;
  const totalPrice = roomPrice * nights;
  const taxes = totalPrice * 0.15;
  const grandTotal = totalPrice + taxes;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (!guestInfo.firstName || !guestInfo.lastName) {
      toast.error('Please enter guest name');
      return;
    }

    const checkoutParams = new URLSearchParams({
      type: 'hotel',
      itemId: hotelData.hotelId,
      price: grandTotal.toString(),
      title: hotelData.name,
      description: `${rooms[selectedRoom].name} - ${nights} Night${nights > 1 ? 's' : ''}`,
      image: hotelData.image,
      date: `${hotelData.checkIn} to ${hotelData.checkOut}`,
      location: hotelData.location,
      guests: hotelData.guests.toString(),
      roomType: rooms[selectedRoom].name,
      checkIn: hotelData.checkIn,
      checkOut: hotelData.checkOut,
      nights: nights.toString(),
      guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
    });

    navigate(`/booking/checkout?${checkoutParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Image */}
      <section className="relative pt-16">
        <div className="h-[400px] overflow-hidden">
          <img src={hotelData.image} alt={hotelData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto px-6">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {Array(hotelData.stars).fill(0).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-white mb-2">{hotelData.name}</h1>
                  <p className="text-white/80 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {hotelData.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-white">{hotelData.rating}</span>
                    <span className="text-white/80">({hotelData.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About This Hotel</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">{hotelData.description}</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {amenities.map((amenity, idx) => (
                      <div key={idx} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <amenity.icon className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Room Selection */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-teal-600" />
                    Select Your Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {rooms.map((room, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedRoom === idx ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 hover:border-teal-300'
                      }`}
                      onClick={() => setSelectedRoom(idx)}
                    >
                      <img src={room.image} alt={room.name} className="w-32 h-24 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{room.name}</h3>
                          <span className="text-xl font-bold text-teal-600">${room.price}<span className="text-sm font-normal text-slate-500">/night</span></span>
                        </div>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {room.size}</span>
                          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {room.beds}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {room.view}</span>
                        </div>
                      </div>
                      {selectedRoom === idx && <CheckCircle className="w-6 h-6 text-teal-600" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Guest Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input value={guestInfo.firstName} onChange={(e) => setGuestInfo({...guestInfo, firstName: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={guestInfo.lastName} onChange={(e) => setGuestInfo({...guestInfo, lastName: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={guestInfo.email} onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={guestInfo.phone} onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Special Requests</Label>
                    <Input value={guestInfo.specialRequests} onChange={(e) => setGuestInfo({...guestInfo, specialRequests: e.target.value})} placeholder="Any special requirements..." className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-teal-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-sm text-slate-500">Check-in / Check-out</p>
                        <p className="font-medium">{hotelData.checkIn} → {hotelData.checkOut}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-sm text-slate-500">Guests</p>
                        <p className="font-medium">{hotelData.guests} Guest{hotelData.guests > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">{rooms[selectedRoom].name}</span>
                      <span className="font-medium">${roomPrice}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">× {nights} nights</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxes & Fees</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-teal-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700" size="lg" onClick={handleBookNow}>
                    Book Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>Free cancellation until {hotelData.checkIn}</span>
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

export default HotelDetailPage;
