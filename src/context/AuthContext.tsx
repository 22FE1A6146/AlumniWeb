import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { auth, signIn as firebaseSignIn, signUp as firebaseSignUp, logOut as firebaseLogout, useAuth as useFirebaseAuth } from '@/lib/firebase';
import { User } from '@/types';
import apiService from '@/lib/api';
import { updateProfile } from "firebase/auth";

// Define AuthContextType interface
interface AuthContextType {
  currentUser: firebase.User | null;
  loading: boolean;
  userData: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useFirebaseAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const response = await apiService.getAlumniById(currentUser.uid);
          setUserData(response); // Use response directly, assuming apiService unwraps data
          const userRole = response.role || localStorage.getItem('userRole') || 'user';
          setIsAdmin(userRole === 'admin');
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
          setIsAdmin(false);
          toast({
            title: "Error",
            description: "Failed to fetch user profile.",
            variant: "destructive",
          });
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        localStorage.removeItem('userRole');
      }
    };

    fetchUserData();
  }, [currentUser, toast]);

  const login = async (email: string, password: string, role?: string) => {
    try {
      await firebaseSignIn(email, password);

      if (role) {
        localStorage.setItem('userRole', role);
        setIsAdmin(role === 'admin');
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      const message = error.message || "An error occurred during login.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await firebaseSignUp(email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });

        // Optionally create alumni profile
        try {
          await apiService.createAlumni(result.user.uid, {
            userId: result.user.uid,
            name,
            email,
            batch: '',
            graduationYear: 0,
            isMentor: false,
          });
        } catch (apiError) {
          console.error("Error creating alumni profile:", apiError);
        }

        toast({
          title: "Registration successful",
          description: "Your account has been created.",
        });
      }
    } catch (error: any) {
      const message = error.message || "An error occurred during registration.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      localStorage.removeItem('userRole');
      setUserData(null);
      setIsAdmin(false);

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      const message = error.message || "An error occurred during logout.";
      toast({
        title: "Logout failed",
        description: message,
        variant: "destructive",
      });
      throw new Error(message);
    }
  };

  const value = {
    currentUser,
    loading,
    userData,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};  