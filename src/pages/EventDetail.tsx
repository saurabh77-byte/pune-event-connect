import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, Users, IndianRupee, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);

      if (user) {
        const { data: regData } = await supabase
          .from("registrations")
          .select("*")
          .eq("event_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsRegistered(!!regData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to register for events",
      });
      navigate("/auth");
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .insert({ event_id: id, user_id: user.id });

      if (error) throw error;

      await supabase
        .from("events")
        .update({ current_attendees: (event.current_attendees || 0) + 1 })
        .eq("id", id);

      toast({
        title: "Successfully registered!",
        description: "You're all set for this event",
      });
      setIsRegistered(true);
      fetchEvent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await supabase
        .from("events")
        .update({ current_attendees: Math.max((event.current_attendees || 1) - 1, 0) })
        .eq("id", id);

      toast({
        title: "Registration cancelled",
      });
      setIsRegistered(false);
      fetchEvent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 bg-muted">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <Calendar className="h-24 w-24 text-primary-foreground/50" />
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>
              <Badge variant="secondary" className="capitalize text-base px-4 py-1">
                {event.category}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{format(new Date(event.event_date), "PPP")}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), "p")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">{event.city}</p>
                </div>
              </div>

              {spotsLeft !== null && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{spotsLeft} spots available</p>
                    <p className="text-sm text-muted-foreground">
                      {event.current_attendees} registered
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {event.price > 0 ? `₹${event.price}` : "Free"}
                  </p>
                  <p className="text-sm text-muted-foreground">Entry fee</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-4">
              {isRegistered ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={registering}
                  className="flex-1"
                >
                  {registering ? "Cancelling..." : "Cancel Registration"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className="flex-1"
                >
                  {registering ? "Registering..." : isFull ? "Event Full" : "Register Now"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
