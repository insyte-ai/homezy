'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useChatPanelStore } from '@/store/chatPanelStore';
import { SERVICE_NAVIGATION, SERVICE_SUBCATEGORIES, ADDITIONAL_SERVICES } from '@/lib/serviceNavigation';

export default function AllServicesPage() {
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 md:py-20">
        <div className={`container-custom text-center transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            All Home Services in UAE
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            From repairs to renovations, find verified professionals for any home improvement
            project. Compare quotes and hire with confidence.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Main Service Categories */}
      {SERVICE_NAVIGATION.map((category) => (
        <section key={category.id} className="py-12 border-b border-gray-200">
          <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.services.map((service) => {
                const subcategories = SERVICE_SUBCATEGORIES[service.id] || [];
                return (
                  <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-primary-500 hover:shadow-md transition-all">
                    <Link href={`/services/${service.slug}`} className="group">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-2 flex items-center justify-between">
                        {service.name}
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                      </h3>
                    </Link>
                    {subcategories.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {subcategories.slice(0, 4).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/services/${sub.slug}`}
                              className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        {subcategories.length > 4 && (
                          <li>
                            <Link
                              href={`/services/${service.slug}`}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              +{subcategories.length - 4} more services →
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Services */}
      {ADDITIONAL_SERVICES.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Additional Professional Services
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ADDITIONAL_SERVICES.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {service.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-500">
        <div className={`max-w-4xl mx-auto px-4 text-center transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-gray-800 mb-8">
            Our AI assistant can help you find the perfect professional for any project
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Chat with Home GPT
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Post Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
