import axios, { AxiosError } from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || ;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for Event data
interface Event {
  _id?: string;
  description: string;
  organizer: string;
  createdAt?: string | Date;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

// Interface for Job data
interface Job {
  _id?: string;
  description: string;
  postedBy: string;
  postedAt?: string | Date;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

// Interface for Alumni data
interface Alumni {
  userId: string;
  name: string;
  email: string;
  photoURL?: string;
  batch: string;
  graduationYear: number;
  degree?: string;
  major?: string;
  currentJobTitle?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  achievements?: string[];
  skills?: string[];
  experience?: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  isMentor: boolean;
  mentorshipAreas?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Interface for error response
interface ErrorResponse {
  message: string;
  errors?: Array<{ msg: string; param?: string }>;
}

// Add authentication token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request token:', token);
      } catch (error) {
        console.error('Failed to get ID token:', error);
        throw new Error('Authentication token retrieval failed');
      }
    } else {
      console.warn('No authenticated user found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.map((e) => e.msg).join(', ') ||
      error.message ||
      'An unexpected error occurred';
    console.error('API error:', {
      message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(new Error(message));
  }
);

// Define API service functions
export const apiService = {
  // ALUMNI
  getAlumni: (params?: {
    batch?: string;
    search?: string;
    page?: number;
    limit?: number;
    groupByBatch?: boolean;
    groupByBatchAndMajor?: boolean;
  }) =>
    api.get('/alumni', { params }).then((res) => {
      console.log('getAlumni response:', res.data);
      if (params?.groupByBatch || params?.groupByBatchAndMajor) {
        return res.data;
      }
      return Array.isArray(res.data) ? res.data : res.data.data || [];
    }),

  getAlumniGroupedByBatch: () =>
    apiService.getAlumni({ groupByBatch: true }),

  getAlumniGroupedByBatchAndMajor: () =>
    apiService.getAlumni({ groupByBatchAndMajor: true }),

  getAlumniById: (userId: string) => api.get<Alumni>(`/alumni/${userId}`).then((res) => res.data),

  updateProfile: (userId: string, data: Partial<Alumni>) => {
    console.log('Updating profile for userId:', userId, 'with data:', data);
    return api.put<Alumni>(`/alumni/${userId}`, data).then((res) => res.data);
  },

  createAlumni: (userId: string, data: Alumni) => {
    console.log('Creating alumni for userId:', userId, 'with data:', data);
    return api.post<Alumni>(`/alumni/${userId}`, data).then((res) => res.data);
  },

  uploadProfilePicture: async (file: File) => {
    if (!auth.currentUser) {
      console.error('No authenticated user');
      throw new Error('User not authenticated');
    }
    console.log('Uploading file:', file);
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const response = await api.post<{ url: string }>('/alumni/upload', formData);
      console.log('Upload response:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },


  requestProfileDeletion: (userId: string) => {
    console.log('Requesting profile deletion for userId:', userId);
    return api.post(`/alumni/${userId}/request-deletion`).then((res) => res.data);
  },












  // MENTORSHIP
  getMentors: async () => {
    try {
      const res = await api.get<AlumniProfile[]>('/mentorship/mentors');
      console.log('getMentors response:', res.data); // Debugging log
      const data = res.data;
      // Handle both direct array and nested data
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error('getMentors error:', error); // Debugging log
      return []; // Fallback to empty array
    }
  },
  requestMentorship: (mentorId: string, area: string, message: string) =>
    api.post('/mentorship/request', { mentorId, area, message }).then((res) => res.data),
  getMentorshipRequestsAsMentor: () =>
    api.get('/mentorship/requests/mentor').then((res) => res.data),
  getMentorshipRequestsAsStudent: () =>
    api.get('/mentorship/requests/student').then((res) => res.data),
  updateMentorshipRequestStatus: (requestId: string, status: 'accepted' | 'rejected') =>
    api.put(`/mentorship/requests/${requestId}`, { status }).then((res) => res.data),

  // JOBS
  getJobs: () => api.get<Job[]>('/jobs').then((res) => {
    console.log('getJobs response:', res.data);
    return Array.isArray(res.data) ? res.data : res.data.jobs || [];
  }),




//changesss
getMyJobs: () => api.get<Job[]>('/jobs/my-jobs').then((res) => {
  console.log('getMyJobs response:', res.data);
  return Array.isArray(res.data) ? res.data : res.data.jobs || [];
}),






  getJobById: (id: string) => api.get<Job>(`/jobs/${id}`).then((res) => res.data),
  postJob: (data: Partial<Job>) => {
    console.log('Posting job with data:', data);
    return api.post<Job>('/jobs', data).then((res) => res.data);
  },







  updateJob: async (id: string, data: JobUpdateData): Promise<Job> => {
    try {
      // Validate ID format (basic ObjectId check)
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('Invalid job ID:', id);
        throw new Error('Invalid job ID');
      }

      // Validate data
      if (!data.description && !data.media) {
        console.error('No valid fields provided for update:', data);
        throw new Error('At least one field (description or media) must be provided');
      }

      if (data.media && ((data.media.type && !data.media.url) || (!data.media.type && data.media.url))) {
        console.error('Invalid media format:', data.media);
        throw new Error('Media must have both type and url, or both must be null');
      }

      console.log('Updating job ID:', id, 'with data:', data);
      const response = await api.put<Job>(`/jobs/${id}`, data);
      console.log('updateJob response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating job:', error.message);
      throw new Error(error.message);
    }
  },













  deleteJob: (id: string) => api.delete(`/jobs/${id}`).then((res) => res.data),

  // EVENTS
  getEvents: () => api.get<Event[]>('/events').then((res) => {
    console.log('getEvents response:', res.data);
    return Array.isArray(res.data) ? res.data : res.data.events || [];
  }),

  getMyEvents: () => api.get<Event[]>('/events/my-events').then((res) => {
    console.log('getMyEvents response:', res.data);
    return Array.isArray(res.data) ? res.data : res.data.events || [];
  }),

  getEventById: (id: string) => api.get<Event>(`/events/${id}`).then((res) => res.data),
  createEvent: (data: Partial<Event>) => {
    console.log('Creating event with data:', data);
    return api.post<Event>('/events', data).then((res) => res.data);
  },
  updateEvent: (id: string, data: Partial<Event>) => {
    console.log('Updating event ID:', id, 'with data:', data);
    return api.put<Event>(`/events/${id}`, data).then((res) => res.data);
  },
  deleteEvent: (id: string) => api.delete(`/events/${id}`).then((res) => res.data),
  registerForEvent: (id: string) => api.post(`/events/${id}/register`).then((res) => res.data),

  // MESSAGES
  getConversations: () => api.get('/messages/conversations').then((res) => res.data),
  getMessages: (conversationId: string) =>
    api.get(`/messages/${conversationId}`).then((res) => res.data),
  sendMessage: (conversationId: string, data: any) =>
    api.post(`/messages/${conversationId}`, data).then((res) => res.data),
  startConversation: (recipientId: string) =>
    api.post('/messages/new', { recipientId }).then((res) => res.data),

  // ADMIN DASHBOARD
  getDashboardStats: () => api.get('/admin/stats').then((res) => res.data),
  getUserActivity: () => api.get('/admin/activity').then((res) => res.data),
  getEventAttendance: () => api.get('/admin/events/attendance').then((res) => res.data),
  getRecentRegistrations: () => api.get('/admin/registrations/recent').then((res) => res.data),
  sendAnnouncement: (data: any) => api.post('/admin/announcements', data).then((res) => res.data),

  canPostJob: () =>
    api.get<{ canPost: boolean }>('/can-post-job').then((res) => res.data.canPost),
};

export default apiService;  
