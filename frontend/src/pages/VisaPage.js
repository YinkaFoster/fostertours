import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  FileText, Clock, DollarSign, CheckCircle, Loader2
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const VisaPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API}/visa-packages`);
        setPackages(response.data.packages || []);
      } catch (error) {
        console.error('Failed to fetch visa packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="visa-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1743193143977-bc57e2c100ad?w=1920"
            alt="Passport"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Visa Services</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Hassle-free visa processing for your international travels
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 md:px-12 lg:px-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Select Package', desc: 'Choose your destination and visa type' },
              { step: 2, title: 'Submit Documents', desc: 'Upload required documents securely' },
              { step: 3, title: 'We Process', desc: 'Our experts handle your application' },
              { step: 4, title: 'Receive Visa', desc: 'Get your visa delivered to you' },
            ].map((item) => (
              <Card key={item.step} className="border-0 shadow-soft text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Packages */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-8">Available Packages</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg, index) => (
                <Card key={pkg.package_id} className="h-full border-0 shadow-soft card-hover overflow-hidden" data-testid={`visa-card-${index}`}>
                  <div className="h-40 relative">
                    <img
                      src={pkg.image_url}
                      alt={pkg.country}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-serif text-xl">{pkg.country}</h3>
                      <p className="text-sm text-white/80">{pkg.visa_type}</p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.processing_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-primary">${pkg.price}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Documents Required:</p>
                      <div className="space-y-1">
                        {pkg.documents_required.slice(0, 3).map((doc, i) => (
                          <p key={i} className="text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {doc}
                          </p>
                        ))}
                        {pkg.documents_required.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{pkg.documents_required.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                    <Button className="w-full btn-pill bg-primary" data-testid={`apply-visa-${index}`}>
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisaPage;
