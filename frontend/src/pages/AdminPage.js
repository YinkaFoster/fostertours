import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {
  Users, ShoppingCart, Calendar, Map, DollarSign, TrendingUp,
  Search, Edit, Trash2, Shield, ShieldOff, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Eye, Package, Download, Upload, FileText, Settings,
  Megaphone, Home, Plus, Image, Link as LinkIcon, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const USER_ROLES = ["user", "moderator", "support", "manager", "admin", "super_admin"];

const AdminPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsStatus, setBookingsStatus] = useState('all');
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersStatus, setOrdersStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Reports state
  const [reportType, setReportType] = useState('users');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Ads state
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'banner',
    priority: 0,
    is_active: true
  });
  
  // Dialogs state
  const [editDialog, setEditDialog] = useState({ open: false, type: '', item: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [roleDialog, setRoleDialog] = useState({ open: false, user: null, newRole: '' });
  const [adDialog, setAdDialog] = useState({ open: false, ad: null });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && !user.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
    fetchStats();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'ads') fetchAds();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: usersPage, limit: 10 });
      if (usersSearch) params.append('search', usersSearch);
      
      const response = await axios.get(`${API}/admin/users?${params}`, { headers: getAuthHeaders() });
      setUsers(response.data.users);
      setUsersTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams({ page: bookingsPage, limit: 10 });
      if (bookingsStatus !== 'all') params.append('status', bookingsStatus);
      
      const response = await axios.get(`${API}/admin/bookings?${params}`, { headers: getAuthHeaders() });
      setBookings(response.data.bookings);
      setBookingsTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({ page: ordersPage, limit: 10 });
      if (ordersStatus !== 'all') params.append('status', ordersStatus);
      
      const response = await axios.get(`${API}/admin/orders?${params}`, { headers: getAuthHeaders() });
      setOrders(response.data.orders);
      setOrdersTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await axios.get(`${API}/admin/settings`, { headers: getAuthHeaders() });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchAds = async () => {
    setAdsLoading(true);
    try {
      const response = await axios.get(`${API}/admin/ads`, { headers: getAuthHeaders() });
      setAds(response.data.ads || []);
    } catch (error) {
      toast.error('Failed to fetch advertisements');
    } finally {
      setAdsLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole }, { headers: getAuthHeaders() });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      setRoleDialog({ open: false, user: null, newRole: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const generateReport = async (format = 'json') => {
    setReportLoading(true);
    try {
      const response = await axios.get(`${API}/admin/reports/generate`, {
        params: { report_type: reportType, format },
        headers: getAuthHeaders()
      });
      
      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([response.data.content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Downloaded ${response.data.filename}`);
      } else {
        // Download JSON file
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Downloaded ${reportType} report (${response.data.total_rows} rows)`);
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const uploadReport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API}/admin/reports/upload`, formData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`File uploaded: ${response.data.filename}`);
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const saveSettings = async () => {
    try {
      await axios.put(`${API}/admin/settings`, settings, { headers: getAuthHeaders() });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const createAd = async () => {
    try {
      await axios.post(`${API}/admin/ads`, newAd, { headers: getAuthHeaders() });
      toast.success('Advertisement created');
      fetchAds();
      setAdDialog({ open: false, ad: null });
      setNewAd({ title: '', description: '', image_url: '', link_url: '', position: 'banner', priority: 0, is_active: true });
    } catch (error) {
      toast.error('Failed to create advertisement');
    }
  };

  const updateAd = async (adId, data) => {
    try {
      await axios.put(`${API}/admin/ads/${adId}`, data, { headers: getAuthHeaders() });
      toast.success('Advertisement updated');
      fetchAds();
    } catch (error) {
      toast.error('Failed to update advertisement');
    }
  };

  const deleteAd = async (adId) => {
    try {
      await axios.delete(`${API}/admin/ads/${adId}`, { headers: getAuthHeaders() });
      toast.success('Advertisement deleted');
      fetchAds();
    } catch (error) {
      toast.error('Failed to delete advertisement');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.item) return;
    try {
      await axios.delete(`${API}/admin/users/${deleteDialog.item.user_id}`, { headers: getAuthHeaders() });
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteDialog({ open: false, type: '', item: null });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
          {/* Header with Back to Home */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  <Home className="w-4 h-4" />
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">Admin Panel</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage users, bookings, and app settings</p>
            </div>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
          </div>

          {/* Tabs - Mobile Scrollable */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex min-w-max sm:grid sm:grid-cols-6 h-auto p-1 gap-1">
                <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <BarChart3 className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <Users className="w-4 h-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="bookings" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <Calendar className="w-4 h-4" /> Bookings
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <Package className="w-4 h-4" /> Orders
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <FileText className="w-4 h-4" /> Reports
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <Settings className="w-4 h-4" /> Settings
                </TabsTrigger>
                <TabsTrigger value="ads" className="gap-2 text-xs sm:text-sm px-3 py-2">
                  <Megaphone className="w-4 h-4" /> Ads
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Users</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats?.stats?.users || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Bookings</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats?.stats?.bookings || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Orders</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats?.stats?.orders || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                        <p className="text-xl sm:text-2xl font-bold">${(stats?.stats?.revenue || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.recent_users?.map((u) => (
                        <div key={u.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{u.name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <Badge variant={u.is_admin ? 'default' : 'outline'} className="text-xs">
                            {u.role || (u.is_admin ? 'admin' : 'user')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.recent_bookings?.map((b) => (
                        <div key={b.booking_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{b.booking_type}</p>
                            <p className="text-xs text-muted-foreground">${b.total_amount}</p>
                          </div>
                          <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {b.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="icon" onClick={fetchUsers}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead className="hidden sm:table-cell">Role</TableHead>
                              <TableHead className="hidden md:table-cell">Balance</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((u) => (
                              <TableRow key={u.user_id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{u.name || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                    <Badge variant="outline" className="sm:hidden mt-1 text-xs">
                                      {u.role || 'user'}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant={u.is_admin ? 'default' : 'outline'}>
                                    {u.role || (u.is_admin ? 'admin' : 'user')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">${u.wallet_balance?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setRoleDialog({ open: true, user: u, newRole: u.role || 'user' })}
                                      title="Change Role"
                                    >
                                      <Shield className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteDialog({ open: true, type: 'user', item: u })}
                                      className="text-destructive"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {usersPage} of {usersTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={usersPage <= 1}
                            onClick={() => { setUsersPage(p => p - 1); fetchUsers(); }}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={usersPage >= usersTotalPages}
                            onClick={() => { setUsersPage(p => p + 1); fetchUsers(); }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Booking Management</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={bookingsStatus} onValueChange={(v) => { setBookingsStatus(v); setBookingsPage(1); }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={fetchBookings}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead className="hidden sm:table-cell">User</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bookings.map((b) => (
                              <TableRow key={b.booking_id}>
                                <TableCell className="font-medium capitalize">{b.booking_type}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm">{b.user?.email || 'N/A'}</TableCell>
                                <TableCell>${b.total_amount}</TableCell>
                                <TableCell>
                                  <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                    {b.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">Page {bookingsPage} of {bookingsTotalPages}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled={bookingsPage <= 1} onClick={() => { setBookingsPage(p => p - 1); }}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={bookingsPage >= bookingsTotalPages} onClick={() => { setBookingsPage(p => p + 1); }}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Order Management</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={ordersStatus} onValueChange={(v) => { setOrdersStatus(v); setOrdersPage(1); }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={fetchOrders}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead className="hidden sm:table-cell">User</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((o) => (
                              <TableRow key={o.order_id}>
                                <TableCell className="font-mono text-xs">{o.order_id?.slice(0, 8)}...</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm">{o.user?.email || 'N/A'}</TableCell>
                                <TableCell>${o.total}</TableCell>
                                <TableCell>
                                  <Badge variant={o.status === 'delivered' ? 'default' : 'secondary'}>{o.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">Page {ordersPage} of {ordersTotalPages}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled={ordersPage <= 1} onClick={() => setOrdersPage(p => p - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={ordersPage >= ordersTotalPages} onClick={() => setOrdersPage(p => p + 1)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" /> Generate Reports
                    </CardTitle>
                    <CardDescription>Download reports in CSV or JSON format</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="users">Users Report</SelectItem>
                          <SelectItem value="bookings">Bookings Report</SelectItem>
                          <SelectItem value="orders">Orders Report</SelectItem>
                          <SelectItem value="revenue">Revenue Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => generateReport('csv')} disabled={reportLoading} className="flex-1">
                        {reportLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download CSV
                      </Button>
                      <Button variant="outline" onClick={() => generateReport('json')} disabled={reportLoading} className="flex-1">
                        {reportLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" /> Upload Reports
                    </CardTitle>
                    <CardDescription>Upload CSV or Excel files for processing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">Supports CSV, XLSX, XLS</p>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={uploadReport}
                        className="mt-4"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              {settingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : settings ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* General Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Site Name</Label>
                        <Input
                          value={settings.site_name || ''}
                          onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Site Description</Label>
                        <Textarea
                          value={settings.site_description || ''}
                          onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                          value={settings.contact_email || ''}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input
                          value={settings.contact_phone || ''}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp Number</Label>
                        <Input
                          value={settings.contact_whatsapp || ''}
                          onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Maintenance Mode</Label>
                        <Switch
                          checked={settings.maintenance_mode || false}
                          onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Media Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Media</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'].map((platform) => (
                        <div key={platform} className="space-y-2">
                          <Label className="capitalize">{platform}</Label>
                          <Input
                            placeholder={`https://${platform}.com/...`}
                            value={settings.social_media?.[platform] || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              social_media: { ...settings.social_media, [platform]: e.target.value }
                            })}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Booking Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Allow Instant Booking</Label>
                        <Switch
                          checked={settings.booking_settings?.allow_instant_booking || false}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            booking_settings: { ...settings.booking_settings, allow_instant_booking: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require Payment Upfront</Label>
                        <Switch
                          checked={settings.booking_settings?.require_payment_upfront || false}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            booking_settings: { ...settings.booking_settings, require_payment_upfront: checked }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cancellation Notice (hours)</Label>
                        <Input
                          type="number"
                          value={settings.booking_settings?.cancellation_hours || 24}
                          onChange={(e) => setSettings({
                            ...settings,
                            booking_settings: { ...settings.booking_settings, cancellation_hours: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Passengers per Booking</Label>
                        <Input
                          type="number"
                          value={settings.booking_settings?.max_passengers_per_booking || 9}
                          onChange={(e) => setSettings({
                            ...settings,
                            booking_settings: { ...settings.booking_settings, max_passengers_per_booking: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Email Notifications</Label>
                        <Switch
                          checked={settings.notification_settings?.email_notifications || false}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notification_settings: { ...settings.notification_settings, email_notifications: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>SMS Notifications</Label>
                        <Switch
                          checked={settings.notification_settings?.sms_notifications || false}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notification_settings: { ...settings.notification_settings, sms_notifications: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Push Notifications</Label>
                        <Switch
                          checked={settings.notification_settings?.push_notifications || false}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notification_settings: { ...settings.notification_settings, push_notifications: checked }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="md:col-span-2">
                    <Button onClick={saveSettings} className="w-full">
                      <Settings className="w-4 h-4 mr-2" /> Save All Settings
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            {/* Ads Tab */}
            <TabsContent value="ads">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Advertisement Management</CardTitle>
                      <CardDescription>Create and manage promotional banners</CardDescription>
                    </div>
                    <Dialog open={adDialog.open} onOpenChange={(open) => setAdDialog({ open, ad: null })}>
                      <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> New Ad</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Advertisement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={newAd.title}
                              onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newAd.description}
                              onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={newAd.image_url}
                              onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link URL</Label>
                            <Input
                              value={newAd.link_url}
                              onChange={(e) => setNewAd({ ...newAd, link_url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Position</Label>
                            <Select value={newAd.position} onValueChange={(v) => setNewAd({ ...newAd, position: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="banner">Banner (Top)</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="inline">Inline (Content)</SelectItem>
                                <SelectItem value="popup">Popup</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                              checked={newAd.is_active}
                              onCheckedChange={(checked) => setNewAd({ ...newAd, is_active: checked })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={createAd}>Create Ad</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {adsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : ads.length === 0 ? (
                    <div className="text-center py-8">
                      <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No advertisements yet</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ads.map((ad) => (
                        <Card key={ad.ad_id} className="overflow-hidden">
                          {ad.image_url && (
                            <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover" />
                          )}
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{ad.title}</h3>
                              <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                                {ad.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ad.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <span>Position: {ad.position}</span>
                              <span>{ad.click_count || 0} clicks</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => updateAd(ad.ad_id, { is_active: !ad.is_active })}
                              >
                                {ad.is_active ? 'Disable' : 'Enable'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteAd(ad.ad_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Assign a new role to {roleDialog.user?.name || roleDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Role</Label>
            <Select value={roleDialog.newRole} onValueChange={(v) => setRoleDialog({ ...roleDialog, newRole: v })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Admin and Super Admin roles get full admin access
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, user: null, newRole: '' })}>
              Cancel
            </Button>
            <Button onClick={() => updateUserRole(roleDialog.user?.user_id, roleDialog.newRole)}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, type: '', item: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
