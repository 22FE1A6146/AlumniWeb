import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import apiService from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Briefcase, MapPin, Calendar, GraduationCap, 
  Linkedin, Twitter, Github, Globe, Edit, MailPlus, Mail 
} from "lucide-react";

const Profile = () => {
  const { currentUser } = useAuthContext();
  const { userId } = useParams();
  const queryClient = useQueryClient();

  const targetUserId = userId || (currentUser?.uid || "");
  const isOwnProfile = !userId || userId === currentUser?.uid;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: () => apiService.getAlumniById(targetUserId),
    enabled: !!targetUserId,
  });

  const mutation = useMutation({
    mutationFn: (updatedData) => apiService.updateProfile(targetUserId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', targetUserId]);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto my-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-2 text-center md:text-left flex-1">
                <Skeleton className="h-8 w-60 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {error.message === "Alumni not found" ? "Profile Not Found" : "Error"}
        </h2>
        {isOwnProfile && error.message === "Alumni not found" && (
          <div className="space-y-4">
            <p>You haven't completed your profile yet.</p>
            <Button asChild>
              <Link to="/profile/setup">Complete Your Profile</Link>
            </Button>
          </div>
        )}
        {!isOwnProfile && <p>{error.message}</p>}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto my-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        {isOwnProfile && (
          <div className="space-y-4">
            <p>You haven't completed your profile yet.</p>
            <Button asChild>
              <Link to="/profile/setup">Complete Your Profile</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.photoURL} alt={profile.name} />
              <AvatarFallback className="text-3xl">
                {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <div className="flex justify-center md:justify-end gap-2">
                  {isOwnProfile ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/profile/edit">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link to={`/messages/new?recipient=${profile.userId}`}>
                        <MailPlus className="h-4 w-4 mr-1" />
                        Message
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              
              {(isOwnProfile || profile.isMentor) && profile.email && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              
              {profile.currentJobTitle && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.currentJobTitle}</span>
                  {profile.company && (
                    <>
                      <span className="mx-1">at</span>
                      <span>{profile.company}</span>
                    </>
                  )}
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>Class of {profile.graduationYear}</span>
                </div>
                {profile.degree && profile.major && (
                  <div className="flex items-center gap-1 text-xs">
                    <GraduationCap className="h-3 w-3" />
                    <span>{profile.degree} in {profile.major}</span>
                  </div>
                )}
                {profile.batch && (
                  <Badge variant="outline">{profile.batch}</Badge>
                )}
                {profile.isMentor && (
                  <Badge variant="secondary">Mentor</Badge>
                )}
              </div>
              
              <div className="flex gap-3 justify-center md:justify-start mt-2">
                {profile.linkedin && (
                  <a 
                    href={profile.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile.twitter && (
                  <a 
                    href={profile.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.github && (
                  <a 
                    href={profile.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              {profile.achievements?.length > 0 && (
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              )}
              {profile.experience?.length > 0 && (
                <TabsTrigger value="experience">Experience</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="about" className="mt-4">
              {profile.bio ? (
                <div className="prose max-w-none">
                  <p>{profile.bio}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No bio available</p>
              )}
            </TabsContent>
            <TabsContent value="skills" className="mt-4">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No skills listed</p>
              )}
            </TabsContent>
            {profile.achievements?.length > 0 && (
              <TabsContent value="achievements" className="mt-4">
                <ul className="list-disc list-inside space-y-1">
                  {profile.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </TabsContent>
            )}
            {profile.experience?.length > 0 && (
              <TabsContent value="experience" className="mt-4">
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="font-semibold">{exp.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-sm">{exp.description}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        
        {profile.isMentor && profile.mentorshipAreas && profile.mentorshipAreas.length > 0 && (
          <CardFooter className="border-t pt-4">
            <div>
              <h3 className="font-medium mb-2">Mentorship Areas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.mentorshipAreas.map((area, index) => (
                  <Badge key={index} variant="outline">{area}</Badge>
                ))}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Profile;