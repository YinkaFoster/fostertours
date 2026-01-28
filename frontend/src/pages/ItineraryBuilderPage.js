import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, GripVertical, Calendar, MapPin, Clock, DollarSign,
  Save, Loader2, ChevronLeft, Edit, Hotel, Utensils, Camera, Car, Plane
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Activity types with icons
const activityTypes = [
  { type: 'sightseeing', label: 'Sightseeing', icon: Camera, color: 'bg-blue-500' },
  { type: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-orange-500' },
  { type: 'accommodation', label: 'Hotel/Stay', icon: Hotel, color: 'bg-purple-500' },
  { type: 'transport', label: 'Transport', icon: Car, color: 'bg-green-500' },
  { type: 'flight', label: 'Flight', icon: Plane, color: 'bg-teal-500' },
  { type: 'other', label: 'Other', icon: MapPin, color: 'bg-gray-500' },
];

// Sortable Activity Item
const SortableActivity = ({ activity, onEdit, onDelete, dayIndex }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeInfo = activityTypes.find(t => t.type === activity.type) || activityTypes[5];
  const Icon = typeInfo.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-background rounded-lg border group ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className={`w-8 h-8 rounded-full ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{activity.title}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {activity.time && <span>{activity.time}</span>}
          {activity.location && (
            <>
              <span>•</span>
              <span className="truncate">{activity.location}</span>
            </>
          )}
        </div>
      </div>
      
      {activity.cost > 0 && (
        <Badge variant="secondary" className="flex-shrink-0">
          ${activity.cost}
        </Badge>
      )}
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(activity, dayIndex)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(activity.id, dayIndex)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Day Card
const DayCard = ({ day, index, activities, onAddActivity, onEditActivity, onDeleteActivity, onDragEnd, onUpdateDay, onDeleteDay }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = activities.findIndex(a => a.id === active.id);
      const newIndex = activities.findIndex(a => a.id === over.id);
      onDragEnd(index, oldIndex, newIndex);
    }
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">{index + 1}</span>
            </div>
            <div>
              <Input
                value={day.title || `Day ${index + 1}`}
                onChange={(e) => onUpdateDay(index, { title: e.target.value })}
                className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0"
                placeholder={`Day ${index + 1}`}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <Input
                  type="date"
                  value={day.date || ''}
                  onChange={(e) => onUpdateDay(index, { date: e.target.value })}
                  className="border-0 p-0 h-auto w-32 focus-visible:ring-0 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddActivity(index)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            {index > 0 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteDay(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No activities yet</p>
            <Button
              variant="link"
              onClick={() => onAddActivity(index)}
              className="mt-2"
            >
              Add your first activity
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activities.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {activities.map((activity) => (
                  <SortableActivity
                    key={activity.id}
                    activity={activity}
                    dayIndex={index}
                    onEdit={onEditActivity}
                    onDelete={onDeleteActivity}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        {/* Day Notes */}
        <div className="mt-4 pt-4 border-t">
          <Textarea
            placeholder="Add notes for this day..."
            value={day.notes || ''}
            onChange={(e) => onUpdateDay(index, { notes: e.target.value })}
            className="resize-none"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ItineraryBuilderPage = () => {
  const { itineraryId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!!itineraryId);
  const [saving, setSaving] = useState(false);
  
  // Itinerary data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [days, setDays] = useState([{ title: 'Day 1', date: '', activities: [], notes: '' }]);
  const [totalBudget, setTotalBudget] = useState(0);
  
  // Activity dialog
  const [activityDialog, setActivityDialog] = useState({
    open: false,
    dayIndex: 0,
    activity: null
  });
  const [activityForm, setActivityForm] = useState({
    title: '',
    type: 'sightseeing',
    time: '',
    duration: '',
    location: '',
    cost: 0,
    notes: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (itineraryId) {
      loadItinerary();
    }
  }, [isAuthenticated, itineraryId]);

  // Calculate total budget whenever days change
  useEffect(() => {
    const total = days.reduce((sum, day) => {
      return sum + day.activities.reduce((daySum, act) => daySum + (act.cost || 0), 0);
    }, 0);
    setTotalBudget(total);
  }, [days]);

  const loadItinerary = async () => {
    try {
      const response = await axios.get(`${API}/itineraries/${itineraryId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      const data = response.data;
      setTitle(data.title || '');
      setDescription(data.description || '');
      setStartDate(data.start_date || '');
      setEndDate(data.end_date || '');
      setDestinations(data.destinations || []);
      setDays(data.days?.length > 0 ? data.days : [{ title: 'Day 1', date: '', activities: [], notes: '' }]);
    } catch (error) {
      toast.error('Failed to load itinerary');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        destinations,
        days,
        total_budget: totalBudget
      };

      if (itineraryId) {
        await axios.put(`${API}/itineraries/${itineraryId}`, payload, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        toast.success('Itinerary updated!');
      } else {
        const response = await axios.post(`${API}/itineraries`, payload, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        toast.success('Itinerary created!');
        navigate(`/itinerary/builder/${response.data.itinerary_id}`);
      }
    } catch (error) {
      toast.error('Failed to save itinerary');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDay = () => {
    const newDay = {
      title: `Day ${days.length + 1}`,
      date: '',
      activities: [],
      notes: ''
    };
    setDays([...days, newDay]);
  };

  const handleUpdateDay = (dayIndex, updates) => {
    setDays(days.map((day, i) => i === dayIndex ? { ...day, ...updates } : day));
  };

  const handleDeleteDay = (dayIndex) => {
    if (days.length === 1) {
      toast.error('You need at least one day');
      return;
    }
    setDays(days.filter((_, i) => i !== dayIndex));
  };

  const handleOpenActivityDialog = (dayIndex, activity = null) => {
    setActivityDialog({ open: true, dayIndex, activity });
    if (activity) {
      setActivityForm({
        title: activity.title,
        type: activity.type,
        time: activity.time || '',
        duration: activity.duration || '',
        location: activity.location || '',
        cost: activity.cost || 0,
        notes: activity.notes || ''
      });
    } else {
      setActivityForm({
        title: '',
        type: 'sightseeing',
        time: '',
        duration: '',
        location: '',
        cost: 0,
        notes: ''
      });
    }
  };

  const handleSaveActivity = () => {
    if (!activityForm.title.trim()) {
      toast.error('Please enter activity title');
      return;
    }

    const { dayIndex, activity } = activityDialog;
    
    if (activity) {
      // Edit existing
      setDays(days.map((day, i) => {
        if (i === dayIndex) {
          return {
            ...day,
            activities: day.activities.map(a => 
              a.id === activity.id ? { ...a, ...activityForm } : a
            )
          };
        }
        return day;
      }));
      toast.success('Activity updated');
    } else {
      // Add new
      const newActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...activityForm
      };
      setDays(days.map((day, i) => {
        if (i === dayIndex) {
          return { ...day, activities: [...day.activities, newActivity] };
        }
        return day;
      }));
      toast.success('Activity added');
    }

    setActivityDialog({ open: false, dayIndex: 0, activity: null });
  };

  const handleDeleteActivity = (activityId, dayIndex) => {
    setDays(days.map((day, i) => {
      if (i === dayIndex) {
        return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
      }
      return day;
    }));
    toast.success('Activity deleted');
  };

  const handleDragEnd = (dayIndex, oldIndex, newIndex) => {
    setDays(days.map((day, i) => {
      if (i === dayIndex) {
        return { ...day, activities: arrayMove(day.activities, oldIndex, newIndex) };
      }
      return day;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="itinerary-builder">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-serif">
                  {itineraryId ? 'Edit Itinerary' : 'Create Itinerary'}
                </h1>
                <p className="text-muted-foreground">Plan your perfect trip</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-pill"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>

          {/* Trip Info */}
          <Card className="border-0 shadow-soft mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Trip Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer in Europe"
                    className="text-lg font-medium mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your trip..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="destinations">Destinations</Label>
                  <Input
                    id="destinations"
                    value={destinations.join(', ')}
                    onChange={(e) => setDestinations(e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
                    placeholder="e.g., Paris, Rome, Barcelona"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple destinations with commas</p>
                </div>
              </div>

              {/* Budget Summary */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-medium">Estimated Budget</span>
                </div>
                <span className="text-2xl font-bold text-primary">${totalBudget.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Days */}
          <div className="space-y-6">
            {days.map((day, index) => (
              <DayCard
                key={index}
                day={day}
                index={index}
                activities={day.activities}
                onAddActivity={handleOpenActivityDialog}
                onEditActivity={handleOpenActivityDialog}
                onDeleteActivity={handleDeleteActivity}
                onDragEnd={handleDragEnd}
                onUpdateDay={handleUpdateDay}
                onDeleteDay={handleDeleteDay}
              />
            ))}

            <Button
              variant="outline"
              className="w-full h-14 border-dashed"
              onClick={handleAddDay}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Day
            </Button>
          </div>
        </div>
      </main>

      {/* Activity Dialog */}
      <Dialog open={activityDialog.open} onOpenChange={(open) => setActivityDialog({ ...activityDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activityDialog.activity ? 'Edit Activity' : 'Add Activity'}
            </DialogTitle>
            <DialogDescription>
              Add details for this activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Activity Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {activityTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => setActivityForm({ ...activityForm, type: type.type })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        activityForm.type === type.type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${
                        activityForm.type === type.type ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="actTitle">Title</Label>
              <Input
                id="actTitle"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                placeholder="e.g., Visit Eiffel Tower"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actTime">Time</Label>
                <Input
                  id="actTime"
                  type="time"
                  value={activityForm.time}
                  onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="actDuration">Duration</Label>
                <Input
                  id="actDuration"
                  value={activityForm.duration}
                  onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="actLocation">Location</Label>
              <Input
                id="actLocation"
                value={activityForm.location}
                onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                placeholder="e.g., Champ de Mars, Paris"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="actCost">Estimated Cost ($)</Label>
              <Input
                id="actCost"
                type="number"
                min="0"
                step="0.01"
                value={activityForm.cost}
                onChange={(e) => setActivityForm({ ...activityForm, cost: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="actNotes">Notes</Label>
              <Textarea
                id="actNotes"
                value={activityForm.notes}
                onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                placeholder="Additional notes..."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialog({ ...activityDialog, open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSaveActivity}>
              {activityDialog.activity ? 'Update' : 'Add'} Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ItineraryBuilderPage;
