import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ShoppingBag, Search, Star, ShoppingCart, Loader2, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const StorePage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice, t } = useLocale();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = category !== 'all' ? `?category=${category}` : '';
        const response = await axios.get(`${API}/store/products${params}`);
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const categories = ['All', 'Bags', 'Electronics', 'Accessories', 'Books'];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const success = await addToCart(product.product_id, 1);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="store-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Travel Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Essential gear and accessories for your adventures
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
              data-testid="search-input"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 md:px-12 lg:px-20 border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
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
          <Select defaultValue="popular">
            <SelectTrigger className="w-40" data-testid="sort-select">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl mb-2">No products found</h3>
              <p className="text-muted-foreground">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <Link key={product.product_id} to={`/store/product/${product.product_id}`} data-testid={`product-card-${index}`}>
                  <Card className="h-full border-0 shadow-soft card-hover overflow-hidden group">
                    <div className="h-56 relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover img-zoom"
                      />
                      {product.sale_price && (
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0">
                          Sale
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary"
                        onClick={(e) => handleAddToCart(e, product)}
                        data-testid={`add-to-cart-${index}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
                      <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">({product.reviews_count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.sale_price ? (
                          <>
                            <span className="text-xl font-bold text-primary">{formatPrice(product.sale_price)}</span>
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StorePage;
