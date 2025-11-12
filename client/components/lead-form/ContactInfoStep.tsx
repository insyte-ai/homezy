/**
 * Contact Info Step
 * Final step for email-only guest signup
 */

'use client';

import { useState } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { useAuthStore } from '@/store/authStore';
import { createLead } from '@/lib/services/leads';
import { Mail, User, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ContactInfoStepProps {
  onSubmit?: () => void;
}

export function ContactInfoStep({ onSubmit }: ContactInfoStepProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    email,
    name,
    phone,
    errors,
    setContactField,
    setSubmitting,
    validateCurrentStep,
    getServiceAnswers,
    // Common fields
    title,
    description,
    emirate,
    neighborhood,
    budgetBracket,
    urgency,
    timeline,
    photos,
    selectedServiceId,
    reset,
  } = useLeadFormStore();

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);

    try {
      // If user is NOT authenticated, create guest account first
      if (!isAuthenticated) {
        const { api } = await import('@/lib/api');

        const guestSignupResponse = await api.post('/auth/guest-signup', {
          email,
          firstName: name || undefined,
          phone: phone || undefined,
        });

        const { data } = guestSignupResponse.data;

        // Store access token in localStorage and update auth store
        // This will authenticate the user for the lead creation
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.accessToken);
        }

        // Update auth store state directly
        useAuthStore.setState({
          user: data.user,
          isAuthenticated: true,
        });
      }

      // Now create the lead (user is authenticated)
      await createLead({
        title,
        description,
        category: selectedServiceId!,
        location: {
          emirate,
          neighborhood: neighborhood || undefined,
        },
        budgetBracket,
        urgency,
        timeline: timeline || undefined,
        photos,
        serviceAnswers: getServiceAnswers() || undefined,
      });

      setIsSuccess(true);
      toast.success('Lead created successfully!');

      // Reset form after success
      setTimeout(() => {
        reset();
        onSubmit?.();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Failed to create lead. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lead Created Successfully!
        </h2>
        <p className="text-gray-600 mb-8">
          Up to 5 verified professionals will claim your lead and submit quotes.
          You'll be notified via email.
        </p>
        <div className="bg-primary-50 border border-primary-300 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-800">
            <strong className="text-gray-900">What's next?</strong>
            <br />
            We'll send you an email with a link to view and manage your lead. You can
            compare quotes, chat with professionals, and hire the best fit for your
            project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Almost done! How can we reach you?
        </h2>
        <p className="text-sm text-gray-600">
          We'll send quotes from professionals to your email
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="inline h-4 w-4 mr-1" />
          Email Address *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setContactField('email', e.target.value)}
          placeholder="you@example.com"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Name (Optional for now) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="inline h-4 w-4 mr-1" />
          Your Name (Optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setContactField('name', e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Phone (Optional for now) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setContactField('phone', e.target.value)}
          placeholder="+971 50 123 4567"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Privacy notice */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
        <p className="text-xs text-gray-600">
          By submitting this form, you agree to receive quotes from verified
          professionals. We'll create a free account for you so you can manage your
          lead and communicate with professionals. You can set a password later.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={useLeadFormStore.getState().isSubmitting}
        className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {useLeadFormStore.getState().isSubmitting
          ? 'Creating your lead...'
          : 'Get Free Quotes'}
      </button>
    </div>
  );
}
