'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      value: 'support@homezy.co',
      description: 'Send us an email anytime',
      href: 'mailto:support@homezy.co',
      actionText: 'Send Email',
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      value: '+971 50 773 0455',
      description: 'Available during business hours',
      href: 'tel:+971507730455',
      actionText: 'Call Now',
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      value: 'D-66, DSO HQ, Dubai Silicon Oasis',
      description: 'Dubai, United Arab Emirates',
      href: 'https://maps.google.com/?q=Dubai+Silicon+Oasis',
      actionText: 'Get Directions',
    },
  ];

  const supportOptions = [
    {
      icon: UserGroupIcon,
      title: 'For Homeowners',
      description: 'Questions about finding pros, submitting requests, or your account?',
      link: '/help',
      linkText: 'Visit Help Center',
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'For Professionals',
      description: 'Need help with leads, quotes, or growing your business?',
      link: '/become-a-pro',
      linkText: 'Learn About Pro Features',
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'General Inquiries',
      description: 'Have questions about Homezy or how our platform works?',
      link: '/about',
      linkText: 'Learn More About Us',
    },
  ];

  const faqs = [
    {
      question: 'What are your business hours?',
      answer: 'Our support team is available Sunday to Thursday, 9:00 AM - 6:00 PM GST. We typically respond to emails within 24 hours during business days.',
    },
    {
      question: 'How do I find a professional for my project?',
      answer: 'Simply describe your project on our homepage, and we\'ll match you with up to 5 verified professionals who will send you quotes.',
    },
    {
      question: 'How can I become a verified professional?',
      answer: 'Click "Become a Pro" and complete the registration process. You\'ll need to submit your trade license and Emirates ID for verification.',
    },
    {
      question: 'Is Homezy free for homeowners?',
      answer: 'Yes, Homezy is completely free for homeowners. You can submit unlimited service requests and receive quotes at no cost.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-normal text-gray-900 mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We&apos;re here to help. Whether you&apos;re a homeowner, professional, or just
                have questions about Homezy, our team is ready to assist you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow group"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-lg mb-6 group-hover:bg-primary-600 transition-colors">
                      <method.icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-900 font-medium mb-2">{method.value}</p>
                    <p className="text-sm text-gray-600 mb-4">{method.description}</p>
                    <span className="text-sm text-primary-600 font-medium group-hover:text-primary-700">
                      {method.actionText} →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Business Hours</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>Sunday - Thursday</span>
                        <span className="font-medium text-gray-900">9:00 AM - 6:00 PM GST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Friday - Saturday</span>
                        <span className="font-medium text-gray-900">Closed</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Email support is available 24/7. We&apos;ll respond within 24 hours during business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-normal text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-lg text-gray-600">
                  Fill out the form below and we&apos;ll get back to you shortly
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="pro">Professional Registration</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-normal text-gray-900 mb-4">How Can We Help?</h2>
                <p className="text-lg text-gray-600">Choose the option that best describes your inquiry</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {supportOptions.map((option, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                      <option.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                    <Link href={option.link} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                      {option.linkText} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-normal text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-600">Quick answers to common questions</p>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Office Location */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-normal text-gray-900 mb-4">Our Office</h2>
                <p className="text-lg text-gray-600">Visit us at our headquarters in Dubai Silicon Oasis</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-start gap-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Avik Smart Home Services FZ-LLC
                    </h3>
                    <p className="text-gray-600 mb-4">
                      D-66, DSO HQ, Dubai Silicon Oasis<br />
                      Dubai, United Arab Emirates
                    </p>
                    <a
                      href="https://maps.google.com/?q=Dubai+Silicon+Oasis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
