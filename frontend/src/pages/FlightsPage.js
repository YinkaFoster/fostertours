import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import {
  Plane, Search, ArrowRight, Clock, Loader2, Filter, SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const FlightsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');

  // Filters
  const [maxPrice, setMaxPrice] = useState([2000]);
  const [maxStops, setMaxStops] = useState('any');
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  const popularAirlines = ['Emirates', 'Qatar Airways', 'Singapore Airlines', 'Lufthansa', 'British Airways'];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/flights/search`, {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: departureDate,
        return_date: returnDate || null,
        passengers,
        cabin_class: cabinClass
      });
      setFlights(response.data.flights || []);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlights = flights.filter(flight => {
    if (flight.price > maxPrice[0]) return false;
    if (maxStops !== 'any' && flight.stops > parseInt(maxStops)) return false;
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) return false;
    return true;
  });

  const handleBookFlight = (flight) => {
    navigate(`/booking/flight/${flight.flight_id}`, { state: { flight } });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="flights-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1759173342374-f7702ead3a02?w=1920"
            alt="Airplane cabin"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12">
          <div className="text-center text-white mb-8">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Find Your Perfect Flight</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Search hundreds of airlines and compare prices to find the best deal
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0" data-testid="flight-search-form">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      placeholder="City or Airport (e.g., JFK)"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="h-12"
                      data-testid="origin-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      placeholder="City or Airport (e.g., LAX)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-12"
                      data-testid="destination-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departure</Label>
                    <Input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="h-12"
                      data-testid="departure-date-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Return (Optional)</Label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="h-12"
                      data-testid="return-date-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Passengers</Label>
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="h-12"
                      data-testid="passengers-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cabin Class</Label>
                    <Select value={cabinClass} onValueChange={setCabinClass}>
                      <SelectTrigger className="h-12" data-testid="cabin-class-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">Premium Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      className="w-full h-12 btn-pill bg-primary"
                      disabled={loading}
                      data-testid="search-flights-btn"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Search Flights
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-soft sticky top-24" data-testid="filters-panel">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <SlidersHorizontal className="w-5 h-5" />
                      <h3 className="font-semibold">Filters</h3>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <Label className="mb-3 block">Max Price: ${maxPrice[0]}</Label>
                      <Slider
                        value={maxPrice}
                        onValueChange={setMaxPrice}
                        max={3000}
                        step={50}
                        className="mt-2"
                        data-testid="price-slider"
                      />
                    </div>

                    {/* Stops */}
                    <div className="mb-6">
                      <Label className="mb-3 block">Stops</Label>
                      <Select value={maxStops} onValueChange={setMaxStops}>
                        <SelectTrigger data-testid="stops-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="0">Non-stop only</SelectItem>
                          <SelectItem value="1">1 stop or less</SelectItem>
                          <SelectItem value="2">2 stops or less</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Airlines */}
                    <div>
                      <Label className="mb-3 block">Airlines</Label>
                      <div className="space-y-2">
                        {popularAirlines.map((airline) => (
                          <div key={airline} className="flex items-center gap-2">
                            <Checkbox
                              id={airline}
                              checked={selectedAirlines.includes(airline)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAirlines([...selectedAirlines, airline]);
                                } else {
                                  setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                }
                              }}
                            />
                            <label htmlFor={airline} className="text-sm cursor-pointer">
                              {airline}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl">
                    {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Found
                  </h2>
                  <Select defaultValue="price">
                    <SelectTrigger className="w-40" data-testid="sort-select">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Lowest Price</SelectItem>
                      <SelectItem value="duration">Shortest Duration</SelectItem>
                      <SelectItem value="departure">Departure Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredFlights.length === 0 ? (
                  <Card className="border-0 shadow-soft">
                    <CardContent className="py-12 text-center">
                      <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-serif text-xl mb-2">No flights found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredFlights.map((flight, index) => (
                      <Card key={flight.flight_id} className="border-0 shadow-soft card-hover" data-testid={`flight-card-${index}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Airline Info */}
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                <Plane className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{flight.airline}</p>
                                <p className="text-sm text-muted-foreground font-condensed tracking-wide">
                                  {flight.flight_number}
                                </p>
                              </div>
                            </div>

                            {/* Flight Details */}
                            <div className="flex-1 flex items-center justify-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{flight.departure_time}</p>
                                <p className="text-sm text-muted-foreground">{flight.origin}</p>
                              </div>
                              <div className="flex-1 max-w-32 flex flex-col items-center">
                                <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                                <div className="w-full h-0.5 bg-border relative">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                  {flight.stops > 0 && (
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-secondary" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{flight.arrival_time}</p>
                                <p className="text-sm text-muted-foreground">{flight.destination}</p>
                              </div>
                            </div>

                            {/* Price & Book */}
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary">${flight.price}</p>
                              <p className="text-xs text-muted-foreground mb-2">per person</p>
                              <Button
                                className="btn-pill bg-secondary"
                                onClick={() => handleBookFlight(flight)}
                                data-testid={`book-flight-${index}`}
                              >
                                Select <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {flight.cabin_class}
                            </span>
                            <Badge variant="outline">{flight.available_seats} seats left</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Routes */}
      {!searched && (
        <section className="py-12 px-6 md:px-12 lg:px-20 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl mb-8 text-center">Popular Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { from: 'New York', to: 'London', price: 450, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
                { from: 'Los Angeles', to: 'Tokyo', price: 680, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
                { from: 'Miami', to: 'Paris', price: 520, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
              ].map((route, i) => (
                <Card key={i} className="border-0 shadow-soft card-hover overflow-hidden" data-testid={`popular-route-${i}`}>
                  <div className="h-40 relative">
                    <img src={route.image} alt={route.to} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 hero-overlay" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{route.from}</p>
                        <p className="text-sm text-muted-foreground">to {route.to}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">from</p>
                        <p className="text-xl font-bold text-primary">${route.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default FlightsPage;
