import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertCircle, Clock, CreditCard, Plane, Hotel, Car, Calendar,
  CheckCircle, XCircle, Info, ArrowRight, Shield
} from 'lucide-react';

const CancellationPolicyPage = () => {
  const policies = [
    {
      icon: Plane,
      title: 'Flight Cancellations',
      color: 'bg-blue-500',
      items: [
        { time: 'More than 72 hours before departure', refund: '100% refund (minus processing fee)', status: 'full' },
        { time: '24-72 hours before departure', refund: '75% refund', status: 'partial' },
        { time: 'Less than 24 hours before departure', refund: '50% refund', status: 'partial' },
        { time: 'No-show', refund: 'No refund', status: 'none' },
      ],
      note: 'Airline cancellation fees may apply in addition to our processing fee. Refund amounts depend on the specific airline and fare class.'
    },
    {
      icon: Hotel,
      title: 'Hotel Cancellations',
      color: 'bg-orange-500',
      items: [
        { time: 'More than 48 hours before check-in', refund: '100% refund', status: 'full' },
        { time: '24-48 hours before check-in', refund: '50% refund', status: 'partial' },
        { time: 'Less than 24 hours before check-in', refund: 'No refund', status: 'none' },
        { time: 'No-show', refund: 'No refund', status: 'none' },
      ],
      note: 'Some hotels have stricter cancellation policies, especially during peak seasons. Always check the specific hotel\'s policy at the time of booking.'
    },
    {
      icon: Car,
      title: 'Vehicle Rental Cancellations',
      color: 'bg-green-500',
      items: [
        { time: 'More than 24 hours before pickup', refund: '100% refund', status: 'full' },
        { time: 'Less than 24 hours before pickup', refund: '75% refund', status: 'partial' },
        { time: 'No-show', refund: '50% refund', status: 'partial' },
      ],
      note: 'Early return of vehicles does not entitle you to a refund for unused days.'
    },
    {
      icon: Calendar,
      title: 'Travel Package Cancellations',
      color: 'bg-purple-500',
      items: [
        { time: 'More than 30 days before departure', refund: '90% refund', status: 'full' },
        { time: '15-30 days before departure', refund: '70% refund', status: 'partial' },
        { time: '7-14 days before departure', refund: '50% refund', status: 'partial' },
        { time: 'Less than 7 days before departure', refund: '25% refund', status: 'partial' },
        { time: 'No-show', refund: 'No refund', status: 'none' },
      ],
      note: 'Custom packages may have different cancellation terms based on the specific services included.'
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'full':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'none':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Cancellation Policy
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Understand our fair and transparent cancellation and refund policies.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Important Information
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                The policies below are general guidelines. Specific bookings may have different terms based on promotional offers, 
                peak season rates, or provider policies. Always review the cancellation policy shown at checkout before confirming your booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="space-y-8">
            {policies.map((policy, idx) => (
              <Card key={idx} className="border-0 shadow-lg overflow-hidden">
                <CardHeader className={`${policy.color} text-white`}>
                  <CardTitle className="flex items-center gap-3">
                    <policy.icon className="w-6 h-6" />
                    {policy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Cancellation Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Refund Amount</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policy.items.map((item, iidx) => (
                          <tr key={iidx} className="border-b dark:border-slate-700 last:border-0">
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.time}</td>
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.refund}</td>
                            <td className="py-3 px-4 text-center">{getStatusIcon(item.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Note:</strong> {policy.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Cancel */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            How to Cancel Your Booking
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Log In', description: 'Sign in to your Foster Tours account' },
              { step: '2', title: 'Find Booking', description: 'Go to My Bookings and select the booking' },
              { step: '3', title: 'Request Cancellation', description: 'Click Cancel and confirm your request' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Timeline */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Refund Processing Time</h3>
                  <p className="text-slate-600 dark:text-slate-400">How long refunds take to process</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">Credit/Debit Card</span>
                  <span className="font-medium text-slate-900 dark:text-white">5-10 business days</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">Bank Transfer</span>
                  <span className="font-medium text-slate-900 dark:text-white">3-7 business days</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">Wallet Credit</span>
                  <span className="font-medium text-slate-900 dark:text-white">Instant</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">PayPal</span>
                  <span className="font-medium text-slate-900 dark:text-white">3-5 business days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center text-white">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Need Help with a Cancellation?
          </h2>
          <p className="text-teal-100 mb-6">
            Our support team is here to assist you with any cancellation or refund queries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                Contact Support
              </Button>
            </a>
            <Link to="/faqs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CancellationPolicyPage;
