import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, UserPlus, Briefcase, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Slide1 from './Slide1.jpg';
import Slide2 from './Slide2.jpg';
import Slide3 from './Slide3.jpg';

const Home: React.FC = () => {
  const slides = [Slide1, Slide2, Slide3];
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Automatic slideshow for hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  // Automatic scrolling for stats section
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const containerWidth = scrollContainer.clientWidth;

    const interval = setInterval(() => {
      if (scrollContainer.scrollLeft + containerWidth >= scrollWidth) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 264, behavior: 'smooth' }); // 264 = card width (256) + gap (8)
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const featuredAlumni = [
    {
      id: "1",
      name: "Sarah Johnson",
      batch: "2015",
      jobTitle: "Senior Software Engineer",
      company: "Google",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "2",
      name: "Michael Chen",
      batch: "2018",
      jobTitle: "Product Manager",
      company: "Microsoft",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "3",
      name: "Amanda Rodriguez",
      batch: "2016",
      jobTitle: "Marketing Director",
      company: "Netflix",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "4",
      name: "David Washington",
      batch: "2019",
      jobTitle: "Data Scientist",
      company: "Amazon",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
    },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Annual Alumni Meetup",
      date: new Date(2023, 8, 25),
      location: "University Campus",
      type: "meetup",
    },
    {
      id: "2",
      title: "Career Development Workshop",
      date: new Date(2023, 9, 10),
      location: "Virtual",
      type: "workshop",
    },
    {
      id: "3",
      title: "Industry Insights Webinar",
      date: new Date(2023, 9, 15),
      location: "Virtual",
      type: "webinar",
    },
  ];

  const featuredJobs = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "Tech Solutions Inc",
      location: "San Francisco, CA",
      type: "full-time",
      postedAt: new Date(2023, 8, 10),
    },
    {
      id: "2",
      title: "Marketing Intern",
      company: "Growth Media",
      location: "Remote",
      type: "internship",
      postedAt: new Date(2023, 8, 15),
    },
    {
      id: "3",
      title: "UX Designer",
      company: "Design Studios",
      location: "New York, NY",
      type: "full-time",
      postedAt: new Date(2023, 8, 18),
    },
  ];

  const youtubeVideoId = 'kvp8mlfnWKA';

  return (
    <div className="flex flex-col">
      {/* Hero Section with Slideshow */}
      <section className="bg-navy text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Connect with your <span className="text-gold">College Community</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-md">
                Build meaningful relationships, find mentorship opportunities, and advance your career with our alumni network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                  <Link to="/register">Join the Network</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                  <Link to="/alumni">Explore Alumni</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-lg shadow-lg overflow-hidden h-96 w-full">
                <img
                  src={slides[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-navy/50 text-white p-2 rounded-full hover:bg-navy/80"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-navy/50 text-white p-2 rounded-full hover:bg-navy/80"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>
                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-3 w-3 rounded-full ${
                        currentSlide === index ? 'bg-gold' : 'bg-white/50'
                      } hover:bg-white/80 transition-colors`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <div className="flex flex-col">
      {/* Video Section with Slideshow */}
      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-6 text-navy">Watch Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Slideshow on the Left */}
            <div className="relative rounded-lg shadow-lg overflow-hidden h-[300px] w-full">
              <img
                src={slides[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-navy/50 text-white p-2 rounded-full hover:bg-navy/80"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-navy/50 text-white p-2 rounded-full hover:bg-navy/80"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-3 w-3 rounded-full ${
                      currentSlide === index ? 'bg-gold' : 'bg-white/50'
                    } hover:bg-white/80 transition-colors`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            {/* Video on the Right */}
            <div className="relative rounded-lg shadow-lg overflow-hidden h-[300px] w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?start=11&rel=0&controls=1`}
                title="Alumni network video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>

      {/* Stats Section */}
      <section className="bg-navy py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Our Community Impact</h2>
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-thin scrollbar-thumb-gold scrollbar-track-navy/50"
            >
              {[
                { value: "5000+", label: "Alumni in Network" },
                { value: "200+", label: "Mentors Available" },
                { value: "350+", label: "Job Opportunities" },
                { value: "50+", label: "Events Per Year" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="snap-center flex-shrink-0 w-64 bg-white text-navy shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Scrollbar styling */}
            <style jsx>{`
              .scrollbar-thin {
                scrollbar-width: thin;
                scrollbar-color: #d4af37 rgba(0, 0, 128, 0.5);
              }
              .scrollbar-thin::-webkit-scrollbar {
                height: 8px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: rgba(0, 0, 128, 0.5);
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #d4af37;
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #b8972f;
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Our Community</h2>
          
          <Tabs defaultValue="alumni" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="alumni" className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Featured Alumni</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>Upcoming Events</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span>Latest Jobs</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="alumni" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredAlumni.map((alumni) => (
                  <Card key={alumni.id} className="alumni-card group">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img 
                          src={alumni.image} 
                          alt={alumni.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent flex items-end p-4">
                          <div className="text-white">
                            <h3 className="font-semibold">{alumni.name}</h3>
                            <p className="text-sm text-gold">Class of {alumni.batch}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">{alumni.jobTitle}</p>
                        <p className="text-sm font-medium">{alumni.company}</p>
                        <Button variant="ghost" size="sm" asChild className="mt-2 w-full">
                          <Link to={`/alumni/${alumni.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button asChild variant="outline">
                  <Link to="/alumni">View All Alumni</Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="alumni-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-navy/10 rounded p-3 flex items-center justify-center">
                          <CalendarDays className="text-navy" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {event.date.toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <Button variant="link" size="sm" asChild className="p-0 mt-1">
                            <Link to={`/events/${event.id}`}>Learn more</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button asChild variant="outline">
                  <Link to="/events">View All Events</Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredJobs.map((job) => (
                  <Card key={job.id} className="alumni-card">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <div className="space-y-1">
                          <p className="font-medium">{job.company}</p>
                          <p className="text-sm text-gray-600">{job.location}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{job.type}</p>
                        </div>
                        <div className="pt-2">
                          <Button asChild>
                            <Link to={`/jobs/${job.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button asChild variant="outline">
                  <Link to="/jobs">View All Jobs</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Mentorship Section */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80" 
                alt="Mentorship" 
                className="rounded-lg shadow-lg h-64 md:h-96 w-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-bold">Mentorship Program</h2>
              <p className="text-gray-300">
                Get guidance from alumni who have been in your shoes. Our mentorship program connects you with experienced professionals ready to help you navigate your career path.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center text-navy">
                    ✓
                  </div>
                  <span>One-on-one guidance sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center text-navy">
                    ✓
                  </div>
                  <span>Career advice from industry experts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center text-navy">
                    ✓
                  </div>
                  <span>Resume reviews and interview preparation</span>
                </li>
              </ul>
              <Button asChild className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                <Link to="/mentorship">Find a Mentor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
