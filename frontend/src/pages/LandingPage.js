import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Plane, Hotel, Calendar, Car, FileText, ShoppingBag, Wallet, Map,
  ArrowRight, Star, ChevronRight, Search, Users, MapPin
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const LandingPage = () => {
  const { theme } = useTheme();
  const [destinations, setDestinations] = useState([]);
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, eventsRes, blogsRes] = await Promise.all([
          axios.get(`${API}/destinations/featured`),
          axios.get(`${API}/events?limit=4`),
          axios.get(`${API}/blog/posts?featured=true&limit=3`)
        ]);
        setDestinations(destRes.data.destinations || []);
        setEvents(eventsRes.data.events || []);
        setBlogs(blogsRes.data.posts || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const services = [
    { icon: Plane, title: 'Flights', desc: 'Find the best deals', link: '/flights', color: 'text-blue-500' },
    { icon: Hotel, title: 'Hotels', desc: 'Luxury to budget stays', link: '/hotels', color: 'text-amber-500' },
    { icon: Calendar, title: 'Events', desc: 'Tours & experiences', link: '/events', color: 'text-emerald-500' },
    { icon: Car, title: 'Vehicles', desc: 'Cars & bikes rental', link: '/vehicles', color: 'text-purple-500' },
    { icon: FileText, title: 'Visa', desc: 'Hassle-free processing', link: '/visa', color: 'text-red-500' },
    { icon: Map, title: 'Itinerary', desc: 'Plan your trip', link: '/itinerary', color: 'text-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" data-testid="hero-section">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1653959747793-c7c3775665f0?w=1920"
            alt="Tropical paradise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 brand-glow" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 text-white animate-fade-in">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Discover 200+ Destinations
              </Badge>
              <h1 className="font-serif text-5xl md:text-7xl font-semibold tracking-tight leading-none mb-6">
                Your Journey<br />
                <span className="text-primary">Begins Here</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-xl mb-8 leading-relaxed">
                Explore the world's most breathtaking destinations with exclusive deals on flights, hotels, and unforgettable experiences.
              </p>

              {/* Search Box */}
              <div className="glass rounded-2xl p-6 max-w-2xl" data-testid="hero-search-box">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input
                        placeholder="Where to?"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="destination-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input
                        type="date"
                        className="pl-10 bg-white/10 border-white/20 text-white"
                        data-testid="date-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Travelers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input
                        type="number"
                        placeholder="2"
                        min="1"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        data-testid="travelers-input"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 btn-pill bg-secondary hover:bg-secondary/90 text-white"
                  data-testid="search-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explore Destinations
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="md:col-span-4 hidden md:block">
              <div className="glass rounded-2xl p-6 animate-fade-in stagger-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">50K+</p>
                      <p className="text-sm text-white/60">Happy Travelers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">200+</p>
                      <p className="text-sm text-white/60">Destinations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">4.9</p>
                      <p className="text-sm text-white/60">Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/30" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for the perfect trip, all in one place
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <Link
                key={service.title}
                to={service.link}
                className="group"
                data-testid={`service-${service.title.toLowerCase()}`}
              >
                <Card className="h-full card-hover border-0 shadow-soft">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl ${service.color} bg-current/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className={`w-7 h-7 ${service.color}`} />
                    </div>
                    <h3 className="font-semibold mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 px-6 md:px-12 lg:px-20" data-testid="destinations-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-2">Featured Destinations</h2>
              <p className="text-muted-foreground">Handpicked places for your next adventure</p>
            </div>
            <Link to="/destinations">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {destinations.slice(0, 4).map((dest, index) => (
              <div
                key={dest.id}
                className={`${index === 0 ? 'md:col-span-8 md:row-span-2' : 'md:col-span-4'} group relative rounded-2xl overflow-hidden card-hover`}
                data-testid={`destination-card-${index}`}
              >
                <div className={`${index === 0 ? 'h-[500px]' : 'h-[240px]'} relative`}>
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover img-zoom"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-condensed tracking-wide text-sm">{dest.rating}</span>
                    </div>
                    <h3 className={`font-serif ${index === 0 ? 'text-3xl' : 'text-xl'} mb-1`}>{dest.name}</h3>
                    <p className="text-white/80 text-sm">{dest.country}</p>
                    <p className="mt-2 font-condensed tracking-wide">
                      From <span className="text-secondary font-bold">${dest.price_from}</span>/night
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Experiences */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/30" data-testid="events-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-2">Events & Experiences</h2>
              <p className="text-muted-foreground">Unique adventures waiting for you</p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <Link
                key={event.event_id}
                to={`/events/${event.event_id}`}
                data-testid={`event-card-${index}`}
              >
                <Card className="h-full card-hover border-0 shadow-soft overflow-hidden">
                  <div className="h-48 relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-secondary text-white border-0">
                      {event.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif text-lg mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.city}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-condensed tracking-wide text-primary font-bold">
                        ${event.price}
                      </span>
                      <span className="text-xs text-muted-foreground">{event.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1706066954162-d557cc64a163?w=1920"
            alt="Adventure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust Foster Tours for their dream vacations. Sign up today and get exclusive deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="btn-pill bg-white text-primary hover:bg-white/90" data-testid="cta-signup-btn">
                Get Started Free
              </Button>
            </Link>
            <Link to="/flights">
              <Button variant="outline" className="btn-pill border-white text-white hover:bg-white/10" data-testid="cta-explore-btn">
                Explore Flights <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-6 md:px-12 lg:px-20" data-testid="blog-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-2">Travel Stories</h2>
              <p className="text-muted-foreground">Tips, guides, and inspiration</p>
            </div>
            <Link to="/blog">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                Read More <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, index) => (
              <Link
                key={post.post_id}
                to={`/blog/${post.slug}`}
                data-testid={`blog-card-${index}`}
              >
                <Card className="h-full card-hover border-0 shadow-soft overflow-hidden">
                  <div className="h-56 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover img-zoom"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                    <h3 className="font-serif text-xl mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author_image}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.read_time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
