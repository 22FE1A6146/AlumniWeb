import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Job } from '@/types';
import { Briefcase } from 'lucide-react';
import apiService from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { useAuthContext } from '@/context/AuthContext';

const JobListingPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, userData } = useAuthContext();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getJobs();
        const fetchedJobs = Array.isArray(response) ? response : [];
        const sortedJobs = fetchedJobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setJobs(sortedJobs);
      } catch (error: any) {
        console.error("Error fetching jobs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch job listings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);


  const getEmbeddedVideoUrl = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      const videoId = match?.[1] || "";
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      const videoId = match?.[1] || "";
      return `https://player.vimeo.com/video/${videoId}`;
    }
  
    // fallback to raw URL (won't work for YouTube/Vimeo, but OK for mp4 direct links)
    return url;
  };
  







  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job & Internship Listings</h1>
            <p className="text-gray-600">
              Explore job and internship opportunities posted by alumni and partners.
            </p>
          </div>

          {currentUser && userData?.isMentor && (
            <Button asChild>
              <Link to="/jobs/post" aria-label="Post a new job">
                Post a Job
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Job Posting</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {job.media && (
                      <div className="mt-2">
                        {job.media.type === 'image' ? (
                          <img
                            src={job.media.url}
                            alt="Job media"
                            className="w-full h-48 object-cover rounded-md"
                          />
                        ) : (
                          <div className="aspect-video">
                          <iframe
                            src={getEmbeddedVideoUrl(job.media.url)}
                            title="Job Video"
                            allowFullScreen
                            className="w-full h-full rounded-md border"
                          ></iframe>
                        </div>
                        
                        )}
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none mt-2">
                      <p>{job.description}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/jobs/${job._id}`} aria-label="View job details">
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-1 text-gray-500">No job postings available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingPage;  
 