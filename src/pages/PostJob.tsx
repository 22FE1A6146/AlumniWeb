import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Image, Video, X } from 'lucide-react';
import apiService from '@/lib/api';
import { useAuthContext } from '@/context/AuthContext';

// Define the form schema for jobs only
const jobFormSchema = z.object({
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  mediaType: z.enum(['none', 'image', 'video']).default('none'),
  mediaUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const PostJob: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      description: '',
      mediaType: 'none',
      mediaUrl: '',
    },
  });

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const mediaType = form.watch('mediaType');

  const handleMediaUrlChange = (url: string) => {
    form.setValue('mediaUrl', url);
    if (url) {
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  };

  const handleMediaTypeChange = (type: 'none' | 'image' | 'video') => {
    form.setValue('mediaType', type);
    if (type === 'none') {
      form.setValue('mediaUrl', '');
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    form.setValue('mediaType', 'none');
    form.setValue('mediaUrl', '');
    setMediaPreview(null);
  };

  const handleSubmit = async (values: JobFormValues) => {
    try {
      const jobData = {
        description: values.description,
        ...(values.mediaType !== 'none' && values.mediaUrl
          ? { media: { type: values.mediaType, url: values.mediaUrl } }
          : {}),
      };
      await apiService.postJob(jobData);
      toast({
        title: 'Job Posted',
        description: 'Your job post has been published successfully.',
      });
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to publish job post. Please try again.',
      });
    }
  };



  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : '';
  };
  













  const handleCancel = () => {
    navigate('/jobs');
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Job Post</CardTitle>
          <CardDescription>
            Share a job opportunity with the alumni community. Add an image or video to make your post stand out.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your job description..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Media</h3>
                  {mediaType !== 'none' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearMedia}
                      className="h-8 px-2 text-xs"
                    >
                      <X size={16} className="mr-1" /> Remove Media
                    </Button>
                  )}
                </div>

                <Tabs
                  defaultValue="none"
                  value={mediaType}
                  onValueChange={(value) => handleMediaTypeChange(value as 'none' | 'image' | 'video')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="none">None</TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <Image size={16} /> Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Video size={16} /> Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="mediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              onChange={(e) => handleMediaUrlChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {mediaPreview && mediaType === 'image' && (
                      <div className="relative mt-2 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-[300px] w-auto mx-auto object-contain"
                          onError={() => setMediaPreview(null)}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="mediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL (YouTube, Vimeo, etc.)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                              onChange={(e) => handleMediaUrlChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

{mediaPreview && mediaType === 'video' && (
  <div className="relative mt-2 rounded-md overflow-hidden border border-gray-200 aspect-video">
    <iframe
      src={`https://www.youtube.com/embed/${getYouTubeVideoId(mediaPreview)}`}
      title="Video Preview"
      allowFullScreen
      className="w-full h-full"
    ></iframe>
  </div>
)}

                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <div className="flex justify-end space-x-4 w-full">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Post Job</Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default PostJob;
