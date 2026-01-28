import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Plane, Hotel, Car, Utensils, Camera, Map, Users, Calendar,
  Check, Star, Clock, ArrowRight, Sparkles, Shield, Heart
} from 'lucide-react';

const PackagesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Packages' },
    { id: 'honeymoon', label: 'Honeymoon' },
    { id: 'family', label: 'Family' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'budget', label: 'Budget-Friendly' },
  ];

  const packages = [
    {
      id: 1,
      name: 'Dubai Luxury Escape',
      category: 'luxury',
      duration: '5 Days / 4 Nights',
      groupSize: '2-6 People',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      price: 2499,
      originalPrice: 2999,
      rating: 4.9,
      reviews: 156,
      featured: true,
      includes: ['5-Star Hotel', 'Return Flights', 'Desert Safari', 'City Tour', 'Airport Transfer', 'Breakfast'],
      highlights: [
        'Stay at Atlantis The Palm',
        'Private Desert Safari with BBQ Dinner',
        'Burj Khalifa Observation Deck',
        'Dubai Mall Shopping Tour'
      ]
    },
    {
      id: 2,
      name: 'Maldives Honeymoon Paradise',
      category: 'honeymoon',
      duration: '6 Days / 5 Nights',
      groupSize: '2 People',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      price: 3999,
      originalPrice: 4599,
      rating: 4.95,
      reviews: 89,
      featured: true,
      includes: ['Overwater Villa', 'Return Flights', 'Sunset Cruise', 'Spa Treatment', 'All Meals', 'Speedboat Transfer'],
      highlights: [
        'Private Overwater Bungalow',
        'Couples Spa Experience',
        'Romantic Sunset Cruise',
        'Underwater Restaurant Dinner'
      ]
    },
    {
      id: 3,
      name: 'Paris Romance Package',
      category: 'honeymoon',
      duration: '4 Days / 3 Nights',
      groupSize: '2 People',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      price: 1899,
      originalPrice: 2299,
      rating: 4.8,
      reviews: 234,
      featured: false,
      includes: ['4-Star Hotel', 'Return Flights', 'Eiffel Tower Tour', 'Seine Cruise', 'Breakfast'],
      highlights: [
        'Eiffel Tower Skip-the-Line',
        'Seine River Dinner Cruise',
        'Louvre Museum Guided Tour',
        'Montmartre Walking Tour'
      ]
    },
    {
      id: 4,
      name: 'Bali Family Adventure',
      category: 'family',
      duration: '7 Days / 6 Nights',
      groupSize: '4-6 People',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      price: 2199,
      originalPrice: 2599,
      rating: 4.85,
      reviews: 178,
      featured: true,
      includes: ['Family Resort', 'Return Flights', 'Temple Tours', 'Rice Terrace Visit', 'Water Sports', 'All Meals'],
      highlights: [
        'Kid-Friendly Resort with Pool',
        'Monkey Forest Adventure',
        'Water Sports Activities',
        'Traditional Dance Show'
      ]
    },
    {
      id: 5,
      name: 'South Africa Safari',
      category: 'adventure',
      duration: '8 Days / 7 Nights',
      groupSize: '2-8 People',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      price: 3499,
      originalPrice: 3999,
      rating: 4.9,
      reviews: 145,
      featured: false,
      includes: ['Safari Lodge', 'Return Flights', 'Game Drives', 'Cape Town Tour', 'Wine Tasting', 'All Meals'],
      highlights: [
        'Big Five Safari Experience',
        'Table Mountain Cable Car',
        'Cape Winelands Tour',
        'Penguin Colony Visit'
      ]
    },
    {
      id: 6,
      name: 'Turkey Explorer',
      category: 'budget',
      duration: '6 Days / 5 Nights',
      groupSize: '2-10 People',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
      price: 899,
      originalPrice: 1199,
      rating: 4.7,
      reviews: 312,
      featured: false,
      includes: ['3-Star Hotel', 'Return Flights', 'Istanbul Tour', 'Cappadocia Visit', 'Breakfast', 'Airport Transfer'],
      highlights: [
        'Blue Mosque & Hagia Sophia',
        'Cappadocia Hot Air Balloon',
        'Grand Bazaar Shopping',
        'Bosphorus Cruise'
      ]
    },
    {
      id: 7,
      name: 'Swiss Alps Adventure',
      category: 'adventure',
      duration: '5 Days / 4 Nights',
      groupSize: '2-6 People',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      price: 2799,
      originalPrice: 3299,
      rating: 4.85,
      reviews: 98,
      featured: false,
      includes: ['Mountain Resort', 'Return Flights', 'Glacier Express', 'Ski Pass', 'Breakfast', 'Cable Cars'],
      highlights: [
        'Glacier Express Train Ride',
        'Jungfrau Peak Visit',
        'Skiing/Snowboarding',
        'Swiss Chocolate Factory'
      ]
    },
    {
      id: 8,
      name: 'Thailand Family Fun',
      category: 'family',
      duration: '6 Days / 5 Nights',
      groupSize: '4-8 People',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
      price: 1599,
      originalPrice: 1999,
      rating: 4.75,
      reviews: 203,
      featured: false,
      includes: ['Family Resort', 'Return Flights', 'Bangkok Tour', 'Beach Days', 'Elephant Sanctuary', 'Breakfast'],
      highlights: [
        'Ethical Elephant Sanctuary',
        'Grand Palace Tour',
        'Phuket Beach Resort',
        'Thai Cooking Class'
      ]
    },
  ];

  const filteredPackages = activeCategory === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.category === activeCategory);

  const featuredPackages = packages.filter(pkg => pkg.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <Badge className="bg-orange-500 text-white mb-4">Limited Time Offers</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Travel Packages
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              All-inclusive travel packages designed for every type of traveler. 
              Save up to 30% when you book a complete package.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Handpicked Experiences</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  activeCategory === category.id 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      {activeCategory === 'all' && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                Featured Packages
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => (
                <Card key={pkg.id} className="border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 relative">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-orange-500 text-white">Featured</Badge>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {pkg.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {pkg.groupSize}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{pkg.rating}</span>
                      <span className="text-slate-500 text-sm">({pkg.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.includes.slice(0, 4).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t dark:border-slate-700">
                      <div>
                        <p className="text-slate-500 line-through text-sm">${pkg.originalPrice}</p>
                        <p className="text-2xl font-bold text-teal-600">${pkg.price}</p>
                        <p className="text-xs text-slate-500">per person</p>
                      </div>
                      <Link to={`/flights`}>
                        <Button className="bg-teal-600 hover:bg-teal-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Packages Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">
            {activeCategory === 'all' ? 'All Packages' : categories.find(c => c.id === activeCategory)?.label}
            <span className="text-slate-500 font-normal text-lg ml-2">({filteredPackages.length})</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pkg.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-orange-500 text-white text-xs">Featured</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">{pkg.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{pkg.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {pkg.groupSize}
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Check className="w-4 h-4 text-teal-500" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t dark:border-slate-700">
                      <div>
                        <p className="text-slate-500 line-through text-sm">${pkg.originalPrice}</p>
                        <p className="text-xl font-bold text-teal-600">${pkg.price}<span className="text-sm font-normal text-slate-500">/person</span></p>
                      </div>
                      <Link to={`/flights`}>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          Book Now <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              What's Included in Our Packages
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every Foster Tours package is designed to give you a hassle-free travel experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Plane, label: 'Return Flights' },
              { icon: Hotel, label: 'Accommodation' },
              { icon: Car, label: 'Airport Transfers' },
              { icon: Map, label: 'Guided Tours' },
              { icon: Utensils, label: 'Meals Included' },
              { icon: Camera, label: 'Activities' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Need a Custom Package?
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Our travel experts can create a personalized itinerary just for you. 
            Tell us your dream destination and preferences.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/itinerary/ai">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                <Sparkles className="w-5 h-5 mr-2" />
                Use AI Trip Planner
              </Button>
            </Link>
            <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PackagesPage;
