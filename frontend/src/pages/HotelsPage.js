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
  Hotel, Search, Star, MapPin, Wifi, Car, Dumbbell, Utensils, Waves, Loader2, SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const HotelsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [searched, setSearched] = useState(false);

  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // Filters
  const [maxPrice, setMaxPrice] = useState([500]);
  const [minRating, setMinRating] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'pool', label: 'Pool', icon: Waves },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location || !checkIn || !checkOut) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/hotels/search`, {
        location,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        rooms
      });
      setHotels(response.data.hotels || []);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    if (hotel.price_per_night > maxPrice[0]) return false;
    if (minRating !== 'any' && hotel.rating < parseFloat(minRating)) return false;
    if (selectedAmenities.length > 0) {
      const hotelAmenities = hotel.amenities.map(a => a.toLowerCase());
      if (!selectedAmenities.every(a => hotelAmenities.some(ha => ha.includes(a)))) return false;
    }
    return true;
  });

  const handleViewHotel = (hotel) => {
    navigate(`/hotels/${hotel.hotel_id}`, { state: { hotel, checkIn, checkOut, guests, rooms } });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="hotels-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1702830499141-a0634d87d6af?w=1920"
            alt="Luxury hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12">
          <div className="text-center text-white mb-8">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Find Your Perfect Stay</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              From luxury resorts to cozy boutique hotels - discover accommodations worldwide
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0" data-testid="hotel-search-form">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="City, region, or hotel name"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-12 pl-10"
                        data-testid="location-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Check In</Label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="h-12"
                      data-testid="checkin-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check Out</Label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-12"
                      data-testid="checkout-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Guests</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="h-12"
                      data-testid="guests-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value))}
                      className="h-12"
                      data-testid="rooms-input"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      className="w-full h-12 btn-pill bg-primary"
                      disabled={loading}
                      data-testid="search-hotels-btn"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Search Hotels
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
                      <Label className="mb-3 block">Max Price/Night: ${maxPrice[0]}</Label>
                      <Slider
                        value={maxPrice}
                        onValueChange={setMaxPrice}
                        max={1000}
                        step={25}
                        className="mt-2"
                        data-testid="price-slider"
                      />
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                      <Label className="mb-3 block">Minimum Rating</Label>
                      <Select value={minRating} onValueChange={setMinRating}>
                        <SelectTrigger data-testid="rating-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="4.5">4.5+ Excellent</SelectItem>
                          <SelectItem value="4.0">4.0+ Very Good</SelectItem>
                          <SelectItem value="3.5">3.5+ Good</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities */}
                    <div>
                      <Label className="mb-3 block">Amenities</Label>
                      <div className="space-y-2">
                        {amenitiesList.map((amenity) => (
                          <div key={amenity.id} className="flex items-center gap-2">
                            <Checkbox
                              id={amenity.id}
                              checked={selectedAmenities.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAmenities([...selectedAmenities, amenity.id]);
                                } else {
                                  setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.id));
                                }
                              }}
                            />
                            <label htmlFor={amenity.id} className="text-sm cursor-pointer flex items-center gap-2">
                              <amenity.icon className="w-4 h-4" />
                              {amenity.label}
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
                    {filteredHotels.length} Hotel{filteredHotels.length !== 1 ? 's' : ''} Found
                  </h2>
                  <Select defaultValue="price">
                    <SelectTrigger className="w-40" data-testid="sort-select">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Lowest Price</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredHotels.length === 0 ? (
                  <Card className="border-0 shadow-soft">
                    <CardContent className="py-12 text-center">
                      <Hotel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-serif text-xl mb-2">No hotels found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredHotels.map((hotel, index) => (
                      <Card key={hotel.hotel_id} className="border-0 shadow-soft card-hover overflow-hidden" data-testid={`hotel-card-${index}`}>
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="md:w-72 h-48 md:h-auto relative">
                            <img
                              src={hotel.image_url}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row justify-between h-full">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {hotel.rating}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {hotel.reviews_count} reviews
                                  </span>
                                </div>
                                <h3 className="font-serif text-xl mb-2">{hotel.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                  <MapPin className="w-4 h-4" />
                                  {hotel.location}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {hotel.amenities.slice(0, 4).map((amenity, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {hotel.amenities.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{hotel.amenities.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Price & Book */}
                              <div className="md:text-right mt-4 md:mt-0 md:ml-6 md:border-l md:border-border md:pl-6">
                                <p className="text-sm text-muted-foreground">per night</p>
                                <p className="text-3xl font-bold text-primary">${hotel.price_per_night}</p>
                                <Button
                                  className="btn-pill bg-secondary mt-3"
                                  onClick={() => handleViewHotel(hotel)}
                                  data-testid={`view-hotel-${index}`}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Hotels */}
      {!searched && (
        <section className="py-12 px-6 md:px-12 lg:px-20 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl mb-8 text-center">Featured Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'The Ritz Paris', location: 'Paris, France', rating: 4.9, price: 850, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800' },
                { name: 'Aman Tokyo', location: 'Tokyo, Japan', rating: 4.8, price: 620, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800' },
                { name: 'Burj Al Arab', location: 'Dubai, UAE', rating: 4.9, price: 1200, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
              ].map((hotel, i) => (
                <Card key={i} className="border-0 shadow-soft card-hover overflow-hidden" data-testid={`featured-hotel-${i}`}>
                  <div className="h-48 relative">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover img-zoom" />
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-0 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      {hotel.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif text-lg mb-1">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {hotel.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">from</p>
                        <p className="text-xl font-bold text-primary">${hotel.price}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
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

export default HotelsPage;
