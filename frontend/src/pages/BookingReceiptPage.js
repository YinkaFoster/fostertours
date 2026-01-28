import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  CheckCircle, Download, Mail, Printer, Share2, Calendar, MapPin,
  ArrowRight, Home, Plane, Hotel, Car, FileText, Ticket, Clock,
  Users, CreditCard, QrCode, Phone, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BookingReceiptPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');
  const reference = searchParams.get('reference');

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#14b8a6', '#f97316', '#eab308'] });
    fetchBooking();
  }, [bookingId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBooking = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API}/bookings/${bookingId}`, { headers: getAuthHeaders() });
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingIcon = (type) => {
    const icons = { flight: Plane, hotel: Hotel, vehicle: Car, visa: FileText, event: Ticket };
    const Icon = icons[type] || Ticket;
    return <Icon className="w-6 h-6" />;
  };

  const getBookingColor = (type) => {
    const colors = { flight: 'bg-blue-600', hotel: 'bg-teal-600', vehicle: 'bg-green-600', visa: 'bg-amber-600', event: 'bg-purple-600' };
    return colors[type] || 'bg-teal-600';
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    toast.success('Downloading receipt...');
    // In production, generate PDF
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const bookingType = booking?.booking_type || 'booking';
  const details = booking?.item_details || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your booking has been successfully processed
            </p>
          </div>

          {/* Receipt Card */}
          <Card className="border-0 shadow-xl overflow-hidden print:shadow-none" id="receipt">
            {/* Header */}
            <div className={`${getBookingColor(bookingType)} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {getBookingIcon(bookingType)}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Booking Reference</p>
                    <p className="text-2xl font-bold">{bookingId || reference}</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white capitalize">{bookingType}</Badge>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Booking Details */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {details.title || `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking`}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{details.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {details.date && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="font-medium">{details.date}</p>
                      </div>
                    </div>
                  )}
                  {details.location && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="font-medium">{details.location}</p>
                      </div>
                    </div>
                  )}
                  {details.guests && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-xs text-slate-500">Guests</p>
                        <p className="font-medium">{details.guests}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-slate-500">Booked On</p>
                      <p className="font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Guest/Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium">{booking?.guest_info?.firstName} {booking?.guest_info?.lastName || user?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium">{booking?.guest_info?.email || user?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium">{booking?.guest_info?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Booking Status</p>
                    <Badge className="bg-green-100 text-green-700 capitalize">{booking?.status || 'Confirmed'}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">${(booking?.total_amount * 0.88)?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Taxes & Fees</span>
                    <span className="font-medium">${(booking?.total_amount * 0.12)?.toFixed(2) || '0.00'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Paid</span>
                    <span className="font-bold text-teal-600">${booking?.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Paid via {booking?.payment_method || 'Paystack'}</span>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  <span className="capitalize">{booking?.payment_status || 'Completed'}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* QR Code (Mock) */}
              <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-24 h-24 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">Scan for digital voucher</p>
                  <p className="font-mono text-xs text-slate-400 mt-1">{bookingId || reference}</p>
                </div>
              </div>

              {/* Important Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Present this receipt or booking reference at check-in</li>
                  <li>• A confirmation email has been sent to your email address</li>
                  <li>• Contact support for any modifications or cancellations</li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center text-sm text-slate-500">
                <p className="mb-2">Need help? Contact us:</p>
                <div className="flex items-center justify-center gap-4">
                  <a href="https://wa.me/2349058681268" className="flex items-center gap-1 text-green-600 hover:underline">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href="mailto:support@fostertours.com" className="flex items-center gap-1 text-teal-600 hover:underline">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Link to="/dashboard">
              <Button className="bg-teal-600 hover:bg-teal-700">
                View All Bookings <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Back Home */}
          <div className="text-center mt-6 print:hidden">
            <Link to="/" className="text-teal-600 hover:underline flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default BookingReceiptPage;
