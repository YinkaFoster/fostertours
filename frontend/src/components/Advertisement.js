import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Banner Ad Component
export const BannerAd = ({ position = 'banner', page = 'home' }) => {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [position, page]);

  const fetchAd = async () => {
    try {
      const response = await axios.get(`${API}/ads`);
      const ads = response.data.ads || [];
      const matchingAd = ads.find(a => 
        a.position === position && 
        (a.target_pages?.includes(page) || a.target_pages?.includes('all'))
      );
      if (matchingAd) {
        setAd(matchingAd);
        // Track impression
        axios.post(`${API}/ads/${matchingAd.ad_id}/impression`).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch ads');
    }
  };

  const handleClick = () => {
    if (ad?.ad_id) {
      axios.post(`${API}/ads/${ad.ad_id}/click`).catch(() => {});
    }
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  if (!ad || dismissed) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
      <div 
        className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 flex-1">
          {ad.image_url && (
            <img 
              src={ad.image_url} 
              alt={ad.title} 
              className="h-8 sm:h-10 w-auto rounded hidden sm:block"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ad.title}</p>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{ad.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Sidebar Ad Component
export const SidebarAd = ({ page = 'home' }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAd();
  }, [page]);

  const fetchAd = async () => {
    try {
      const response = await axios.get(`${API}/ads`);
      const ads = response.data.ads || [];
      const matchingAd = ads.find(a => 
        a.position === 'sidebar' && 
        (a.target_pages?.includes(page) || a.target_pages?.includes('all'))
      );
      if (matchingAd) {
        setAd(matchingAd);
        axios.post(`${API}/ads/${matchingAd.ad_id}/impression`).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch ads');
    }
  };

  const handleClick = () => {
    if (ad?.ad_id) {
      axios.post(`${API}/ads/${ad.ad_id}/click`).catch(() => {});
    }
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  if (!ad) return null;

  return (
    <div 
      className="rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      {ad.image_url && (
        <img 
          src={ad.image_url} 
          alt={ad.title} 
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4 bg-muted/50">
        <p className="font-medium text-sm mb-1">{ad.title}</p>
        <p className="text-xs text-muted-foreground">{ad.description}</p>
        <span className="text-[10px] text-muted-foreground mt-2 block">Sponsored</span>
      </div>
    </div>
  );
};

// Inline Ad Component (for content sections)
export const InlineAd = ({ page = 'home' }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAd();
  }, [page]);

  const fetchAd = async () => {
    try {
      const response = await axios.get(`${API}/ads`);
      const ads = response.data.ads || [];
      const matchingAd = ads.find(a => 
        a.position === 'inline' && 
        (a.target_pages?.includes(page) || a.target_pages?.includes('all'))
      );
      if (matchingAd) {
        setAd(matchingAd);
        axios.post(`${API}/ads/${matchingAd.ad_id}/impression`).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch ads');
    }
  };

  const handleClick = () => {
    if (ad?.ad_id) {
      axios.post(`${API}/ads/${ad.ad_id}/click`).catch(() => {});
    }
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  if (!ad) return null;

  return (
    <div 
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {ad.image_url ? (
        <div className="relative">
          <img 
            src={ad.image_url} 
            alt={ad.title} 
            className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full mb-2 inline-block">Sponsored</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1">{ad.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2">{ad.description}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full mb-2 inline-block">Sponsored</span>
          <h3 className="font-semibold text-lg mb-1">{ad.title}</h3>
          <p className="text-sm text-white/80">{ad.description}</p>
        </div>
      )}
    </div>
  );
};

// Popup Ad Component
export const PopupAd = ({ page = 'home', delay = 5000 }) => {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAd();
    }, delay);
    return () => clearTimeout(timer);
  }, [page, delay]);

  const fetchAd = async () => {
    // Check if user has already seen this popup recently
    const lastSeen = localStorage.getItem('popup_ad_seen');
    if (lastSeen && Date.now() - parseInt(lastSeen) < 3600000) { // 1 hour
      return;
    }

    try {
      const response = await axios.get(`${API}/ads`);
      const ads = response.data.ads || [];
      const matchingAd = ads.find(a => 
        a.position === 'popup' && 
        (a.target_pages?.includes(page) || a.target_pages?.includes('all'))
      );
      if (matchingAd) {
        setAd(matchingAd);
        setShow(true);
        localStorage.setItem('popup_ad_seen', Date.now().toString());
        axios.post(`${API}/ads/${matchingAd.ad_id}/impression`).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch ads');
    }
  };

  const handleClick = () => {
    if (ad?.ad_id) {
      axios.post(`${API}/ads/${ad.ad_id}/click`).catch(() => {});
    }
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank');
    }
    setShow(false);
  };

  if (!ad || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-background rounded-2xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white"
          onClick={() => setShow(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        
        {ad.image_url && (
          <img 
            src={ad.image_url} 
            alt={ad.title} 
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="p-6">
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
          <h3 className="font-serif text-xl font-semibold mt-1 mb-2">{ad.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{ad.description}</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleClick}>
              Learn More
            </Button>
            <Button variant="outline" onClick={() => setShow(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { BannerAd, SidebarAd, InlineAd, PopupAd };
