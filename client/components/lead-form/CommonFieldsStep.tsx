/**
 * Common Fields Step
 * Collects title, description, location, budget, urgency
 */

'use client';

import { useLeadFormStore } from '@/store/leadFormStore';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '@homezy/shared';
import { MapPin, DollarSign, Clock, FileText } from 'lucide-react';

export function CommonFieldsStep() {
  const {
    title,
    description,
    emirate,
    neighborhood,
    budgetBracket,
    urgency,
    timeline,
    errors,
    setCommonField,
  } = useLeadFormStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your project
        </h2>
        <p className="text-sm text-gray-600">
          This information helps professionals understand your needs
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setCommonField('title', e.target.value)}
          placeholder="e.g., Fix leaking kitchen sink"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
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
          value={description}
          onChange={(e) => setCommonField('description', e.target.value)}
          placeholder="Describe your project in detail. What needs to be done? Any specific requirements?"
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length} / 20 minimum characters
        </p>
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Emirate *
          </label>
          <select
            value={emirate}
            onChange={(e) => setCommonField('emirate', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.emirate ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select emirate</option>
            {EMIRATES.map((em) => (
              <option key={em.id} value={em.id}>
                {em.name}
              </option>
            ))}
          </select>
          {errors.emirate && (
            <p className="text-sm text-red-600 mt-1">{errors.emirate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Neighborhood (Optional)
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setCommonField('neighborhood', e.target.value)}
            placeholder="e.g., Dubai Marina"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            value={budgetBracket}
            onChange={(e) => setCommonField('budgetBracket', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.budgetBracket ? 'border-red-500' : 'border-gray-300'
            }`}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Urgency *
          </label>
          <select
            value={urgency}
            onChange={(e) => setCommonField('urgency', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.urgency ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select urgency</option>
            {URGENCY_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.urgency && (
            <p className="text-sm text-red-600 mt-1">{errors.urgency}</p>
          )}
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
          value={timeline}
          onChange={(e) => setCommonField('timeline', e.target.value)}
          placeholder="e.g., Looking to start within the next 2 weeks"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
