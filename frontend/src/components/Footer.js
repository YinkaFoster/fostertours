import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  Plane, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube,
  ArrowRight, MessageCircle
} from 'lucide-react';
import LocaleSelector from './LocaleSelector';

// Foster Tours Logo (stacked version for footer)
const LOGO_STACKED_URL = "https://customer-assets.emergentagent.com/job_journeyquest-9/artifacts/pfeq0xxl_Untitled%20design%20-%201.PNG";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white" data-testid="footer">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src={LOGO_STACKED_URL} 
                alt="Foster Tours" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-serif font-semibold">Foster Tours</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner for unforgettable travel experiences. Explore the world with confidence.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://wa.me/2349058681268" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-500 transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/foster_tours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Flights', href: '/flights' },
                { label: 'Hotels', href: '/hotels' },
                { label: 'Events & Tours', href: '/events' },
                { label: 'Vehicle Rental', href: '/vehicles' },
                { label: 'Visa Services', href: '/visa' },
                { label: 'Travel Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refunds' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to our newsletter for exclusive deals and travel tips.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button className="btn-pill bg-primary">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-6 space-y-3">
              <a 
                href="https://wa.me/2349058681268" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                +234 9058 681 268 (WhatsApp)
              </a>
              <a 
                href="https://instagram.com/foster_tours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @foster_tours
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                support@fostertours.com
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
