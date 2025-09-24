import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date_time: string;
    end_date_time?: string;
    location?: string;
    address?: string;
    image_url?: string;
    max_attendees?: number;
    organizer_id: string;
    rsvps?: any[];
  };
  showActions?: boolean;
}

export const EventCard = ({ event, showActions = true }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rsvpCount = event.rsvps?.length || 0;
  const approvedCount = event.rsvps?.filter(rsvp => rsvp.approved).length || 0;

  return (
    <Card className="h-full flex flex-col">
      {event.image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="flex-shrink-0">
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {formatDate(event.date_time)}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {event.description}
        </p>
        
        <div className="space-y-2">
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            {approvedCount} attending
            {event.max_attendees && ` • ${rsvpCount} requests`}
          </div>
          
          {event.end_date_time && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Ends: {formatDate(event.end_date_time)}
            </div>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex-shrink-0">
          <Link to={`/events/${event.id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};