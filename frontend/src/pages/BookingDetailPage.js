import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Plane, Hotel, Calendar, Car, FileText, MapPin, Clock, Users,
  CreditCard, ArrowLeft, CheckCircle, Loader2, AlertCircle,
  Star, Luggage, Coffee, Wifi, ParkingCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BookingDetailPage = () => {
  const { bookingType, itemId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState(null);
  const [error, setError] = useState(null);

  // Get booking info from URL params (passed from search results)
  const bookingData = {
    type: bookingType,
    itemId: itemId,
    price: parseFloat(searchParams.get('price') || '0'),
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    image: searchParams.get('image') || '',
    date: searchParams.get('date') || '',
    location: searchParams.get('location') || '',
    duration: searchParams.get('duration') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    // Flight specific
    airline: searchParams.get('airline') || '',
    departure: searchParams.get('departure') || '',
    arrival: searchParams.get('arrival') || '',
    stops: searchParams.get('stops') || '0',
    // Hotel specific
    rating: searchParams.get('rating') || '',
    amenities: searchParams.get('amenities') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    // Vehicle specific
    vehicleType: searchParams.get('vehicleType') || '',
    seats: searchParams.get('seats') || '',
    transmission: searchParams.get('transmission') || '',
  };

  useEffect(() => {
    // For now, use the URL params as item details
    setItemDetails(bookingData);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingType, itemId]);

  const getBookingIcon = () => {
    switch (bookingType) {
      case 'flight': return <Plane className="w-6 h-6" />;
      case 'hotel': return <Hotel className="w-6 h-6" />;
      case 'event': return <Calendar className="w-6 h-6" />;
      case 'vehicle': return <Car className="w-6 h-6" />;
      case 'visa': return <FileText className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getBookingTitle = () => {
    switch (bookingType) {
      case 'flight': return 'Flight Booking';
      case 'hotel': return 'Hotel Reservation';
      case 'event': return 'Event Booking';
      case 'vehicle': return 'Vehicle Rental';
      case 'visa': return 'Visa Service';
      default: return 'Booking';
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue with booking');
      navigate('/login');
      return;
    }

    // Navigate to checkout with booking details
    const checkoutParams = new URLSearchParams({
      type: bookingType,
      itemId: itemId,
      price: bookingData.price.toString(),
      title: bookingData.title,
      description: bookingData.description,
      image: bookingData.image,
      date: bookingData.date,
      location: bookingData.location,
      guests: bookingData.guests.toString(),
    });

    navigate(`/booking/checkout?${checkoutParams.toString()}`);
  };

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
      
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {getBookingIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">
                {getBookingTitle()}
              </h1>
              <p className="text-teal-100">Review your booking details</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Info Card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                {bookingData.image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={bookingData.image} 
                      alt={bookingData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-teal-100 text-teal-700 mb-2 capitalize">
                        {bookingType}
                      </Badge>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {bookingData.title || `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking`}
                      </h2>
                    </div>
                    {bookingData.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-yellow-700">{bookingData.rating}</span>
                      </div>
                    )}
                  </div>

                  {bookingData.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {bookingData.description}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {bookingData.location && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        <span>{bookingData.location}</span>
                      </div>
                    )}
                    {bookingData.date && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span>{bookingData.date}</span>
                      </div>
                    )}
                    {bookingData.duration && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Clock className="w-5 h-5 text-teal-600" />
                        <span>{bookingData.duration}</span>
                      </div>
                    )}
                    {bookingData.guests > 0 && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Users className="w-5 h-5 text-teal-600" />
                        <span>{bookingData.guests} Guest(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Flight-specific details */}
                  {bookingType === 'flight' && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Flight Details</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookingData.departure || 'DEP'}</p>
                          <p className="text-sm text-slate-500">Departure</p>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="flex items-center">
                            <div className="h-px bg-slate-300 flex-1" />
                            <Plane className="w-5 h-5 mx-2 text-teal-600" />
                            <div className="h-px bg-slate-300 flex-1" />
                          </div>
                          <p className="text-center text-xs text-slate-500 mt-1">
                            {bookingData.stops === '0' ? 'Direct' : `${bookingData.stops} Stop(s)`}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookingData.arrival || 'ARR'}</p>
                          <p className="text-sm text-slate-500">Arrival</p>
                        </div>
                      </div>
                      {bookingData.airline && (
                        <p className="text-center mt-4 text-slate-600">
                          Operated by <span className="font-medium">{bookingData.airline}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hotel-specific details */}
                  {bookingType === 'hotel' && bookingData.amenities && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {bookingData.amenities.split(',').map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm">
                            {amenity.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle-specific details */}
                  {bookingType === 'vehicle' && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {bookingData.vehicleType && (
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Car className="w-6 h-6 mx-auto text-teal-600 mb-1" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">{bookingData.vehicleType}</p>
                        </div>
                      )}
                      {bookingData.seats && (
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Users className="w-6 h-6 mx-auto text-teal-600 mb-1" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">{bookingData.seats} Seats</p>
                        </div>
                      )}
                      {bookingData.transmission && (
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Luggage className="w-6 h-6 mx-auto text-teal-600 mb-1" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">{bookingData.transmission}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Instant confirmation',
                      '24/7 customer support',
                      'Free cancellation (24h)',
                      'Secure payment',
                      'Email confirmation',
                      'Mobile voucher accepted'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-slate-50 dark:bg-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Base Price</span>
                      <span className="font-medium">${bookingData.price.toFixed(2)}</span>
                    </div>
                    {bookingData.guests > 1 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Guests ({bookingData.guests})</span>
                        <span className="font-medium">× {bookingData.guests}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Taxes & Fees</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-teal-600">
                        ${(bookingData.price * (bookingData.guests || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secure checkout with Paystack</span>
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

export default BookingDetailPage;
