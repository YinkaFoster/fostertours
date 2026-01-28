import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search, MapPin, Star, Plane, Calendar, Users, ArrowRight,
  Sun, Umbrella, Mountain, Building2, Palmtree, Compass
} from 'lucide-react';

const DestinationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Destinations', icon: Compass },
    { id: 'beach', label: 'Beach', icon: Palmtree },
    { id: 'city', label: 'City Break', icon: Building2 },
    { id: 'adventure', label: 'Adventure', icon: Mountain },
    { id: 'tropical', label: 'Tropical', icon: Sun },
  ];

  const destinations = [
    {
      id: 1,
      name: 'Dubai, UAE',
      country: 'United Arab Emirates',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      category: 'city',
      rating: 4.9,
      reviews: 2450,
      priceFrom: 850,
      description: 'Experience luxury shopping, ultramodern architecture, and vibrant nightlife.',
      highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
      bestTime: 'Nov - Mar'
    },
    {
      id: 2,
      name: 'Maldives',
      country: 'Republic of Maldives',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      category: 'beach',
      rating: 4.95,
      reviews: 1890,
      priceFrom: 1200,
      description: 'Paradise islands with crystal-clear waters and overwater bungalows.',
      highlights: ['Overwater Villas', 'Snorkeling', 'Spa Retreats', 'Sunset Cruises'],
      bestTime: 'Nov - Apr'
    },
    {
      id: 3,
      name: 'Paris, France',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      category: 'city',
      rating: 4.8,
      reviews: 3200,
      priceFrom: 750,
      description: 'The city of lights, love, art, and world-renowned cuisine.',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Champs-Élysées', 'Notre-Dame'],
      bestTime: 'Apr - Jun, Sep - Oct'
    },
    {
      id: 4,
      name: 'Bali, Indonesia',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      category: 'tropical',
      rating: 4.85,
      reviews: 2100,
      priceFrom: 600,
      description: 'Tropical paradise with ancient temples, rice terraces, and beaches.',
      highlights: ['Ubud Temples', 'Rice Terraces', 'Beach Clubs', 'Volcano Tours'],
      bestTime: 'Apr - Oct'
    },
    {
      id: 5,
      name: 'Cape Town',
      country: 'South Africa',
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
      category: 'adventure',
      rating: 4.75,
      reviews: 1650,
      priceFrom: 700,
      description: 'Where mountains meet the ocean with incredible wildlife and wine.',
      highlights: ['Table Mountain', 'Cape Point', 'Wine Tours', 'Safari'],
      bestTime: 'Oct - Mar'
    },
    {
      id: 6,
      name: 'Santorini, Greece',
      country: 'Greece',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      category: 'beach',
      rating: 4.9,
      reviews: 1980,
      priceFrom: 900,
      description: 'Iconic white-washed buildings with stunning sunsets over the Aegean.',
      highlights: ['Oia Sunset', 'Volcanic Beaches', 'Wine Tasting', 'Boat Tours'],
      bestTime: 'Apr - Oct'
    },
    {
      id: 7,
      name: 'Tokyo, Japan',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      category: 'city',
      rating: 4.85,
      reviews: 2800,
      priceFrom: 950,
      description: 'A blend of ultramodern and traditional, from neon-lit streets to ancient temples.',
      highlights: ['Shibuya Crossing', 'Mt. Fuji', 'Sensoji Temple', 'Akihabara'],
      bestTime: 'Mar - May, Sep - Nov'
    },
    {
      id: 8,
      name: 'Zanzibar',
      country: 'Tanzania',
      image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800',
      category: 'beach',
      rating: 4.7,
      reviews: 1200,
      priceFrom: 550,
      description: 'Exotic spice island with pristine beaches and rich Swahili culture.',
      highlights: ['Stone Town', 'Spice Tours', 'Dolphin Watching', 'Snorkeling'],
      bestTime: 'Jun - Oct'
    },
    {
      id: 9,
      name: 'Swiss Alps',
      country: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      category: 'adventure',
      rating: 4.9,
      reviews: 1550,
      priceFrom: 1100,
      description: 'Majestic mountain landscapes perfect for skiing and hiking adventures.',
      highlights: ['Matterhorn', 'Jungfrau', 'Glacier Express', 'Ski Resorts'],
      bestTime: 'Dec - Mar, Jun - Sep'
    },
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Explore Our Destinations
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              Discover breathtaking destinations around the world. From tropical beaches to 
              bustling cities, find your perfect getaway.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-slate-900 border-0 rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeCategory === category.id 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              {filteredDestinations.length} Destinations Found
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm">
                      {destination.category.charAt(0).toUpperCase() + destination.category.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-slate-900">{destination.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {destination.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.highlights.slice(0, 3).map((highlight, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">Starting from</p>
                      <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                        ${destination.priceFrom}
                      </p>
                    </div>
                    <Link to={`/flights?destination=${encodeURIComponent(destination.name)}`}>
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        Explore <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-16">
              <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No destinations found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or explore all destinations.
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Can't Find Your Dream Destination?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Our travel experts can help you discover hidden gems and create custom itineraries 
            tailored to your preferences.
          </p>
          <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              Chat With Our Experts
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DestinationsPage;
