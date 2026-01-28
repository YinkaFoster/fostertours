import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Sparkles, Send, MapPin, Calendar, DollarSign, Users, Heart, Loader2,
  Bot, User, Save, Trash2, ChevronLeft, Plus, History, Plane, Map
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AIItineraryPage = () => {
  const { sessionId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Form state for new session
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState([]);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const interestOptions = [
    { id: 'culture', label: 'Culture & History', icon: '🏛️' },
    { id: 'food', label: 'Food & Dining', icon: '🍕' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'nature', label: 'Nature', icon: '🌿' },
    { id: 'beach', label: 'Beach & Relaxation', icon: '🏖️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'art', label: 'Art & Museums', icon: '🎨' },
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($50-100/day)' },
    { value: 'moderate', label: 'Moderate ($100-200/day)' },
    { value: 'luxury', label: 'Luxury ($200-500/day)' },
    { value: 'ultra-luxury', label: 'Ultra Luxury ($500+/day)' },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/itinerary/ai' } } });
      return;
    }

    // Fetch existing sessions
    fetchSessions();

    // If sessionId in URL, load that session
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [isAuthenticated, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/ai/itinerary`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const loadSession = async (sid) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ai/itinerary/${sid}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setCurrentSessionId(sid);
      setDestination(response.data.destination || '');
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/itinerary/ai');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlanning = async (e) => {
    e.preventDefault();
    
    if (!destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select your travel dates');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${API}/ai/itinerary/start`,
        {
          destination,
          start_date: startDate,
          end_date: endDate,
          budget,
          travelers,
          interests
        },
        { headers: getAuthHeaders(), withCredentials: true }
      );

      setCurrentSessionId(response.data.session_id);
      setMessages([
        {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Update URL without reload
      window.history.pushState({}, '', `/itinerary/ai/${response.data.session_id}`);
      
      fetchSessions();
      toast.success('Let\'s plan your trip!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start planning');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentSessionId) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await axios.post(
        `${API}/ai/itinerary/${currentSessionId}/chat`,
        { message: inputMessage },
        { headers: getAuthHeaders(), withCredentials: true }
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      toast.error('Failed to send message');
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSaveItinerary = async () => {
    if (!currentSessionId) return;

    try {
      const response = await axios.post(
        `${API}/ai/itinerary/${currentSessionId}/save`,
        { title: `Trip to ${destination}` },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      toast.success('Itinerary saved to your trips!');
      navigate(`/itinerary/${response.data.itinerary_id}`);
    } catch (error) {
      toast.error('Failed to save itinerary');
    }
  };

  const handleDeleteSession = async (sid) => {
    try {
      await axios.delete(`${API}/ai/itinerary/${sid}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      toast.success('Session deleted');
      fetchSessions();
      if (sid === currentSessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        navigate('/itinerary/ai');
      }
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('moderate');
    setTravelers(2);
    setInterests([]);
    navigate('/itinerary/ai');
  };

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "Add more restaurant recommendations",
    "What's the best time to visit each place?",
    "Make the schedule more relaxed",
    "Add some budget-friendly alternatives",
    "Include local transportation tips",
    "What should I pack for this trip?"
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="ai-itinerary-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - History */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-soft sticky top-24">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5" />
                      History
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleNewChat}
                      className="h-8"
                      data-testid="new-chat-btn"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[300px]">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No previous trips planned
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div
                            key={session.session_id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                              session.session_id === currentSessionId
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              navigate(`/itinerary/ai/${session.session_id}`);
                              loadSession(session.session_id);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {session.destination || 'Untitled Trip'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {session.start_date} - {session.end_date}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session.session_id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {!currentSessionId ? (
                /* New Trip Form */
                <Card className="border-0 shadow-soft" data-testid="trip-form">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">AI Travel Planner</CardTitle>
                        <CardDescription>
                          Tell me about your dream trip and I'll create the perfect itinerary
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleStartPlanning} className="space-y-6">
                      {/* Destination */}
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Where do you want to go?
                        </Label>
                        <Input
                          id="destination"
                          placeholder="e.g., Tokyo, Japan"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="h-12 text-lg"
                          data-testid="destination-input"
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Start Date
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12"
                            data-testid="start-date-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            End Date
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-12"
                            data-testid="end-date-input"
                          />
                        </div>
                      </div>

                      {/* Budget & Travelers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Budget
                          </Label>
                          <Select value={budget} onValueChange={setBudget}>
                            <SelectTrigger className="h-12" data-testid="budget-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {budgetOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="travelers" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Number of Travelers
                          </Label>
                          <Input
                            id="travelers"
                            type="number"
                            min="1"
                            max="20"
                            value={travelers}
                            onChange={(e) => setTravelers(parseInt(e.target.value))}
                            className="h-12"
                            data-testid="travelers-input"
                          />
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          What are you interested in?
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {interestOptions.map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => toggleInterest(interest.id)}
                              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                                interests.includes(interest.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              data-testid={`interest-${interest.id}`}
                            >
                              <span className="text-2xl mb-1 block">{interest.icon}</span>
                              <span className="text-sm font-medium">{interest.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg btn-pill bg-gradient-to-r from-primary to-secondary"
                        disabled={sending}
                        data-testid="start-planning-btn"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="w-5 h-5 mr-2" />
                        )}
                        Start Planning My Trip
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                /* Chat Interface */
                <Card className="border-0 shadow-soft h-[calc(100vh-140px)] flex flex-col" data-testid="chat-interface">
                  {/* Chat Header */}
                  <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Trip to {destination}</CardTitle>
                          <CardDescription>{startDate} - {endDate}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveItinerary}
                          data-testid="save-itinerary-btn"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNewChat}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          New Trip
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'justify-end' : ''
                            }`}
                            data-testid={`message-${index}`}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl p-4 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {sending && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-muted rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Quick Suggestions */}
                  {messages.length > 0 && !sending && (
                    <div className="px-4 pb-2">
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-2">
                          {quickSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0 rounded-full"
                              onClick={() => setInputMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <Input
                        ref={inputRef}
                        placeholder="Ask me to modify your itinerary..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={sending}
                        className="flex-1 h-12"
                        data-testid="chat-input"
                      />
                      <Button
                        type="submit"
                        disabled={!inputMessage.trim() || sending}
                        className="h-12 px-6 btn-pill bg-primary"
                        data-testid="send-btn"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </form>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIItineraryPage;
