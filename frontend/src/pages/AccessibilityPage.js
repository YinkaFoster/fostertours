import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Accessibility, Eye, Ear, Hand, Brain, Heart,
  Plane, Hotel, Car, CheckCircle, Phone, Mail
} from 'lucide-react';

const AccessibilityPage = () => {
  const commitments = [
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'Screen reader compatible website, high contrast options, and alt text for images.'
    },
    {
      icon: Ear,
      title: 'Hearing Accessibility',
      description: 'Text-based support options, email communication, and written confirmations.'
    },
    {
      icon: Hand,
      title: 'Motor Accessibility',
      description: 'Keyboard navigation support and simplified booking processes.'
    },
    {
      icon: Brain,
      title: 'Cognitive Accessibility',
      description: 'Clear language, step-by-step guides, and helpful tooltips throughout.'
    },
  ];

  const services = [
    {
      icon: Plane,
      title: 'Accessible Flights',
      features: [
        'Wheelchair assistance booking',
        'Priority boarding arrangements',
        'Special meal requests',
        'Assistance animal arrangements',
        'Seat selection for accessibility needs'
      ]
    },
    {
      icon: Hotel,
      title: 'Accessible Hotels',
      features: [
        'Wheelchair accessible rooms',
        'Roll-in showers',
        'Grab bars and safety features',
        'Ground floor room options',
        'Visual and hearing alerts'
      ]
    },
    {
      icon: Car,
      title: 'Accessible Transport',
      features: [
        'Wheelchair accessible vehicles',
        'Hand controls available',
        'Ramp-equipped vans',
        'Driver assistance services',
        'Flexible pickup locations'
      ]
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
              <Accessibility className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Accessibility
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Travel is for everyone. We're committed to making our services 
              accessible to all travelers.
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Our Accessibility Commitment
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We believe everyone deserves the opportunity to explore the world. 
              Here's how we make travel accessible for all.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commitments.map((item, idx) => (
              <Card key={idx} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible Services */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Accessible Travel Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {service.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Website Accessibility */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                Website Accessibility Features
              </h2>
              <div className="space-y-4">
                {[
                  'WCAG 2.1 AA compliance standards',
                  'Keyboard navigation support throughout the site',
                  'Screen reader optimization with ARIA labels',
                  'High contrast mode compatibility',
                  'Resizable text without loss of functionality',
                  'Clear focus indicators for navigation',
                  'Alternative text for all meaningful images',
                  'Consistent and predictable navigation',
                  'Error identification and suggestions',
                  'Multiple ways to access content'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Request Assistance */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-600 to-teal-800 text-white">
            <CardContent className="p-8">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-serif font-bold mb-4">
                  Need Special Assistance?
                </h2>
                <p className="text-teal-100 mb-6 max-w-xl mx-auto">
                  Our dedicated accessibility team is here to help you plan your perfect trip. 
                  Let us know your specific needs and we'll make the necessary arrangements.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Us
                    </Button>
                  </a>
                  <a href="mailto:accessibility@fostertours.com">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Us
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Help Us Improve
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We're continuously working to improve accessibility. If you encounter any barriers 
            or have suggestions, please let us know.
          </p>
          <a href="mailto:accessibility@fostertours.com">
            <Button variant="outline">
              Send Feedback
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AccessibilityPage;
