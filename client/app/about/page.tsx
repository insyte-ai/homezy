import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'About Us - Homezy',
  description: 'Learn about Homezy, the AI-powered home improvement marketplace connecting UAE homeowners with verified professionals.',
};

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Verification',
      description: 'Every professional on our platform is verified with valid trade licenses and credentials, ensuring safe and legitimate services.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We use AI to match homeowners with the right professionals, making home improvement simple and efficient.'
    },
    {
      icon: HeartIcon,
      title: 'Customer Success',
      description: 'Your satisfaction is our priority. We provide tools and support to ensure every project is completed successfully.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Regional Focus',
      description: 'Built specifically for the UAE market, understanding local regulations, practices, and needs.'
    }
  ];

  const stats = [
    { value: '2024', label: 'Founded' },
    { value: '50+', label: 'Service Categories' },
    { value: '100%', label: 'Verified Pros' },
    { value: '7', label: 'Emirates Covered' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-normal text-gray-900 mb-6">
                About Homezy
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We&apos;re building the go-to platform for home services in the UAE,
                making it simple to find, compare, and hire trusted professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-gray-200 py-12">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-medium text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-normal text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Homezy was founded in 2024 to solve a common frustration: finding reliable
                    home service professionals in the UAE. Whether it&apos;s a plumber, electrician,
                    AC technician, or interior designer, homeowners struggled to find verified,
                    trustworthy professionals.
                  </p>
                  <p>
                    We built Homezy as an AI-powered marketplace where homeowners can describe
                    their projects and get matched with verified professionals who provide
                    competitive quotes. No more endless phone calls or uncertain referrals.
                  </p>
                  <p>
                    Today, we connect thousands of homeowners with verified professionals across
                    all seven emirates, covering everything from emergency repairs to complete
                    home renovations.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <HomeIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Home Services Marketplace</h3>
                        <p className="text-sm text-gray-600">
                          Connecting homeowners with verified professionals
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">50+ Service Categories</h3>
                        <p className="text-sm text-gray-600">
                          From plumbing and electrical to renovations and design
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <SparklesIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">AI-Powered Matching</h3>
                        <p className="text-sm text-gray-600">
                          Smart technology to find the right pro for your project
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">What We Stand For</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we build and every decision we make
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <value.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-normal text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-600">We&apos;d love to hear from you. Reach out through any of these channels.</p>
              </div>

              {/* Contact Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <a
                  href="mailto:support@homezy.co"
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 group-hover:bg-primary-600 transition-colors">
                    <EnvelopeIcon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Email Us</h3>
                  <p className="text-gray-900 font-medium group-hover:text-primary-600 transition-colors">
                    support@homezy.co
                  </p>
                </a>

                <a
                  href="tel:+971507730455"
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 group-hover:bg-primary-600 transition-colors">
                    <PhoneIcon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Call Us</h3>
                  <p className="text-gray-900 font-medium group-hover:text-primary-600 transition-colors">
                    +971 50 773 0455
                  </p>
                </a>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <MapPinIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Visit Us</h3>
                  <p className="text-gray-900 font-medium">
                    D-66, DSO HQ<br />
                    Dubai Silicon Oasis<br />
                    Dubai, UAE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-normal mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Whether you need help with a home project or you&apos;re a professional looking
              to grow your business, Homezy is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center">
                Find a Professional
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/become-a-pro" className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center transition-colors">
                Become a Pro
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
