import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  MessageCircle, Send, Search, ArrowLeft, MoreVertical,
  Check, CheckCheck, Loader2, User, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.conversation_id === conversationId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        headers: getAuthHeaders()
      });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setShowNewMessage(false);
    try {
      const response = await axios.get(
        `${API}/messages/conversation/${conv.conversation_id}`,
        { headers: getAuthHeaders() }
      );
      setMessages(response.data.messages || []);
      
      // Update unread count in local state
      setConversations(prev => prev.map(c => 
        c.conversation_id === conv.conversation_id 
          ? { ...c, unread_count: 0 }
          : c
      ));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.other_user?.user_id) return;

    setSending(true);
    try {
      const response = await axios.post(
        `${API}/messages/send?receiver_id=${selectedConversation.other_user.user_id}&content=${encodeURIComponent(newMessage)}`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      
      // Update conversation in list
      setConversations(prev => prev.map(c => 
        c.conversation_id === selectedConversation.conversation_id
          ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() }
          : c
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchUsers([]);
      return;
    }
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
      setSearchUsers(response.data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const startNewConversation = async (otherUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user?.user_id === otherUser.user_id);
    if (existing) {
      handleSelectConversation(existing);
      return;
    }

    // Create new conversation object locally
    const newConv = {
      conversation_id: `temp_${Date.now()}`,
      participants: [user?.user_id, otherUser.user_id],
      other_user: otherUser,
      last_message: null,
      last_message_at: null,
      unread_count: 0
    };
    
    setSelectedConversation(newConv);
    setMessages([]);
    setShowNewMessage(false);
    setSearchUsers([]);
    setSearchTerm('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <MessageCircle className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Messages</h1>
            <p className="text-slate-600 mb-8">Sign in to view and send messages</p>
            <Link to="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="h-[calc(100vh-80px)] flex">
            {/* Conversations List */}
            <div className={`w-full md:w-96 border-r dark:border-slate-800 flex flex-col ${
              selectedConversation ? 'hidden md:flex' : 'flex'
            }`}>
              {/* Header */}
              <div className="p-4 border-b dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Messages</h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowNewMessage(!showNewMessage)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                
                {showNewMessage ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                    />
                    {searchUsers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                        {searchUsers.map((u) => (
                          <div
                            key={u.user_id}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                            onClick={() => startNewConversation(u)}
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback>{u.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                )}
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      className={`p-4 border-b dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        selectedConversation?.conversation_id === conv.conversation_id
                          ? 'bg-teal-50 dark:bg-teal-900/20'
                          : ''
                      }`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.other_user?.avatar} />
                          <AvatarFallback>
                            {conv.other_user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-900 dark:text-white truncate">
                              {conv.other_user?.name || 'User'}
                            </h3>
                            {conv.last_message_at && (
                              <span className="text-xs text-slate-500">
                                {formatTime(conv.last_message_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-teal-600">{conv.unread_count}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No conversations yet</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Start a new conversation by clicking the + button
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${
              selectedConversation ? 'flex' : 'hidden md:flex'
            }`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b dark:border-slate-800 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.other_user?.avatar} />
                      <AvatarFallback>
                        {selectedConversation.other_user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        {selectedConversation.other_user?.name || 'User'}
                      </h2>
                    </div>
                    <Link to={`/profile/${selectedConversation.other_user?.user_id}`}>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`flex ${
                          msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.sender_id === user?.user_id
                              ? 'bg-teal-600 text-white rounded-br-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            msg.sender_id === user?.user_id ? 'text-teal-100' : 'text-slate-400'
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.created_at)}
                            </span>
                            {msg.sender_id === user?.user_id && (
                              msg.read 
                                ? <CheckCheck className="w-4 h-4" />
                                : <Check className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-800">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Select a conversation
                    </h2>
                    <p className="text-slate-500">
                      Choose a conversation from the list or start a new one
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MessagesPage;
