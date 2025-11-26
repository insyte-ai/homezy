'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'homeowner' as 'homeowner',
  });

  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
  }>({});

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState([
    { regex: /.{8,}/, text: 'At least 8 characters', met: false },
    { regex: /[A-Z]/, text: 'One uppercase letter', met: false },
    { regex: /[0-9]/, text: 'One number', met: false },
    { regex: /[^A-Za-z0-9]/, text: 'One special character', met: false },
  ]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        switch (user.role) {
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
      }
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password requirements in real-time
    if (name === 'password') {
      setPasswordRequirements((prev) =>
        prev.map((req) => ({
          ...req,
          met: req.regex.test(value),
        }))
      );
    }

    // Clear errors on input change
    if (error) {
      clearError();
    }
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Check if all password requirements are met
    const allRequirementsMet = passwordRequirements.every((req) => req.met);
    if (!allRequirementsMet) {
      errors.password = 'Please meet all password requirements';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      // Error is already handled in the store
      console.error('Registration error:', err);
    }
  };

  const handleGoogleSuccess = () => {
    // Google users are auto-verified, so redirect directly
    // The useEffect will handle the role-based redirect
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Create your account
      </h2>
      <p className="text-neutral-600 mb-6">
        Sign up as a homeowner to get started with your home improvement projects.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              placeholder="Doe"
            />
          </div>
        </div>

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
            placeholder="you@example.com"
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
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`input ${validationErrors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
          {formData.password && (
            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center text-sm ${
                    req.met ? 'text-green-600' : 'text-neutral-400'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      req.met ? 'text-green-500' : 'text-neutral-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {req.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <GoogleSignInButton
          role="homeowner"
          onSuccess={handleGoogleSuccess}
          text="Continue with Google"
        />
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-black font-medium hover:underline">
          Sign in
        </Link>
        {' · '}
        <Link href="/become-a-pro" className="text-black font-medium hover:underline">
          Sign up as Pro
        </Link>
      </p>

      <p className="text-center mt-4 text-xs text-gray-500">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="underline">Terms</Link>
        {' and '}
        <Link href="/privacy" className="underline">Privacy</Link>
      </p>
    </div>
  );
}
