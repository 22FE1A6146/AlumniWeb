import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface Event {
  _id: string;
  description: string;
  organizer: string;
  createdAt?: string;
  media?: {
    type: "image" | "video";
    url: string;
  };
}

const EventListing = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: Event[] = await apiService.getEvents();
        setEvents(data);
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Error loading events",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-gray-600">
            Connect with alumni through meetups, webinars, and workshops.
          </p>
        </div>
        <Button asChild>
          <Link to="/events/create">Create Event</Link>
        </Button>
      </div>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event._id} className="overflow-hidden">
              <h1 className="text-lg font-semibold p-4">Event Posting</h1>
              {event.media?.type === "image" && event.media.url ? (
                <img
                  src={event.media.url}
                  alt={event.description || "Event image"}
                  className="w-full h-48 object-cover"
                />
              ) : event.media?.type === "video" && event.media.url ? (
                <video
                  src={event.media.url}
                  controls
                  className="w-full h-48 object-cover"
                />
              ) : null}
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm mb-1">
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleDateString()
                    : "Date not available"}
                </p>
                
                <p className="text-gray-700">{event.description}</p>
                <Link to={`/events/${event._id}`} className="text-blue-500 hover:underline">
  View Details
</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListing;


