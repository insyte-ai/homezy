'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  History,
  Calendar,
  DollarSign,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  Filter,
  Search,
  Wind,
  Droplets,
  Zap,
  Paintbrush,
  Hammer,
  Home,
  Trees,
  Waves,
  Bug,
  Sparkles,
  Shield,
  Wrench,
  Settings,
  HardHat,
  MoreHorizontal,
  Square,
  Building,
  X,
} from 'lucide-react';
import {
  getMyServiceHistory,
  deleteServiceHistory,
  createServiceHistory,
  serviceCategoryConfig,
  serviceTypeConfig,
  type ServiceHistory,
  type HomeServiceCategory,
  type HomeServiceType,
  type ProviderType,
  type CreateServiceHistoryInput,
} from '@/lib/services/serviceHistory';
import { getMyProperties, type Property } from '@/lib/services/property';
import {
  HOME_SERVICE_CATEGORIES,
  HOME_SERVICE_TYPES,
  PROVIDER_TYPES,
} from '@homezy/shared';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Wind,
  Droplets,
  Zap,
  Paintbrush,
  Square,
  Hammer,
  Home,
  Trees,
  Waves,
  Bug,
  Sparkles,
  Shield,
  Wrench,
  Settings,
  HardHat,
  MoreHorizontal,
};

export default function ServiceHistoryPage() {
  const [services, setServices] = useState<ServiceHistory[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<HomeServiceCategory | 'all'>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Action menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateServiceHistoryInput>({
    propertyId: '',
    title: '',
    description: '',
    category: 'general-maintenance',
    serviceType: 'maintenance',
    providerType: 'external',
    providerName: '',
    cost: undefined,
    completedAt: new Date(),
    rating: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [servicesResult, propertiesResult] = await Promise.all([
        getMyServiceHistory({ limit: 100 }),
        getMyProperties(),
      ]);
      setServices(servicesResult.services);
      setProperties(propertiesResult.properties);

      // Set default property for form
      const primary = propertiesResult.properties.find((p) => p.isPrimary);
      if (primary) {
        setFormData((prev) => ({ ...prev, propertyId: primary.id }));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load service history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service record?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteServiceHistory(id);
      setServices(services.filter((s) => s.id !== id));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Failed to delete service. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else if (type === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.propertyId) {
      alert('Please select a property');
      return;
    }

    try {
      setIsSubmitting(true);
      const newService = await createServiceHistory(formData);
      setServices([newService, ...services]);
      setShowAddForm(false);
      setFormData({
        propertyId: formData.propertyId,
        title: '',
        description: '',
        category: 'general-maintenance',
        serviceType: 'maintenance',
        providerType: 'external',
        providerName: '',
        cost: undefined,
        completedAt: new Date(),
        rating: undefined,
      });
    } catch (err: any) {
      console.error('Failed to add service:', err);
      alert(err.response?.data?.message || 'Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return serviceCategoryConfig[category as HomeServiceCategory]?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    const config = serviceCategoryConfig[category as HomeServiceCategory];
    const IconComponent = iconMap[config?.icon || 'MoreHorizontal'];
    return IconComponent || MoreHorizontal;
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    if (selectedCategory !== 'all' && service.category !== selectedCategory) return false;
    if (selectedProperty !== 'all' && service.propertyId !== selectedProperty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        service.title.toLowerCase().includes(query) ||
        service.providerName?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate total spent
  const totalSpent = filteredServices.reduce((sum, s) => sum + (s.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/my-home"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
            <p className="text-gray-600 mt-1">Track all services performed on your home</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-xl font-bold text-gray-900">{filteredServices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">
                AED {totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredServices.filter((s) => s.rating).length > 0
                  ? (
                      filteredServices.reduce((sum, s) => sum + (s.rating || 0), 0) /
                      filteredServices.filter((s) => s.rating).length
                    ).toFixed(1)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as HomeServiceCategory | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {HOME_SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Properties</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Service Record</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., AC Annual Maintenance"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property *
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select property</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {HOME_SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {HOME_SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {serviceTypeConfig[type]?.label || type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type
                </label>
                <select
                  name="providerType"
                  value={formData.providerType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="external">External Provider</option>
                  <option value="homezy">Homezy Professional</option>
                </select>
              </div>

              {/* Provider Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Cool Air Services"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (AED)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost ?? ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date *
                </label>
                <input
                  type="date"
                  name="completedAt"
                  value={
                    formData.completedAt
                      ? new Date(formData.completedAt).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating ?? ''}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  min={1}
                  max={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Details about the service..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No service records</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedProperty !== 'all'
              ? 'No services match your filters. Try adjusting your search criteria.'
              : 'Start tracking your home services to build a maintenance history.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedProperty === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Service
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const CategoryIcon = getCategoryIcon(service.category);
            const config = serviceCategoryConfig[service.category];

            return (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${config?.bgColor || 'bg-gray-100'}`}>
                      <CategoryIcon className={`h-5 w-5 ${config?.color || 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color}`}>
                          {getCategoryLabel(service.category)}
                        </span>
                        <span>•</span>
                        <span>{serviceTypeConfig[service.serviceType]?.label}</span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{getPropertyName(service.propertyId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(service.completedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {service.providerName && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>
                              {service.providerType === 'homezy' ? 'Homezy: ' : ''}
                              {service.providerName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Cost & Rating */}
                    <div className="text-right">
                      {service.cost ? (
                        <p className="text-lg font-semibold text-gray-900">
                          AED {service.cost.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">No cost</p>
                      )}
                      {service.rating && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < service.rating!
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(actionMenuOpen === service.id ? null : service.id)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {actionMenuOpen === service.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => handleDelete(service.id)}
                              disabled={deletingId === service.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === service.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
