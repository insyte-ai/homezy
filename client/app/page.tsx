"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchBar } from "@/components/home/SearchBar";
import { PopularServices } from "@/components/home/PopularServices";
import { MultiStepLeadForm } from "@/components/lead-form/MultiStepLeadForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Briefcase, ArrowRight } from "lucide-react";
import { getMarketplace, Lead } from "@/lib/services/leads";
import { useAuthStore } from "@/store/authStore";
import { useChatPanelStore } from "@/store/chatPanelStore";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [latestLeads, setLatestLeads] = useState<Lead[]>([]);

  // Redirect authenticated users to their dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'homeowner') {
        router.push('/dashboard');
      } else if (user.role === 'pro') {
        router.push('/pro/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

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
          <div className="py-16">
            {/* Main Content - Full Width */}
            <div className={`transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Find trusted home service
                  <br />
                  <span className="text-primary-600">professionals in UAE</span>
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
          </div>

          {/* Full Width Content Below Hero */}
          <div className={`pb-16 transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
            {/* How It Works */}
            <div className="bg-gray-50 rounded-2xl p-10 mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How Homezy Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
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
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
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
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
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
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
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
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                          {lead.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {lead.budgetBracket}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded capitalize">
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
                <div className="mt-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 rounded-full p-3">
                        <Briefcase className="h-6 w-6 text-primary-600" />
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
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors"
                    >
                      Become a Pro
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

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
