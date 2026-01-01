'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getAllSubservices, type SubService } from '@/lib/services/serviceData';
import type { ProProject, CreateProProjectInput, UpdateProProjectInput } from '@homezy/shared';

interface ProjectModalProps {
  project?: ProProject | null;
  onClose: () => void;
  onSave: (input: CreateProProjectInput | UpdateProProjectInput) => Promise<void>;
}

interface FormData {
  name: string;
  description: string;
  serviceCategory: string;
  completionDate: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  serviceCategory?: string;
  completionDate?: string;
}

const emptyFormData: FormData = {
  name: '',
  description: '',
  serviceCategory: '',
  completionDate: new Date().toISOString().split('T')[0],
};

export function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const isEditing = !!project;

  useEffect(() => {
    loadCategories();

    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        serviceCategory: project.serviceCategory,
        completionDate: new Date(project.completionDate).toISOString().split('T')[0],
      });
    }
  }, [project]);

  const loadCategories = async () => {
    try {
      const subservices = await getAllSubservices();
      const sortedCategories = [...subservices].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setServiceCategories(sortedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!formData.serviceCategory) {
      errors.serviceCategory = 'Please select a service category';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.completionDate) {
      errors.completionDate = 'Completion date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        serviceCategory: formData.serviceCategory,
        completionDate: new Date(formData.completionDate),
      });
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                clearFieldError('name');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.name
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-300'
              }`}
              placeholder="e.g., Modern Kitchen Renovation at Marina Heights"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Service Category *
            </label>
            <select
              value={formData.serviceCategory}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, serviceCategory: e.target.value }));
                clearFieldError('serviceCategory');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.serviceCategory
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-300'
              }`}
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? 'Loading...' : 'Select a category'}
              </option>
              {serviceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formErrors.serviceCategory && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.serviceCategory}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                clearFieldError('description');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.description
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-300'
              }`}
              rows={4}
              placeholder="Describe the project scope, challenges faced, and outcomes achieved..."
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Completion Date *
            </label>
            <input
              type="date"
              value={formData.completionDate}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  completionDate: e.target.value,
                }));
                clearFieldError('completionDate');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.completionDate
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-300'
              }`}
            />
            {formErrors.completionDate && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.completionDate}
              </p>
            )}
          </div>

          {/* Hint */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              After creating the project, you can add photos with room category tags.
              Photos are automatically published to the Ideas page for homeowners to
              discover your work.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
