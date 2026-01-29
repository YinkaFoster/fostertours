import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  Car, Calendar, MapPin, Clock, Users, Fuel, Settings,
  ArrowRight, ArrowLeft, CheckCircle, Shield, CreditCard,
  Gauge, Snowflake, Radio, Navigation, Info
} from 'lucide-react';
import { toast } from 'sonner';

const VehicleDetailPage = () => {
  const location = useLocation();
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [driverInfo, setDriverInfo] = useState({ name: '', email: '', phone: '', license: '' });
  const [addOns, setAddOns] = useState({ insurance: false, gps: false, childSeat: false });

  // Get vehicle data from navigation state or use defaults
  const stateData = location.state || {};
  const vehicle = stateData.vehicle || {};

  const vehicleData = {
    vehicleId: vehicle.vehicle_id || vehicleId || 'VH' + Date.now(),
    name: vehicle.name || 'Toyota Land Cruiser 2024',
    image: vehicle.image_url || vehicle.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    type: vehicle.type || 'SUV',
    brand: vehicle.brand || 'Toyota',
    model: vehicle.model || 'Land Cruiser',
    year: vehicle.year || '2024',
    price: vehicle.price_per_day || vehicle.price || 120,
    location: stateData.pickupLocation || vehicle.location || 'City Center',
    pickupDate: stateData.pickupDate || new Date().toISOString().split('T')[0],
    pickupTime: stateData.pickupTime || '10:00 AM',
    returnDate: stateData.returnDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnTime: stateData.returnTime || '10:00 AM',
    seats: vehicle.seats || 5,
    transmission: vehicle.transmission || 'Automatic',
    fuel: vehicle.fuel_type || vehicle.fuel || 'Petrol',
    mileage: vehicle.mileage || 'Unlimited',
    rating: vehicle.rating || 4.5,
    reviewCount: vehicle.reviews_count || 200,
    features: vehicle.features || ['Air Conditioning', 'Bluetooth', 'USB Port'],
  };

  const features = [
    { icon: Users, label: `${vehicleData.seats} Seats` },
    { icon: Settings, label: vehicleData.transmission },
    { icon: Fuel, label: vehicleData.fuel },
    { icon: Gauge, label: vehicleData.mileage },
    { icon: Snowflake, label: 'Air Conditioning' },
    { icon: Radio, label: 'Bluetooth/USB' },
  ];

  const addOnOptions = [
    { key: 'insurance', label: 'Full Insurance Coverage', price: 25, description: 'Zero excess, full coverage' },
    { key: 'gps', label: 'GPS Navigation', price: 10, description: 'Garmin GPS unit' },
    { key: 'childSeat', label: 'Child Seat', price: 15, description: 'Age-appropriate seat' },
  ];

  const days = Math.max(1, Math.ceil((new Date(vehicleData.returnDate) - new Date(vehicleData.pickupDate)) / (1000 * 60 * 60 * 24)));
  const basePrice = vehicleData.price * days;
  const addOnTotal = addOnOptions.reduce((sum, opt) => sum + (addOns[opt.key] ? opt.price * days : 0), 0);
  const subtotal = basePrice + addOnTotal;
  const taxes = subtotal * 0.1;
  const grandTotal = subtotal + taxes;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (!driverInfo.name || !driverInfo.license) {
      toast.error('Please enter driver details and license number');
      return;
    }

    const checkoutParams = new URLSearchParams({
      type: 'vehicle',
      itemId: vehicleData.vehicleId,
      price: grandTotal.toString(),
      title: vehicleData.name,
      description: `${vehicleData.type} - ${days} Day${days > 1 ? 's' : ''} Rental`,
      image: vehicleData.image,
      date: `${vehicleData.pickupDate} to ${vehicleData.returnDate}`,
      location: vehicleData.location,
      guests: '1',
      vehicleType: vehicleData.type,
      pickupDate: vehicleData.pickupDate,
      returnDate: vehicleData.returnDate,
      driverName: driverInfo.name,
      days: days.toString(),
    });

    navigate(`/booking/checkout?${checkoutParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Button variant="ghost" className="text-white hover:bg-white/10 mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
              <Car className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <Badge className="bg-white/20 text-white mb-2">{vehicleData.type}</Badge>
              <h1 className="text-3xl font-serif font-bold text-white">{vehicleData.name}</h1>
              <p className="text-green-100 flex items-center gap-2"><MapPin className="w-4 h-4" /> {vehicleData.location}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Vehicle Image & Details */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img src={vehicleData.image} alt={vehicleData.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{vehicleData.name}</h2>
                      <p className="text-slate-500">{vehicleData.brand} {vehicleData.model} • {vehicleData.year}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold">{vehicleData.rating}</span>
                        <span className="text-slate-500">({vehicleData.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {features.map((feat, idx) => (
                      <div key={idx} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <feat.icon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{feat.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rental Period */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Rental Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">Pick-up</p>
                      <p className="font-semibold text-lg">{vehicleData.pickupDate}</p>
                      <p className="text-slate-600">{vehicleData.pickupTime}</p>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {vehicleData.location}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">Return</p>
                      <p className="font-semibold text-lg">{vehicleData.returnDate}</p>
                      <p className="text-slate-600">{vehicleData.returnTime}</p>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Same location
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Optional Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {addOnOptions.map((opt) => (
                    <div
                      key={opt.key}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        addOns[opt.key] ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 hover:border-green-300'
                      }`}
                      onClick={() => setAddOns({...addOns, [opt.key]: !addOns[opt.key]})}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          addOns[opt.key] ? 'border-green-600 bg-green-600' : 'border-slate-300'
                        }`}>
                          {addOns[opt.key] && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-sm text-slate-500">{opt.description}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">+${opt.price}/day</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Driver Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={driverInfo.name} onChange={(e) => setDriverInfo({...driverInfo, name: e.target.value})} placeholder="As on driving license" className="mt-1" />
                    </div>
                    <div>
                      <Label>Driving License # *</Label>
                      <Input value={driverInfo.license} onChange={(e) => setDriverInfo({...driverInfo, license: e.target.value})} placeholder="License number" className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={driverInfo.email} onChange={(e) => setDriverInfo({...driverInfo, email: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={driverInfo.phone} onChange={(e) => setDriverInfo({...driverInfo, phone: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <span>Driver must be 21+ years old and present valid driving license at pickup.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-green-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Rental Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">${vehicleData.price}/day × {days} days</span>
                      <span className="font-medium">${basePrice.toFixed(2)}</span>
                    </div>
                    {addOnOptions.filter(opt => addOns[opt.key]).map(opt => (
                      <div key={opt.key} className="flex justify-between text-sm">
                        <span className="text-slate-600">{opt.label}</span>
                        <span>${(opt.price * days).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxes & Fees</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-green-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700" size="lg" onClick={handleBookNow}>
                    Reserve Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Free cancellation up to 24h before</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>$0 deposit with full insurance</span>
                    </div>
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

export default VehicleDetailPage;
