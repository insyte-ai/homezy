'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  LogOut,
  Home,
  Briefcase,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const UserProfileDropdown: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getRoleBadgeColor = () => {
    if (user?.role === 'pro') {
      return 'bg-primary-50 text-neutral-900 border border-primary-200';
    } else if (user?.role === 'homeowner') {
      return 'bg-blue-50 text-blue-800 border border-blue-200';
    } else if (user?.role === 'admin') {
      return 'bg-purple-50 text-purple-800 border border-purple-200';
    }
    return 'bg-gray-50 text-gray-800 border border-gray-200';
  };

  const getRoleDisplayName = () => {
    if (user?.role === 'pro') return 'Professional';
    if (user?.role === 'homeowner') return 'Homeowner';
    if (user?.role === 'admin') return 'Admin';
    return user?.role || 'User';
  };

  const getDashboardLink = () => {
    if (user?.role === 'pro') return '/pro/dashboard';
    if (user?.role === 'homeowner') return '/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getSettingsLink = () => {
    if (user?.role === 'pro') return '/pro/dashboard/settings';
    if (user?.role === 'homeowner') return '/dashboard/settings';
    if (user?.role === 'admin') return '/admin/settings';
    return '/settings';
  };

  if (!user) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {getUserInitials()}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {getUserDisplayName()}
        </span>
        <ChevronDown
          className={`hidden md:block h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 overflow-hidden">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor()}`}>
                {getRoleDisplayName()}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <Link
              href={getDashboardLink()}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-4 w-4 mr-3 text-gray-500" />
              Dashboard
            </Link>

            {user.role === 'pro' && (
              <>
                <Link
                  href="/pro/dashboard/profile"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  My Profile
                </Link>
                <Link
                  href="/pro/dashboard/portfolio"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                  Portfolio
                </Link>
              </>
            )}
          </div>

          {/* Settings & Logout */}
          <div className="border-t border-gray-100 pt-2">
            <Link
              href={getSettingsLink()}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4 mr-3 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
