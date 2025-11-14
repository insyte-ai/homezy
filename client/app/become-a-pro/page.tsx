import Link from 'next/link';
import { Metadata } from 'next';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata: Metadata = {
  title: 'Become a Professional | Homezy',
  description: 'Join Homezy as a verified professional and grow your home improvement business in the UAE. Get quality leads, build your reputation, and connect with homeowners.',
};

export default function BecomeAProPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PublicHeader />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-600 text-black py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Grow Your Business with Homezy
            </h1>
            <p className="text-xl sm:text-2xl text-gray-800 mb-8">
              Connect with thousands of UAE homeowners looking for trusted professionals like you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/pro/register"
                className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-md"
              >
                Get Started Free
              </Link>
              <a
                href="#how-it-works"
                className="btn btn-outline border-black text-black hover:bg-black/10 px-8 py-4 text-lg font-semibold"
              >
                Learn More
              </a>
            </div>
            <p className="mt-6 text-gray-800">
              No subscription fees. Pay only for leads you claim.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Why Join Homezy?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Built for UAE professionals who want quality leads and fair competition
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Quality Leads */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Quality Leads
              </h3>
              <p className="text-neutral-600">
                Access verified homeowner requests that match your expertise and service area. No spam, no tire-kickers.
              </p>
            </div>

            {/* Fair Competition */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Fair Credit System
              </h3>
              <p className="text-neutral-600">
                No bidding wars. Up to 5 professionals per lead. Credit-based claiming ensures fair competition.
              </p>
            </div>

            {/* Build Reputation */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Build Your Reputation
              </h3>
              <p className="text-neutral-600">
                Showcase your portfolio, collect reviews, and earn verification badges to stand out.
              </p>
            </div>

            {/* No Subscriptions */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Flexible Payments
              </h3>
              <p className="text-neutral-600">
                No monthly subscriptions. Purchase credits as needed and only pay for leads you claim.
              </p>
            </div>

            {/* Better Visibility */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Enhanced Verification
              </h3>
              <p className="text-neutral-600">
                Get verified for better visibility and 15% lower credit costs. Stand out from the competition.
              </p>
            </div>

            {/* UAE Market */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                UAE-Focused Platform
              </h3>
              <p className="text-neutral-600">
                Built specifically for the UAE market with local regulations, pricing, and standards in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Simple 4-step process to start getting quality leads
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Sign Up Free</h3>
                <p className="text-neutral-600 text-sm">
                  Create your account and set up your professional profile
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">Get Verified</h3>
                <p className="text-neutral-600 text-sm">
                  Upload your license and insurance for basic verification
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Browse Leads</h3>
                <p className="text-neutral-600 text-sm">
                  Find projects matching your expertise and service area
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-bold text-lg mb-2">Win Projects</h3>
                <p className="text-neutral-600 text-sm">
                  Claim leads, submit quotes, and grow your business
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Transparent Credit Pricing
            </h2>
            <p className="text-lg text-neutral-600">
              Pay only for the leads you want. No hidden fees or subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {/* Starter Package */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="text-sm font-semibold text-neutral-600 mb-2">STARTER</div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-neutral-900">AED 250</div>
                <div className="text-neutral-600">50 credits</div>
              </div>
              <div className="text-sm text-neutral-500">AED 5.00 per credit</div>
            </div>

            {/* Professional Package */}
            <div className="bg-white rounded-xl p-6 border-2 border-primary-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="text-sm font-semibold text-primary-600 mb-2">PROFESSIONAL</div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-neutral-900">AED 600</div>
                <div className="text-neutral-600">160 credits</div>
              </div>
              <div className="text-sm text-green-600 font-medium">AED 3.75 per credit + 10 bonus</div>
            </div>

            {/* Business Package */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="text-sm font-semibold text-neutral-600 mb-2">BUSINESS</div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-neutral-900">AED 1,400</div>
                <div className="text-neutral-600">440 credits</div>
              </div>
              <div className="text-sm text-green-600 font-medium">AED 3.18 per credit + 40 bonus</div>
            </div>

            {/* Enterprise Package */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="text-sm font-semibold text-neutral-600 mb-2">ENTERPRISE</div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-neutral-900">AED 3,000</div>
                <div className="text-neutral-600">1,150 credits</div>
              </div>
              <div className="text-sm text-green-600 font-medium">AED 2.61 per credit + 150 bonus</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <h4 className="font-bold text-neutral-900 mb-3">Credit costs per lead by project value:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><span className="font-medium">AED 500-1K:</span> 5 credits</div>
              <div><span className="font-medium">AED 1K-5K:</span> 10 credits</div>
              <div><span className="font-medium">AED 5K-15K:</span> 20 credits</div>
              <div><span className="font-medium">AED 15K-50K:</span> 40 credits</div>
              <div><span className="font-medium">AED 50K-150K:</span> 75 credits</div>
              <div><span className="font-medium">AED 150K+:</span> 125 credits</div>
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              <strong>Comprehensive verified pros get 15% discount</strong> on all lead claims
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-primary-600 text-black">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join hundreds of verified professionals already winning projects on Homezy
          </p>
          <Link
            href="/auth/pro/register"
            className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold inline-block shadow-md"
          >
            Get Started Free
          </Link>
          <p className="mt-4 text-gray-800">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline font-medium hover:text-gray-900">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
