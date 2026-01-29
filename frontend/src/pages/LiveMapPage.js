import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  MapPin, Navigation, Users, Share2, UserPlus, UserMinus,
  Loader2, Search, Eye, EyeOff, RefreshCw, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const WS_URL = process.env.REACT_APP_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';

const LiveMapPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [sharedWith, setSharedWith] = useState([]);
  const [friendsLocations, setFriendsLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [watchId, setWatchId] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocationSettings();
      fetchFriendsLocations();
      connectWebSocket();
      loadMap();
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (mapInstanceRef.current && friendsLocations.length > 0) {
      updateMapMarkers();
    }
  }, [friendsLocations]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadMap = async () => {
    // Load Leaflet dynamically
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initializeMap();
      document.body.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const L = window.L;
    const map = L.map(mapRef.current).setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    mapInstanceRef.current = map;
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          setMyLocation({ latitude, longitude });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;
    
    const L = window.L;
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};
    
    // Add markers for friends
    friendsLocations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #14b8a6, #f97316);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
              <span style="color: white; font-weight: bold; font-size: 14px;">
                ${loc.user_name?.[0] || '?'}
              </span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        
        const marker = L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; min-width: 120px;">
              <strong>${loc.user_name}</strong>
              <br/>
              <small style="color: #666;">
                Updated ${formatTimeAgo(loc.updated_at)}
              </small>
            </div>
          `);
        
        markersRef.current[loc.user_id] = marker;
      }
    });
    
    // Fit map to show all markers
    if (friendsLocations.length > 0) {
      const bounds = L.latLngBounds(
        friendsLocations
          .filter(loc => loc.latitude && loc.longitude)
          .map(loc => [loc.latitude, loc.longitude])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const connectWebSocket = () => {
    if (!user?.user_id) return;
    
    try {
      wsRef.current = new WebSocket(`${WS_URL}/ws/location/${user.user_id}`);
      
      wsRef.current.onopen = () => {
        console.log('Location WebSocket connected');
        // Request current locations
        wsRef.current.send(JSON.stringify({ action: 'request_locations' }));
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        // Reconnect after delay
        setTimeout(() => {
          if (isAuthenticated && user) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.action) {
      case 'location_update':
        setFriendsLocations(prev => {
          const existing = prev.findIndex(l => l.user_id === data.user_id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = {
              ...updated[existing],
              latitude: data.latitude,
              longitude: data.longitude,
              updated_at: data.updated_at
            };
            return updated;
          }
          return [...prev, data];
        });
        break;
        
      case 'all_locations':
        setFriendsLocations(data.locations || []);
        break;
    }
  };

  const fetchLocationSettings = async () => {
    try {
      const response = await axios.get(`${API}/location/my-sharing`, {
        headers: getAuthHeaders()
      });
      setSharingEnabled(response.data.sharing_enabled);
      setSharedWith(response.data.visible_to || []);
      if (response.data.location) {
        setMyLocation(response.data.location);
      }
    } catch (error) {
      console.error('Failed to fetch location settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsLocations = async () => {
    try {
      const response = await axios.get(`${API}/location/friends`, {
        headers: getAuthHeaders()
      });
      setFriendsLocations(response.data.locations || []);
    } catch (error) {
      console.error('Failed to fetch friends locations:', error);
    }
  };

  const toggleSharing = async () => {
    try {
      await axios.post(`${API}/location/toggle`, {
        enabled: !sharingEnabled
      }, {
        headers: getAuthHeaders()
      });
      
      setSharingEnabled(!sharingEnabled);
      
      if (!sharingEnabled) {
        startLocationTracking();
        toast.success('Location sharing enabled');
      } else {
        stopLocationTracking();
        toast.success('Location sharing disabled');
      }
    } catch (error) {
      toast.error('Failed to toggle location sharing');
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setMyLocation({ latitude, longitude, accuracy });
        
        // Send update via WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'update_location',
            latitude,
            longitude,
            accuracy
          }));
        }
        
        // Also update via REST API as backup
        try {
          await axios.post(`${API}/location/update`, {
            latitude,
            longitude,
            accuracy
          }, {
            headers: getAuthHeaders()
          });
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get your location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
    
    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const shareWithUser = async (targetUser) => {
    try {
      await axios.post(`${API}/location/share-with`, {
        user_id: targetUser.user_id
      }, {
        headers: getAuthHeaders()
      });
      
      setSharedWith(prev => [...prev, targetUser]);
      setSearchResults([]);
      setSearchTerm('');
      toast.success(`Now sharing location with ${targetUser.name}`);
    } catch (error) {
      toast.error('Failed to share location');
    }
  };

  const stopSharingWithUser = async (userId) => {
    try {
      await axios.post(`${API}/location/stop-sharing-with`, {
        user_id: userId
      }, {
        headers: getAuthHeaders()
      });
      
      setSharedWith(prev => prev.filter(u => u.user_id !== userId));
      toast.success('Stopped sharing location');
    } catch (error) {
      toast.error('Failed to stop sharing');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const centerOnFriend = (loc) => {
    if (mapInstanceRef.current && loc.latitude && loc.longitude) {
      mapInstanceRef.current.setView([loc.latitude, loc.longitude], 15);
      if (markersRef.current[loc.user_id]) {
        markersRef.current[loc.user_id].openPopup();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <MapPin className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Live Map</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign in to share your location and see friends on the map
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="w-full lg:w-80 border-r dark:border-slate-800 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-teal-600" />
                <h1 className="text-xl font-semibold">Live Map</h1>
              </div>
              
              {/* Location Sharing Toggle */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Navigation className={`w-5 h-5 ${sharingEnabled ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="font-medium">Share My Location</p>
                        <p className="text-xs text-slate-500">
                          {sharingEnabled ? 'Your location is being shared' : 'Location sharing is off'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={sharingEnabled}
                      onCheckedChange={toggleSharing}
                    />
                  </div>
                  
                  {myLocation && sharingEnabled && (
                    <div className="mt-3 pt-3 border-t text-xs text-slate-500">
                      <p>Lat: {myLocation.latitude?.toFixed(6)}</p>
                      <p>Lng: {myLocation.longitude?.toFixed(6)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Share With Users */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Sharing With
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Add people..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 text-sm"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {searchResults.map(u => (
                          <div
                            key={u.user_id}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            onClick={() => shareWithUser(u)}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm flex-1">{u.name}</span>
                            <UserPlus className="w-4 h-4 text-teal-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {sharedWith.length > 0 ? (
                    <div className="space-y-2">
                      {sharedWith.map(u => (
                        <div key={u.user_id} className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm flex-1">{u.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => stopSharingWithUser(u.user_id)}
                          >
                            <UserMinus className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No one added yet
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Friends on Map */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends on Map
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={fetchFriendsLocations}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {friendsLocations.length > 0 ? (
                    <div className="space-y-2">
                      {friendsLocations.map(loc => (
                        <div 
                          key={loc.user_id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          onClick={() => centerOnFriend(loc)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={loc.user_avatar} />
                            <AvatarFallback>{loc.user_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{loc.user_name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(loc.updated_at)}
                            </p>
                          </div>
                          <MapPin className="w-4 h-4 text-teal-600" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        No friends sharing their location with you yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Map Container */}
            <div className="flex-1 relative">
              <div 
                ref={mapRef}
                className="w-full h-full bg-slate-100 dark:bg-slate-800"
                style={{ minHeight: '400px' }}
              />
              
              {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiveMapPage;
