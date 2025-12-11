'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated (with role-based routing)
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        // Check if returning to lead form
        const returnToLeadForm = searchParams.get('returnToLeadForm');
        const serviceId = searchParams.get('serviceId');

        if (returnToLeadForm === 'true' && serviceId) {
          // Redirect back to homepage with query params to reopen modal
          router.replace(`/?returnToLeadForm=true&serviceId=${serviceId}`);
          return;
        }

        // Check if we have a stored redirect URL
        const redirectUrl = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectUrl);
          return;
        }

        // Default redirects based on role
        switch (user.role) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'pro':
            router.replace('/pro/dashboard');
            break;
          case 'homeowner':
            router.replace('/dashboard');
            break;
          default:
            router.replace('/');
        }
      }
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on input change
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await login(formData);

      // Check if returning to lead form
      const returnToLeadForm = searchParams.get('returnToLeadForm');
      const serviceId = searchParams.get('serviceId');

      if (returnToLeadForm === 'true' && serviceId) {
        // Redirect back to homepage with query params to reopen modal
        router.push(`/?returnToLeadForm=true&serviceId=${serviceId}`);
        return;
      }

      // Check for stored redirect URL
      const redirectUrl = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
        return;
      }

      // Redirect based on user role (user is now set in store after login)
      const currentUser = useAuthStore.getState().user;
      switch (currentUser?.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'pro':
          router.push('/pro/dashboard');
          break;
        case 'homeowner':
          router.push('/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      // Error is already handled in the store
      console.error('Login error:', err);
    }
  };

  const handleGoogleSuccess = () => {
    // Check if returning to lead form
    const returnToLeadForm = searchParams.get('returnToLeadForm');
    const serviceId = searchParams.get('serviceId');

    if (returnToLeadForm === 'true' && serviceId) {
      router.push(`/?returnToLeadForm=true&serviceId=${serviceId}`);
      return;
    }

    // Check for stored redirect URL
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
    // Otherwise, useEffect will handle role-based redirect
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center">Sign in to your account</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
            Forgot your password?
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            text="Sign in with Google"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/auth/register" className="btn btn-outline w-full text-center block">
            Sign up as Homeowner
          </Link>
          <Link href="/auth/pro/register" className="btn btn-outline w-full text-center block">
            Sign up as Pro
          </Link>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
