import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from '@/context/AuthContext';
import apiService from '@/lib/api';
import { Trash2 } from "lucide-react";

const currentYear = new Date().getFullYear();
const majorOptions = ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'OTHERS'];

const experienceSchema = z.object({
  jobTitle: z.string().min(1, { message: "Job title is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, { message: "Start date must be YYYY-MM" }),
  endDate: z.string().regex(/^\d{4}-\d{2}$|^$/, { message: "End date must be YYYY-MM or empty" }),
  description: z.string().optional(),
});

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  batch: z.string().min(1, { message: "Batch is required" }),
  graduationYear: z.coerce.number().int().min(1900).max(currentYear + 10),
  degree: z.string().min(1, { message: "Degree is required" }),
  major: z.string().min(1, { message: "Major is required" }),
  currentJobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL" }).optional().or(z.string().length(0)),
  twitter: z.string().url({ message: "Please enter a valid Twitter URL" }).optional().or(z.string().length(0)),
  github: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.string().length(0)),
  website: z.string().url({ message: "Please enter a valid website URL" }).optional().or(z.string().length(0)),
  skills: z.string().optional(),
  achievements: z.string().optional(),
  isMentor: z.boolean().default(false),
  mentorshipAreas: z.string().optional(),
  photoURL: z.any().optional(),
  experience: z.array(experienceSchema).optional(),
});

const ProfileEdit = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experienceList, setExperienceList] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: currentUser?.email || "",
      batch: "",
      graduationYear: currentYear,
      degree: "",
      major: "",
      currentJobTitle: "",
      company: "",
      location: "",
      bio: "",
      linkedin: "",
      twitter: "",
      github: "",
      website: "",
      skills: "",
      achievements: "",
      isMentor: false,
      mentorshipAreas: "",
      photoURL: null,
      experience: [],
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      try {
        return await apiService.getAlumniById(currentUser.uid);
      } catch (error) {
        return null;
      }
    },
    enabled: !!currentUser?.uid,
  });

  useEffect(() => {
    if (profile) {
      setExperienceList(profile.experience || []);
      form.reset({
        email: profile.email || currentUser?.email || "",
        batch: profile.batch || "",
        graduationYear: profile.graduationYear || currentYear,
        degree: profile.degree || "",
        major: profile.major || "",
        currentJobTitle: profile.currentJobTitle || "",
        company: profile.company || "",
        location: profile.location || "",
        bio: profile.bio || "",
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
        github: profile.github || "",
        website: profile.website || "",
        skills: profile.skills?.join(", ") || "",
        achievements: profile.achievements?.join("\n") || "",
        isMentor: profile.isMentor || false,
        mentorshipAreas: profile.mentorshipAreas?.join(", ") || "",
        photoURL: null,
        experience: profile.experience || [],
      });
    }
  }, [profile, form, currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!currentUser?.uid) throw new Error("Not authenticated");
      let photoURL = data.photoURL;
      if (data.photoURL instanceof File) {
        photoURL = await apiService.uploadProfilePicture(data.photoURL);
      } else {
        photoURL = profile?.photoURL || "";
      }
      return await apiService.updateProfile(currentUser.uid, { ...data, photoURL });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      navigate("/profile");
    },
    onError: (error) => {
      toast.error("Failed to update profile", { 
        description: error.message 
      });
      setIsSubmitting(false);
    }
  });

  const addExperience = () => {
    setExperienceList([...experienceList, {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    }]);
  };

  const removeExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
    form.setValue('experience', experienceList.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updatedList = [...experienceList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setExperienceList(updatedList);
    form.setValue('experience', updatedList);
  };

  const onSubmit = async (values) => {
    if (!currentUser) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsSubmitting(true);
    
    const skillsArray = values.skills ? values.skills.split(',').map(skill => skill.trim()) : [];
    const achievementsArray = values.achievements ? values.achievements.split('\n').filter(a => a.trim()) : [];
    const mentorshipAreasArray = values.mentorshipAreas ? values.mentorshipAreas.split(',').map(area => area.trim()) : [];
    
    updateProfileMutation.mutate({
      name: currentUser.displayName || "",
      email: values.email,
      photoURL: values.photoURL,
      batch: values.batch,
      graduationYear: values.graduationYear,
      degree: values.degree,
      major: values.major,
      currentJobTitle: values.currentJobTitle || "",
      company: values.company || "",
      location: values.location || "",
      bio: values.bio || "",
      linkedin: values.linkedin || "",
      twitter: values.twitter || "",
      github: values.github || "",
      website: values.website || "",
      skills: skillsArray,
      achievements: achievementsArray,
      isMentor: values.isMentor,
      experience: values.experience || [],
      mentorshipAreas: values.isMentor ? mentorshipAreasArray : [],
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto my-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Loading Profile...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Edit Your Profile</CardTitle>
          <CardDescription className="text-center">
            Update your alumni profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2020-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bachelor of Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a major" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {majorOptions.map((major) => (
                            <SelectItem key={major} value={major}>
                              {major}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentJobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about yourself..." 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. JavaScript, React, Node.js" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievements (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List your key achievements..." 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-lg mb-2">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Experience</FormLabel>
                  <Button type="button" variant="outline" onClick={addExperience}>
                    Add Experience
                  </Button>
                </div>
                {experienceList.map((exp, index) => (
                  <Card key={index} className="p-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Job Title</FormLabel>
                        <Input
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                          placeholder="e.g. Software Engineer"
                        />
                      </div>
                      <div>
                        <FormLabel>Company</FormLabel>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g. Google"
                        />
                      </div>
                      <div>
                        <FormLabel>Start Date (YYYY-MM)</FormLabel>
                        <Input
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          placeholder="e.g. 2020-01"
                        />
                      </div>
                      <div>
                        <FormLabel>End Date (YYYY-MM or blank)</FormLabel>
                        <Input
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          placeholder="e.g. 2022-06 or leave blank"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your role..."
                        rows={3}
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isMentor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Available for Mentorship
                        </FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch("isMentor") && (
                  <FormField
                    control={form.control}
                    name="mentorshipAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mentorship Areas (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Career Guidance, Technical Skills, Interview Preparation" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileEdit;
