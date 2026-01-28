import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent } from '../components/ui/dialog';
import {
  Image, MapPin, X, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const GalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const params = category !== 'all' ? `?category=${category}` : '';
        const response = await axios.get(`${API}/gallery${params}`);
        setGallery(response.data.items || []);
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [category]);

  const categories = ['All', 'Beaches', 'Wildlife', 'Nature', 'Cities', 'Historical', 'Mountains'];

  const openLightbox = (item, index) => {
    setSelectedImage(item);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrev = () => {
    const newIndex = selectedIndex === 0 ? gallery.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(gallery[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex === gallery.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    setSelectedImage(gallery[newIndex]);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="gallery-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Photo Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stunning destinations and travel memories from around the world
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 px-6 md:px-12 lg:px-20 border-b">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat.toLowerCase() || (cat === 'All' && category === 'all') ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.toLowerCase() === 'all' ? 'all' : cat)}
              className="rounded-full"
              data-testid={`category-${cat.toLowerCase()}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl mb-2">No images found</h3>
              <p className="text-muted-foreground">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item, index) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => openLightbox(item, index)}
                  data-testid={`gallery-item-${index}`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Badge className="mb-2 bg-white/20 text-white border-white/30">
                      {item.category}
                    </Badge>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0">
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
              data-testid="close-lightbox"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={goToPrev}
              data-testid="prev-image"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={goToNext}
              data-testid="next-image"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Image */}
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full max-h-[80vh] object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <Badge className="mb-2 bg-white/20 text-white border-white/30">
                    {selectedImage.category}
                  </Badge>
                  <h3 className="text-white text-2xl font-serif">{selectedImage.title}</h3>
                  <p className="text-white/80 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedImage.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default GalleryPage;
