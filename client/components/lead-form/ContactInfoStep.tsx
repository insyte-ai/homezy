/**
 * Contact Info Step
 * Final step for email-only guest signup
 */

'use client';

import { useState, useEffect } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { useAuthStore } from '@/store/authStore';
import { createLead, createDirectLead } from '@/lib/services/leads';
import { Mail, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LeadSuccessWithPros } from './LeadSuccessWithPros';

interface ContactInfoStepProps {
  onSubmit?: () => void;
}

export function ContactInfoStep({ onSubmit }: ContactInfoStepProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
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
    targetProfessionalId,
    reset,
  } = useLeadFormStore();

  const [createdLead, setCreatedLead] = useState<{
    leadId: string;
    serviceCategory: string;
    emirate: string;
    wasGuest: boolean;
  } | null>(null);

  // Pre-fill contact info for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      // Pre-fill email
      if (user.email && !email) {
        setContactField('email', user.email);
      }

      // Pre-fill name from firstName + lastName
      if (user.firstName && !name) {
        const fullName = user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName;
        setContactField('name', fullName);
      }

      // Pre-fill phone if available
      if (user.phone && !phone) {
        setContactField('phone', user.phone);
      }
    }
  }, [isAuthenticated, user, email, name, phone, setContactField]);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);

    try {
      // Check if this is a direct lead or indirect lead
      const isDirectLead = !!targetProfessionalId;

      if (isAuthenticated) {
        // AUTHENTICATED USER: Use existing lead creation flow
        const leadInput = {
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
        };

        console.log('[ContactInfoStep] Authenticated user creating lead:', { isDirectLead, targetProfessionalId });

        let lead;
        if (isDirectLead) {
          lead = await createDirectLead(targetProfessionalId!, leadInput);
          console.log('[ContactInfoStep] Direct lead created:', lead.id);
          toast.success('Direct request sent successfully!');
        } else {
          lead = await createLead(leadInput);
          console.log('[ContactInfoStep] Indirect lead created:', lead.id);
          toast.success('Request created successfully!');
        }

        setCreatedLead({
          leadId: lead.id,
          serviceCategory: selectedServiceId!,
          emirate,
          wasGuest: false,
        });
      } else {
        // UNAUTHENTICATED USER: Use new /leads/guest endpoint
        // This creates user + lead atomically and sends magic link
        console.log('[ContactInfoStep] Guest user creating lead via /leads/guest');

        const { api } = await import('@/lib/api');

        const guestLeadInput = {
          // Contact info
          email,
          firstName: name || undefined,
          phone: phone || undefined,
          // Lead data
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
          // Optional: Direct lead
          targetProfessionalId: targetProfessionalId || undefined,
        };

        const response = await api.post('/leads/guest', guestLeadInput);
        const { data } = response.data;

        console.log('[ContactInfoStep] Guest lead created:', data.leadId);

        // Show appropriate success message
        toast.success(
          data.isNewUser
            ? 'Request submitted! Check your email to set up your account.'
            : 'Request submitted! Check your email to access your dashboard.'
        );

        // Show success screen
        setCreatedLead({
          leadId: data.leadId,
          serviceCategory: selectedServiceId!,
          emirate,
          wasGuest: true,
        });
      }
    } catch (error: any) {
      console.error('[ContactInfoStep] Failed to create lead:', error);
      console.error('[ContactInfoStep] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error('This email is registered as a professional. Please use a different email or login.');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(
          error.response?.data?.message || error.message || 'Failed to create request. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success state - Show matching professionals
  if (createdLead) {
    return (
      <LeadSuccessWithPros
        leadId={createdLead.leadId}
        serviceCategory={createdLead.serviceCategory}
        emirate={createdLead.emirate}
        isGuest={createdLead.wasGuest}
        onClose={() => {
          reset();
          onSubmit?.();
        }}
      />
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

        {/* Login prompt for existing users */}
        {!isAuthenticated && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  // Redirect to login with return URL
                  const returnUrl = `/auth/login?returnToLeadForm=true&serviceId=${selectedServiceId || ''}`;
                  router.push(returnUrl);
                }}
                className="font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                Login here
              </button>
              {' '}to auto-fill your details
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Using your account information. You can edit these fields if needed.
            </p>
          </div>
        )}
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
          {isAuthenticated ? (
            <>
              By submitting this form, you agree to receive quotes from verified
              professionals via email and in your dashboard.
            </>
          ) : (
            <>
              By submitting this form, you agree to receive quotes from verified
              professionals. We'll create a free account for you so you can manage your
              lead and communicate with professionals. You can set a password later.
            </>
          )}
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
