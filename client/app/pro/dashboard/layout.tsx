'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function ProDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showProgressBanner, setShowProgressBanner] = useState(true);

  // Check if user is pro
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Wait for user to be loaded before checking role
    if (!user) {
      return;
    }

    // Check if user is a pro
    if (user.role !== 'pro') {
      console.log('Redirecting non-pro user to homepage', { role: user.role });
      router.push('/');
    }
  }, [user, isAuthenticated, router]);

  // Mock profile completion - TODO: Get from API
  const profileCompletion = {
    completed: 2,
    total: 6,
    tasks: [
      { id: 1, name: 'Basic profile setup', completed: true, link: '/pro/onboarding' },
      { id: 2, name: 'Service categories selected', completed: true, link: '/pro/dashboard/profile' },
      { id: 3, name: 'Upload verification documents', completed: false, link: '/pro/dashboard/verification', highlight: true },
      { id: 4, name: 'Add bio and tagline', completed: false, link: '/pro/dashboard/profile' },
      { id: 5, name: 'Upload portfolio photos', completed: false, link: '/pro/dashboard/portfolio' },
      { id: 6, name: 'Set pricing and availability', completed: false, link: '/pro/dashboard/settings' },
    ],
  };

  const completionPercentage = Math.round((profileCompletion.completed / profileCompletion.total) * 100);
  const incompleteTasks = profileCompletion.tasks.filter(t => !t.completed);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/pro/dashboard" className="flex items-center gap-2">
                <span className="font-quicksand text-2xl font-bold text-gray-900">
                  Home<span className="text-primary-500">zy</span>
                </span>
                <span className="text-sm font-normal text-neutral-500">Pro</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/pro/dashboard" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Dashboard
                </Link>
                <Link href="/pro/dashboard/leads" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Leads
                </Link>
                <Link href="/pro/dashboard/messages" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Messages
                </Link>
                <Link href="/pro/dashboard/profile" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pro/dashboard/credits" className="btn btn-outline text-sm">
                💰 Buy Credits
              </Link>
              <div className="relative">
                <button className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0] || 'P'}
                  </div>
                  <span className="hidden md:block font-medium">{user?.firstName}</span>
                </button>
              </div>
              <button
                onClick={() => logout()}
                className="text-neutral-600 hover:text-neutral-900 text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Completion Banner */}
      {showProgressBanner && completionPercentage < 100 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Complete your profile to start claiming leads</h3>
                  <button
                    onClick={() => setShowProgressBanner(false)}
                    className="text-white hover:text-neutral-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-md">
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {completionPercentage}% Complete
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {incompleteTasks.slice(0, 3).map((task) => (
                    <Link
                      key={task.id}
                      href={task.link}
                      className={`text-sm px-3 py-1 rounded-full transition-colors ${
                        task.highlight
                          ? 'bg-white text-orange-600 font-medium hover:bg-neutral-100'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {task.name}
                    </Link>
                  ))}
                  {incompleteTasks.length > 3 && (
                    <span className="text-sm px-3 py-1 rounded-full bg-white/20">
                      +{incompleteTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
