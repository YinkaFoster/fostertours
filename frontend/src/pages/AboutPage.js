import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Globe, Users, Award, Heart, Shield, Clock,
  Plane, Hotel, Car, FileText, MapPin, Star
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Travelers', value: '50,000+', icon: Users },
    { label: 'Destinations', value: '150+', icon: MapPin },
    { label: 'Years Experience', value: '10+', icon: Award },
    { label: 'Customer Rating', value: '4.9/5', icon: Star },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We prioritize your satisfaction and strive to exceed your expectations in every journey.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your safety is our priority. We partner only with verified and trusted service providers.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access to destinations worldwide with local expertise and personalized recommendations.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our dedicated team is available around the clock to assist you with any travel needs.'
    },
  ];

  const team = [
    {
      name: 'Adebayo Foster',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      bio: 'Passionate traveler with 15+ years in the tourism industry.'
    },
    {
      name: 'Chioma Okonkwo',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
      bio: 'Expert in logistics and customer experience management.'
    },
    {
      name: 'Emmanuel Nwachukwu',
      role: 'Travel Consultant',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      bio: 'Specialized in African and European destinations.'
    },
    {
      name: 'Fatima Abubakar',
      role: 'Customer Success Lead',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
      bio: 'Dedicated to ensuring every trip is memorable.'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              About Foster Tours
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              Your trusted partner for unforgettable travel experiences since 2014. 
              We believe every journey should be an adventure worth remembering.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/flights">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/partner">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                  <stat.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                A Decade of Creating Travel Memories
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  Foster Tours was founded in 2014 with a simple mission: to make world-class 
                  travel experiences accessible to everyone. What started as a small travel 
                  consultancy in Lagos has grown into one of Nigeria's most trusted travel agencies.
                </p>
                <p>
                  Over the years, we've helped over 50,000 travelers explore destinations across 
                  6 continents. From arranging flights and hotel bookings to curating bespoke 
                  travel packages and handling visa applications, we've become a one-stop solution 
                  for all travel needs.
                </p>
                <p>
                  Our team of experienced travel consultants brings local knowledge and global 
                  expertise to every booking, ensuring you get the best deals and seamless 
                  travel experiences.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" 
                alt="Travel Adventure" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Award Winning</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Best Travel Agency 2023</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              What Drives Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our core values guide everything we do, from planning your trip to ensuring your safe return home.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                    <value.icon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Meet the Experts Behind Your Journeys
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our passionate team of travel enthusiasts is dedicated to making your dream trips a reality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-teal-600 dark:text-teal-400 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Let us help you create memories that last a lifetime. Contact us today to plan your perfect trip.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/flights">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                <Plane className="w-5 h-5 mr-2" />
                Book a Flight
              </Button>
            </Link>
            <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
