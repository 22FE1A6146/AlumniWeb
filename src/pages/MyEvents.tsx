import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';

interface Event {
  _id: string;
  description: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  organizer: string;
}

const MyEvents: React.FC = () => {
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch all events and filter by organizer
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['myEvents', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) throw new Error('User not authenticated');
      const response = await apiService.getEvents();
      return response.filter((event) => event.organizer === currentUser.uid);
    },
    enabled: !!currentUser,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiService.deleteEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents', currentUser?.uid] });
    },
  });

  const handleDelete = (eventId: string, eventDescription: string) => {
    if (window.confirm(`Are you sure you want to delete the event with description "${eventDescription}"?`)) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-navy">Please log in to view your event posts.</p>
            <Button asChild className="mt-4">
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-navy mb-6 flex items-center gap-2">
        <Calendar size={28} className="text-gold" />
        My Event Posts
      </h1>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      )}

      {error && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 flex items-center gap-2 text-destructive">
            <AlertCircle size={20} />
            <p>Error loading events: {(error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events?.length === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-navy">You haven't posted any events yet.</p>
            <Button asChild className="mt-4">
              <Link to="/events/create">Create an Event</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events && events.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-navy line-clamp-1">{event.description}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {event.media && (
                  <div className="mb-4">
                    {event.media.type === 'video' ? (
                      <video src={event.media.url} controls className="w-full h-40 object-cover rounded" />
                    ) : (
                      <img src={event.media.url} alt="Event media" className="w-full h-40 object-cover rounded" />
                    )}
                  </div>
                )}
                <p className="text-gray-600 line-clamp-3">{event.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/events/${event._id}`}>View Details</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(event._id, event.description)}
                    disabled={deleteEventMutation.isPending}
                  >
                    {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;