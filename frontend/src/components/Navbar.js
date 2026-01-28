import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  Plane, Hotel, Calendar, Car, FileText, ShoppingBag, Map, Menu, X,
  Sun, Moon, User, LogOut, Settings, Wallet, BookOpen, Image, LayoutDashboard, Sparkles
} from 'lucide-react';
import LocaleSelector from './LocaleSelector';

// Foster Tours Logo
const LOGO_URL = "https://customer-assets.emergentagent.com/job_journeyquest-9/artifacts/mdvh6cnk_Untitled%20design%20-%202.PNG";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { t, formatPrice } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/flights', label: t('flights'), icon: Plane },
    { href: '/hotels', label: t('hotels'), icon: Hotel },
    { href: '/events', label: t('events'), icon: Calendar },
    { href: '/vehicles', label: t('vehicles'), icon: Car },
    { href: '/visa', label: t('visa'), icon: FileText },
    { href: '/store', label: t('store'), icon: ShoppingBag },
    { href: '/blog', label: t('blog'), icon: BookOpen },
    { href: '/itinerary/ai', label: t('aiPlanner'), icon: Sparkles },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/80 border-b border-border/50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <img 
              src={LOGO_URL} 
              alt="Foster Tours" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-9 h-9 rounded-full bg-primary items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Locale Selector */}
            <div className="hidden sm:flex">
              <LocaleSelector variant="compact" />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Store Cart */}
            <Link to="/store/cart">
              <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="nav-cart">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-secondary">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-trigger">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2" data-testid="nav-dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="flex items-center gap-2" data-testid="nav-wallet">
                      <Wallet className="w-4 h-4" />
                      {t('wallet')}
                      <span className="ml-auto text-primary font-medium">
                        {formatPrice(user?.wallet_balance || 0)}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/itinerary" className="flex items-center gap-2" data-testid="nav-itinerary">
                      <Map className="w-4 h-4" />
                      My Itineraries
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/gallery" className="flex items-center gap-2" data-testid="nav-gallery">
                      <Image className="w-4 h-4" />
                      Gallery
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2" data-testid="nav-settings">
                      <Settings className="w-4 h-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  {user?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2" data-testid="nav-admin">
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="nav-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" data-testid="nav-login">{t('login')}</Button>
                </Link>
                <Link to="/login">
                  <Button className="btn-pill bg-primary" data-testid="nav-signup">{t('signUp')}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Locale Selector in Mobile */}
                  <div className="px-4 pb-4 border-b">
                    <LocaleSelector />
                  </div>
                  
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive(link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2" />
                  <Link
                    to="/store"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {t('store')}
                  </Link>
                  <Link
                    to="/gallery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                  >
                    <Image className="w-5 h-5" />
                    Gallery
                  </Link>
                  {!isAuthenticated && (
                    <div className="mt-4 space-y-2">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full" variant="outline">{t('login')}</Button>
                      </Link>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary">{t('signUp')}</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
