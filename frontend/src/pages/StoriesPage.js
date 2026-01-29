import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  Plus, X, Heart, MessageCircle, Send, ChevronLeft, ChevronRight,
  Loader2, MapPin, Camera, Video, Image as ImageIcon, Trash2,
  Play, Pause, Eye, Clock, Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const StoriesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storiesByUser, setStoriesByUser] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newStory, setNewStory] = useState({
    caption: '',
    location: '',
    files: []
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    fetchStories();
  }, [isAuthenticated]);

  useEffect(() => {
    // Auto-progress for stories
    if (selectedUserIndex !== null) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [selectedUserIndex, selectedStoryIndex]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStories = async () => {
    try {
      const endpoint = isAuthenticated ? '/stories/feed' : '/stories';
      const response = await axios.get(`${API}${endpoint}`, {
        headers: getAuthHeaders()
      });
      setStoriesByUser(response.data.stories || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setUploadProgress(0);
    
    progressInterval.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          // Move to next story or user
          handleNextStory();
          return 0;
        }
        return prev + 2; // 5 seconds per story
      });
    }, 100);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage && file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB image limit`);
        return false;
      }
      if (isVideo && file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 50MB video limit`);
        return false;
      }
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported format`);
        return false;
      }
      return true;
    });

    // Create preview URLs
    const previews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));

    setNewStory(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
    setPreviewUrls(prev => [...prev, ...previews]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index].url);
    setNewStory(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateStory = async () => {
    if (newStory.files.length === 0) {
      toast.error('Please add at least one photo or video');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caption', newStory.caption);
      formData.append('location', newStory.location);
      newStory.files.forEach(file => {
        formData.append('files', file);
      });

      await axios.post(`${API}/stories`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Story created!');
      setShowCreateModal(false);
      setNewStory({ caption: '', location: '', files: [] });
      setPreviewUrls([]);
      fetchStories();
    } catch (error) {
      console.error('Failed to create story:', error);
      toast.error(error.response?.data?.detail || 'Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  const handleStoryClick = async (userIndex) => {
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(0);
    
    // Mark as viewed
    const story = storiesByUser[userIndex]?.stories[0];
    if (story && isAuthenticated) {
      try {
        await axios.get(`${API}/stories/${story.story_id}`, {
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.error('Failed to record view');
      }
    }
  };

  const handleNextStory = () => {
    if (selectedUserIndex === null) return;
    
    const currentUserStories = storiesByUser[selectedUserIndex]?.stories || [];
    
    if (selectedStoryIndex < currentUserStories.length - 1) {
      setSelectedStoryIndex(prev => prev + 1);
    } else if (selectedUserIndex < storiesByUser.length - 1) {
      // Move to next user
      setSelectedUserIndex(prev => prev + 1);
      setSelectedStoryIndex(0);
    } else {
      // End of all stories
      closeViewer();
    }
  };

  const handlePrevStory = () => {
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(prev => prev - 1);
    } else if (selectedUserIndex > 0) {
      setSelectedUserIndex(prev => prev - 1);
      const prevUserStories = storiesByUser[selectedUserIndex - 1]?.stories || [];
      setSelectedStoryIndex(prevUserStories.length - 1);
    }
  };

  const closeViewer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setSelectedUserIndex(null);
    setSelectedStoryIndex(0);
  };

  const handleLikeStory = async (storyId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like stories');
      return;
    }

    try {
      const response = await axios.post(`${API}/stories/${storyId}/like`, {}, {
        headers: getAuthHeaders()
      });
      
      // Update local state
      setStoriesByUser(prev => prev.map(userStories => ({
        ...userStories,
        stories: userStories.stories.map(s => 
          s.story_id === storyId 
            ? { ...s, is_liked: response.data.liked, likes_count: s.likes_count + (response.data.liked ? 1 : -1) }
            : s
        )
      })));
    } catch (error) {
      console.error('Failed to like story');
    }
  };

  const handleSaveStory = async (storyId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save stories');
      return;
    }

    try {
      await axios.post(`${API}/favorites`, {
        item_type: 'story',
        item_id: storyId
      }, {
        headers: getAuthHeaders()
      });
      toast.success('Story saved to favorites!');
    } catch (error) {
      if (error.response?.status === 400) {
        // Already saved, remove it
        try {
          await axios.delete(`${API}/favorites/story/${storyId}`, {
            headers: getAuthHeaders()
          });
          toast.success('Removed from favorites');
        } catch {
          toast.error('Failed to update favorites');
        }
      } else {
        toast.error('Failed to save story');
      }
    }
  };

  const fetchComments = async (storyId) => {
    try {
      const response = await axios.get(`${API}/stories/${storyId}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleAddComment = async (storyId) => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`${API}/stories/${storyId}/comments`, {
        content: newComment
      }, {
        headers: getAuthHeaders()
      });
      
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const openComments = (storyId) => {
    fetchComments(storyId);
    setShowCommentsModal(true);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const currentStory = selectedUserIndex !== null 
    ? storiesByUser[selectedUserIndex]?.stories[selectedStoryIndex] 
    : null;
  const currentUser = selectedUserIndex !== null 
    ? storiesByUser[selectedUserIndex] 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Stories Header */}
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Travel Stories
            </h1>
            {isAuthenticated && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Story
              </Button>
            )}
          </div>

          {/* Stories Carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Create Story Button (Mobile) */}
            {isAuthenticated && (
              <div 
                className="flex-shrink-0 w-20 cursor-pointer"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-orange-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-teal-600" />
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-slate-600 dark:text-slate-400 truncate">
                  Your Story
                </p>
              </div>
            )}

            {/* User Stories */}
            {loading ? (
              <div className="flex gap-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex-shrink-0 w-20 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mt-2 mx-2" />
                  </div>
                ))}
              </div>
            ) : storiesByUser.length > 0 ? (
              storiesByUser.map((userStory, index) => (
                <div 
                  key={userStory.user_id}
                  className="flex-shrink-0 w-20 cursor-pointer"
                  onClick={() => handleStoryClick(index)}
                >
                  <div className={`w-20 h-20 rounded-full p-0.5 ${
                    userStory.has_unseen 
                      ? 'bg-gradient-to-br from-teal-500 to-orange-500' 
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}>
                    <Avatar className="w-full h-full border-2 border-white dark:border-slate-900">
                      <AvatarImage src={userStory.user_avatar} />
                      <AvatarFallback className="text-lg">
                        {userStory.user_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-600 dark:text-slate-400 truncate">
                    {userStory.user_id === user?.user_id ? 'Your Story' : userStory.user_name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 py-4">
                No stories yet. {isAuthenticated ? 'Be the first to share!' : 'Sign in to see stories from people you follow.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Recent Stories Grid */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Recent Stories
          </h2>
          
          {storiesByUser.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {storiesByUser.flatMap((userStory, userIndex) => 
                userStory.stories.map((story, storyIndex) => (
                  <Card 
                    key={story.story_id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedUserIndex(userIndex);
                      setSelectedStoryIndex(storyIndex);
                    }}
                  >
                    <div className="relative aspect-[9/16]">
                      {story.media[0]?.type === 'video' ? (
                        <video 
                          src={story.media[0]?.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img 
                          src={story.media[0]?.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* User info */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Avatar className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={userStory.user_avatar} />
                          <AvatarFallback>{userStory.user_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm font-medium drop-shadow">
                          {userStory.user_name}
                        </span>
                      </div>

                      {/* Time ago */}
                      <div className="absolute top-3 right-3">
                        <span className="text-white text-xs drop-shadow flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(story.created_at)}
                        </span>
                      </div>

                      {/* Caption & Stats */}
                      <div className="absolute bottom-3 left-3 right-3">
                        {story.caption && (
                          <p className="text-white text-sm mb-2 line-clamp-2 drop-shadow">
                            {story.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-white text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {story.views_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {story.likes_count}
                          </span>
                        </div>
                      </div>

                      {/* Video indicator */}
                      {story.media[0]?.type === 'video' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Play className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : !loading && (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Stories Yet
              </h3>
              <p className="text-slate-500 mb-6">
                {isAuthenticated 
                  ? 'Share your travel experiences with the community!'
                  : 'Sign in to view and share travel stories'}
              </p>
              {isAuthenticated ? (
                <Button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Story
                </Button>
              ) : (
                <Link to="/login">
                  <Button className="bg-teal-600 hover:bg-teal-700">Sign In</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Story Viewer Modal */}
      {selectedUserIndex !== null && currentStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeViewer}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={handlePrevStory}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={handleNextStory}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Story Content */}
          <div className="relative w-full max-w-md h-full max-h-[90vh] mx-auto">
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {currentUser?.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100"
                    style={{ 
                      width: idx < selectedStoryIndex 
                        ? '100%' 
                        : idx === selectedStoryIndex 
                          ? `${uploadProgress}%`
                          : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* User header */}
            <div className="absolute top-10 left-4 right-4 flex items-center gap-3 z-10">
              <Link to={`/profile/${currentUser?.user_id}`}>
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage src={currentUser?.user_avatar} />
                  <AvatarFallback>{currentUser?.user_name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link to={`/profile/${currentUser?.user_id}`}>
                  <p className="text-white font-medium">{currentUser?.user_name}</p>
                </Link>
                <p className="text-white/70 text-sm">{formatTimeAgo(currentStory.created_at)}</p>
              </div>
            </div>

            {/* Media */}
            <div className="w-full h-full flex items-center justify-center">
              {currentStory.media[0]?.type === 'video' ? (
                <video 
                  ref={videoRef}
                  src={currentStory.media[0]?.url}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={currentStory.media[0]?.url}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Caption & Location */}
            {(currentStory.caption || currentStory.location) && (
              <div className="absolute bottom-24 left-4 right-4 z-10">
                {currentStory.location && (
                  <p className="text-white/80 text-sm flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    {currentStory.location}
                  </p>
                )}
                {currentStory.caption && (
                  <p className="text-white text-lg">{currentStory.caption}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                className={`text-white hover:bg-white/20 ${currentStory.is_liked ? 'text-red-500' : ''}`}
                onClick={() => handleLikeStory(currentStory.story_id)}
              >
                <Heart className={`w-6 h-6 ${currentStory.is_liked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-white">{currentStory.likes_count}</span>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => openComments(currentStory.story_id)}
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 ml-auto"
                onClick={() => handleSaveStory(currentStory.story_id)}
              >
                <Bookmark className="w-6 h-6" />
              </Button>
              
              <span className="text-white/70 text-sm flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {currentStory.views_count}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File upload area */}
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-4 mb-4">
                <ImageIcon className="w-10 h-10 text-slate-400" />
                <Video className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Click to add photos or videos
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Images: max 10MB • Videos: max 50MB
              </p>
            </div>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    {preview.type === 'video' ? (
                      <video src={preview.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {preview.type === 'video' && (
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Caption */}
            <Textarea
              placeholder="Write a caption..."
              value={newStory.caption}
              onChange={(e) => setNewStory(prev => ({ ...prev, caption: e.target.value }))}
              rows={3}
            />

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Add location"
                value={newStory.location}
                onChange={(e) => setNewStory(prev => ({ ...prev, location: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Submit */}
            <Button 
              onClick={handleCreateStory}
              disabled={uploading || newStory.files.length === 0}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Share Story
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={(open) => {
        setShowCommentsModal(open);
        if (!open && selectedUserIndex !== null) {
          startProgress();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-80 overflow-y-auto space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.comment_id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>{comment.user_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">No comments yet</p>
            )}
          </div>

          {isAuthenticated && currentStory && (
            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(currentStory.story_id)}
              />
              <Button 
                size="icon"
                onClick={() => handleAddComment(currentStory.story_id)}
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StoriesPage;
