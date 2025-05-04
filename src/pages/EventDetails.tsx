import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
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

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await apiService.getEventById(id || "");
        setEvent(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load event",
          description: error.message || "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!event) return <div className="p-4">Event not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
       <Link
      to="/events"
      className="inline-flex items-center text-blue-600 hover:underline"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      Back to Events
    </Link>
      <h1 className="text-3xl font-bold mb-2">Event</h1>
      {event.media && (
        <div className="mb-4">
          {event.media.type === "image" ? (
            <img
              src={event.media.url}
              alt="Event media"
              className="w-full rounded-md"
            />
          ) : (
            <video controls className="w-full rounded-md">
              <source src={event.media.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}


      <p className="text-sm text-gray-500 mb-4">
        Posted on {new Date(event.createdAt || "").toLocaleDateString()}
      </p>
      <p className="text-lg">{event.description}</p>
    </div>
  );
};

export default EventDetails;
