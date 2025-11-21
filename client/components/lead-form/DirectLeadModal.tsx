/**
 * Direct Lead Modal
 * Simplified lead creation form for sending direct requests to specific professionals
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { URGENCY_LEVELS, BUDGET_BRACKETS, EMIRATES } from '@homezy/shared';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';

interface DirectLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  categories?: string[];
}

export function DirectLeadModal({
  isOpen,
  onClose,
  professionalId,
  professionalName,
  categories = [],
}: DirectLeadModalProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0] || '',
    emirate: '',
    budgetBracket: '',
    urgency: 'urgent' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const subservices = await getAllSubservices();
        setServiceCategories(subservices);
      } catch (err) {
        console.error('Failed to load service categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Pre-fill category if professional has only one
  useEffect(() => {
    if (categories.length === 1 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a service category';
    }

    if (!formData.emirate) {
      newErrors.emirate = 'Please select your location';
    }

    if (!formData.budgetBracket) {
      newErrors.budgetBracket = 'Please select a budget range';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Please select urgency level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to send a request to this professional');
      onClose();
      router.push(`/auth/login?redirect=/pros/${professionalId}/request`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create direct lead
      const response = await api.post('/leads/direct', {
        professionalId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          emirate: formData.emirate,
        },
        budgetBracket: formData.budgetBracket,
        urgency: formData.urgency,
      });

      toast.success(`Request sent to ${professionalName}!`);
      onClose();

      // Redirect to dashboard to see the lead
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to send direct lead:', error);
      toast.error(
        error.response?.data?.message || 'Failed to send request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Send Request to {professionalName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              This professional will have 24 hours to respond
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-6 w-6 text-gray-500" />
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
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Kitchen Renovation in Dubai Marina"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your project in detail..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loadingCategories}
            >
              <option value="">{loadingCategories ? 'Loading...' : 'Select a service'}</option>
              {serviceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Location & Budget - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.emirate}
                onChange={(e) => handleChange('emirate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.emirate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select emirate</option>
                {EMIRATES.map((emirate) => (
                  <option key={emirate.id} value={emirate.id}>
                    {emirate.name}
                  </option>
                ))}
              </select>
              {errors.emirate && (
                <p className="text-sm text-red-600 mt-1">{errors.emirate}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range *
              </label>
              <select
                value={formData.budgetBracket}
                onChange={(e) => handleChange('budgetBracket', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.budgetBracket ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select budget</option>
                {BUDGET_BRACKETS.map((bracket) => (
                  <option key={bracket.id} value={bracket.id}>
                    {bracket.label}
                  </option>
                ))}
              </select>
              {errors.budgetBracket && (
                <p className="text-sm text-red-600 mt-1">{errors.budgetBracket}</p>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {URGENCY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleChange('urgency', level.id)}
                  className={`p-3 border-2 rounded-xl font-medium text-sm transition ${
                    formData.urgency === level.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={isSubmitting}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {errors.urgency && (
              <p className="text-sm text-red-600 mt-1">{errors.urgency}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> {professionalName} will have 24 hours to respond to your
              request. If they don't respond, your request will automatically become available
              to other verified professionals.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
