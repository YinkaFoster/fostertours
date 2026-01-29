import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeatSelection from '../components/SeatSelection';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Plane, Clock, Calendar, Users, Luggage, Utensils, Wifi,
  ArrowRight, ArrowLeft, CheckCircle, Info, Shield, Star,
  CreditCard, ChevronDown, ChevronUp, MapPin, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const FlightDetailPage = () => {
  const location = useLocation();
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [passengers, setPassengers] = useState([{ firstName: '', lastName: '', email: '', phone: '' }]);
  const [expandedSection, setExpandedSection] = useState('flight');
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(null);

  // Get flight data from navigation state or use defaults
  const stateData = location.state || {};
  const flight = stateData.flight || {};

  const flightData = {
    flightId: flight.flight_id || flightId || 'FL' + Date.now(),
    airline: flight.airline || 'Emirates',
    airlineLogo: flight.airline_logo || 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg',
    flightNumber: flight.flight_number || 'EK 785',
    departure: flight.origin || 'LOS',
    departureCity: flight.origin_city || 'Lagos',
    departureAirport: flight.origin_airport || 'Murtala Muhammed International',
    departureTime: flight.departure_time || '08:30',
    departureDate: flight.departure_date || stateData.departureDate || new Date().toISOString().split('T')[0],
    arrival: flight.destination || 'DXB',
    arrivalCity: flight.destination_city || 'Dubai',
    arrivalAirport: flight.destination_airport || 'Dubai International',
    arrivalTime: flight.arrival_time || '19:45',
    duration: flight.duration || '8h 15m',
    stops: flight.stops || 0,
    stopCities: flight.stop_cities || [],
    class: flight.cabin_class || 'Economy',
    price: flight.price_per_person || flight.price || 650,
    seatsAvailable: flight.available_seats || 12,
    aircraft: flight.aircraft || 'Boeing 777-300ER',
    baggage: flight.baggage?.checked || '23kg',
    amenities: flight.amenities || ['WiFi', 'Entertainment', 'Meals'],
    meal: flight.meal_included !== false,
    wifi: flight.amenities?.includes('WiFi') || true,
    entertainment: flight.amenities?.includes('Entertainment') || true,
    refundable: flight.refundable || false,
    airlineRating: flight.airline_rating || 4.5,
  };

  const passengerCount = stateData.passengers || 1;
  const totalPrice = flightData.price * passengerCount;
  const seatPrice = selectedSeats?.total_seat_price || 0;
  const taxes = (totalPrice + seatPrice) * 0.12;
  const grandTotal = totalPrice + seatPrice + taxes;

  useEffect(() => {
    // Initialize passengers array based on count
    const initialPassengers = Array(passengerCount).fill(null).map(() => ({
      firstName: '', lastName: '', email: '', phone: ''
    }));
    setPassengers(initialPassengers);
  }, [passengerCount]);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleContinueToSeats = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue with booking');
      navigate('/login');
      return;
    }

    // Validate passenger info (only first and last name required)
    const isValid = passengers.every(p => p.firstName?.trim() && p.lastName?.trim());
    if (!isValid) {
      toast.error('Please fill in passenger first and last names before selecting seats');
      return;
    }

    console.log('Opening seat selection for flight:', flightData.flightId);
    setShowSeatSelection(true);
    setExpandedSection('');  // Close the card when showing seat selection
  };

  const handleSeatSelect = (seatData) => {
    setSelectedSeats(seatData);
    setShowSeatSelection(false);
    toast.success('Seats selected successfully!');
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue with booking');
      navigate('/login');
      return;
    }

    // Validate passenger info
    const isValid = passengers.every(p => p.firstName && p.lastName);
    if (!isValid) {
      toast.error('Please fill in all passenger details');
      return;
    }

    // Navigate to booking checkout with all flight details
    navigate(`/booking/checkout`, {
      state: {
        type: 'flight',
        itemId: flightData.flightId,
        price: grandTotal,
        title: `${flightData.departureCity} to ${flightData.arrivalCity}`,
        description: `${flightData.airline} ${flightData.flightNumber} - ${flightData.class}`,
        image: flightData.airlineLogo,
        date: flightData.departureDate,
        location: `${flightData.departure} → ${flightData.arrival}`,
        guests: passengerCount,
        flight: flightData,
        passengers: passengers,
        selectedSeats: selectedSeats,
        payment: {
          base_fare: totalPrice,
          seat_charges: seatPrice,
          taxes: taxes,
          service_fee: 25,
          total: grandTotal
        }
      }
    });
  };

  const amenities = [
    { icon: Luggage, label: `${flightData.baggage} Checked Baggage`, included: true },
    { icon: Utensils, label: 'In-flight Meals', included: flightData.meal },
    { icon: Wifi, label: 'Wi-Fi Available', included: flightData.wifi },
    { icon: Star, label: 'Entertainment System', included: flightData.entertainment },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 pt-24 pb-12">
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
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">
                {flightData.departureCity} → {flightData.arrivalCity}
              </h1>
              <p className="text-blue-100">
                {flightData.airline} • {flightData.flightNumber} • {flightData.class}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Flight Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === 'flight' ? '' : 'flight')}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      Flight Details
                    </CardTitle>
                    {expandedSection === 'flight' ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </CardHeader>
                {expandedSection === 'flight' && (
                  <CardContent className="p-6">
                    {/* Airline Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <img 
                        src={flightData.airlineLogo} 
                        alt={flightData.airline}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{flightData.airline}</h3>
                        <p className="text-slate-500">{flightData.flightNumber} • {flightData.aircraft}</p>
                      </div>
                      <Badge className="ml-auto bg-blue-100 text-blue-700">{flightData.class}</Badge>
                    </div>

                    {/* Flight Route */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">{flightData.departureTime}</p>
                          <p className="text-2xl font-semibold text-blue-600">{flightData.departure}</p>
                          <p className="text-slate-500">{flightData.departureCity}</p>
                          <p className="text-sm text-slate-400">{flightData.departureDate}</p>
                        </div>
                        
                        <div className="flex-1 px-8">
                          <div className="relative">
                            <div className="h-0.5 bg-slate-300 w-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{flightData.duration}</span>
                              </div>
                            </div>
                            {flightData.stops === 0 ? (
                              <p className="text-center text-sm text-green-600 mt-2">Direct Flight</p>
                            ) : (
                              <p className="text-center text-sm text-orange-600 mt-2">
                                {flightData.stops} Stop{flightData.stops > 1 ? 's' : ''}
                                {flightData.stopCity && ` via ${flightData.stopCity}`}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">{flightData.arrivalTime}</p>
                          <p className="text-2xl font-semibold text-blue-600">{flightData.arrival}</p>
                          <p className="text-slate-500">{flightData.arrivalCity}</p>
                          <p className="text-sm text-slate-400">{flightData.departureDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-4">Included Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {amenities.map((amenity, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${
                            amenity.included ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <amenity.icon className="w-5 h-5" />
                            <span className="text-sm">{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Passenger Details */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === 'passengers' ? '' : 'passengers')}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Passenger Details ({passengerCount})
                    </CardTitle>
                    {expandedSection === 'passengers' ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </CardHeader>
                {expandedSection === 'passengers' && (
                  <CardContent className="p-6 space-y-6">
                    {passengers.map((passenger, idx) => (
                      <div key={idx} className="p-4 border rounded-xl">
                        <h4 className="font-semibold mb-4">Passenger {idx + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                              placeholder="As shown on ID"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={passenger.lastName}
                              onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                              placeholder="As shown on ID"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={passenger.email}
                              onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={passenger.phone}
                              onChange={(e) => updatePassenger(idx, 'phone', e.target.value)}
                              placeholder="+234 xxx xxx xxxx"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Seat Selection Section */}
              {!showSeatSelection && (
                <Card className="border-0 shadow-lg">
                  <CardHeader
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'seats' ? '' : 'seats')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Seat Selection {selectedSeats && <Badge className="ml-2 bg-green-500">Selected</Badge>}
                      </CardTitle>
                      {expandedSection === 'seats' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </CardHeader>
                  {expandedSection === 'seats' && (
                    <CardContent className="p-6">
                      {selectedSeats ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-medium text-green-900 mb-2">✓ Seats Reserved</p>
                            <div className="space-y-1 text-sm">
                              {selectedSeats.seats.map((seat, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>Passenger {idx + 1}: Seat {seat.seat_number}</span>
                                  <span className="font-medium">${seat.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedSeats(null);
                              setShowSeatSelection(true);
                            }}
                          >
                            Change Seats
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-600">
                            Select your preferred seats for all {passengerCount} passenger{passengerCount > 1 ? 's' : ''}. 
                            Seat selection is optional but recommended.
                          </p>
                          <Button
                            className="w-full"
                            onClick={handleContinueToSeats}
                          >
                            Select Seats Now
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setExpandedSection('')}
                          >
                            Skip Seat Selection
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Seat Selection Component */}
              {showSeatSelection && (
                <div className="mt-6">
                  <SeatSelection
                    flightId={flightData.flightId}
                    passengerCount={passengerCount}
                    onSeatSelect={handleSeatSelect}
                    onBack={() => setShowSeatSelection(false)}
                  />
                </div>
              )}

              {/* Policies */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Important Information
                  </h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Free cancellation up to 24 hours before departure</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Online check-in available 24 hours before flight</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span>Valid passport required for international travel</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span>Arrive at airport at least 3 hours before departure</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-blue-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base Fare ({passengerCount} passenger{passengerCount > 1 ? 's' : ''})</span>
                      <span className="font-medium">${flightData.price.toFixed(2)} × {passengerCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    {selectedSeats && (
                      <div className="flex justify-between text-green-600">
                        <span>Seat Charges ({selectedSeats.seats.length} seat{selectedSeats.seats.length > 1 ? 's' : ''})</span>
                        <span className="font-medium">+${seatPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxes & Fees</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    onClick={handleBookNow}
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Secure booking with Paystack</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Only {flightData.seatsAvailable} seats left at this price
                    </Badge>
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

export default FlightDetailPage;
