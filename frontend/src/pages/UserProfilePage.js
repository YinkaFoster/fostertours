import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  MapPin, Globe, Calendar, Users, Edit, Loader2, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API}/users/${userId}/profile`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setProfile(response.data);
        setIsFollowing(response.data.is_following);
        setFollowersCount(response.data.followers_count);
        setFollowingCount(response.data.following_count);

        // Fetch followers and following lists
        const [followersRes, followingRes] = await Promise.all([
          axios.get(`${API}/social/followers/${userId}`),
          axios.get(`${API}/social/following/${userId}`)
        ]);
        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Profile not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, navigate]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API}/social/follow/${userId}`, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success('Unfollowed');
      } else {
        await axios.post(`${API}/social/follow/${userId}`, {}, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
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

  if (!profile) return null;

  const isOwnProfile = currentUser?.user_id === userId;

  return (
    <div className="min-h-screen bg-background" data-testid="user-profile-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Profile Header */}
          <Card className="border-0 shadow-soft mb-8 overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
            
            <CardContent className="relative pt-0">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-16">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                  <AvatarImage src={profile.picture} />
                  <AvatarFallback className="text-3xl">
                    {profile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left pb-4">
                  <h1 className="font-serif text-2xl sm:text-3xl">{profile.name}</h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pb-4">
                  {isOwnProfile ? (
                    <Link to="/settings">
                      <Button variant="outline" className="btn-pill" data-testid="edit-profile-btn">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      className="btn-pill"
                      onClick={handleFollow}
                      disabled={followLoading}
                      data-testid="follow-btn"
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Users className="w-4 h-4 mr-2" />
                      )}
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-8 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.posts_count}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="followers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers" data-testid="followers-tab">
                Followers ({followersCount})
              </TabsTrigger>
              <TabsTrigger value="following" data-testid="following-tab">
                Following ({followingCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="followers">
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  {followers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No followers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followers.map((follower, index) => (
                        <Link
                          key={follower.user_id}
                          to={`/profile/${follower.user_id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          data-testid={`follower-${index}`}
                        >
                          <Avatar>
                            <AvatarImage src={follower.picture} />
                            <AvatarFallback>{follower.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{follower.name}</p>
                            <p className="text-sm text-muted-foreground">{follower.email}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="following">
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  {following.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Not following anyone yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {following.map((user, index) => (
                        <Link
                          key={user.user_id}
                          to={`/profile/${user.user_id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          data-testid={`following-${index}`}
                        >
                          <Avatar>
                            <AvatarImage src={user.picture} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
