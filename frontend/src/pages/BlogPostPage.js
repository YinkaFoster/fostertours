import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Heart, MessageCircle, Share2, Bookmark, ChevronLeft, Clock, Eye,
  Twitter, Facebook, Linkedin, Link as LinkIcon, Send, Loader2, Trash2, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BlogPostPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API}/blog/posts/${slug}`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setPost(response.data);
        setLiked(response.data.user_liked || false);
        setLikesCount(response.data.likes_count || 0);
        setComments(response.data.comments || []);
        
        // Check if following author
        if (response.data.author_id) {
          const followRes = await axios.get(`${API}/social/is-following/${response.data.author_id}`, {
            headers: getAuthHeaders(),
            withCredentials: true
          });
          setIsFollowing(followRes.data.is_following);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Post not found');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      navigate('/login');
      return;
    }

    try {
      if (liked) {
        await axios.delete(`${API}/social/like/${post.post_id}`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await axios.post(`${API}/social/like/${post.post_id}`, {}, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await axios.delete(`${API}/social/follow/${post.author_id}`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setIsFollowing(false);
        toast.success('Unfollowed author');
      } else {
        await axios.post(`${API}/social/follow/${post.author_id}`, {}, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setIsFollowing(true);
        toast.success('Following author');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(
        `${API}/social/comment/${post.post_id}`,
        { content: newComment },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/social/comment/${commentId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    // Record share
    try {
      await axios.post(`${API}/social/share/${post.post_id}`, { platform }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (error) {
      console.error('Failed to record share');
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background" data-testid="blog-post-page">
      <Navbar />

      <main className="pt-20 pb-12">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[400px]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-4 bg-secondary text-white border-0">{post.category}</Badge>
              <h1 className="font-serif text-3xl md:text-5xl text-white mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.read_time}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views} views
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Author Section */}
          <div className="flex items-center justify-between py-6 border-b">
            <Link to={`/profile/${post.author_id}`} className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author_image} />
                <AvatarFallback>{post.author?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.author}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </Link>
            {post.author_id && user?.user_id !== post.author_id && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                className="btn-pill"
                data-testid="follow-btn"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>

          {/* Social Actions Bar */}
          <div className="sticky top-20 z-40 bg-background/95 backdrop-blur py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={liked ? 'text-red-500' : ''}
                  data-testid="like-btn"
                >
                  <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-red-500' : ''}`} />
                  {likesCount}
                </Button>
                <Button variant="ghost" size="sm" data-testid="comment-btn">
                  <MessageCircle className="w-5 h-5 mr-1" />
                  {comments.length}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="share-btn">
                      <Share2 className="w-5 h-5 mr-1" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('facebook')}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('link')}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <article className="py-8 prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 py-6 border-t">
            {post.tags?.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {/* Comments Section */}
          <section className="py-8" data-testid="comments-section">
            <h2 className="font-serif text-2xl mb-6">Comments ({comments.length})</h2>

            {/* Comment Form */}
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'G'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={isAuthenticated ? "Write a comment..." : "Login to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!isAuthenticated}
                    className="min-h-[100px] mb-2"
                    data-testid="comment-input"
                  />
                  <Button
                    type="submit"
                    disabled={!isAuthenticated || !newComment.trim() || submittingComment}
                    className="btn-pill bg-primary"
                    data-testid="submit-comment-btn"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment.comment_id} className="flex gap-4" data-testid={`comment-${index}`}>
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={comment.user_image} />
                      <AvatarFallback>{comment.user_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{comment.user_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {user?.user_id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.comment_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
