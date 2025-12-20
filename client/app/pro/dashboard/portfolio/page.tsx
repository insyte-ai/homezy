'use client';

import { useState, useEffect } from 'react';
import { getMyProfile, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, updateFeaturedProjects, uploadPortfolioImages } from '@/lib/services/professional';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';
import type { PortfolioItem } from '@homezy/shared';
import { Plus, Edit2, Trash2, Star, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioFormData {
  title: string;
  description: string;
  category: string;
  images: string[];
  beforeImages: string[];
  afterImages: string[];
  completionDate: string;
  isFeatured: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  completionDate?: string;
  images?: string;
}

const emptyFormData: PortfolioFormData = {
  title: '',
  description: '',
  category: '',
  images: [],
  beforeImages: [],
  afterImages: [],
  completionDate: new Date().toISOString().split('T')[0],
  isFeatured: false,
};

export default function ProPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadPortfolio();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const subservices = await getAllSubservices();
      // Sort categories alphabetically by name
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

  const loadPortfolio = async () => {
    try {
      const data = await getMyProfile();
      setPortfolio(data.user.proProfile?.portfolio || []);
      setFeaturedProjects(data.user.proProfile?.featuredProjects || []);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILES_PER_TYPE = 10;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP images are allowed.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
        continue;
      }

      valid.push(file);
    }

    // Check total count
    if (valid.length > MAX_FILES_PER_TYPE) {
      errors.push(`Maximum ${MAX_FILES_PER_TYPE} files allowed at once.`);
      return { valid: valid.slice(0, MAX_FILES_PER_TYPE), errors };
    }

    return { valid, errors };
  };

  const handleImageUpload = async (files: FileList, type: 'images' | 'beforeImages' | 'afterImages') => {
    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    // Show validation errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      if (valid.length === 0) return;
    }

    // Check if adding these would exceed the limit
    const currentCount = formData[type].length;
    const MAX_TOTAL_PER_TYPE = 20;
    const availableSlots = MAX_TOTAL_PER_TYPE - currentCount;

    if (availableSlots <= 0) {
      toast.error(`Maximum ${MAX_TOTAL_PER_TYPE} images allowed per section.`);
      return;
    }

    const filesToUpload = valid.slice(0, availableSlots);
    if (filesToUpload.length < valid.length) {
      toast.error(`Only uploading ${filesToUpload.length} of ${valid.length} files to stay within the ${MAX_TOTAL_PER_TYPE} image limit.`);
    }

    setUploading(true);
    try {
      const urls = await uploadPortfolioImages(filesToUpload);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...urls],
      }));
      // Clear images error if uploading to main images
      if (type === 'images') {
        clearFieldError('images');
      }
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (type: 'images' | 'beforeImages' | 'afterImages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (!formData.completionDate) {
      errors.completionDate = 'Completion date is required';
    }

    if (formData.images.length === 0) {
      errors.images = 'At least one project photo is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
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

    try {
      if (editingId) {
        await updatePortfolioItem(editingId, formData);
        toast.success('Project updated successfully');
      } else {
        await addPortfolioItem(formData);
        toast.success('Project added successfully');
      }

      await loadPortfolio();
      closeModal();
    } catch (error) {
      toast.error(editingId ? 'Failed to update project' : 'Failed to add project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deletePortfolioItem(id);
      toast.success('Project deleted successfully');
      await loadPortfolio();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const toggleFeatured = async (projectId: string) => {
    try {
      let newFeatured: string[];

      if (featuredProjects.includes(projectId)) {
        newFeatured = featuredProjects.filter(id => id !== projectId);
      } else {
        if (featuredProjects.length >= 6) {
          toast.error('You can only feature up to 6 projects');
          return;
        }
        newFeatured = [...featuredProjects, projectId];
      }

      await updateFeaturedProjects(newFeatured);
      setFeaturedProjects(newFeatured);
      toast.success('Featured projects updated');
    } catch (error) {
      toast.error('Failed to update featured projects');
    }
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      images: item.images || [],
      beforeImages: item.beforeImages || [],
      afterImages: item.afterImages || [],
      completionDate: new Date(item.completionDate).toISOString().split('T')[0],
      isFeatured: item.isFeatured,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  const getCategoryName = (categoryId: string) => {
    return serviceCategories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Portfolio</h1>
            <p className="text-neutral-600">
              Showcase your best work to win more projects
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Project
          </button>
        </div>

        {portfolio.length === 0 ? (
          <div>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-primary-900">
                💡 <strong>Tip:</strong> Pros with 10+ portfolio photos get 3x more quote requests. Add before/after photos for best results!
              </p>
            </div>

            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
              <p className="text-neutral-600 mb-4">Start by adding your first project</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                Add Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary-900">
                ⭐ <strong>Featured Projects:</strong> {featuredProjects.length}/6 selected. Click the star icon to feature projects on your profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Project Image */}
                  <div className="relative aspect-video bg-neutral-100">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {featuredProjects.includes(item.id) && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900 text-lg line-clamp-1">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => toggleFeatured(item.id)}
                        className={`flex-shrink-0 ml-2 ${
                          featuredProjects.includes(item.id)
                            ? 'text-yellow-500'
                            : 'text-neutral-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${featuredProjects.includes(item.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-neutral-900 text-xs font-medium">
                        {getCategoryName(item.category)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.completionDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Image Count */}
                    <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                      {item.images && item.images.length > 0 && (
                        <span>{item.images.length} photo{item.images.length !== 1 ? 's' : ''}</span>
                      )}
                      {item.beforeImages && item.beforeImages.length > 0 && (
                        <span>{item.beforeImages.length} before</span>
                      )}
                      {item.afterImages && item.afterImages.length > 0 && (
                        <span>{item.afterImages.length} after</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-neutral-200">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    clearFieldError('title');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.title ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                  }`}
                  placeholder="e.g., Modern Kitchen Renovation"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, category: e.target.value }));
                    clearFieldError('category');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.category ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                  }`}
                  disabled={loadingCategories}
                >
                  <option value="">{loadingCategories ? 'Loading...' : 'Select a category'}</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
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
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    clearFieldError('description');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                  }`}
                  rows={4}
                  placeholder="Describe the project, challenges, and results..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
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
                    setFormData(prev => ({ ...prev, completionDate: e.target.value }));
                    clearFieldError('completionDate');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.completionDate ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                  }`}
                />
                {formErrors.completionDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.completionDate}</p>
                )}
              </div>

              {/* General Images */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Project Photos *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 ${
                  formErrors.images ? 'border-red-400 bg-red-50' : 'border-neutral-300'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files, 'images')}
                    className="hidden"
                    id="general-images"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="general-images"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className={`h-8 w-8 mb-2 ${formErrors.images ? 'text-red-400' : 'text-neutral-400'}`} />
                    <span className={`text-sm ${formErrors.images ? 'text-red-600' : 'text-neutral-600'}`}>
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                  </label>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage('images', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.images && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.images}</p>
                )}
              </div>

              {/* Before Images */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Before Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files, 'beforeImages')}
                    className="hidden"
                    id="before-images"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="before-images"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600">
                      {uploading ? 'Uploading...' : 'Click to upload before photos'}
                    </span>
                  </label>

                  {formData.beforeImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {formData.beforeImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage('beforeImages', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* After Images */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  After Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files, 'afterImages')}
                    className="hidden"
                    id="after-images"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="after-images"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600">
                      {uploading ? 'Uploading...' : 'Click to upload after photos'}
                    </span>
                  </label>

                  {formData.afterImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {formData.afterImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage('afterImages', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : editingId ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
