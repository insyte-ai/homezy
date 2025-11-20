/**
 * Common Fields Step
 * Collects title, description, location, budget, urgency
 * Includes AI-powered auto-generation of title and description
 */

'use client';

import { useState } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { EMIRATES, BUDGET_BRACKETS, URGENCY_LEVELS } from '@homezy/shared';
import { MapPin, DollarSign, Clock, FileText, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

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
    selectedServiceId,
    questionnaire,
    answers,
    setCommonField,
  } = useLeadFormStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  /**
   * Generate title and description using AI based on questionnaire answers
   */
  const handleGenerateContent = async () => {
    if (!questionnaire || !selectedServiceId) {
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      // Format answers for API
      const formattedAnswers = questionnaire.questions
        .filter((q) => answers[q.id]) // Only include answered questions
        .map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: answers[q.id],
          type: q.type,
        }));

      // Call the API
      const response = await api.post('/leads/generate-content', {
        serviceId: selectedServiceId,
        serviceName: questionnaire.serviceName,
        answers: formattedAnswers,
        emirate: emirate || undefined,
      });

      if (response.data.success && response.data.data) {
        // Pre-fill the fields with generated content
        setCommonField('title', response.data.data.title);
        setCommonField('description', response.data.data.description);
      } else {
        setGenerateError('Failed to generate content. Please fill manually.');
      }
    } catch (error: any) {
      console.error('Failed to generate lead content:', error);
      setGenerateError(
        error.response?.data?.message || 'Failed to generate content. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if we have enough answers to generate content
  const canGenerate = questionnaire && questionnaire.questions.some((q) => answers[q.id]);

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

      {/* AI Auto-Generate Banner */}
      {canGenerate && !title && !description && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">
                Save time with AI ✨
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Let our AI generate a professional title and description based on your answers.
                You can always edit them afterward.
              </p>
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Auto-generate with AI
                  </>
                )}
              </button>
              {generateError && (
                <p className="text-sm text-red-600 mt-2">{generateError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Generate Button (when fields have content) */}
      {canGenerate && (title || description) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Re-generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Re-generate with AI
              </>
            )}
          </button>
          {generateError && (
            <p className="text-sm text-red-600 mt-2">{generateError}</p>
          )}
        </div>
      )}

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
