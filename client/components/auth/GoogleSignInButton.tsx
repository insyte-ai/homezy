'use client';

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface GoogleSignInButtonProps {
  role?: 'homeowner' | 'pro';
  onSuccess?: () => void;
  onError?: (error: any) => void;
  text?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  role,
  onSuccess,
  onError,
  text = 'Continue with Google'
}) => {
  const router = useRouter();
  const googleAuth = useAuthStore((state) => (state as any).googleAuth);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('No credential received from Google');
      return;
    }

    try {
      // Call the Google auth method from the store
      await googleAuth({
        token: credentialResponse.credential,
        role
      });

      toast.success('Successfully logged in with Google!');
      onSuccess?.();

      // Redirect based on role
      if (role === 'pro') {
        router.push('/pro/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google');
      onError?.(error);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    toast.error('Failed to login with Google');
    onError?.(new Error('Google login failed'));
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        text={text === 'Continue with Google' ? 'continue_with' : 'signin_with'}
        width="400"
        shape="rectangular"
        size="large"
        theme="outline"
      />
    </div>
  );
};

export default GoogleSignInButton;
