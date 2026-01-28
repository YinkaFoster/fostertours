import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plane, Hotel, Calendar, Car, FileText, Wallet, Map, ArrowRight,
  Clock, MapPin, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, itinerariesRes] = await Promise.all([
          axios.get(`${API}/bookings`, {
            headers: getAuthHeaders(),
            withCredentials: true
          }),
          axios.get(`${API}/itineraries`, {
            headers: getAuthHeaders(),
            withCredentials: true
          })
        ]);
        setBookings(bookingsRes.data.bookings || []);
        setItineraries(itinerariesRes.data.itineraries || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: { variant: 'default', icon: CheckCircle, className: 'bg-green-500' },
      pending: { variant: 'secondary', icon: AlertCircle, className: 'bg-amber-500' },
      cancelled: { variant: 'destructive', icon: XCircle, className: 'bg-red-500' },
      completed: { variant: 'default', icon: CheckCircle, className: 'bg-blue-500' }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={`${config.className} text-white`}>
        <config.icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBookingIcon = (type) => {
    const icons = {
      flight: Plane,
      hotel: Hotel,
      event: Calendar,
      vehicle: Car,
      visa: FileText
    };
    return icons[type] || Plane;
  };

  const quickActions = [
    { icon: Plane, label: 'Book Flight', href: '/flights', color: 'text-blue-500' },
    { icon: Hotel, label: 'Find Hotel', href: '/hotels', color: 'text-amber-500' },
    { icon: Calendar, label: 'Browse Events', href: '/events', color: 'text-emerald-500' },
    { icon: Map, label: 'Plan Trip', href: '/itinerary/builder', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}
            </h1>
            <p className="text-muted-foreground">
              Manage your bookings, itineraries, and travel plans
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-soft" data-testid="wallet-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold">${user?.wallet_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <Link to="/wallet">
                  <Button variant="link" className="mt-2 p-0 h-auto text-primary">
                    Top up <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft" data-testid="bookings-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => b.status !== 'cancelled').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft" data-testid="trips-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Map className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saved Trips</p>
                    <p className="text-2xl font-bold">{itineraries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft" data-testid="completed-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-serif text-xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href} data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}>
                  <Card className="border-0 shadow-soft card-hover">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${action.color} bg-current/10 flex items-center justify-center`}>
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Bookings & Itineraries */}
          <Tabs defaultValue="bookings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bookings" data-testid="bookings-tab">My Bookings</TabsTrigger>
              <TabsTrigger value="itineraries" data-testid="itineraries-tab">My Itineraries</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : bookings.length === 0 ? (
                <Card className="border-0 shadow-soft">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-xl mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">Start planning your next adventure!</p>
                    <Link to="/flights">
                      <Button className="btn-pill bg-primary">Search Flights</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const Icon = getBookingIcon(booking.booking_type);
                    return (
                      <Card key={booking.booking_id} className="border-0 shadow-soft" data-testid={`booking-${booking.booking_id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">
                                  {booking.item_details?.name || booking.item_details?.title || 'Booking'}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {booking.item_details?.location || booking.item_details?.destination || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(booking.status)}
                              <p className="text-lg font-bold mt-2">${booking.total_amount?.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="itineraries" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : itineraries.length === 0 ? (
                <Card className="border-0 shadow-soft">
                  <CardContent className="py-12 text-center">
                    <Map className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-xl mb-2">No itineraries yet</h3>
                    <p className="text-muted-foreground mb-4">Create your perfect trip plan!</p>
                    <Link to="/itinerary/builder">
                      <Button className="btn-pill bg-primary">Create Itinerary</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itineraries.map((itinerary) => (
                    <Link key={itinerary.itinerary_id} to={`/itinerary/${itinerary.itinerary_id}`}>
                      <Card className="border-0 shadow-soft card-hover h-full" data-testid={`itinerary-${itinerary.itinerary_id}`}>
                        <CardContent className="p-6">
                          <h3 className="font-serif text-lg mb-2">{itinerary.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {itinerary.start_date} - {itinerary.end_date}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {itinerary.destinations?.slice(0, 3).map((dest, i) => (
                              <Badge key={i} variant="secondary">{dest}</Badge>
                            ))}
                            {itinerary.destinations?.length > 3 && (
                              <Badge variant="outline">+{itinerary.destinations.length - 3}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
