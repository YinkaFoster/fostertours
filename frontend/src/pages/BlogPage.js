import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  BookOpen, Search, Clock, Eye, Loader2
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = category !== 'all' ? `?category=${category}` : '';
        const response = await axios.get(`${API}/blog/posts${params}`);
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  const categories = ['All', 'Destinations', 'Tips & Guides', 'Sustainability', 'Food', 'Adventure'];

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const otherPosts = filteredPosts.filter(p => p !== featuredPost);

  return (
    <div className="min-h-screen bg-background" data-testid="blog-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600657644140-aa5b5e003829?w=1920"
            alt="Travel blog"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Travel Stories</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Tips, guides, and inspiration for your next adventure
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="search-input"
            />
          </div>
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
              data-testid={`category-${cat.toLowerCase().replace(' & ', '-')}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try a different search or category</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link to={`/blog/${featuredPost.slug}`} className="block mb-12" data-testid="featured-post">
                  <Card className="border-0 shadow-soft overflow-hidden card-hover">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="h-64 md:h-auto">
                        <img
                          src={featuredPost.image_url}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-4 bg-secondary text-white border-0">Featured</Badge>
                        <Badge variant="secondary" className="w-fit mb-3">{featuredPost.category}</Badge>
                        <h2 className="font-serif text-3xl mb-4">{featuredPost.title}</h2>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                        <div className="flex items-center gap-4">
                          <img
                            src={featuredPost.author_image}
                            alt={featuredPost.author}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{featuredPost.author}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {featuredPost.read_time}
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {featuredPost.views}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              )}

              {/* Other Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post, index) => (
                  <Link key={post.post_id} to={`/blog/${post.slug}`} data-testid={`blog-card-${index}`}>
                    <Card className="h-full border-0 shadow-soft card-hover overflow-hidden">
                      <div className="h-56 overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover img-zoom"
                        />
                      </div>
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                        <h3 className="font-serif text-xl mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author_image}
                            alt={post.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{post.author}</p>
                            <p className="text-xs text-muted-foreground">{post.read_time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
