'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useChatPanelStore } from '@/store/chatPanelStore';
import { ServicesDropdown } from '@/components/navigation/ServicesDropdown';

export function PublicHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  // Redirect pros and admins away from public pages to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'pro') {
        router.push('/pro/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
      // Homeowners can stay on public pages
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      {/* Top Banner - Only for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-gray-50 py-2 text-center text-xs border-b border-gray-200">
          <div className={`transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[40vw]' : 'lg:pr-14'}`}>
            <p className="text-gray-600">
              Find trusted home improvement professionals in UAE.
              <Link
                href="/auth/register"
                className="ml-2 underline font-medium text-gray-900"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[40vw]' : 'lg:pr-14'}`}>
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0.5">
              <Image
                src="/house-logo.svg"
                alt="Homezy Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h1 className="font-quicksand text-[32px] font-bold text-gray-900 leading-none">
                homezy
              </h1>
            </Link>

            {/* Center - Search or other content can go here */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              {/* Future: Add search bar here if needed */}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Link
                  href="/become-a-pro"
                  className="hidden md:block text-sm text-gray-600 hover:text-gray-900"
                >
                  Become a Pro
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <span className="hidden md:block text-sm text-gray-700">
                    Welcome, {user?.firstName}!
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Join free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="hidden lg:block border-t border-gray-200 bg-white">
          <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[40vw]' : 'lg:pr-14'}`}>
            <div className="flex items-center justify-between h-12">
              {/* Left side navigation */}
              <div className="flex items-center space-x-8">
                <ServicesDropdown />
                <Link
                  href="/pros"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Browse Professionals
                </Link>
                <Link
                  href="/lead-marketplace"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Browse Jobs
                </Link>
              </div>

              {/* Right side navigation */}
              <Link
                href="/resources"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Resource Center
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
