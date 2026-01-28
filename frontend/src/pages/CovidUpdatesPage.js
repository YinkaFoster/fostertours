import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Shield, AlertTriangle, CheckCircle, Globe, Plane, Hotel,
  FileText, Heart, ExternalLink, Clock, RefreshCw, Info
} from 'lucide-react';

const CovidUpdatesPage = () => {
  const currentStatus = {
    lastUpdated: 'January 2025',
    globalStatus: 'Most travel restrictions have been lifted worldwide',
    recommendation: 'Check destination-specific requirements before booking'
  };

  const travelTips = [
    {
      icon: FileText,
      title: 'Check Requirements',
      description: 'Verify entry requirements for your destination, including any health documentation needed.'
    },
    {
      icon: Shield,
      title: 'Travel Insurance',
      description: 'Consider comprehensive travel insurance that covers health emergencies and trip changes.'
    },
    {
      icon: Heart,
      title: 'Health Precautions',
      description: 'Maintain good hygiene practices and consider personal protective measures during travel.'
    },
    {
      icon: RefreshCw,
      title: 'Stay Flexible',
      description: 'Book flexible tickets and accommodations when possible to allow for changes.'
    },
  ];

  const popularDestinations = [
    { name: 'Dubai, UAE', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
    { name: 'United Kingdom', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
    { name: 'United States', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
    { name: 'France', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
    { name: 'South Africa', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
    { name: 'Turkey', status: 'Open', requirements: 'No COVID restrictions', color: 'bg-green-100 text-green-800' },
  ];

  const ourMeasures = [
    'Flexible booking and cancellation policies',
    'Real-time updates on travel requirements',
    'Partner hotels and airlines following safety protocols',
    'Dedicated support for travel-related queries',
    'Refund options for affected bookings',
    'Updated health and safety information'
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              COVID-19 Travel Updates
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-4">
              Stay informed about the latest travel guidelines and requirements.
            </p>
            <Badge className="bg-white/20 text-white">
              <Clock className="w-4 h-4 mr-1" />
              Last Updated: {currentStatus.lastUpdated}
            </Badge>
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-8 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Global Travel Status: Restrictions Largely Lifted
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {currentStatus.globalStatus}. {currentStatus.recommendation}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Travel Tips for 2025
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {travelTips.map((tip, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
                    <tip.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{tip.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Destination Status */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Popular Destinations Status
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDestinations.map((dest, idx) => (
              <Card key={idx} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{dest.name}</p>
                      <p className="text-xs text-slate-500">{dest.requirements}</p>
                    </div>
                  </div>
                  <Badge className={dest.color}>{dest.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            * Requirements may change. Always verify before booking.
          </p>
        </div>
      </section>

      {/* Our Measures */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-teal-600" />
                Our Commitment to Safe Travel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {ourMeasures.map((measure, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{measure}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Official Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'World Health Organization', url: 'https://www.who.int/travel-advice', description: 'Global health guidelines' },
              { name: 'IATA Travel Centre', url: 'https://www.iatatravelcentre.com', description: 'Airline travel requirements' },
              { name: 'CDC Travel Health', url: 'https://wwwnc.cdc.gov/travel', description: 'US health recommendations' },
            ].map((resource, idx) => (
              <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{resource.name}</h3>
                      <ExternalLink className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{resource.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center text-white">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-serif font-bold mb-4">
            Have Questions About Your Trip?
          </h2>
          <p className="text-teal-100 mb-6">
            Our team can help you understand the requirements for your specific destination.
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

export default CovidUpdatesPage;
