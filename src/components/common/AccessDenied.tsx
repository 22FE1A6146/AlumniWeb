
import React from 'react';
import { Button } from "@/components/ui/button";
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = "You don't have permission to access this page.",
  redirectPath = "/",
  redirectLabel = "Go to Homepage"
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-20 w-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
        <Button onClick={() => navigate(redirectPath)}>
          {redirectLabel}
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;