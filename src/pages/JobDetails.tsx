import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Job } from "@/types";
import apiService from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";


const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await apiService.getJobById(id || "");
        setJob(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load job",
          description: error.message || "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id, toast]);

  if (loading) return <div className="p-4">Loading job details...</div>;
  if (!job) return <div className="p-4">Job not found.</div>;



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
  
    // fallback to raw URL (e.g., mp4 direct links)
    return url;
  };
  











  return (
    <div className="max-w-3xl mx-auto p-6">
      
  {/* Back Button */}
  
    <Link
      to="/jobs"
      className="inline-flex items-center text-blue-600 hover:underline"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      Back to Jobs
    </Link>
 

  

      <h1 className="text-3xl font-bold mb-2">Job Opportunity</h1>

      {job.media && (
        <div className="mb-4">
          {job.media.type === "image" ? (
            <img
              src={job.media.url}
              alt="Job media"
              className="w-full rounded-lg"
            />
          ) : (
            <div className="aspect-video">
            <iframe
              src={getEmbeddedVideoUrl(job.media.url)}
              title="Job Video"
              allowFullScreen
              className="w-full h-full rounded-lg border"
            ></iframe>
          </div>
          
          )}
        </div>
      )}

      
      <p className="text-sm text-gray-500 mb-4">
  Posted on{" "}
  {job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"}
</p>

      <p className="text-lg text-gray-800">{job.description}</p>
    </div>
  );
};

export default JobDetails;
