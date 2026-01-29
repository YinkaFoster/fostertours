import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Calendar, MapPin, Clock, Users, Loader2
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = category !== 'all' ? `?category=${category}` : '';
        const response = await axios.get(`${API}/events${params}`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category]);

  const handleSelectEvent = (event) => {
    navigate(`/events/${event.event_id}`, { state: { event } });
  };

  const categories = ['All', 'Safari', 'Food & Culture', 'Nature', 'Adventure', 'City Tours'];

  return (
    <div className="min-h-screen bg-background" data-testid="events-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
            alt="Safari"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Events & Experiences</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover unique tours, local experiences, and unforgettable adventures
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6 md:px-12 lg:px-20 border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat.toLowerCase() || (cat === 'All' && category === 'all') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat.toLowerCase() === 'all' ? 'all' : cat)}
                className="rounded-full"
                data-testid={`category-${cat.toLowerCase()}`}
              >
                {cat}
              </Button>
            ))}
          </div>
          <Select defaultValue="date">
            <SelectTrigger className="w-40" data-testid="sort-select">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Upcoming</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl mb-2">No events found</h3>
              <p className="text-muted-foreground">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <Link key={event.event_id} to={`/events/${event.event_id}`} data-testid={`event-card-${index}`}>
                  <Card className="h-full border-0 shadow-soft card-hover overflow-hidden">
                    <div className="h-56 relative">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover img-zoom"
                      />
                      <Badge className="absolute top-4 left-4 bg-secondary text-white border-0">
                        {event.category}
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white font-condensed tracking-wide text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-serif text-xl mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${event.price}</p>
                          <p className="text-xs text-muted-foreground">per person</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.available_spots} spots left
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;
