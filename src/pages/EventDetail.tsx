import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileCard } from '@/components/ProfileCard';
import { toast } from '@/hooks/use-toast';
import { CalendarDays, MapPin, Users, Clock, UserCheck, UserPlus, QrCode, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { account, profile } = useWeb3Auth();
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [userRsvp, setUserRsvp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id, account]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch RSVPs with profiles
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select(`
          *,
          profiles:profiles!rsvps_user_id_fkey(*)
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (rsvpError) throw rsvpError;
      setRsvps(rsvpData || []);

      // Find user's RSVP
      const userRsvpData = rsvpData?.find(rsvp => rsvp.user_id === account);
      setUserRsvp(userRsvpData);

      // Generate QR code for organizer
      if (account === eventData.organizer_id) {
        const qrData = `soulpass://event/${id}/attendance`;
        const qrDataURL = await QRCode.toDataURL(qrData);
        setQrCode(qrDataURL);
      }

    } catch (error) {
      console.error('Error fetching event details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch event details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!account) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to RSVP',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rsvps')
        .insert([
          {
            event_id: id,
            user_id: account,
            status: 'going',
          }
        ]);

      if (error) throw error;

      toast({
        title: 'RSVP Submitted',
        description: 'Your RSVP has been submitted for approval',
      });

      fetchEventDetails();
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit RSVP',
        variant: 'destructive',
      });
    }
  };

  const handleApproveRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ approved: true, approved_at: new Date().toISOString() })
        .eq('id', rsvpId);

      if (error) throw error;

      toast({
        title: 'RSVP Approved',
        description: 'The RSVP has been approved',
      });

      fetchEventDetails();
    } catch (error) {
      console.error('Error approving RSVP:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve RSVP',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAttendance = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ attended: true, attended_at: new Date().toISOString() })
        .eq('id', rsvpId);

      if (error) throw error;

      toast({
        title: 'Attendance Marked',
        description: 'Attendance has been marked successfully',
      });

      fetchEventDetails();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Event not found</div>;
  }

  const isOrganizer = account === event.organizer_id;
  const approvedRsvps = rsvps.filter(rsvp => rsvp.approved);
  const pendingRsvps = rsvps.filter(rsvp => !rsvp.approved);
  const attendedCount = rsvps.filter(rsvp => rsvp.attended).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(event.date_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {approvedRsvps.length} approved • {pendingRsvps.length} pending
                      </div>
                    </div>
                  </div>
                  
                  {!isOrganizer && account && !userRsvp && (
                    <Button onClick={handleRSVP} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Request to Join
                    </Button>
                  )}
                  
                  {userRsvp && (
                    <Badge variant={userRsvp.approved ? 'default' : 'secondary'}>
                      {userRsvp.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              {event.image_url && (
                <div className="px-6">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p>{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Tools */}
            {isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Organizer Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                      <div className="text-sm text-muted-foreground">Attended</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{approvedRsvps.length}</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                  </div>
                  
                  {qrCode && (
                    <div className="text-center">
                      <h4 className="font-medium mb-2 flex items-center justify-center gap-2">
                        <QrCode className="h-4 w-4" />
                        Attendance QR Code
                      </h4>
                      <img src={qrCode} alt="Attendance QR Code" className="mx-auto border rounded-lg" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Scan this QR code to mark attendance
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approved Attendees */}
            {approvedRsvps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approved Attendees ({approvedRsvps.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {approvedRsvps.map((rsvp) => (
                    <div key={rsvp.id} className="space-y-2">
                      <ProfileCard profile={rsvp.profiles} compact />
                      {isOrganizer && rsvp.approved && !rsvp.attended && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(rsvp.id)}
                          className="w-full gap-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Attended
                        </Button>
                      )}
                      {rsvp.attended && (
                        <Badge variant="default" className="w-full justify-center">
                          Attended
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pending Requests (Organizer Only) */}
            {isOrganizer && pendingRsvps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Requests ({pendingRsvps.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingRsvps
                    .sort((a, b) => (b.profiles?.reputation_score || 0) - (a.profiles?.reputation_score || 0))
                    .map((rsvp) => (
                    <div key={rsvp.id} className="space-y-2">
                      <ProfileCard profile={rsvp.profiles} compact />
                      <Button
                        size="sm"
                        onClick={() => handleApproveRSVP(rsvp.id)}
                        className="w-full gap-2"
                      >
                        <UserCheck className="h-3 w-3" />
                        Approve
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;