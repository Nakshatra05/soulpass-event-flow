import { useState, useEffect } from 'react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ProfileCard } from '@/components/ProfileCard';
import { EventCard } from '@/components/EventCard';
import { toast } from '@/hooks/use-toast';
import { Save, Edit, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { account, profile, user } = useWeb3Auth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userRsvps, setUserRsvps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    linkedin_url: '',
    twitter_url: '',
    github_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        github_url: profile.github_url || '',
      });
      fetchUserData();
    }
  }, [profile]);

  const fetchUserData = async () => {
    if (!account) return;

    try {
      // Fetch events created by user
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', account)
        .order('created_at', { ascending: false });

      setUserEvents(eventsData || []);

      // Fetch user's RSVPs with event details
      const { data: rsvpsData } = await supabase
        .from('rsvps')
        .select(`
          *,
          events:events(*)
        `)
        .eq('user_id', account)
        .order('created_at', { ascending: false });

      setUserRsvps(rsvpsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', account);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });

      setEditing(false);
      // Refresh profile would happen through the context
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
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
              Please connect your wallet to view your profile
            </p>
            <Link to="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const approvedRsvps = userRsvps.filter(rsvp => rsvp.approved);
  const attendedRsvps = userRsvps.filter(rsvp => rsvp.attended);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {!editing ? (
                <div className="space-y-4">
                  <ProfileCard profile={profile} />
                  <Button 
                    onClick={() => setEditing(true)}
                    className="w-full gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="twitter_url">Twitter URL</Label>
                      <Input
                        id="twitter_url"
                        type="url"
                        value={formData.twitter_url}
                        onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="github_url">GitHub URL</Label>
                      <Input
                        id="github_url"
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="flex-1 gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Events ({userEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No events created yet</p>
                    <Link to="/create-event">
                      <Button>Create Your First Event</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userEvents.slice(0, 4).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My RSVPs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My RSVPs ({approvedRsvps.length} approved, {attendedRsvps.length} attended)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userRsvps.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No RSVPs yet</p>
                    <Link to="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRsvps.slice(0, 6).map((rsvp) => (
                      <div key={rsvp.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{rsvp.events.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rsvp.events.date_time).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {rsvp.attended && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Attended
                            </span>
                          )}
                          {rsvp.approved ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              Approved
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;