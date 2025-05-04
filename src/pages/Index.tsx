import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Briefcase, Calendar, Users, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Alumni Network</h1>
        <p className="text-xl text-gray-600 mb-8">Connect with fellow alumni, find career opportunities, and stay updated with upcoming events.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button 
            className="h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
            onClick={() => navigate('/alumni')}
          >
            <Users size={24} />
            View Alumni
          </Button>
          
          <Button 
            className="h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600"
            onClick={() => navigate('/jobs')}
          >
            <Briefcase size={24} />
            Browse Jobs
          </Button>
          
          <Button 
            className="h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600"
            onClick={() => navigate('/events')}
          >
            <Calendar size={24} />
            Upcoming Events
          </Button>
          
          {isAdmin ? (
            <Button 
              className="h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse"
              onClick={() => navigate('/admin')}
            >
              <ShieldCheck size={24} />
              Admin Dashboard
            </Button>
          ) : (
            <Button 
              className="h-24 text-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600"
              onClick={() => navigate('/admin')}
            >
              <LayoutDashboard size={24} />
              Admin Dashboard
            </Button>
          )}
        </div>
        
        {isAdmin && (
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200 mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-800 flex items-center">
              <ShieldCheck className="mr-2" size={24} /> 
              Admin Access Granted
            </h2>
            <p className="text-green-700">
              You're logged in with admin privileges. You can access the Admin Dashboard to manage users, events, and more.
            </p>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to the Alumni Network</h2>
          <p className="text-gray-600">
            This platform helps alumni stay connected, find job opportunities, attend events, and mentor current students.
            Administrators can manage users, post events, and send announcements through the Admin Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;