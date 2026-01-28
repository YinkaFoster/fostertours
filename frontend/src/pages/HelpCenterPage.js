import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Search, Plane, Hotel, Car, FileText, CreditCard, Calendar,
  MessageCircle, Phone, Mail, ArrowRight, HelpCircle, BookOpen,
  Shield, Clock, Users, Headphones
} from 'lucide-react';

const HelpCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      icon: Plane,
      title: 'Flight Bookings',
      description: 'Help with booking, changing, or canceling flights',
      articles: 12,
      href: '/help/flights'
    },
    {
      icon: Hotel,
      title: 'Hotel Reservations',
      description: 'Questions about hotel bookings and policies',
      articles: 10,
      href: '/help/hotels'
    },
    {
      icon: Car,
      title: 'Vehicle Rentals',
      description: 'Information about car rentals and requirements',
      articles: 8,
      href: '/help/vehicles'
    },
    {
      icon: FileText,
      title: 'Visa Services',
      description: 'Visa application process and requirements',
      articles: 15,
      href: '/help/visa'
    },
    {
      icon: CreditCard,
      title: 'Payments & Refunds',
      description: 'Payment methods, billing, and refund policies',
      articles: 9,
      href: '/help/payments'
    },
    {
      icon: Calendar,
      title: 'Travel Packages',
      description: 'Information about our travel packages',
      articles: 7,
      href: '/help/packages'
    },
  ];

  const popularArticles = [
    { title: 'How to book a flight on Foster Tours', views: '15.2k' },
    { title: 'Cancellation and refund policy explained', views: '12.8k' },
    { title: 'How to change or modify my booking', views: '10.5k' },
    { title: 'Payment methods we accept', views: '9.3k' },
    { title: 'Visa application requirements by country', views: '8.7k' },
    { title: 'How to contact customer support', views: '7.9k' },
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Chat with us instantly',
      action: '+234 9058 681 268',
      href: 'https://wa.me/2349058681268',
      color: 'bg-green-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      action: 'support@fostertours.com',
      href: 'mailto:support@fostertours.com',
      color: 'bg-teal-500'
    },
    {
      icon: Headphones,
      title: 'AI Assistant',
      description: 'Available 24/7',
      action: 'Start Chat',
      href: '#chatbot',
      color: 'bg-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-8">
              Find answers to your questions and get the support you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-slate-900 border-0 rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
                      <category.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {category.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                        {category.description}
                      </p>
                      <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                        {category.articles} articles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Popular Articles
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, idx) => (
              <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{article.title}</span>
                  </div>
                  <span className="text-slate-500 text-sm">{article.views} views</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our support team is ready to assist you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, idx) => (
              <a key={idx} href={option.href} target={option.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4`}>
                      <option.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {option.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {option.description}
                    </p>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">
                      {option.action}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <Clock className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-teal-100 text-sm">Usually within 2 hours</p>
            </div>
            <div>
              <Users className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="font-semibold mb-1">Support Team</h3>
              <p className="text-teal-100 text-sm">Available Mon-Sat 9AM-6PM</p>
            </div>
            <div>
              <Shield className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="font-semibold mb-1">Satisfaction</h3>
              <p className="text-teal-100 text-sm">98% customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
