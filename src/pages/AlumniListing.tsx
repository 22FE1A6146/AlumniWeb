import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@/lib/api';
import { AlumniProfile } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const AlumniListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'batch' | 'batchAndMajor'>('list');
  const [openBatches, setOpenBatches] = useState<string[]>([]);
  const [openMajors, setOpenMajors] = useState<{ [batch: string]: string[] }>({});

  const { data: alumniData = [], isLoading } = useQuery({
    queryKey: ['alumni-listings', viewMode],
    queryFn: async () => {
      const params: { [key: string]: string | boolean } = {};
      if (viewMode === 'batch') params.groupByBatch = 'true';
      if (viewMode === 'batchAndMajor') params.groupByBatchAndMajor = 'true';
      console.log('Fetching alumni with params:', params);
      const data = await apiService.getAlumni(params);
      console.log('Received data:', data);
      return data;
    },
  });

  const filteredAlumni = Array.isArray(alumniData)
    ? alumniData.filter((alum: AlumniProfile) =>
        alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alum.currentJobTitle && alum.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alum.company && alum.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const groupedAlumni = !Array.isArray(alumniData) ? alumniData : {};

  const toggleBatch = (batch: string) => {
    setOpenBatches((prev) =>
      prev.includes(batch) ? prev.filter((b) => b !== batch) : [...prev, batch]
    );
  };

  const toggleMajor = (batch: string, major: string) => {
    setOpenMajors((prev) => {
      const batchMajors = prev[batch] || [];
      return {
        ...prev,
        [batch]: batchMajors.includes(major)
          ? batchMajors.filter((m) => m !== major)
          : [...batchMajors, major],
      };
    });
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Our Alumni</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our alumni network and connect with professionals in various fields.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center max-w-xl mx-auto mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search by name, job title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={viewMode !== 'list'}
          />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setViewMode(
              viewMode === 'list' ? 'batch' : viewMode === 'batch' ? 'batchAndMajor' : 'list'
            )
          }
        >
          {viewMode === 'list'
            ? 'Group by Batch'
            : viewMode === 'batch'
            ? 'Group by Batch & Major'
            : 'Show List View'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            filteredAlumni.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No alumni found</h3>
                <p className="text-muted-foreground mt-2">Try different search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAlumni.map((alum: AlumniProfile) => (
                  <Card key={alum.userId}>
                    <CardHeader>
                      <div className="flex gap-4 items-center">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={alum.photoURL} alt={alum.name} />
                          <AvatarFallback>
                            {alum.name?.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{alum.name}</CardTitle>
                          <CardDescription>
                            {alum.currentJobTitle}
                            {alum.company && ` at ${alum.company}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {alum.graduationYear && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Graduation Year: {alum.graduationYear}
                        </p>
                      )}
                      {alum.major && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Major: {alum.major}
                        </p>
                      )}
                      {alum.skills?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {alum.skills.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {alum.skills.length > 3 && (
                              <Badge variant="secondary">+{alum.skills.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/alumni/${alum.userId}`}>View Profile</Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link to={`/messages/new?recipient=${alum.userId}`}>Connect</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )
          ) : viewMode === 'batch' ? (
            Object.keys(groupedAlumni).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No alumni found</h3>
                <p className="text-muted-foreground mt-2">No alumni data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedAlumni).length === 1 && Object.keys(groupedAlumni)[0] === 'Unknown' ? (
                  <p className="text-center text-muted-foreground">
                    All alumni are in the "Unknown" batch. Expand to view.
                  </p>
                ) : null}
                {Object.keys(groupedAlumni)
                  .sort((a, b) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : b - a))
                  .map((batch) => (
                    <Collapsible
                      key={batch}
                      open={openBatches.includes(batch)}
                      onOpenChange={() => toggleBatch(batch)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Batch {batch}</h3>
                          <Badge variant="secondary">{groupedAlumni[batch].length}</Badge>
                        </div>
                        {openBatches.includes(batch) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          {groupedAlumni[batch].map((alum: AlumniProfile) => (
                            <Card key={alum.userId}>
                              <CardHeader>
                                <div className="flex gap-4 items-center">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={alum.photoURL} alt={alum.name} />
                                    <AvatarFallback>
                                      {alum.name?.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle>{alum.name}</CardTitle>
                                    <CardDescription>
                                      {alum.currentJobTitle}
                                      {alum.company && ` at ${alum.company}`}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {alum.graduationYear && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Graduation Year: {alum.graduationYear}
                                  </p>
                                )}
                                {alum.major && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Major: {alum.major}
                                  </p>
                                )}
                                {alum.skills?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Skills:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {alum.skills.slice(0, 3).map((skill, i) => (
                                        <Badge key={i} variant="secondary">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {alum.skills.length > 3 && (
                                        <Badge variant="secondary">
                                          +{alum.skills.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button asChild variant="outline" className="flex-1">
                                  <Link to={`/alumni/${alum.userId}`}>View Profile</Link>
                                </Button>
                                <Button asChild className="flex-1">
                                  <Link to={`/messages/new?recipient=${alum.userId}`}>
                                    Connect
                                  </Link>
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>
            )
          ) : (
            Object.keys(groupedAlumni).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No alumni found</h3>
                <p className="text-muted-foreground mt-2">No alumni data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedAlumni).length === 1 && Object.keys(groupedAlumni)[0] === 'Unknown' ? (
                  <p className="text-center text-muted-foreground">
                    All alumni are in the "Unknown" batch. Expand to view.
                  </p>
                ) : null}
                {Object.keys(groupedAlumni)
                  .sort((a, b) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : b - a))
                  .map((batch) => (
                    <Collapsible
                      key={batch}
                      open={openBatches.includes(batch)}
                      onOpenChange={() => toggleBatch(batch)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Batch {batch}</h3>
                          <Badge variant="secondary">
                            {Object.values(groupedAlumni[batch]).reduce(
                              (acc: number, majorAlumni: AlumniProfile[]) => acc + majorAlumni.length,
                              0
                            )}
                          </Badge>
                        </div>
                        {openBatches.includes(batch) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-4 mt-4">
                          {Object.keys(groupedAlumni[batch])
                            .sort((a, b) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : a.localeCompare(b)))
                            .map((major) => (
                              <Collapsible
                                key={`${batch}-${major}`}
                                open={(openMajors[batch] || []).includes(major)}
                                onOpenChange={() => toggleMajor(batch, major)}
                              >
                                <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted/50 p-3 rounded-lg pl-6">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-md font-medium">{major}</h4>
                                    <Badge variant="secondary">{groupedAlumni[batch][major].length}</Badge>
                                  </div>
                                  {(openMajors[batch] || []).includes(major) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pl-6">
                                    {groupedAlumni[batch][major].map((alum: AlumniProfile) => (
                                      <Card key={alum.userId}>
                                        <CardHeader>
                                          <div className="flex gap-4 items-center">
                                            <Avatar className="h-16 w-16">
                                              <AvatarImage src={alum.photoURL} alt={alum.name} />
                                              <AvatarFallback>
                                                {alum.name?.split(' ').map((n) => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <CardTitle>{alum.name}</CardTitle>
                                              <CardDescription>
                                                {alum.currentJobTitle}
                                                {alum.company && ` at ${alum.company}`}
                                              </CardDescription>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          {alum.graduationYear && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Graduation Year: {alum.graduationYear}
                                            </p>
                                          )}
                                          {alum.major && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Major: {alum.major}
                                            </p>
                                          )}
                                          {alum.skills?.length > 0 && (
                                            <div>
                                              <p className="text-sm font-medium mb-1">Skills:</p>
                                              <div className="flex flex-wrap gap-1.5">
                                                {alum.skills.slice(0, 3).map((skill, i) => (
                                                  <Badge key={i} variant="secondary">
                                                    {skill}
                                                  </Badge>
                                                ))}
                                                {alum.skills.length > 3 && (
                                                  <Badge variant="secondary">
                                                    +{alum.skills.length - 3}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                          <Button asChild variant="outline" className="flex-1">
                                            <Link to={`/alumni/${alum.userId}`}>View Profile</Link>
                                          </Button>
                                          <Button asChild className="flex-1">
                                            <Link to={`/messages/new?recipient=${alum.userId}`}>
                                              Connect
                                            </Link>
                                          </Button>
                                        </CardFooter>
                                      </Card>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default AlumniListings;
