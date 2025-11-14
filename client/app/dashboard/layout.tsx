'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  FileText,
  MessageSquare,
  FolderKanban,
  Users,
  Settings,
  Menu,
  X,
  MessageCircle,
  Search
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is homeowner
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Wait for user to be loaded before checking role
    if (!user) {
      return;
    }

    // Check if user is a homeowner
    if (user.role !== 'homeowner') {
      console.log('Redirecting non-homeowner user', { role: user.role });

      // Redirect based on role
      if (user.role === 'pro') {
        router.push('/pro/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, isAuthenticated, router]);

  // Check if user is new (created in last 7 days)
  const isNewUser = user?.createdAt
    ? new Date(user.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    : false;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Leads', href: '/dashboard/leads', icon: FileText },
    { name: 'Quotes', href: '/dashboard/quotes', icon: MessageSquare },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Professionals', href: '/dashboard/professionals', icon: Users },
  ];

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        {/* Top Level - Logo, Search, User */}
        <div className="border-b border-neutral-100">
          <div className="container-custom">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-0.5">
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
              </Link>

              {/* Search Bar - Placeholder for now */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search leads, quotes, or professionals..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Right Side - AI Chat, User Menu */}
              <div className="flex items-center space-x-4">
                {/* AI Chat Button */}
                <Link
                  href="/#chat"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Chat with Home GPT"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden lg:inline">AI Assistant</span>
                </Link>

                {/* User Menu */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    href="/dashboard/settings"
                    className="text-neutral-600 hover:text-neutral-900 p-2"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>

                  <div className="flex items-center space-x-2 text-neutral-700">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.firstName?.[0]?.toUpperCase() || 'H'}
                    </div>
                    <span className="hidden lg:block font-medium text-sm">{user?.firstName}</span>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-neutral-700 hover:text-neutral-900 p-2"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Level - Navigation Links */}
        <div className="hidden md:block">
          <div className="container-custom">
            <nav className="flex items-center justify-end space-x-1 h-12">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors rounded-md ${
                      active
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <span>Sign out</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Welcome Banner for New Users */}
      {showWelcomeBanner && isNewUser && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-black">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  Welcome to Homezy, {user?.firstName}! 👋
                </h3>
                <p className="text-sm text-gray-800">
                  Start your first home improvement project by creating a lead. Get matched with up to 5 verified professionals and compare quotes.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/leads"
                    className="text-sm px-4 py-2 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Create Your First Lead
                  </Link>
                  <Link
                    href="/dashboard/professionals"
                    className="text-sm px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                  >
                    Browse Professionals
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="text-black hover:text-gray-700 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-custom py-8">
        {children}
      </main>
    </div>
  );
}
