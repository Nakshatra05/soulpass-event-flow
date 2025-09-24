import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Image, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { account } = useWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    end_date_time: '',
    location: '',
    address: '',
    max_attendees: '',
    image_url: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create an event',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.date_time) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date_time: formData.date_time,
        end_date_time: formData.end_date_time || null,
        location: formData.location || null,
        address: formData.address || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        image_url: formData.image_url || null,
        organizer_id: account,
        is_public: true,
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Event Created',
        description: 'Your event has been created successfully!',
      });

      navigate(`/events/${data.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-4">
              Please connect your wallet to create an event
            </p>
            <Link to="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/events">
              <Button variant="outline" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground">
              Create an amazing event for the SoulPass community
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Date & Time
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_time">Start Date & Time *</Label>
                      <Input
                        id="date_time"
                        type="datetime-local"
                        value={formData.date_time}
                        onChange={(e) => handleInputChange('date_time', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end_date_time">End Date & Time</Label>
                      <Input
                        id="end_date_time"
                        type="datetime-local"
                        value={formData.end_date_time}
                        onChange={(e) => handleInputChange('end_date_time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Venue Name</Label>
                      <Input
                        id="location"
                        placeholder="e.g. Conference Center"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Additional Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_attendees">Max Attendees</Label>
                      <Input
                        id="max_attendees"
                        type="number"
                        placeholder="Leave empty for no limit"
                        value={formData.max_attendees}
                        onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={(e) => handleInputChange('image_url', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {formData.image_url && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={formData.image_url} 
                        alt="Event preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Link to="/events" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;