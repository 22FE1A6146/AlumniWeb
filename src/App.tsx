import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AlumniListing from "./pages/AlumniListing";
import JobListing from "./pages/JobListing";
import EventListing from "./pages/EventListing";
import Mentorship from "./pages/Mentorship";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileEdit from "./pages/ProfileEdit";
import Messages from "./pages/Messages";
import { AdminDashboard } from "./pages/AdminDashboard";
import { useAuthContext } from "./context/AuthContext";
import PostJob from "./pages/PostJob"; 
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import JobDetails from "./pages/JobDetails";
import MyEvents from "./pages/MyEvents";
import MyJobs from "./pages/MyJobs";
import ForgotPassword from "./pages/ForgotPassword";
import AboutUs from "./pages/AboutUs";
import Gallery from "./pages/Gallery";
import Settings from "./pages/settings";
// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuthContext();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component - This checks if the user is an admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuthContext();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if the user has admin rights
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Mentor/Admin Route Component - This checks if the user is a mentor or admin
const MentorAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading, isAdmin, userData } = useAuthContext();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if the user has admin rights or is a mentor
 
  
  return <>{children}</>;
};

// Auth Provider Wrapper for Protected Routes
const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProviderWrapper>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/alumni" element={<AlumniListing />} />
              <Route path="/alumni/:userId" element={<Profile />} />
              <Route path="/jobs" element={<JobListing />} />
              <Route path="/events" element={<EventListing />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/gallery" element={<Gallery />} />
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/profile/setup" element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } />
              
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              <Route path="/messages/:conversationId" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />

<Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
<Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />         
              {/* Protected Routes for Job and Event Creation */}
              <Route path="/jobs/post" element={
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              } />
              
              <Route path="/events/create" element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProviderWrapper>
  </QueryClientProvider>
);

export default App;