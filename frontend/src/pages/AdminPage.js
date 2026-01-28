import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Loader2, RefreshCw, Eye, Package
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({ open: false, type: '', item: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });

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
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: usersPage, limit: 10 });
      if (usersSearch) params.append('search', usersSearch);
      
      const response = await axios.get(`${API}/admin/users?${params}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
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
      
      const response = await axios.get(`${API}/admin/bookings?${params}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
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
      
      const response = await axios.get(`${API}/admin/orders?${params}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setOrders(response.data.orders);
      setOrdersTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, makeAdmin) => {
    try {
      const endpoint = makeAdmin ? 'make-admin' : 'revoke-admin';
      await axios.post(`${API}/admin/${endpoint}/${userId}`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      toast.success(makeAdmin ? 'Admin privileges granted' : 'Admin privileges revoked');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.item) return;
    try {
      await axios.delete(`${API}/admin/users/${deleteDialog.item.user_id}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      toast.success('User deleted');
      setDeleteDialog({ open: false, type: '', item: null });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Delete failed');
    }
  };

  const handleUpdateBooking = async (bookingId, status) => {
    try {
      await axios.put(`${API}/admin/bookings/${bookingId}`, { status }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      toast.success('Booking updated');
      fetchBookings();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpdateOrder = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}`, { status }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      toast.success('Order updated');
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return (
      <Badge className={`${colors[status] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-page">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your travel platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{stats?.stats?.users || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                        <p className="text-2xl font-bold">{stats?.stats?.bookings || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Orders</p>
                        <p className="text-2xl font-bold">{stats?.stats?.orders || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <Map className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Itineraries</p>
                        <p className="text-2xl font-bold">{stats?.stats?.itineraries || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats?.stats?.revenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest user registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.recent_users?.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recent_users.map((u) => (
                          <div key={u.user_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                {u.picture ? (
                                  <img src={u.picture} alt="" className="w-10 h-10 rounded-full" />
                                ) : (
                                  <span className="text-sm font-medium">{u.name?.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                            {u.is_admin && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No users yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest booking activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.recent_bookings?.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recent_bookings.map((b) => (
                          <div key={b.booking_id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium capitalize">{b.booking_type} Booking</p>
                              <p className="text-sm text-muted-foreground">{formatDate(b.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(b.total_amount)}</p>
                              {getStatusBadge(b.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No bookings yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage all registered users</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                          className="pl-9 w-64"
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {u.picture ? (
                                      <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                      <span className="text-xs font-medium">{u.name?.charAt(0)}</span>
                                    )}
                                  </div>
                                  <span className="font-medium">{u.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>{formatCurrency(u.wallet_balance)}</TableCell>
                              <TableCell>{formatDate(u.created_at)}</TableCell>
                              <TableCell>
                                {u.is_admin ? (
                                  <Badge variant="default">Admin</Badge>
                                ) : (
                                  <Badge variant="secondary">User</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {u.is_admin ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleToggleAdmin(u.user_id, false)}
                                      title="Revoke Admin"
                                      disabled={u.user_id === user?.user_id}
                                    >
                                      <ShieldOff className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleToggleAdmin(u.user_id, true)}
                                      title="Make Admin"
                                    >
                                      <Shield className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteDialog({ open: true, type: 'user', item: u })}
                                    disabled={u.user_id === user?.user_id}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {usersPage} of {usersTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            disabled={usersPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                            disabled={usersPage === usersTotalPages}
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
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Booking Management</CardTitle>
                      <CardDescription>Manage all travel bookings</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={bookingsStatus} onValueChange={setBookingsStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
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
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No bookings found</p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((b) => (
                            <TableRow key={b.booking_id}>
                              <TableCell className="font-mono text-sm">{b.booking_id}</TableCell>
                              <TableCell className="capitalize">{b.booking_type}</TableCell>
                              <TableCell>{b.user?.name || 'Unknown'}</TableCell>
                              <TableCell>{formatCurrency(b.total_amount)}</TableCell>
                              <TableCell>{getStatusBadge(b.status)}</TableCell>
                              <TableCell>{formatDate(b.created_at)}</TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={b.status}
                                  onValueChange={(status) => handleUpdateBooking(b.booking_id, status)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {bookingsPage} of {bookingsTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setBookingsPage(p => Math.max(1, p - 1)); }}
                            disabled={bookingsPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setBookingsPage(p => Math.min(bookingsTotalPages, p + 1)); }}
                            disabled={bookingsPage === bookingsTotalPages}
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

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Order Management</CardTitle>
                      <CardDescription>Manage store orders</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={ordersStatus} onValueChange={setOrdersStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders found</p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((o) => (
                            <TableRow key={o.order_id}>
                              <TableCell className="font-mono text-sm">{o.order_id}</TableCell>
                              <TableCell>{o.user?.name || 'Unknown'}</TableCell>
                              <TableCell>{o.items?.length || 0} items</TableCell>
                              <TableCell>{formatCurrency(o.total)}</TableCell>
                              <TableCell>{getStatusBadge(o.status)}</TableCell>
                              <TableCell>{formatDate(o.created_at)}</TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={o.status}
                                  onValueChange={(status) => handleUpdateOrder(o.order_id, status)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {ordersPage} of {ordersTotalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setOrdersPage(p => Math.max(1, p - 1)); }}
                            disabled={ordersPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setOrdersPage(p => Math.min(ordersTotalPages, p + 1)); }}
                            disabled={ordersPage === ordersTotalPages}
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
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.item?.name}? This action cannot be undone.
              All associated bookings and data will also be deleted.
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
