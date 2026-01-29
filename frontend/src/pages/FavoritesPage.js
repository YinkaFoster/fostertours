import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Heart, Bookmark, MapPin, ShoppingBag, FileText, Camera,
  Loader2, Trash2, ExternalLink, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? `?item_type=${activeTab}` : '';
      const response = await axios.get(`${API}/favorites${params}`, {
        headers: getAuthHeaders()
      });
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemType, itemId) => {
    try {
      await axios.delete(`${API}/favorites/${itemType}/${itemId}`, {
        headers: getAuthHeaders()
      });
      setFavorites(prev => prev.filter(f => !(f.item_type === itemType && f.item_id === itemId)));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getItemLink = (fav) => {
    switch (fav.item_type) {
      case 'story':
        return `/stories`;
      case 'destination':
        return `/destinations`;
      case 'product':
        return `/store/product/${fav.item_id}`;
      case 'blog_post':
        return `/blog/${fav.item_data?.slug || fav.item_id}`;
      default:
        return '#';
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'story':
        return <Camera className="w-4 h-4" />;
      case 'destination':
        return <MapPin className="w-4 h-4" />;
      case 'product':
        return <ShoppingBag className="w-4 h-4" />;
      case 'blog_post':
        return <FileText className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const renderFavoriteCard = (fav) => {
    const itemData = fav.item_data;
    
    if (!itemData) {
      return (
        <Card key={fav.favorite_id} className="overflow-hidden opacity-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                {getItemIcon(fav.item_type)}
              </div>
              <div className="flex-1">
                <p className="text-slate-500">Item no longer available</p>
                <p className="text-xs text-slate-400 capitalize">{fav.item_type.replace('_', ' ')}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFavorite(fav.item_type, fav.item_id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (fav.item_type) {
      case 'story':
        return (
          <Card key={fav.favorite_id} className="overflow-hidden">
            <div className="flex">
              <div className="w-32 h-32 relative">
                {itemData.media?.[0]?.type === 'video' ? (
                  <video 
                    src={itemData.media[0].url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img 
                    src={itemData.media?.[0]?.url || '/placeholder.jpg'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback>{itemData.user_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{itemData.user_name}</span>
                    </div>
                    {itemData.caption && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {itemData.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Camera className="w-3 h-3" />
                      <span>Story</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(fav.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to="/stories">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(fav.item_type, fav.item_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        );

      case 'product':
        return (
          <Card key={fav.favorite_id} className="overflow-hidden">
            <div className="flex">
              <div className="w-32 h-32">
                <img 
                  src={itemData.image_url || '/placeholder.jpg'}
                  alt={itemData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1">{itemData.name}</h3>
                    <p className="text-teal-600 font-semibold mb-2">
                      ${itemData.sale_price || itemData.price}
                      {itemData.sale_price && (
                        <span className="text-sm text-slate-400 line-through ml-2">
                          ${itemData.price}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{itemData.category}</span>
                      <span>•</span>
                      <span>{itemData.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/store/product/${fav.item_id}`}>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(fav.item_type, fav.item_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        );

      case 'blog_post':
        return (
          <Card key={fav.favorite_id} className="overflow-hidden">
            <div className="flex">
              <div className="w-32 h-32">
                <img 
                  src={itemData.image_url || '/placeholder.jpg'}
                  alt={itemData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1 line-clamp-1">{itemData.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {itemData.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="w-3 h-3" />
                      <span>{itemData.category}</span>
                      <span>•</span>
                      <span>{itemData.read_time}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/blog/${itemData.slug}`}>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(fav.item_type, fav.item_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        );

      case 'destination':
        return (
          <Card key={fav.favorite_id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{fav.item_id}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Saved {formatDate(fav.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link to="/destinations">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFavorite(fav.item_type, fav.item_id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Bookmark className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Your Favorites</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign in to view your saved items
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
      
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Bookmark className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Your Favorites
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Stories
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="blog_post" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="destination" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destinations
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : favorites.length > 0 ? (
                <div className="space-y-4">
                  {favorites.map(fav => renderFavoriteCard(fav))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {activeTab === 'all' 
                      ? 'Start saving items you like!'
                      : `You haven't saved any ${activeTab.replace('_', ' ')}s yet`}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/stories">
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Browse Stories
                      </Button>
                    </Link>
                    <Link to="/store">
                      <Button variant="outline">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Shop Products
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
