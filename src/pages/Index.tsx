import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import heroImage from "@/assets/hero-pune-events.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

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
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: true })
      .limit(3);

    setFeaturedEvents(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              Discover Amazing{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Events in Pune
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              From cultural festivals to tech meetups, find and join events that matter to you
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/events">
                <Button size="lg" className="shadow-elegant">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Diverse Events</h3>
              <p className="text-muted-foreground">
                Cultural festivals, tech conferences, sports tournaments, and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Easy Registration</h3>
              <p className="text-muted-foreground">
                Book your spot in seconds with our seamless registration process
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">For Event Managers</h3>
              <p className="text-muted-foreground">
                Create and manage your events with powerful tools
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground text-lg">
              Don't miss out on these exciting events in Pune
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/events">
              <Button size="lg" variant="outline">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of event-goers and managers in Pune's vibrant event community
            </p>
            <div className="flex gap-4 justify-center">
              {!user ? (
                <Link to="/auth">
                  <Button size="lg" variant="secondary">
                    Sign Up Now
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
