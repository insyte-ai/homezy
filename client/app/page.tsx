"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SearchBar } from "@/components/home/SearchBar";
import { PopularServices } from "@/components/home/PopularServices";
import { LeadForm } from "@/components/home/LeadForm";
import { MessageCircle, X } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [showChat, setShowChat] = useState(false);

  // Redirect pros and admins away from homepage to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "pro") {
        router.push("/pro/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
      // Homeowners can stay on homepage
    }
  }, [isAuthenticated, user, router]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowLeadForm(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/house-logo.svg"
                alt="Homezy Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h1
                className="font-quicksand text-[32px] font-bold text-gray-900 leading-none"
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Home<span className="text-primary-500">zy</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <Link
                  href="/become-a-pro"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm hidden md:block"
                >
                  Become a Pro
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 text-sm hidden md:block">
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
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex-1 flex">
        {/* Left Side - Service Search & Lead Form (2/3) */}
        <div className="flex-1 lg:w-2/3 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Find trusted home service
                <br />
                <span className="text-primary-500">professionals in UAE</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get matched with verified professionals. Compare quotes.
                Complete your project with confidence.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-12">
              <SearchBar onSelectService={handleServiceSelect} />
            </div>

            {/* Popular Services */}
            <div className="mb-12">
              <PopularServices onSelectService={handleServiceSelect} />
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How Homezy Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Describe Your Project
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tell us what you need done. Use AI chat or fill out a simple
                    form.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Compare Quotes
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get quotes from up to 5 verified professionals. Review their
                    profiles and ratings.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Hire with Confidence
                  </h4>
                  <p className="text-sm text-gray-600">
                    Choose the best pro for your project. Get it done right, on
                    time, on budget.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-primary-500 text-black rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">
                Need help planning your project?
              </h3>
              <p className="text-gray-800 mb-6">
                Chat with our AI assistant to get cost estimates, timelines, and
                expert advice.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                Start Chatting with Home GPT
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Panel (1/3) - Hidden on mobile, shown as overlay when triggered */}
        <div
          className={`
            fixed lg:relative inset-0 lg:inset-auto
            lg:w-1/3 lg:border-l border-gray-200 bg-white
            transition-transform duration-300 z-50
            ${showChat ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setShowChat(false)}
            className="lg:hidden absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>

          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-black p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Home GPT Assistant
              </h3>
              <p className="text-sm text-gray-800 mt-1">
                Ask me anything about your home improvement project
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Chat FAB */}
      <button
        onClick={() => setShowChat(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-primary-500 text-black rounded-full p-4 shadow-lg hover:bg-primary-600 transition-colors z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <LeadForm
          selectedServiceId={selectedServiceId}
          onClose={() => {
            setShowLeadForm(false);
            setSelectedServiceId(undefined);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/house-logo.svg"
              alt="Homezy"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span
              className="font-quicksand text-[26px] font-bold text-gray-900 leading-none"
              style={{ height: "32px", display: "flex", alignItems: "center" }}
            >
              Home<span className="text-primary-500">zy</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Powered by Claude Sonnet 4.5 | Built for UAE homeowners
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
            <Link href="/become-a-pro" className="hover:text-primary-500">
              Become a Pro
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-primary-500">
              About
            </Link>
            <span>|</span>
            <Link href="/help" className="hover:text-primary-500">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
