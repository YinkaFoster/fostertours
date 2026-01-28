import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Shield, AlertTriangle, Phone, Heart, Globe, MapPin,
  FileText, Users, Lock, Plane, CheckCircle, ExternalLink
} from 'lucide-react';

const SafetyResourcesPage = () => {
  const safetyTips = [
    {
      icon: FileText,
      title: 'Document Safety',
      tips: [
        'Keep digital copies of all important documents',
        'Store passport and ID separately from originals',
        'Share your itinerary with family or friends',
        'Register with your embassy when traveling abroad'
      ]
    },
    {
      icon: Lock,
      title: 'Financial Security',
      tips: [
        'Use credit cards instead of debit cards abroad',
        'Notify your bank of travel plans',
        'Keep emergency cash in multiple locations',
        'Use hotel safes for valuables'
      ]
    },
    {
      icon: Heart,
      title: 'Health Precautions',
      tips: [
        'Get required vaccinations before travel',
        'Pack a basic first-aid kit',
        'Know the location of nearest hospitals',
        'Carry prescription medications in original packaging'
      ]
    },
    {
      icon: Users,
      title: 'Personal Safety',
      tips: [
        'Stay aware of your surroundings',
        'Avoid displaying expensive items',
        'Use reputable transportation services',
        'Trust your instincts in unfamiliar situations'
      ]
    },
  ];

  const emergencyContacts = [
    { country: 'Nigeria', police: '112', ambulance: '112', fire: '112' },
    { country: 'United States', police: '911', ambulance: '911', fire: '911' },
    { country: 'United Kingdom', police: '999', ambulance: '999', fire: '999' },
    { country: 'UAE (Dubai)', police: '999', ambulance: '998', fire: '997' },
    { country: 'South Africa', police: '10111', ambulance: '10177', fire: '10177' },
    { country: 'France', police: '17', ambulance: '15', fire: '18' },
  ];

  const resources = [
    {
      title: 'Travel Advisories',
      description: 'Check government travel advisories before your trip',
      links: [
        { label: 'US State Department', url: 'https://travel.state.gov' },
        { label: 'UK Foreign Office', url: 'https://www.gov.uk/foreign-travel-advice' },
      ]
    },
    {
      title: 'Health Information',
      description: 'Stay informed about health requirements and risks',
      links: [
        { label: 'WHO Travel Advice', url: 'https://www.who.int/travel-advice' },
        { label: 'CDC Travel Health', url: 'https://wwwnc.cdc.gov/travel' },
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Safety Resources
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Your safety is our priority. Access important safety information 
              and resources for worry-free travels.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Essential Travel Safety Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyTips.map((category, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tidx) => (
                      <li key={tidx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Emergency Contact Numbers
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Save these numbers before traveling to your destination.
            </p>
          </div>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left">Country</th>
                      <th className="py-4 px-6 text-center">Police</th>
                      <th className="py-4 px-6 text-center">Ambulance</th>
                      <th className="py-4 px-6 text-center">Fire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyContacts.map((contact, idx) => (
                      <tr key={idx} className="border-b dark:border-slate-700 last:border-0">
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            {contact.country}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">{contact.police}</td>
                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">{contact.ambulance}</td>
                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">{contact.fire}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Travel Insurance */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">Travel Insurance</h3>
                  <p className="text-orange-100 mb-4">
                    We strongly recommend purchasing travel insurance for all trips. 
                    It covers medical emergencies, trip cancellations, lost luggage, and more.
                  </p>
                  <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-orange-600 hover:bg-orange-50">
                      Get Insurance Quote
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* External Resources */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Helpful Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {resource.description}
                  </p>
                  <div className="space-y-2">
                    {resource.links.map((link, lidx) => (
                      <a
                        key={lidx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 Support */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center text-white">
          <Phone className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-serif font-bold mb-4">
            24/7 Emergency Support
          </h2>
          <p className="text-teal-100 mb-6">
            If you're experiencing an emergency while traveling, our support team is available around the clock.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                <Phone className="w-5 h-5 mr-2" />
                Emergency Hotline
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SafetyResourcesPage;
