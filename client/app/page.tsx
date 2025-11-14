"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SearchBar } from "@/components/home/SearchBar";
import { PopularServices } from "@/components/home/PopularServices";
import { MultiStepLeadForm } from "@/components/lead-form/MultiStepLeadForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MessageCircle, X, Briefcase, ArrowRight } from "lucide-react";
import { getMarketplace, Lead } from "@/lib/services/leads";

export default function Home() {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [showChat, setShowChat] = useState(false);
  const [latestLeads, setLatestLeads] = useState<Lead[]>([]);

  // Load latest leads for the jobs board section
  useEffect(() => {
    const loadLatestLeads = async () => {
      try {
        const data = await getMarketplace({ limit: 6 });
        setLatestLeads(data.leads);
      } catch (error) {
        console.error("Failed to load latest leads:", error);
        // Fail silently - homepage should still work without leads
      }
    };
    loadLatestLeads();
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowLeadForm(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container-custom">
          {/* Hero Section Container */}
          <div className="grid lg:grid-cols-3 gap-12 py-16">
            {/* Left Side - Service Search & Lead Form (2/3) */}
            <div className="lg:col-span-2">
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
            </div>

            {/* Right Side - Chat Panel (1/3) */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-20">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] flex flex-col">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Home GPT Assistant
                    </h3>
                    <p className="text-sm text-gray-100 mt-1">
                      Ask me anything about your home improvement project
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Content Below Hero */}
          <div className="pb-16">
            {/* How It Works */}
            <div className="bg-gray-50 rounded-2xl p-10 mb-16">
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

            {/* Latest Opportunities - Jobs Board */}
            {latestLeads.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Latest Opportunities
                    </h3>
                    <p className="text-gray-600">
                      Active projects looking for professionals
                    </p>
                  </div>
                  <Link
                    href="/lead-marketplace"
                    className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-2"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {latestLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {lead.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {lead.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          {lead.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {lead.budgetBracket}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                          {lead.urgency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{lead.location.emirate}</span>
                        <span>
                          {lead.claimsCount}/{lead.maxClaimsAllowed || 5}{" "}
                          claimed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Are you a home improvement professional?
                        </h4>
                        <p className="text-sm text-gray-600">
                          Join Homezy to access exclusive leads and grow your
                          business
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/become-a-pro"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors"
                    >
                      Become a Pro
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Banner for Mobile Chat */}
            <div className="lg:hidden bg-primary-500 text-black rounded-2xl p-8 text-center mb-16">
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
      </main>

      {/* Mobile Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="bg-white h-full flex flex-col">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Home GPT Assistant
                </h3>
                <p className="text-sm text-gray-100 mt-1">
                  Ask me anything about your home improvement project
                </p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="bg-white/20 rounded-full p-2 hover:bg-white/30"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Chat FAB */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-primary-500 text-white rounded-full p-4 shadow-lg hover:bg-primary-600 transition-colors z-40"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && selectedServiceId && (
        <MultiStepLeadForm
          serviceId={selectedServiceId}
          onClose={() => {
            setShowLeadForm(false);
            setSelectedServiceId(undefined);
          }}
          onSubmit={() => {
            setShowLeadForm(false);
            setSelectedServiceId(undefined);
          }}
        />
      )}

      <PublicFooter />
    </div>
  );
}
