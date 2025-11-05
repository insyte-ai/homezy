'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Redirect pros and admins away from homepage to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'pro') {
        router.push('/pro/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
      // Homeowners can stay on homepage
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Homezy</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Link href="/become-a-pro" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Become a Pro
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <span className="text-neutral-700">
                    Welcome, {user?.firstName}!
                  </span>
                  <button
                    onClick={() => logout()}
                    className="btn btn-outline"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-outline">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="btn btn-primary">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Find Trusted Home Improvement
            <br />
            <span className="text-blue-600">Pros in UAE</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Connect with verified pros for your home improvement projects.
            Get quotes, compare services, and hire with confidence.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center space-x-4">
              {isAuthenticated ? (
                <button className="btn btn-primary text-lg px-8 py-4">
                  Start a Project
                </button>
              ) : (
                <>
                  <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-4">
                    Get started free
                  </Link>
                  <Link href="/auth/login" className="btn btn-outline text-lg px-8 py-4">
                    Sign in
                  </Link>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <p className="text-neutral-600">
                Are you a professional?{' '}
                <Link href="/become-a-pro" className="text-blue-600 hover:text-blue-700 font-medium">
                  Learn more
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Verified Pros
            </h3>
            <p className="text-neutral-600">
              All pros are verified and background-checked for your safety
              and peace of mind.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Competitive Quotes
            </h3>
            <p className="text-neutral-600">
              Receive multiple quotes from pros and choose the best fit
              for your budget.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              AI-Powered Matching
            </h3>
            <p className="text-neutral-600">
              Our AI helps match you with the right pros based on your
              specific needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
