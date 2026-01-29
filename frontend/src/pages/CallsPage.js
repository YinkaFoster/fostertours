import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent } from '../components/ui/dialog';
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock,
  Loader2, User, X, Volume2, VolumeX, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const WS_URL = process.env.REACT_APP_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';

const CallsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [callHistory, setCallHistory] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, active
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  
  const wsRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCallHistory();
      connectWebSocket();
    }
    
    return () => {
      cleanupCall();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (callStatus === 'active') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const connectWebSocket = () => {
    if (!user?.user_id) return;
    
    try {
      wsRef.current = new WebSocket(`${WS_URL}/ws/calls/${user.user_id}`);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for calls');
      };
      
      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Reconnect after delay
        setTimeout(() => {
          if (isAuthenticated && user) {
            connectWebSocket();
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const handleWebSocketMessage = async (data) => {
    switch (data.action) {
      case 'incoming-call':
        // Get caller info
        setIncomingCall({
          call_id: data.call_id,
          caller_id: data.from_user,
          caller_name: data.caller_name,
          caller_avatar: data.caller_avatar,
          call_type: data.call_type
        });
        setCallStatus('ringing');
        break;
        
      case 'offer':
        // Received WebRTC offer
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          sendWebSocketMessage({
            action: 'answer',
            target_user: data.from_user,
            call_id: data.call_id,
            sdp: answer
          });
        }
        break;
        
      case 'answer':
        // Received WebRTC answer
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          setCallStatus('active');
        }
        break;
        
      case 'ice-candidate':
        // Received ICE candidate
        if (peerConnectionRef.current && data.candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
        break;
        
      case 'call-rejected':
        toast.error('Call was rejected');
        cleanupCall();
        setCallStatus('idle');
        break;
        
      case 'call-ended':
        toast.info('Call ended');
        cleanupCall();
        setCallStatus('idle');
        fetchCallHistory();
        break;
    }
  };

  const sendWebSocketMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const fetchCallHistory = async () => {
    try {
      const response = await axios.get(`${API}/calls/history`, {
        headers: getAuthHeaders()
      });
      setCallHistory(response.data.calls || []);
    } catch (error) {
      console.error('Failed to fetch call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPeerConnection = async (isVideo = false) => {
    // Get local media stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create peer connection
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;
      
      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && activeCall) {
          sendWebSocketMessage({
            action: 'ice-candidate',
            target_user: activeCall.receiver_id === user.user_id 
              ? activeCall.caller_id 
              : activeCall.receiver_id,
            call_id: activeCall.call_id,
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          cleanupCall();
          setCallStatus('idle');
        }
      };
      
      return pc;
    } catch (error) {
      console.error('Failed to setup peer connection:', error);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  const initiateCall = async (receiverId, receiverName, receiverAvatar, callType = 'voice') => {
    try {
      setCallStatus('calling');
      
      // Create call record in backend
      const response = await axios.post(`${API}/calls/initiate`, {
        receiver_id: receiverId,
        call_type: callType
      }, {
        headers: getAuthHeaders()
      });
      
      const call = response.data.call;
      setActiveCall({
        ...call,
        other_user: {
          user_id: receiverId,
          name: receiverName,
          avatar: receiverAvatar
        }
      });
      
      // Setup WebRTC
      const pc = await setupPeerConnection(callType === 'video');
      
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer via WebSocket
      sendWebSocketMessage({
        action: 'incoming-call',
        target_user: receiverId,
        call_id: call.call_id,
        call_type: callType,
        caller_name: user.name,
        caller_avatar: user.picture || user.avatar
      });
      
      // Send WebRTC offer
      sendWebSocketMessage({
        action: 'offer',
        target_user: receiverId,
        call_id: call.call_id,
        sdp: offer,
        call_type: callType
      });
      
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error('Failed to start call');
      setCallStatus('idle');
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    
    try {
      // Answer in backend
      await axios.post(`${API}/calls/${incomingCall.call_id}/answer`, {}, {
        headers: getAuthHeaders()
      });
      
      setActiveCall({
        call_id: incomingCall.call_id,
        call_type: incomingCall.call_type,
        other_user: {
          user_id: incomingCall.caller_id,
          name: incomingCall.caller_name,
          avatar: incomingCall.caller_avatar
        }
      });
      
      // Setup WebRTC
      await setupPeerConnection(incomingCall.call_type === 'video');
      
      setIncomingCall(null);
      setCallStatus('active');
      
    } catch (error) {
      console.error('Failed to answer call:', error);
      toast.error('Failed to answer call');
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    
    try {
      await axios.post(`${API}/calls/${incomingCall.call_id}/reject`, {}, {
        headers: getAuthHeaders()
      });
      
      sendWebSocketMessage({
        action: 'call-rejected',
        target_user: incomingCall.caller_id,
        call_id: incomingCall.call_id
      });
      
      setIncomingCall(null);
      setCallStatus('idle');
      fetchCallHistory();
      
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const endCall = async () => {
    if (!activeCall) return;
    
    try {
      await axios.post(`${API}/calls/${activeCall.call_id}/end`, {}, {
        headers: getAuthHeaders()
      });
      
      sendWebSocketMessage({
        action: 'call-ended',
        target_user: activeCall.other_user?.user_id,
        call_id: activeCall.call_id
      });
      
      cleanupCall();
      setCallStatus('idle');
      fetchCallHistory();
      
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const cleanupCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setActiveCall(null);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCallIcon = (call) => {
    if (call.status === 'missed' || call.status === 'rejected') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    if (call.is_outgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-teal-600" />;
    }
    return <PhoneIncoming className="w-4 h-4 text-green-500" />;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Phone className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Calls</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign in to make voice and video calls
            </p>
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
      
      <section className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Phone className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Calls
            </h1>
          </div>

          {/* Call History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : callHistory.length > 0 ? (
                <div className="space-y-2">
                  {callHistory.map((call) => (
                    <div 
                      key={call.call_id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={call.other_user?.avatar} />
                        <AvatarFallback>
                          {call.other_user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{call.other_user?.name || 'User'}</h3>
                          {call.call_type === 'video' && (
                            <Video className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          {getCallIcon(call)}
                          <span>
                            {call.status === 'ended' 
                              ? formatDuration(call.duration || 0)
                              : call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                          </span>
                          <span>•</span>
                          <span>{formatCallTime(call.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-teal-600"
                          onClick={() => initiateCall(
                            call.other_user?.user_id,
                            call.other_user?.name,
                            call.other_user?.avatar,
                            'voice'
                          )}
                        >
                          <Phone className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-teal-600"
                          onClick={() => initiateCall(
                            call.other_user?.user_id,
                            call.other_user?.name,
                            call.other_user?.avatar,
                            'video'
                          )}
                        >
                          <Video className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No call history yet</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Start a call from someone's profile or messages
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Incoming Call Dialog */}
      <Dialog open={callStatus === 'ringing' && incomingCall !== null}>
        <DialogContent className="max-w-sm text-center">
          <div className="py-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={incomingCall?.caller_avatar} />
              <AvatarFallback className="text-3xl">
                {incomingCall?.caller_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-2">{incomingCall?.caller_name}</h2>
            <p className="text-slate-500 mb-6">
              Incoming {incomingCall?.call_type} call...
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={rejectCall}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600"
                onClick={answerCall}
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Dialog */}
      <Dialog open={callStatus === 'calling' || callStatus === 'active'}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
            {/* Remote Video */}
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (PiP) */}
            {activeCall?.call_type === 'video' && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
                <video 
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Call Status Overlay */}
            {callStatus === 'calling' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={activeCall?.other_user?.avatar} />
                  <AvatarFallback className="text-3xl">
                    {activeCall?.other_user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-white text-xl font-semibold mb-2">
                  {activeCall?.other_user?.name}
                </h2>
                <p className="text-white/70">Calling...</p>
              </div>
            )}
            
            {/* Call Info */}
            {callStatus === 'active' && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-3 bg-black/50 rounded-full px-4 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activeCall?.other_user?.avatar} />
                    <AvatarFallback>{activeCall?.other_user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {activeCall?.other_user?.name}
                    </p>
                    <p className="text-white/70 text-xs">
                      {formatDuration(callDuration)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Call Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full w-12 h-12 ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                } text-white`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              {activeCall?.call_type === 'video' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-12 h-12 ${
                    isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                  } text-white`}
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={endCall}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full w-12 h-12 ${
                  isSpeakerOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                } text-white`}
                onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              >
                {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CallsPage;
