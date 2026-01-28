import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Newspaper, Download, Mail, Calendar, ArrowRight,
  Award, TrendingUp, Users, Globe, Camera, FileText
} from 'lucide-react';

const PressRoomPage = () => {
  const pressReleases = [
    {
      date: 'January 15, 2025',
      title: 'Foster Tours Launches AI-Powered Trip Planner',
      excerpt: 'Revolutionary AI technology helps travelers create personalized itineraries in minutes.',
      category: 'Product Launch'
    },
    {
      date: 'December 10, 2024',
      title: 'Foster Tours Expands to 150+ Destinations',
      excerpt: 'Continued growth sees the addition of 25 new destinations across Asia and Europe.',
      category: 'Expansion'
    },
    {
      date: 'November 5, 2024',
      title: 'Foster Tours Named Best Travel Agency 2024',
      excerpt: 'Recognition for outstanding customer service and innovative travel solutions.',
      category: 'Award'
    },
    {
      date: 'October 20, 2024',
      title: 'Partnership with Major Airlines Announced',
      excerpt: 'New partnerships bring exclusive deals and better connectivity for customers.',
      category: 'Partnership'
    },
    {
      date: 'September 1, 2024',
      title: 'Foster Tours Reaches 50,000 Happy Travelers',
      excerpt: 'Milestone achievement celebrates a decade of creating memorable travel experiences.',
      category: 'Milestone'
    },
  ];

  const mediaAssets = [
    { name: 'Logo Package (PNG, SVG)', size: '2.5 MB', type: 'logos' },
    { name: 'Brand Guidelines', size: '4.2 MB', type: 'guidelines' },
    { name: 'Executive Photos', size: '8.1 MB', type: 'photos' },
    { name: 'Product Screenshots', size: '12.3 MB', type: 'screenshots' },
  ];

  const companyFacts = [
    { icon: Calendar, label: 'Founded', value: '2014' },
    { icon: Users, label: 'Travelers Served', value: '50,000+' },
    { icon: Globe, label: 'Destinations', value: '150+' },
    { icon: TrendingUp, label: 'YoY Growth', value: '40%' },
  ];

  const coverage = [
    { publication: 'TechCabal', title: 'How Foster Tours is Revolutionizing Travel in Africa' },
    { publication: 'Guardian Nigeria', title: 'Nigerian Travel Startup Expands Globally' },
    { publication: 'BusinessDay', title: 'The Rise of Digital Travel Agencies in Nigeria' },
    { publication: 'Punch', title: 'Foster Tours: Making World Travel Accessible' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <Newspaper className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Press Room
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Latest news, press releases, and media resources about Foster Tours.
            </p>
            <a href="mailto:press@fostertours.com">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                <Mail className="w-5 h-5 mr-2" />
                Media Inquiries
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyFacts.map((fact, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-3">
                  <fact.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{fact.value}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">
            Press Releases
          </h2>
          <div className="space-y-6">
            {pressReleases.map((release, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">{release.category}</Badge>
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {release.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {release.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {release.excerpt}
                      </p>
                    </div>
                    <Button variant="outline" className="flex-shrink-0">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">
            In the News
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {coverage.map((item, idx) => (
              <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <p className="text-teal-600 dark:text-teal-400 font-medium text-sm mb-2">
                    {item.publication}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">
            Media Assets
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaAssets.map((asset, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    {asset.type === 'logos' && <Camera className="w-6 h-6 text-slate-600" />}
                    {asset.type === 'guidelines' && <FileText className="w-6 h-6 text-slate-600" />}
                    {asset.type === 'photos' && <Users className="w-6 h-6 text-slate-600" />}
                    {asset.type === 'screenshots' && <Globe className="w-6 h-6 text-slate-600" />}
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">{asset.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{asset.size}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                About Foster Tours
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Founded in 2014, Foster Tours has grown to become one of Nigeria's leading travel agencies, 
                serving over 50,000 travelers across 150+ destinations worldwide. Our mission is to make 
                world-class travel experiences accessible to everyone through innovative technology and 
                exceptional customer service.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Headquartered in Lagos, Nigeria, Foster Tours offers comprehensive travel services including 
                flight bookings, hotel reservations, visa assistance, vehicle rentals, and curated travel 
                packages. Our AI-powered trip planner and dedicated customer support team ensure every 
                journey is memorable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center text-white">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-serif font-bold mb-4">
            Media Contact
          </h2>
          <p className="text-teal-100 mb-2">
            For press inquiries, interviews, or additional information:
          </p>
          <a href="mailto:press@fostertours.com" className="text-xl font-medium hover:underline">
            press@fostertours.com
          </a>
          <p className="text-teal-200 mt-4 text-sm">
            We typically respond within 24 hours.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PressRoomPage;
