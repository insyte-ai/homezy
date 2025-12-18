"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { Search, Menu, X } from "lucide-react";
import UserProfileDropdown from "@/components/common/UserProfileDropdown";
import { NotificationBell } from "@/components/common/NotificationBell";
import {
  getUnreadCount,
  connectMessagingSocket,
  disconnectMessagingSocket,
} from "@/lib/services/messages";
import { getMyProfile } from "@/lib/services/professional";

export default function ProDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isInitialized, initialize } = useAuthStore();
  const [showProgressBanner, setShowProgressBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState<{
    percentage: number;
    missingSections: string[];
  }>({ percentage: 0, missingSections: [] });

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const navItems = [
    { name: "Dashboard", href: "/pro/dashboard" },
    { name: "Marketplace", href: "/pro/dashboard/leads/marketplace" },
    { name: "My Leads", href: "/pro/dashboard/leads" },
    { name: "Quotes", href: "/pro/dashboard/quotes" },
    { name: "Credits", href: "/pro/dashboard/credits" },
    { name: "Messages", href: "/pro/dashboard/messages", badge: unreadCount > 0 ? unreadCount : undefined },
    { name: "Profile", href: "/pro/dashboard/profile" },
  ];

  const isActivePath = (href: string) => {
    if (href === "/pro/dashboard") {
      return pathname === href;
    }
    // For /pro/dashboard/leads, only match if NOT on marketplace
    if (href === "/pro/dashboard/leads") {
      return (
        pathname === href ||
        (pathname?.startsWith(href) && !pathname?.includes("/marketplace"))
      );
    }
    return pathname?.startsWith(href);
  };

  // Load unread message count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    };

    if (isAuthenticated && user) {
      loadUnreadCount();
    }
  }, [isAuthenticated, user]);

  // Load profile completeness
  useEffect(() => {
    const loadProfileCompleteness = async () => {
      try {
        const data = await getMyProfile();
        if (data.completeness) {
          setProfileCompleteness(data.completeness);
        }
      } catch (error) {
        console.error("Failed to load profile completeness:", error);
      }
    };

    if (isAuthenticated && user) {
      loadProfileCompleteness();
    }
  }, [isAuthenticated, user]);

  // Setup Socket.io to listen for new message notifications
  useEffect(() => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!accessToken || !isAuthenticated) return;

    const socket = connectMessagingSocket(accessToken);

    // Listen for new message notifications to update badge
    const handleUnreadUpdate = () => {
      getUnreadCount().then((response) => {
        setUnreadCount(response.data.unreadCount);
      });
    };

    socket.on("message:notification", handleUnreadUpdate);
    socket.on("unread:updated", handleUnreadUpdate);

    return () => {
      socket.off("message:notification", handleUnreadUpdate);
      socket.off("unread:updated", handleUnreadUpdate);
      disconnectMessagingSocket();
    };
  }, [isAuthenticated]);

  // Check if user is pro and if onboarding is complete
  useEffect(() => {
    // Wait for auth to initialize before making routing decisions
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Wait for user to be loaded before checking role
    if (!user) {
      return;
    }

    // Check if user is a pro
    if (user.role !== "pro") {
      console.log("Redirecting non-pro user to homepage", { role: user.role });
      router.push("/");
      return;
    }

    // Check if onboarding is complete - redirect to onboarding if not
    // Skip this check if we're already on the onboarding page
    if (!pathname?.includes('/onboarding') && !user.proOnboardingCompleted) {
      console.log("Redirecting to onboarding - profile incomplete");
      router.push("/pro/onboarding");
    }
  }, [user, isAuthenticated, router, pathname, isInitialized]);

  // Map missing sections to user-friendly task names and links
  const sectionToTask: Record<string, { name: string; link: string }> = {
    basicInfo: { name: "Add bio and tagline", link: "/pro/dashboard/profile" },
    services: { name: "Set up service categories", link: "/pro/dashboard/profile" },
    pricing: { name: "Set pricing information", link: "/pro/dashboard/profile" },
    portfolio: { name: "Upload portfolio photos", link: "/pro/dashboard/profile" },
    verification: { name: "Complete verification", link: "/pro/dashboard/profile" },
    availability: { name: "Set availability schedule", link: "/pro/dashboard/profile" },
    additional: { name: "Add business details", link: "/pro/dashboard/profile" },
  };

  const incompleteTasks = profileCompleteness.missingSections.map((section, index) => ({
    id: index + 1,
    name: sectionToTask[section]?.name || section,
    link: sectionToTask[section]?.link || "/pro/dashboard/profile",
    highlight: index === 0,
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        {/* Top Level - Logo, Search, Credits, User */}
        <div className="border-b border-neutral-100">
          <div className="container-custom">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/pro/dashboard" className="flex items-center gap-0.5">
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
                <span className="text-sm font-normal text-neutral-500">
                  Pro
                </span>
              </Link>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search leads, projects, or clients..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Right Side - Notifications & User */}
              <div className="flex items-center space-x-4">
                <NotificationBell notificationsPath="/pro/dashboard/notifications" />
                <div className="hidden md:block">
                  <UserProfileDropdown />
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-neutral-700 hover:text-neutral-900 p-2"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
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
                const active = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 font-medium text-sm transition-colors rounded-md flex items-center gap-2 ${
                      active
                        ? "text-neutral-900 bg-primary-50 border-b-2 border-primary-600"
                        : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {item.name}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
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
                const active = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                      active
                        ? "bg-primary-50 text-neutral-900 border-l-4 border-primary-600"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Profile Completion Banner - Only show on main dashboard page */}
      {showProgressBanner && profileCompleteness.percentage < 100 && pathname === '/pro/dashboard' && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">
                    Complete your profile to start claiming leads
                  </h3>
                  <button
                    onClick={() => setShowProgressBanner(false)}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-md">
                    <div className="w-full bg-primary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${profileCompleteness.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 whitespace-nowrap">
                    {profileCompleteness.percentage}% Complete
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {incompleteTasks.slice(0, 3).map((task) => (
                    <Link
                      key={task.id}
                      href={task.link}
                      className={`text-sm px-3 py-1 rounded-full transition-colors ${
                        task.highlight
                          ? "bg-primary-600 text-white font-medium hover:bg-primary-700"
                          : "bg-primary-100 text-neutral-900 hover:bg-primary-200"
                      }`}
                    >
                      {task.name}
                    </Link>
                  ))}
                  {incompleteTasks.length > 3 && (
                    <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-neutral-900">
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
      <main>{children}</main>
    </div>
  );
}
