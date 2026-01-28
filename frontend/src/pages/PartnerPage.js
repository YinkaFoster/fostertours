import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Handshake, Hotel, Plane, Car, Building2, Users, TrendingUp,
  Globe, Shield, Award, ArrowRight, CheckCircle, Mail, Phone
} from 'lucide-react';

const PartnerPage = () => {
  const partnerTypes = [
    {
      icon: Hotel,
      title: 'Hotels & Resorts',
      description: 'List your property on our platform and reach thousands of travelers looking for quality accommodation.',
      benefits: ['Global exposure', 'Commission-based model', 'Real-time booking management', 'Marketing support']
    },
    {
      icon: Plane,
      title: 'Airlines',
      description: 'Partner with us to offer your flights to our growing customer base across Africa and beyond.',
      benefits: ['Increased bookings', 'Dedicated account manager', 'Co-marketing opportunities', 'API integration']
    },
    {
      icon: Car,
      title: 'Vehicle Rentals',
      description: 'Connect with travelers who need reliable transportation at their destinations.',
      benefits: ['Steady customer flow', 'Easy booking system', 'Payment processing', 'Customer support']
    },
    {
      icon: Building2,
      title: 'Tour Operators',
      description: 'Showcase your tours and experiences to travelers seeking authentic local adventures.',
      benefits: ['Premium listing', 'Review management', 'Booking tools', 'Revenue sharing']
    },
  ];

  const whyPartner = [
    { icon: Users, stat: '50,000+', label: 'Active Travelers' },
    { icon: Globe, stat: '150+', label: 'Destinations' },
    { icon: TrendingUp, stat: '40%', label: 'YoY Growth' },
    { icon: Award, stat: '4.9/5', label: 'Customer Rating' },
  ];

  const benefits = [
    { icon: Shield, title: 'Secure Payments', description: 'Reliable and timely payments through secure channels.' },
    { icon: Users, title: 'Quality Customers', description: 'Access to verified, high-value travelers.' },
    { icon: TrendingUp, title: 'Business Growth', description: 'Expand your reach with our marketing support.' },
    { icon: Handshake, title: 'Dedicated Support', description: 'Personal account manager for all partners.' },
  ];

  const steps = [
    { number: '01', title: 'Apply', description: 'Fill out our partnership application form.' },
    { number: '02', title: 'Review', description: 'Our team reviews your application within 48 hours.' },
    { number: '03', title: 'Onboard', description: 'Complete onboarding with your dedicated manager.' },
    { number: '04', title: 'Go Live', description: 'Start receiving bookings and grow your business.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-orange-500 text-white mb-4">Partnership Program</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
                Partner With Foster Tours
              </h1>
              <p className="text-xl text-teal-100 mb-8">
                Join our network of trusted travel partners and grow your business 
                with access to thousands of travelers across Africa and beyond.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:partners@fostertours.com?subject=Partnership Inquiry">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                    Become a Partner
                  </Button>
                </a>
                <a href="#partner-types">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600" 
                alt="Business Partnership" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {whyPartner.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                  <item.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{item.stat}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section id="partner-types" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Partnership Options</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Who Can Partner With Us?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We work with a variety of travel service providers to offer comprehensive solutions to our customers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((type, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-6">
                    <type.icon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{type.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">{type.description}</p>
                  <div className="space-y-2">
                    {type.benefits.map((benefit, bidx) => (
                      <div key={bidx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600 dark:text-slate-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Partner Benefits</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Why Partner With Us?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              How to Become a Partner
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-teal-200 dark:bg-teal-800" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                Ready to Partner With Us?
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Get in touch with our partnerships team to discuss how we can work together.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email Us</h3>
                  <a href="mailto:partners@fostertours.com" className="text-teal-600 hover:text-teal-700">
                    partners@fostertours.com
                  </a>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">WhatsApp</h3>
                  <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                    +234 9058 681 268
                  </a>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <a href="mailto:partners@fostertours.com?subject=Partnership Application">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  Submit Partnership Application <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerPage;
