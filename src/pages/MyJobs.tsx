
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api';
import { Loader2, Briefcase, AlertCircle } from 'lucide-react';

interface Job {
  _id: string;
  description: string;
  postedBy: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

const MyJobs: React.FC = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<{
    description: string;
    mediaType: 'image' | 'video' | '' | null;
    mediaUrl: string | null;
  }>({
    description: '',
    mediaType: '',
    mediaUrl: '',
  });

  // Fetch user's jobs
  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['myJobs', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) throw new Error('User not authenticated');
      const response = await apiService.getMyJobs();
      return response;
    },
    enabled: !!currentUser,
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await apiService.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs', currentUser?.uid] });
      toast({
        title: 'Job Deleted',
        description: 'The job post has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete job post.',
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { description?: string; media?: { type: 'image' | 'video' | null; url: string | null } } }) => {
      return await apiService.updateJob(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs', currentUser?.uid] });
      toast({
        title: 'Job Updated',
        description: 'The job post has been updated successfully.',
      });
      setIsEditModalOpen(false);
      setSelectedJob(null);
      setEditForm({ description: '', mediaType: '', mediaUrl: '' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update job post.',
      });
    },
  });

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setEditForm({
      description: job.description,
      mediaType: job.media?.type || '',
      mediaUrl: job.media?.url || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const data: { description?: string; media?: { type: 'image' | 'video' | null; url: string | null } } = {};

    if (editForm.description && editForm.description !== selectedJob.description) {
      data.description = editForm.description;
    }

    if (editForm.mediaType === '' && editForm.mediaUrl === '') {
      data.media = { type: null, url: null }; // Clear media
    } else if (editForm.mediaType && editForm.mediaUrl && (editForm.mediaType !== selectedJob.media?.type || editForm.mediaUrl !== selectedJob.media?.url)) {
      data.media = { type: editForm.mediaType as 'image' | 'video', url: editForm.mediaUrl };
    }

    if (!data.description && !data.media) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No changes provided.',
      });
      return;
    }

    updateJobMutation.mutate({ id: selectedJob._id, data });
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm(`Are you sure you want to delete this job post?`)) {
      deleteJobMutation.mutate(jobId);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-navy">Please log in to view your job posts.</p>
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
        <Briefcase size={28} className="text-gold" />
        My Job Posts
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
            <p>Error loading jobs: {(error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobs?.length === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-navy">You haven't posted any jobs yet.</p>
            <Button asChild className="mt-4">
              <Link to="/jobs/post">Post a Job</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && jobs && jobs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-navy line-clamp-1">Job Posting</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {job.media && (
                  <div className="mb-4">
                    {job.media.type === 'video' ? (
                      <video src={job.media.url} controls className="w-full h-40 object-cover rounded" />
                    ) : (
                      <img src={job.media.url} alt="Job media" className="w-full h-40 object-cover rounded" />
                    )}
                  </div>
                )}
                <p className="text-gray-600 line-clamp-3">{job.description}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button asChild variant="outline">
                    <Link to={`/jobs/${job._id}`}>View Details</Link>
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(job._id)}
                    disabled={deleteJobMutation.isPending}
                  >
                    {deleteJobMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Job Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter job description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Media</Label>
                <Select
                  value={editForm.mediaType || ''}
                  onValueChange={(value) => setEditForm({ ...editForm, mediaType: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No media</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editForm.mediaType && (
                <div className="grid gap-2">
                  <Label htmlFor="mediaUrl">Media URL</Label>
                  <Input
                    id="mediaUrl"
                    type="url"
                    value={editForm.mediaUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })}
                    placeholder="Enter media URL"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyJobs;
