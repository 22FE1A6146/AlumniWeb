import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from '@/context/AuthContext';
import { LogOut, User, Settings, MessageSquare, LayoutDashboard, Briefcase, Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-purple-800 font-bold"
      : "text-navy font-bold hover:text-purple-900 transition-colors duration-200";
  };

  return (
    <header className="w-full bg-white shadow-sm pt-0 mt-0 pb-0 mb-0">
      <div className="flex flex-col items-center w-full">
        {/* Full-Width Logo at the Very Top */}
        <div className="w-full m-0 p-0 mb-2">
          <img
            src="https://www.vignanlara.org/images/logo/check.jpg"
            alt="College Logo"
            className="w-full h-24 object-contain m-0"
          />
        </div>

        {/* Single Line: Alumni Connect, Navigation, and User Actions */}
        <div className="w-full max-w-screen-xl mt-0 pt-0 pb-0 mb-0 px-4 pr-8 flex flex-col items-center space-y-1 md:flex-row md:space-y-0 md:items-center md:justify-between">
          {/* Alumni Connect Title */}
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-navy">
            <span className="text-purple-800">Alumni</span>Connect
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center space-y-1 md:flex-row md:space-y-0 md:space-x-4 text-lg">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/about" className={isActive('/about')}>About Us</Link>
            <Link to="/alumni" className={isActive('/alumni')}>Alumni</Link>
            <Link to="/mentorship" className={isActive('/mentorship')}>Mentorship</Link>
            <Link to="/jobs" className={isActive('/jobs')}>Jobs</Link>
            <Link to="/events" className={isActive('/events')}>Events</Link>
            <Link to="/gallery" className={isActive('/gallery')}>Gallery</Link>
            {isAdmin && (
              <Link to="/admin" className={`${isActive('/admin')} flex items-center gap-1`}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Actions (Login/Register or Dropdown) */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar>
                      <AvatarImage src={currentUser?.photoURL || ""} />
                      <AvatarFallback className="bg-navy text-white">
                        {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-jobs" className="flex items-center gap-2">
                      <Briefcase size={16} />
                      <span>My Job Posts</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-events" className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>My Event Posts</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild className="text-sm px-3 py-0 rounded-md hover:bg-primary/90">
                  <Link to="/login" className="font-bold">Login</Link>
                </Button>
                <Button asChild className="text-sm px-3 py-0 rounded-md hover:bg-primary/90">
                  <Link to="/register" className="font-bold">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;