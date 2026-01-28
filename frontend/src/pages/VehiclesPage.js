import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Car, MapPin, Users, Fuel, Settings, Loader2, Search
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('all');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        let params = [];
        if (vehicleType !== 'all') params.push(`vehicle_type=${vehicleType}`);
        if (location) params.push(`location=${location}`);
        const query = params.length > 0 ? `?${params.join('&')}` : '';
        const response = await axios.get(`${API}/vehicles${query}`);
        setVehicles(response.data.vehicles || []);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [vehicleType, location]);

  const vehicleTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'car', label: 'Cars' },
    { value: 'suv', label: 'SUVs' },
    { value: 'bike', label: 'Bikes' },
    { value: 'van', label: 'Vans' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="vehicles-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1674476459501-47466da1dbbc?w=1920"
            alt="Vehicle rental"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Vehicle Rentals</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Rent cars, SUVs, bikes, and vans for your travels
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6 md:px-12 lg:px-20 border-b">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Pick-up location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                      data-testid="location-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger data-testid="type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full btn-pill bg-primary" data-testid="search-btn">
                    <Search className="w-4 h-4 mr-2" />
                    Search Vehicles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl mb-2">No vehicles found</h3>
              <p className="text-muted-foreground">Try a different location or type</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, index) => (
                <Link key={vehicle.vehicle_id} to={`/vehicles/${vehicle.vehicle_id}`} data-testid={`vehicle-card-${index}`}>
                  <Card className="h-full border-0 shadow-soft card-hover overflow-hidden">
                    <div className="h-48 relative">
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-4 left-4 ${vehicle.available ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                        {vehicle.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-serif text-lg">{vehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{vehicle.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" />
                        {vehicle.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vehicle.seats} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Settings className="w-4 h-4" />
                          {vehicle.transmission}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${vehicle.price_per_day}</p>
                          <p className="text-xs text-muted-foreground">per day</p>
                        </div>
                        <Button className="btn-pill bg-secondary" disabled={!vehicle.available}>
                          Book Now
                        </Button>
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

export default VehiclesPage;
