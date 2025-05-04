import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import apiService from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { AlumniProfile } from '@/types';
import { Check, Filter, Search, Star } from "lucide-react";

const Mentorship = () => {
  const { currentUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  // Fetch mentors
  const { data: mentors = [], isLoading, error } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const response = await apiService.getMentors();
      console.log('Processed mentors:', response); // Debugging log
      return response; // getMentors returns an array
    },
    onError: (err) => {
      console.error('useQuery error:', err); // Debugging log
    },
  });

  console.log('Mentors state:', { mentors, isLoading, error }); // Debugging log

  // Extract unique mentorship areas
  const allMentorshipAreas = mentors.reduce((areas: string[], mentor: AlumniProfile) => {
    if (mentor.mentorshipAreas && Array.isArray(mentor.mentorshipAreas)) {
      mentor.mentorshipAreas.forEach(area => {
        if (!areas.includes(area)) {
          areas.push(area);
        }
      });
    }
    return areas;
  }, []).sort();

  // Filter mentors based on search and area
  const filteredMentors = mentors.filter((mentor: AlumniProfile) => {
    const matchesSearch =
      searchTerm === '' ||
      (mentor.name && mentor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.skills &&
        Array.isArray(mentor.skills) &&
        mentor.skills.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesArea =
      selectedArea === 'all' ||
      (mentor.mentorshipAreas &&
        Array.isArray(mentor.mentorshipAreas) &&
        mentor.mentorshipAreas.includes(selectedArea));

    return matchesSearch && matchesArea;
  });

  console.log('Filtered mentors:', filteredMentors); // Debugging log

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Mentorship & Guidance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with experienced alumni who are willing to share their knowledge,
            provide career guidance, and help you navigate your professional journey.
          </p>
        </div>

        <Tabs defaultValue="mentors" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="resources">Resources & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search mentors by name, bio or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-full md:w-64 flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedArea}
                  onValueChange={setSelectedArea}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {allMentorshipAreas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-red-600">Error fetching mentors</h3>
                <p className="text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : 'Failed to load mentors. Please check the server or try again later.'}
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-2" />
                      <Skeleton className="h-4 w-4/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {filteredMentors.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No mentors found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search or filter criteria, or verify that mentors are available in the database.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMentors.map((mentor: AlumniProfile) => (
                      <Card key={mentor.userId || mentor.id}>
                        <CardHeader className="pb-2">
                          <div className="flex gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={mentor.photoURL} alt={mentor.name} />
                              <AvatarFallback>
                                {mentor.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{mentor.name || 'Unknown'}</CardTitle>
                              <CardDescription>
                                {mentor.currentJobTitle || 'No job title'}
                                {mentor.company && ` at ${mentor.company}`}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-3 text-sm mb-3">
                            {mentor.bio || "No bio available"}
                          </p>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Mentorship Areas:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {mentor.mentorshipAreas && Array.isArray(mentor.mentorshipAreas) ? (
                                mentor.mentorshipAreas.map((area, index) => (
                                  <Badge key={index} variant="outline">{area}</Badge>
                                ))
                              ) : (
                                <Badge variant="outline">None</Badge>
                              )}
                            </div>
                          </div>

                          {mentor.skills && Array.isArray(mentor.skills) && mentor.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Skills:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {mentor.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary">{skill}</Badge>
                                ))}
                                {mentor.skills.length > 3 && (
                                  <Badge variant="secondary">+{mentor.skills.length - 3}</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <div className="flex gap-2 w-full">
                            <Button
                              asChild
                              variant="outline"
                              className="flex-1"
                            >
                              <Link to={`/alumni/${mentor.userId}`}>
                                View Profile
                              </Link>
                            </Button>
                            <Button
                              asChild
                              className="flex-1"
                            >
                              <Link to={`/messages/new?recipient=${mentor.userId}`}>
                                Contact
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Webinars</CardTitle>
                  <CardDescription>
                    Join our interactive online sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Career Transitions</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      May 15, 2023 • 3:00 PM
                    </p>
                    <p className="text-sm">
                      Learn strategies for successfully navigating career changes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Tech Industry Insights</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      May 22, 2023 • 4:00 PM
                    </p>
                    <p className="text-sm">
                      Current trends and future predictions in tech.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Webinars
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Library</CardTitle>
                  <CardDescription>
                    Helpful materials for your career journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">Resume & Cover Letter Templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">Interview Preparation Guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">Industry Research Reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">Networking Strategies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">Career Development Plans</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse Resources
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Featured Q&A</CardTitle>
                  <CardDescription>
                    Common questions answered by alumni
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">
                      How do I prepare for a tech interview?
                    </h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      Answered by Jane Smith, Software Engineer at Google
                    </p>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 fill-primary text-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      What certifications are most valuable in finance?
                    </h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      Answered by Michael Lee, Financial Analyst
                    </p>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 fill-primary text-primary"
                        />
                      ))}
                      <Star className="h-3 w-3 text-muted" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Q&A
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {currentUser && !mentors.some((m: AlumniProfile) => m.userId === currentUser.uid) && (
          <Card className="mt-12">
            <CardHeader className="text-center">
              <CardTitle>Become a Mentor</CardTitle>
              <CardDescription>
                Share your expertise and give back to the community by mentoring others
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center max-w-xl mx-auto">
              <p className="mb-6">
                As a mentor, you'll have the opportunity to make a meaningful impact
                by guiding students and fellow alumni through their career journeys.
                You can specify your areas of expertise and the time commitment that
                works for you.
              </p>
              <Button asChild>
                <Link to="/profile/edit">Apply to Become a Mentor</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Mentorship;