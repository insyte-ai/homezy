'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AdminDashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Professionals', href: '/admin/professionals', icon: BriefcaseIcon },
    { name: 'Homeowners', href: '/admin/homeowners', icon: UserGroupIcon },
    { name: 'Leads', href: '/admin/leads', icon: DocumentTextIcon },
    { name: 'Credits', href: '/admin/credits', icon: CreditCardIcon },
    { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Audit Logs', href: '/admin/audit', icon: ClipboardDocumentListIcon },
    { name: 'AI', href: '/admin/ai', icon: SparklesIcon },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/house-logo.svg"
              alt="Homezy Logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <h1 className="font-quicksand text-[28px] font-bold text-gray-900 leading-none">
              homezy
            </h1>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
              ADMIN
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-700' : 'text-gray-500'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 p-3 space-y-1 flex-shrink-0">
        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/admin/notifications'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          title={isCollapsed ? 'Notifications' : undefined}
        >
          <div className="relative">
            <BellIcon className="h-5 w-5 text-gray-500" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <span className="flex-1 text-sm font-medium">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </>
          )}
        </Link>

        {/* Settings */}
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/admin/settings'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
