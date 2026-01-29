import React, { useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  Plane, CheckCircle, Download, Printer, Share2, Mail,
  User, Phone, Calendar, Clock, Luggage, CreditCard,
  MapPin, FileText, ArrowRight, Home, TicketCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const FlightReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  // Get booking data from navigation state
  const bookingData = location.state?.booking || {};
  const flightData = location.state?.flight || {};
  const paymentData = location.state?.payment || {};

  // Generate receipt data with defaults
  const receipt = {
    receiptNo: bookingData.receipt_no || `FR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
    paymentStatus: bookingData.payment_status || 'paid',
    dateTime: bookingData.created_at || new Date().toISOString(),
    
    // Passenger Details
    passenger: {
      name: bookingData.passenger_name || bookingData.guest_info?.firstName + ' ' + bookingData.guest_info?.lastName || 'John Doe',
      email: bookingData.passenger_email || bookingData.guest_info?.email || 'passenger@email.com',
      phone: bookingData.passenger_phone || bookingData.guest_info?.phone || '+234 800 000 0000',
    },
    
    // Booking Details
    bookingRef: bookingData.booking_id?.slice(-6).toUpperCase() || generatePNR(),
    ticketNumber: `176-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    bookingDate: bookingData.created_at || new Date().toISOString(),
    
    // Flight Information
    flight: {
      airline: flightData.airline || 'Emirates',
      airlineLogo: flightData.airline_logo || '',
      flightNumber: flightData.flight_number || 'EK 785',
      from: flightData.origin || 'LOS',
      fromCity: flightData.origin_city || 'Lagos',
      fromAirport: flightData.origin_airport || 'Murtala Muhammed International',
      to: flightData.destination || 'DXB',
      toCity: flightData.destination_city || 'Dubai',
      toAirport: flightData.destination_airport || 'Dubai International',
      departure: flightData.departure_date || '2026-02-15',
      departureTime: flightData.departure_time || '22:10',
      arrival: flightData.arrival_time || '06:20+1',
      duration: flightData.duration || '8h 15m',
      cabinClass: flightData.cabin_class || 'Economy',
      aircraft: flightData.aircraft || 'Boeing 777-300ER',
      baggage: flightData.baggage || { checked: '23kg', cabin: '7kg' },
    },
    
    // Payment Summary
    payment: {
      baseFare: paymentData.base_fare || bookingData.price || flightData.price || 620,
      taxes: paymentData.taxes || (bookingData.price || flightData.price || 620) * 0.12,
      serviceFee: paymentData.service_fee || 25,
      total: paymentData.total || bookingData.total_amount || 0,
      method: paymentData.method || 'Visa •••• 4582',
      transactionId: paymentData.transaction_id || `PAY-${generateTransactionId()}`,
      gateway: paymentData.gateway || 'Paystack',
    },
    
    // Billing
    billing: {
      name: bookingData.billing_name || bookingData.passenger_name || 'John Doe',
      country: bookingData.billing_country || 'Nigeria',
    }
  };

  // Calculate total if not provided
  if (!receipt.payment.total) {
    receipt.payment.total = receipt.payment.baseFare + receipt.payment.taxes + receipt.payment.serviceFee;
  }

  function generatePNR() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }

  function generateTransactionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  const formatDate = (dateString, includeTime = false) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    if (includeTime) {
      return date.toLocaleDateString('en-GB', options) + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' (GMT)';
    }
    return date.toLocaleDateString('en-GB', options);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Receipt downloaded successfully!');
    handlePrint();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Flight Receipt - ${receipt.receiptNo}`,
          text: `Flight booking confirmation for ${receipt.flight.fromCity} to ${receipt.flight.toCity}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleEmailReceipt = () => {
    const subject = encodeURIComponent(`Flight Receipt - ${receipt.receiptNo}`);
    const body = encodeURIComponent(`Your flight booking confirmation:\n\nReceipt No: ${receipt.receiptNo}\nBooking Reference: ${receipt.bookingRef}\nFlight: ${receipt.flight.flightNumber}\nRoute: ${receipt.flight.fromCity} → ${receipt.flight.toCity}\nDate: ${formatDate(receipt.flight.departure)}\nTotal Paid: $${receipt.payment.total.toFixed(2)}`);
    window.open(`mailto:${receipt.passenger.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your flight has been booked successfully</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={handleEmailReceipt} variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>

          {/* Receipt Card */}
          <Card className="border-0 shadow-xl overflow-hidden print:shadow-none" ref={receiptRef}>
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Foster Tours</h2>
                    <p className="text-teal-100 text-sm">Flight Booking Receipt</p>
                  </div>
                </div>
                <TicketCheck className="w-10 h-10 text-teal-200" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-teal-200">Receipt No</p>
                  <p className="font-semibold">{receipt.receiptNo}</p>
                </div>
                <div>
                  <p className="text-teal-200">Payment Status</p>
                  <Badge className="bg-green-500 text-white border-0 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                </div>
                <div>
                  <p className="text-teal-200">Date & Time</p>
                  <p className="font-semibold">{formatDate(receipt.dateTime, true)}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Passenger Details */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Passenger Details
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Passenger Name</p>
                      <p className="font-medium">{receipt.passenger.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{receipt.passenger.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{receipt.passenger.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Booking Details
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Reference (PNR)</p>
                      <p className="font-bold text-xl text-teal-600">{receipt.bookingRef}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Number</p>
                      <p className="font-medium">{receipt.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Date</p>
                      <p className="font-medium">{formatDate(receipt.bookingDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Flight Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-teal-600" />
                  Flight Information
                </h3>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl p-4 md:p-6">
                  {/* Airline Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {receipt.flight.airlineLogo ? (
                      <img src={receipt.flight.airlineLogo} alt={receipt.flight.airline} className="h-8" />
                    ) : (
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                        <Plane className="w-5 h-5 text-teal-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{receipt.flight.airline}</p>
                      <p className="text-sm text-muted-foreground">Flight {receipt.flight.flightNumber}</p>
                    </div>
                  </div>

                  {/* Flight Route */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{receipt.flight.from}</p>
                      <p className="text-sm text-muted-foreground">{receipt.flight.fromCity}</p>
                      <p className="text-xs text-muted-foreground mt-1">{receipt.flight.fromAirport}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
                        <Plane className="w-5 h-5 text-teal-600 rotate-90" />
                        <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        {receipt.flight.duration}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{receipt.flight.to}</p>
                      <p className="text-sm text-muted-foreground">{receipt.flight.toCity}</p>
                      <p className="text-xs text-muted-foreground mt-1">{receipt.flight.toAirport}</p>
                    </div>
                  </div>

                  {/* Flight Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Departure
                      </p>
                      <p className="font-semibold">{formatDate(receipt.flight.departure)}</p>
                      <p className="text-teal-600 font-bold">{receipt.flight.departureTime}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Arrival
                      </p>
                      <p className="font-semibold">{receipt.flight.arrival.includes('+') ? 'Next Day' : 'Same Day'}</p>
                      <p className="text-teal-600 font-bold">{receipt.flight.arrival}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-muted-foreground">Cabin Class</p>
                      <p className="font-semibold capitalize">{receipt.flight.cabinClass}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Luggage className="w-3 h-3" /> Baggage
                      </p>
                      <p className="font-semibold text-xs">
                        1 × {typeof receipt.flight.baggage === 'object' ? receipt.flight.baggage.checked : receipt.flight.baggage} checked
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof receipt.flight.baggage === 'object' ? receipt.flight.baggage.cabin : '7kg'} cabin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  Payment Summary
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span className="font-medium">${receipt.payment.baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-medium">${receipt.payment.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">${receipt.payment.serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Paid</span>
                      <span className="font-bold text-teal-600">${receipt.payment.total.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{receipt.payment.method}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-medium font-mono text-xs">{receipt.payment.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Gateway</p>
                      <p className="font-medium">{receipt.payment.gateway}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  Billing Information
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Billed To</p>
                      <p className="font-medium">{receipt.billing.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Billing Country</p>
                      <p className="font-medium">{receipt.billing.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Important Notes */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Important Notes
                </h3>
                <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>This receipt confirms successful payment, not boarding permission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Your e-ticket will be sent separately (or available in "My Trips").</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Please arrive at the airport at least 3 hours before departure for international flights.</span>
                  </li>
                </ul>
              </div>

              {/* Customer Support */}
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Customer Support</p>
                <p>support@fostertours.com | +234 9058 681 268</p>
                <p className="mt-2">WhatsApp: +234 9058 681 268 | Instagram: @foster_tours</p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
            <Link to="/dashboard">
              <Button className="w-full md:w-auto gap-2 bg-teal-600 hover:bg-teal-700">
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/flights">
              <Button variant="outline" className="w-full md:w-auto gap-2">
                <Plane className="w-4 h-4" />
                Book Another Flight
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          nav, footer, button {
            display: none !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default FlightReceiptPage;
