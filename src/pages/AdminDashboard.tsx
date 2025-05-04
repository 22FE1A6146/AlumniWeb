import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import {
  Users, UserPlus, Calendar, Briefcase,
  Plus, Send, TrendingUp, BarChart, UserCheck
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Sample data for charts
const activityData = [
  { month: 'Jan', users: 20 },
  { month: 'Feb', users: 35 },
  { month: 'Mar', users: 45 },
  { month: 'Apr', users: 40 },
  { month: 'May', users: 60 },
  { month: 'Jun', users: 75 },
  { month: 'Jul', users: 85 },
];

const eventAttendanceData = [
  { event: 'Annual Meet', attendees: 120 },
  { event: 'Career Fair', attendees: 87 },
  { event: 'Workshop', attendees: 45 },
  { event: 'Webinar', attendees: 65 },
  { event: 'Networking', attendees: 55 },
];

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{this.state.error?.message || 'An unexpected error occurred.'}</p>
              <p>Please try refreshing the page or contact support.</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Alumni
  const { data: alumniData, isLoading: alumniLoading, error: alumniError } = useQuery({
    queryKey: ['alumni'],
    queryFn: () => apiService.getAlumni(),
  });

  // Mentors
  const { data: mentorData, isLoading: mentorLoading, error: mentorError } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => apiService.getMentors(),
  });

  // Events
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getEvents(),
  });

  // Jobs
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiService.getJobs(),
  });

  // Log data for debugging
  React.useEffect(() => {
    console.log('alumniData:', alumniData);
    if (alumniError) {
      console.error('Alumni fetch error:', alumniError);
      toast.error('Failed to load alumni data');
    }
    if (mentorError) {
      console.error('Mentor fetch error:', mentorError);
      toast.error('Failed to load mentor data');
    }
    if (eventsError) {
      console.error('Events fetch error:', eventsError);
      toast.error('Failed to load events data');
    }
    if (jobsError) {
      console.error('Jobs fetch error:', jobsError);
      toast.error('Failed to load jobs data');
    }
  }, [alumniData, alumniError, mentorError, eventsError, jobsError]);

  const totalAlumni = Array.isArray(alumniData) ? alumniData.length : 0;
  const totalMentors = Array.isArray(mentorData) ? mentorData.length : 0;
  const activeUsers = Array.isArray(alumniData) ? alumniData.length : 0;
  const newRegistrations = Array.isArray(alumniData) ? alumniData.length : 0;

  const handleAddEvent = () => navigate('/events/create');
  const handlePostJob = () => navigate('/jobs/post');
  const handleAddAlumni = () => navigate('/profile/setup');
  const handleSendAnnouncement = () => toast.info('Announcement feature coming soon!');

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <Button onClick={handleAddEvent} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Event
            </Button>
            <Button onClick={handlePostJob} size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" /> Post Job
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Alumni" value={alumniLoading ? '...' : totalAlumni} icon={<Users />} color="blue" />
          <SummaryCard title="Total Mentors" value={mentorLoading ? '...' : totalMentors} icon={<UserCheck />} color="indigo" />
          <SummaryCard title="Active Users" value={activeUsers} icon={<Users />} color="green" />
          <SummaryCard title="New Registrations" value={newRegistrations} icon={<UserPlus />} color="amber" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="User Activity"
            description="Monthly active users over time"
            chart={
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            }
          />
          <ChartCard
            title="Event Attendance"
            description="Attendance count by event"
            chart={
              <RechartsBarChart data={eventAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendees" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            }
          />
        </div>

        {/* Admin Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="mr-2 h-5 w-5" /> Add Event
          </Button>
          <Button onClick={handlePostJob} className="bg-purple-600 hover:bg-purple-700">
            <Briefcase className="mr-2 h-5 w-5" /> Post Job
          </Button>
          <Button onClick={handleAddAlumni} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-5 w-5" /> Profile Update
          </Button>
          <Button onClick={handleSendAnnouncement} className="bg-amber-600 hover:bg-amber-700">
            <Send className="mr-2 h-5 w-5" /> Send Announcement
          </Button>
        </div>

        {/* Tables */}
        <DataTable
          title="Recent Registrations"
          loading={alumniLoading}
          data={[...(alumniData || [])].reverse().slice(0, 5)}
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Batch', accessor: 'batch' },
            {
              header: 'Date Joined',
              accessor: (row: any) =>
                row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
            },
            {
              header: 'Status',
              accessor: () => (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Active
                </span>
              ),
            },
          ]}
        />

        <DataTable
          title="Upcoming Events"
          loading={eventsLoading}
          data={eventsData?.slice(0, 5) || []}
          columns={[
            { header: 'Description', accessor: 'description' },
            { header: 'Organizer', accessor: 'organizer' },
            {
              header: 'Date',
              accessor: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
            },
            { header: 'Registrations', accessor: () => 'N/A' },
          ]}
        />

        <DataTable
          title="Latest Job Postings"
          loading={jobsLoading}
          data={[...(jobsData || [])].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
          }).slice(0, 5)}
          columns={[
            { header: 'Description', accessor: 'description' },
            { header: 'Posted By', accessor: 'postedBy' },
            { header: 'Type', accessor: () => 'N/A' },
            {
              header: 'Posted Date',
              accessor: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
            },
          ]}
        />
      </div>
    </ErrorBoundary>
  );
};

// Component: SummaryCard
const SummaryCard = ({ title, value, icon, color }: any) => (
  <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200`}>
    <CardHeader className="pb-2">
      <CardTitle className={`text-lg font-medium text-${color}-700 flex items-center`}>
        {icon} <span className="ml-2">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className={`text-3xl font-bold text-${color}-800`}>{value}</p>
    </CardContent>
    <CardFooter className="pt-0">
      <p className={`text-sm text-${color}-600`}>
        <TrendingUp className="inline h-4 w-4 mr-1" /> +4.5% from last month
      </p>
    </CardFooter>
  </Card>
);

// Component: ChartCard
const ChartCard = ({ title, description, chart }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Component: DataTable
const DataTable = ({ title, data, columns, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col: any, idx: number) => (
              <TableHead key={idx}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row: any, rowIdx: number) => (
              <TableRow key={row._id || rowIdx}>
                {columns.map((col: any, colIdx: number) => (
                  <TableCell key={colIdx}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] || 'N/A')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export { AdminDashboard };