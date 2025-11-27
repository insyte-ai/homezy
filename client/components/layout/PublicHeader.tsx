'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useChatPanelStore } from '@/store/chatPanelStore';
import { ServicesDropdown } from '@/components/navigation/ServicesDropdown';
import {
  ChevronDown,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';

export function PublicHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return '';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

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
                <div className="relative" ref={dropdownRef}>
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                      {getInitials()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Homeowner
                        </span>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/requests"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          My Requests
                        </Link>
                        <Link
                          href="/dashboard/messages"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          Messages
                        </Link>
                      </div>

                      {/* Settings & Sign Out */}
                      <div className="border-t border-gray-100 py-1">
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="h-4 w-4 text-gray-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Right side - placeholder for future features */}
              <div className="text-sm text-gray-400">
                {/* Resource Center link removed - page doesn't exist yet */}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
