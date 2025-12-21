'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'homeowners',
    title: 'For Homeowners',
    icon: HomeIcon,
    items: [
      {
        question: 'How do I submit a service request?',
        answer: 'Simply use the search bar on our homepage or tap on any service category. Describe your project using our AI-powered form or traditional questionnaire. Our system will match you with up to 5 verified professionals who will send you quotes.',
      },
      {
        question: 'Is it free to use Homezy as a homeowner?',
        answer: 'Yes, Homezy is completely free for homeowners. You can submit unlimited service requests, receive quotes from professionals, and communicate with them at no cost.',
      },
      {
        question: 'How do I compare quotes from professionals?',
        answer: 'When professionals respond to your request, you\'ll see their quotes in your dashboard. Each quote includes the price, timeline, and details about what\'s included. You can also view their profiles, ratings, reviews, and past work to make an informed decision.',
      },
      {
        question: 'Are the professionals verified?',
        answer: 'Yes, we verify all professionals on our platform. They must submit their trade license, Emirates ID, and other relevant documentation. Look for the "Verified" badge on their profile for extra assurance.',
      },
      {
        question: 'What if I\'m not satisfied with the work?',
        answer: 'First, communicate with the professional directly to resolve any issues. If you cannot reach a resolution, contact our support team. While we don\'t guarantee work quality, we can help mediate and may remove professionals who consistently receive complaints.',
      },
    ],
  },
  {
    id: 'professionals',
    title: 'For Professionals',
    icon: WrenchScrewdriverIcon,
    items: [
      {
        question: 'How do I become a verified professional on Homezy?',
        answer: 'Click "Become a Pro" and complete the registration process. You\'ll need to provide your business details, trade license, Emirates ID, and other relevant documents. Our team will review your application and verify your credentials.',
      },
      {
        question: 'How does the credit system work?',
        answer: 'Credits are used to unlock and claim leads. When you see a relevant lead, you spend credits to access the homeowner\'s contact details. Credit costs vary based on the estimated project value. You can purchase credits in packages at discounted rates.',
      },
      {
        question: 'How do I get more leads?',
        answer: 'Complete your profile with photos, descriptions, and certifications. Respond quickly to leads, provide competitive quotes, and maintain high ratings. Verified professionals with complete profiles appear higher in search results.',
      },
      {
        question: 'What happens if a lead is invalid?',
        answer: 'If you receive a lead with incorrect contact information or a duplicate lead, you can request a credit refund within 48 hours. Our team will review and process valid refund requests.',
      },
      {
        question: 'Can I get refunds for credits?',
        answer: 'Credits are generally non-refundable. However, we may issue refunds for invalid leads (wrong contact info, duplicates) or technical errors. Contact support within 48 hours of claiming the lead.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Credits',
    icon: CurrencyDollarIcon,
    items: [
      {
        question: 'How do I pay for services?',
        answer: 'Payments for actual services are made directly between you and the professional. Homezy does not process payments for home improvement work. Agree on payment terms with your chosen professional before work begins.',
      },
      {
        question: 'How do I purchase credits as a professional?',
        answer: 'Go to your dashboard and click on "Credits." Choose a package and complete the purchase using a credit/debit card. Credits are added to your account immediately.',
      },
      {
        question: 'What payment methods are accepted for credits?',
        answer: 'We accept major credit and debit cards (Visa, Mastercard, American Express). Payment processing is handled securely through our payment partners.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    icon: ShieldCheckIcon,
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a link to reset your password. If you don\'t receive the email, check your spam folder or contact support.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Privacy & Security > Delete Account. For professionals, please ensure you have no pending leads or refund requests. Account deletion is permanent and cannot be undone.',
      },
      {
        question: 'How is my data protected?',
        answer: 'We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about how we collect, use, and protect your information.',
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary-600 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-5 pr-8">
          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-normal text-gray-900 mb-6">
                How can we help you?
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find answers to common questions or contact our support team.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 border-b border-gray-200">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {faqCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      selectedCategory === category.id ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${selectedCategory === category.id ? 'text-primary-600' : 'text-gray-600'}`} />
                    </div>
                    <span className={`font-medium text-sm ${
                      selectedCategory === category.id ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {category.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              {(searchQuery ? filteredCategories :
                selectedCategory
                  ? faqCategories.filter(c => c.id === selectedCategory)
                  : faqCategories
              ).map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="mb-12 last:mb-0">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <h2 className="text-2xl font-medium text-gray-900">{category.title}</h2>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      {category.items.map((item, index) => (
                        <FAQAccordion key={index} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {searchQuery && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try a different search term or{' '}
                    <Link href="/contact" className="text-primary-600 hover:underline">
                      contact our support team
                    </Link>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">Still need help?</h2>
              <p className="text-gray-600 mb-8">
                Our support team is ready to assist you with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@homezy.co"
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Email Support
                </a>
                <a
                  href="https://wa.me/971507730455"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+971507730455"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
