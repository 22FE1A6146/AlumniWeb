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
  CardFooter
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Image, Video, X } from 'lucide-react';
import apiService from '@/lib/api';

// Define the form schema
const eventFormSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  mediaType: z.enum(["none", "image", "video"]).default("none"),
  mediaUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CreateEvent: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      description: "",
      mediaType: "none",
      mediaUrl: "",
    },
  });
  
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const mediaType = form.watch("mediaType");

  const handleMediaUrlChange = (url: string) => {
    form.setValue("mediaUrl", url);
    if (url) {
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  };

  const handleMediaTypeChange = (type: "none" | "image" | "video") => {
    form.setValue("mediaType", type);
    if (type === "none") {
      form.setValue("mediaUrl", "");
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    form.setValue("mediaType", "none");
    form.setValue("mediaUrl", "");
    setMediaPreview(null);
  };

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const eventData = {
        description: values.description,
        media: values.mediaType !== "none" && values.mediaUrl
          ? { type: values.mediaType, url: values.mediaUrl }
          : undefined
      };
      
      await apiService.createEvent(eventData);
      
      toast({
        title: "Event Posted",
        description: "Your event has been published successfully.",
      });
      
      navigate('/events');
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to post event. Please try again.",
      });
    }
  };
      

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Event Post</CardTitle>
          <CardDescription>
            Post a new event for the alumni community. You can add an image or video to showcase your event.
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
                        placeholder="Enter your event description..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Media Section */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Media</h3>
                  {mediaType !== "none" && (
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
                  onValueChange={(value) => handleMediaTypeChange(value as "none" | "image" | "video")}
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
                    
                    {mediaPreview && mediaType === "image" && (
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
                    
                    {mediaPreview && mediaType === "video" && (
                      <div className="relative mt-2 rounded-md overflow-hidden border border-gray-200">
                        <div className="bg-gray-100 p-4 text-center">
                          Video URL: {mediaPreview}
                          <p className="text-sm text-gray-500 mt-1">Video will be displayed in the event posting</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            
            <CardFooter className="pt-6">
              <div className="flex justify-end space-x-4 w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Post Event</Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateEvent;
