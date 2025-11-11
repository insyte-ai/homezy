'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ChatInterface } from '@/components/chat/ChatInterface';

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
      // Homeowners can stay on homepage and use Home GPT
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Home</span>zy
              </h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                GPT
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Link href="/become-a-pro" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                  Become a Pro
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 text-sm">
                    Welcome, {user?.firstName}!
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>

      {/* Footer (optional - can be removed if you want full-screen chat) */}
      <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-xs text-gray-500 flex-shrink-0">
        <p>Powered by Claude Sonnet 4.5 | Built for UAE homeowners</p>
      </footer>
    </div>
  );
}
