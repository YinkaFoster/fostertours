import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  CheckCircle, Download, Mail, Calendar, MapPin,
  ArrowRight, Home, Plane, Hotel, Car, FileText, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14b8a6', '#f97316', '#eab308']
    });

    // Fetch booking details
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(response.data);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const getBookingIcon = (type) => {
    const icons = {
      flight: <Plane className="w-6 h-6" />,
      hotel: <Hotel className="w-6 h-6" />,
      vehicle: <Car className="w-6 h-6" />,
      visa: <FileText className="w-6 h-6" />,
      event: <Calendar className="w-6 h-6" />
    };
    return icons[type] || <Calendar className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Thank you for your booking. Your payment has been processed successfully.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-slate-500">Booking Reference</p>
                      <p className="text-2xl font-bold text-teal-600">{bookingId || reference || 'N/A'}</p>
                    </div>
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                      {booking ? getBookingIcon(booking.booking_type) : <CheckCircle className="w-6 h-6" />}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {booking && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Booking Type</span>
                        <span className="font-medium capitalize">{booking.booking_type}</span>
                      </div>
                      {booking.item_details?.title && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Service</span>
                          <span className="font-medium">{booking.item_details.title}</span>
                        </div>
                      )}
                      {booking.item_details?.date && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>
                          <span className="font-medium">{booking.item_details.date}</span>
                        </div>
                      )}
                      {booking.item_details?.location && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location</span>
                          <span className="font-medium">{booking.item_details.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <span className="font-medium text-green-600 capitalize">{booking.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Status</span>
                        <span className="font-medium text-green-600 capitalize">{booking.payment_status}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total Paid</span>
                        <span className="font-bold text-teal-600">${booking.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {!booking && (
                    <div className="text-center py-4">
                      <p className="text-slate-600">Your booking has been confirmed and a confirmation email has been sent to your registered email address.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Confirmation Email</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      A confirmation email with your booking details has been sent to your email address.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Download Voucher</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You can download your booking voucher from your dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Manage Booking</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      View and manage all your bookings from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700">
                View My Bookings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Support Note */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@fostertours.com" className="text-teal-600 hover:underline">
                support@fostertours.com
              </a>
              {' '}or WhatsApp{' '}
              <a href="https://wa.me/2349058681268" className="text-teal-600 hover:underline">
                +234 9058 681 268
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookingSuccessPage;
