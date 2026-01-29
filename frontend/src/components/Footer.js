import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  Plane, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube,
  ArrowRight, MessageCircle, Hotel, Calendar, Car, FileText, ShoppingBag,
  Globe, Sparkles, Clock, Headphones
} from 'lucide-react';
import LocaleSelector from './LocaleSelector';

// Foster Tours Logo
const LOGO_URL = "https://customer-assets.emergentagent.com/job_journeyquest-9/artifacts/1gd2bkdd_Rectangle%201.png";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white" data-testid="footer">
      {/* Main Footer - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block group">
              <div className="h-16 sm:h-20 w-16 sm:w-20 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <img 
                  src={LOGO_URL} 
                  alt="Foster Tours" 
                  className="h-full w-full object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = '<div class="flex items-center gap-2"><div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center"><svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></div></div>';
                  }}
                />
              </div>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Your trusted partner for unforgettable travel experiences.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://wa.me/2349058681268" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-500 transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/foster_tours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-3 sm:mb-4 text-teal-400">Our Services</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: 'Flights', href: '/flights', icon: Plane },
                { label: 'Hotels', href: '/hotels', icon: Hotel },
                { label: 'Events', href: '/events', icon: Calendar },
                { label: 'Vehicles', href: '/vehicles', icon: Car },
                { label: 'Visa', href: '/visa', icon: FileText },
                { label: 'Store', href: '/store', icon: ShoppingBag },
                { label: 'AI Planner', href: '/itinerary/ai', icon: Sparkles },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm group"
                  >
                    <link.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500 group-hover:text-teal-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-3 sm:mb-4 text-teal-400">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Destinations', href: '/destinations' },
                { label: 'Packages', href: '/packages' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Partners', href: '/partner' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-3 sm:mb-4 text-teal-400">Support</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Cancellation', href: '/cancellation-policy' },
                { label: 'Safety', href: '/safety' },
                { label: 'Accessibility', href: '/accessibility' },
                { label: 'COVID-19', href: '/covid-updates' },
                { label: 'Press', href: '/press' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-teal-400">Contact Us</h4>
            <div className="space-y-3">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/2349058681268" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600/30">
                  <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">WhatsApp</p>
                  <p className="text-xs">+234 9058 681 268</p>
                </div>
              </a>
              
              {/* Instagram */}
              <a 
                href="https://instagram.com/foster_tours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-sm text-slate-400 hover:text-pink-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-pink-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-600/30">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">Instagram</p>
                  <p className="text-xs">@foster_tours</p>
                </div>
              </a>
              
              {/* Email */}
              <a 
                href="mailto:support@fostertours.com"
                className="flex items-start gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600/30">
                  <Mail className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">Email</p>
                  <p className="text-xs">support@fostertours.com</p>
                </div>
              </a>

              {/* Support Hours */}
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <div className="w-7 h-7 rounded-full bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">Support Hours</p>
                  <p className="text-xs">Mon - Sat: 9AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-teal-400">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-3">
              Subscribe for exclusive deals and travel tips.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm"
              />
              <Button className="btn-pill bg-primary hover:bg-primary/90 px-3">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Customer Support Badge */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">24/7 AI Support</p>
                  <p className="text-slate-400 text-xs">Chat anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Foster Tours. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
