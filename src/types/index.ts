// Minimal User interface for authentication context
export interface User {
  _id: string;
  email: string;
  displayName?: string;
}

// Job interface based on JobListingPage.tsx
export interface Job {
  _id: string;
  description: string;
  postedBy: string;
  postedAt: Date | string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

// Event interface (unchanged)
export interface Event {
  id: string;
  description: string;
  organizer: string;
  createdAt?: Date | string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

// AlumniProfile interface (unchanged)
export interface AlumniProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoURL?: string;
  batch: string;
  graduationYear: number;
  degree: string;
  major: string;
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
  isMentor: boolean;
  mentorshipAreas?: string[];
}

// Message interface (unchanged)
export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Conversation interface (unchanged)
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

// MentorshipRequest interface (unchanged)
export interface MentorshipRequest {
  id: string;
  mentorId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  area: string;
  createdAt: Date;
  updatedAt: Date;
}

// Batch interface (unchanged)
export interface Batch {
  year: number;
  name: string;
}