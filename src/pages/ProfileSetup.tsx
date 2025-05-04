import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  graduationYear: z.coerce.number().int().min(1900).max(currentYear + 10, { message: `Graduation year must be between 1900 and ${currentYear + 10}` }),
  degree: z.string().min(1, { message: "Degree is required" }),
  major: z.string().min(1, { message: "Major is required" }),
  currentJobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL" }).optional().or(z.string().length(0)),
  skills: z.string().optional(),
  photoURL: z.any().optional(),
  experience: z.array(experienceSchema).optional(),
});

const ProfileSetup = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      skills: "",
      photoURL: null,
      experience: [],
    },
  });

  const setupProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!currentUser?.uid) throw new Error("Not authenticated");
      let photoURL = data.photoURL;
      if (data.photoURL instanceof File) {
        photoURL = await apiService.uploadProfilePicture(data.photoURL);
      }
      return apiService.createAlumni(currentUser.uid, { ...data, photoURL });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', currentUser?.uid]);
      toast.success("Profile completed successfully!");
      navigate(`/profile/${currentUser?.uid}`);
    },
    onError: (error) => {
      toast.error("Failed to complete profile", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
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

  const onSubmit = (values) => {
    if (!currentUser) {
      toast.error("You must be logged in to complete your profile");
      return;
    }

    setIsSubmitting(true);

    const skillsArray = values.skills ? values.skills.split(',').map(skill => skill.trim()) : [];
    
    const profileData = {
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
      skills: skillsArray,
      experience: values.experience || [],
      isMentor: false,
    };

    setupProfileMutation.mutate(profileData);
  };

  return (
    <div className="container mx-auto my-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Let's set up your alumni profile
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
                        <Input type="number" placeholder="e.g. 2023" {...field} />
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
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            You can update your profile information anytime
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileSetup;