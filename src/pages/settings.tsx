import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { useAuth } from '@/lib/firebase';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const Settings = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      await apiService.changePassword({ currentPassword, newPassword });
    },
    onSuccess: () => {
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to change password. Please try again.');
      setSuccess(null);
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.uid) {
        throw new Error('No authenticated user found.');
      }
      await apiService.requestProfileDeletion();
    },
    onSuccess: () => {
      setSuccess('A confirmation email has been sent to your registered email address. Please follow the instructions to delete your account.');
      setEmailSent(true);
      setError(null);
      setDeleteConfirm(false);
    },
    onError: (err: any) => {
      const errorMessage = err.message.includes('Email link sign-in is not enabled')
        ? 'Failed to send deletion email: Email link sign-in is not enabled. Please contact support at support@yourapp.com.'
        : `Failed to send delete confirmation email: ${err.message || 'Please try again or contact support.'}`;
      setError(errorMessage);
      setSuccess(null);
    },
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleDeleteProfile = () => {
    if (!currentUser) {
      setError('You must be logged in to delete your profile.');
      return;
    }
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    deleteProfileMutation.mutate();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h3 className="text-lg font-medium">Not Logged In</h3>
        <p className="text-muted-foreground mt-2">Please log in to manage your account settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your account settings, including password and profile options.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Change Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && !emailSent && (
                <Alert variant="default" className="border-green-500 text-green-700">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={changePasswordMutation.isLoading}
              >
                {changePasswordMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Delete Profile</CardTitle>
            <CardDescription>
              Permanently delete your profile and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deleteConfirm && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Are you sure?</AlertTitle>
                <AlertDescription>
                  This will send a confirmation email to {currentUser.email}. Click again to proceed.
                </AlertDescription>
              </Alert>
            )}
            {success && emailSent && (
              <Alert variant="default" className="border-green-500 text-green-700 mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteProfile}
              disabled={deleteProfileMutation.isLoading || emailSent}
            >
              {deleteProfileMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Confirmation Email...
                </>
              ) : deleteConfirm ? (
                'Send Delete Confirmation Email'
              ) : (
                'Delete Profile'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;