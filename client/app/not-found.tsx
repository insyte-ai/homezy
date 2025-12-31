'use client';

import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center">
        <div className="container-custom py-16">
          <div className="max-w-lg mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <span className="text-8xl font-bold text-gray-200">404</span>
            </div>

            {/* Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page not found
            </h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
              moved or doesn&apos;t exist.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Home className="h-5 w-5" />
                Go Home
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Search className="h-5 w-5" />
                Browse Services
              </Link>
            </div>

            {/* Back Link */}
            <button
              onClick={() => window.history.back()}
              className="mt-8 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back to previous page
            </button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
