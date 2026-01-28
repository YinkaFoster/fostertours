import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Search, X, Plane, Hotel, MapPin, FileText, ShoppingBag,
  Calendar, User, ArrowRight, Loader2
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    onClose();
    switch (type) {
      case 'destination':
        navigate(`/destinations?search=${encodeURIComponent(item.name)}`);
        break;
      case 'blog':
        navigate(`/blog/${item.slug}`);
        break;
      case 'product':
        navigate(`/store/product/${item.product_id}`);
        break;
      case 'event':
        navigate(`/events?search=${encodeURIComponent(item.title)}`);
        break;
      case 'user':
        navigate(`/profile/${item.user_id}`);
        break;
      default:
        break;
    }
  };

  const hasResults = results && (
    results.destinations?.length > 0 ||
    results.blog_posts?.length > 0 ||
    results.products?.length > 0 ||
    results.events?.length > 0 ||
    results.users?.length > 0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search destinations, blog posts, products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg border-0 focus-visible:ring-0"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              </div>
            )}

            {!loading && query.length >= 2 && !hasResults && (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No results found for "{query}"</p>
              </div>
            )}

            {!loading && hasResults && (
              <div className="py-2">
                {/* Destinations */}
                {results.destinations?.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Destinations</p>
                    {results.destinations.map((dest, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        onClick={() => handleResultClick('destination', dest)}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{dest.name}</p>
                          <Badge variant="outline" className="text-xs capitalize">{dest.type}</Badge>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Blog Posts */}
                {results.blog_posts?.length > 0 && (
                  <div className="px-4 py-2 border-t dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Blog Posts</p>
                    {results.blog_posts.map((post, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        onClick={() => handleResultClick('blog', post)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{post.title}</p>
                          <p className="text-sm text-slate-500">{post.category}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Products */}
                {results.products?.length > 0 && (
                  <div className="px-4 py-2 border-t dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Products</p>
                    {results.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        onClick={() => handleResultClick('product', product)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-teal-600 font-medium">${product.price}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Events */}
                {results.events?.length > 0 && (
                  <div className="px-4 py-2 border-t dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Events</p>
                    {results.events.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        onClick={() => handleResultClick('event', event)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                          <p className="text-sm text-slate-500">{event.location}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Users */}
                {results.users?.length > 0 && (
                  <div className="px-4 py-2 border-t dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Users</p>
                    {results.users.map((u, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        onClick={() => handleResultClick('user', u)}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Links */}
            {!query && (
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Plane, label: 'Flights', href: '/flights' },
                    { icon: Hotel, label: 'Hotels', href: '/hotels' },
                    { icon: MapPin, label: 'Destinations', href: '/destinations' },
                    { icon: Calendar, label: 'Events', href: '/events' },
                    { icon: ShoppingBag, label: 'Store', href: '/store' },
                    { icon: FileText, label: 'Blog', href: '/blog' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      onClick={() => {
                        navigate(item.href);
                        onClose();
                      }}
                    >
                      <item.icon className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">ESC</kbd>
                <span>to close</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">↵</kbd>
                <span>to select</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;
