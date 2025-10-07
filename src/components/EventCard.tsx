import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    event_date: string;
    max_attendees: number | null;
    current_attendees: number;
    price: number;
    image_url: string | null;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 group">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary-foreground/50" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">{event.title}</CardTitle>
          <Badge variant="secondary" className="capitalize whitespace-nowrap">
            {event.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.event_date), "PPP")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          {spotsLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{spotsLeft} spots left</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 font-semibold text-lg">
          {event.price > 0 ? (
            <>
              <IndianRupee className="h-4 w-4" />
              {event.price}
            </>
          ) : (
            <span className="text-success">Free</span>
          )}
        </div>
        <Link to={`/events/${event.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
