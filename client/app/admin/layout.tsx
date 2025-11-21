'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AdminDashboardSidebar } from '@/components/dashboard/AdminDashboardSidebar';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isInitialized, initialize } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Wait for auth to initialize before making routing decisions
    if (!isInitialized) {
      return;
    }

    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push('/auth/login?redirect=/admin/dashboard');
      } else if (user?.role !== 'admin') {
        // Authenticated but not admin, redirect to appropriate dashboard
        if (user?.role === 'pro') {
          router.push('/pro/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Authenticated and is admin
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, user, isLoading, router, isInitialized]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <AdminDashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Admin Portal</h2>
          <UserProfileDropdown />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
