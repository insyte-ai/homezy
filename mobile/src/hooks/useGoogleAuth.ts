/**
 * Google Authentication Hook
 * Uses expo-auth-session for Google OAuth flow
 */

import { useEffect, useState, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../constants/config';
import { useAuthStore } from '../store/authStore';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  role: 'homeowner' | 'pro';
}

interface UseGoogleAuthResult {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

export const useGoogleAuth = ({ role }: UseGoogleAuthOptions): UseGoogleAuthResult => {
  const { googleAuth, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Google OAuth is configured
  const isConfigured = !!(
    GOOGLE_WEB_CLIENT_ID ||
    GOOGLE_IOS_CLIENT_ID ||
    GOOGLE_ANDROID_CLIENT_ID
  );

  // Configure Google OAuth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  // Handle OAuth response
  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;

        if (authentication?.accessToken) {
          setIsLoading(true);
          setError(null);

          try {
            // Send the access token to our backend
            await googleAuth({
              token: authentication.accessToken,
              role,
            });
            // Success - navigation handled by auth store
          } catch (err: any) {
            setError(err.message || 'Failed to authenticate with Google');
          } finally {
            setIsLoading(false);
          }
        }
      } else if (response?.type === 'error') {
        setError(response.error?.message || 'Google authentication failed');
      }
    };

    handleResponse();
  }, [response, googleAuth, role]);

  // Trigger Google sign-in
  const signIn = useCallback(async () => {
    if (!isConfigured) {
      setError('Google Sign-In is not configured. Please check your environment variables.');
      return;
    }

    if (!request) {
      setError('Google Sign-In is not ready. Please try again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await promptAsync();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Sign-In');
      setIsLoading(false);
    }
  }, [promptAsync, request, isConfigured]);

  return {
    signIn,
    isLoading: isLoading || authLoading,
    error,
    isConfigured,
  };
};

export default useGoogleAuth;
