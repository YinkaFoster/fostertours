import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Plane, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import {
  Hotel, Calendar, Car, FileText, ShoppingBag, Map, Wallet,
  Gift, MessageCircle, Camera, Bookmark, Phone, Settings, LogOut, Sparkles
} from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const mainNavItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/flights', icon: Plane, label: 'Flights' },
    { href: '/hotels', icon: Hotel, label: 'Hotels' },
    { href: isAuthenticated ? '/home' : '/login', icon: User, label: isAuthenticated ? 'Account' : 'Login' },
  ];

  const moreItems = [
    { href: '/events', icon: Calendar, label: 'Events' },
    { href: '/vehicles', icon: Car, label: 'Vehicles' },
    { href: '/visa', icon: FileText, label: 'Visa' },
    { href: '/store', icon: ShoppingBag, label: 'Store' },
    { href: '/itinerary/ai', icon: Sparkles, label: 'AI Planner' },
    { href: '/stories', icon: Camera, label: 'Stories' },
    { href: '/map', icon: Map, label: 'Live Map' },
  ];

  const userItems = isAuthenticated ? [
    { href: '/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/rewards', icon: Gift, label: 'Rewards' },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/calls', icon: Phone, label: 'Calls' },
    { href: '/favorites', icon: Bookmark, label: 'Favorites' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ] : [];

  return (
    <nav className="mobile-bottom-nav sm:hidden">
      <div className="flex items-center justify-around px-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`mobile-bottom-nav-item flex-1 no-select ios-press ${
              isActive(item.href) ? 'active' : ''
            }`}
          >
            <item.icon className={isActive(item.href) ? 'text-primary' : ''} />
            <span>{item.label}</span>
          </Link>
        ))}
        
        {/* More Menu */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="mobile-bottom-nav-item flex-1 no-select ios-press">
              <Menu />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <div className="pt-2 pb-6">
              {/* Handle bar */}
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              
              {/* User info if authenticated */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 px-4 pb-4 mb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Services Grid */}
              <div className="px-4 mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Services</p>
                <div className="grid grid-cols-4 gap-3">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent ios-press no-select"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs text-center">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Items */}
              {isAuthenticated && userItems.length > 0 && (
                <div className="px-4 mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Account</p>
                  <div className="grid grid-cols-4 gap-3">
                    {userItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent ios-press no-select"
                      >
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-xs text-center">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Logout Button */}
              {isAuthenticated && (
                <div className="px-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      setMoreOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}

              {/* Login/Signup for non-authenticated */}
              {!isAuthenticated && (
                <div className="px-4 pt-4 border-t space-y-2">
                  <Link to="/login" onClick={() => setMoreOpen(false)}>
                    <Button className="w-full bg-primary">Sign In / Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
