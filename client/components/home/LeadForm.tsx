'use client';

import { useState } from 'react';
import { SERVICE_CATEGORIES, EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '@homezy/shared';
import { X, MapPin, DollarSign, Clock, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createLead } from '@/lib/services/leads';

interface LeadFormProps {
  selectedServiceId?: string;
  onClose: () => void;
}

export function LeadForm({ selectedServiceId, onClose }: LeadFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = SERVICE_CATEGORIES.find((s) => s.id === selectedServiceId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: selectedServiceId || '',
    emirate: '',
    neighborhood: '',
    budgetBracket: '',
    urgency: '',
    timeline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to create a lead');
      router.push('/auth/login?redirect=/');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category ||
        !formData.emirate || !formData.budgetBracket || !formData.urgency) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await createLead({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          emirate: formData.emirate,
          neighborhood: formData.neighborhood || undefined,
        },
        budgetBracket: formData.budgetBracket,
        urgency: formData.urgency,
        timeline: formData.timeline || undefined,
      });

      toast.success('Lead created successfully! Professionals will start submitting quotes soon.');
      onClose();

      // TODO: Navigate to homeowner dashboard when available
      // router.push('/homeowner/leads');
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      toast.error(error.response?.data?.message || 'Failed to create lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create a Lead</h2>
            {selectedService && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedService.icon} {selectedService.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix leaking kitchen sink"
              className="input"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a service</option>
              {SERVICE_CATEGORIES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.icon} {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project in detail. What needs to be done? Any specific requirements?"
              rows={4}
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 20 characters. Be specific to get better quotes!
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Emirate *
              </label>
              <select
                value={formData.emirate}
                onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                className="input"
                required
              >
                <option value="">Select emirate</option>
                {EMIRATES.map((emirate) => (
                  <option key={emirate.id} value={emirate.id}>
                    {emirate.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood (Optional)
              </label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="e.g., Dubai Marina"
                className="input"
              />
            </div>
          </div>

          {/* Budget & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Budget Range *
              </label>
              <select
                value={formData.budgetBracket}
                onChange={(e) => setFormData({ ...formData, budgetBracket: e.target.value })}
                className="input"
                required
              >
                <option value="">Select budget</option>
                {BUDGET_BRACKETS.map((bracket) => (
                  <option key={bracket.id} value={bracket.id}>
                    {bracket.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Urgency *
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="input"
                required
              >
                <option value="">Select urgency</option>
                {URGENCY_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Timeline Details (Optional)
            </label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              placeholder="e.g., Looking to start within the next 2 weeks"
              className="input"
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary-50 border border-primary-300 rounded-xl p-4">
            <p className="text-sm text-gray-800">
              <strong className="text-gray-900">What happens next?</strong>
              <br />
              Up to 5 verified professionals will claim your lead and submit detailed quotes.
              You'll be able to compare quotes, view profiles, and choose the best professional for your project.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
