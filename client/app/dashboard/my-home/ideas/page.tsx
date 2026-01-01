'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Plus,
  Lightbulb,
  User,
  Package,
  Store,
  FileText,
  Receipt,
  Link as LinkIcon,
  Heart,
  MoreVertical,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  Star,
  X,
  Bookmark,
  Grid3X3,
} from 'lucide-react';
import { getDefaultProject } from '@/lib/services/homeProjects';
import {
  getProjectResources,
  createResource,
  deleteResource,
  toggleFavorite,
  resourceTypeConfig,
  type ProjectResource,
  type ResourceType,
  type CreateResourceInput,
} from '@/lib/services/projectResources';
import { getSavedPhotos, unsavePhoto, type IdeasPhoto } from '@/lib/services/ideas';
import { RESOURCE_TYPES, getRoomCategoryLabel } from '@homezy/shared';
import toast from 'react-hot-toast';

const iconMap: Record<string, typeof Lightbulb> = {
  Lightbulb,
  User,
  Package,
  Store,
  FileText,
  Receipt,
  Link: LinkIcon,
};

// Form state interface with flattened fields for easier form handling
interface ResourceFormState {
  type: ResourceType;
  title: string;
  notes: string;
  tags: string[];
  sourceUrl?: string;
  url?: string;
  price?: number;
}

type TabType = 'collection' | 'saved';

export default function IdeasPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('saved');

  // Collection tab state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Saved Ideas tab state
  const [savedPhotos, setSavedPhotos] = useState<IdeasPhoto[]>([]);
  const [savedPhotosLoading, setSavedPhotosLoading] = useState(false);
  const [savedPhotosLoaded, setSavedPhotosLoaded] = useState(false);
  const [unsavingPhotoId, setUnsavingPhotoId] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState<ResourceFormState>({
    type: 'idea',
    title: '',
    notes: '',
    tags: [],
  });
  const [saving, setSaving] = useState(false);

  // Action menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Load saved photos when tab switches to 'saved'
  useEffect(() => {
    if (activeTab === 'saved' && !savedPhotosLoaded) {
      loadSavedPhotos();
    }
  }, [activeTab, savedPhotosLoaded]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get or create the default "My Ideas" project
      const { project } = await getDefaultProject();
      setProjectId(project.id);

      // Load resources
      const { resources } = await getProjectResources(project.id);
      setResources(resources);
    } catch (err) {
      console.error('Failed to load ideas:', err);
      setError('Failed to load ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedPhotos = async () => {
    try {
      setSavedPhotosLoading(true);
      const data = await getSavedPhotos({ limit: 50 });
      setSavedPhotos(data.photos);
      setSavedPhotosLoaded(true);
    } catch (err) {
      console.error('Failed to load saved photos:', err);
      toast.error('Failed to load saved ideas');
    } finally {
      setSavedPhotosLoading(false);
    }
  };

  const handleUnsavePhoto = async (photoId: string) => {
    try {
      setUnsavingPhotoId(photoId);
      await unsavePhoto(photoId);
      setSavedPhotos(savedPhotos.filter((p) => p.id !== photoId));
      toast.success('Removed from saved ideas');
    } catch (err) {
      console.error('Failed to unsave photo:', err);
      toast.error('Failed to remove from saved ideas');
    } finally {
      setUnsavingPhotoId(null);
    }
  };

  const handleAddResource = async () => {
    if (!projectId || !newResource.title?.trim() || !newResource.type) return;

    try {
      setSaving(true);

      const input: CreateResourceInput = {
        type: newResource.type,
        title: newResource.title,
        notes: newResource.notes,
        tags: newResource.tags || [],
      };

      // Add type-specific data based on resource type
      if (newResource.type === 'idea') {
        input.ideaData = { images: [], sourceUrl: newResource.sourceUrl };
      } else if (newResource.type === 'link') {
        input.linkData = { url: newResource.url || '', description: newResource.notes };
      } else if (newResource.type === 'product') {
        input.productData = {
          name: newResource.title,
          currency: 'AED',
          images: [],
          price: newResource.price,
          sourceUrl: newResource.sourceUrl,
        };
      }

      const resource = await createResource(projectId, input);
      setResources([resource, ...resources]);
      setNewResource({ type: 'idea', title: '', notes: '', tags: [], sourceUrl: undefined, url: undefined, price: undefined });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add resource:', err);
      alert('Failed to add item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!projectId || !confirm('Delete this item?')) return;

    try {
      await deleteResource(projectId, resourceId);
      setResources(resources.filter((r) => r.id !== resourceId));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleToggleFavorite = async (resourceId: string) => {
    if (!projectId) return;

    try {
      const updated = await toggleFavorite(projectId, resourceId);
      setResources(resources.map((r) => (r.id === resourceId ? updated : r)));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Filter resources
  const filteredResources = resources.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (showFavoritesOnly && !r.isFavorite) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(query) ||
        r.notes?.toLowerCase().includes(query) ||
        r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Group by type for display
  const resourcesByType = RESOURCE_TYPES.reduce((acc, type) => {
    acc[type] = filteredResources.filter((r) => r.type === type);
    return acc;
  }, {} as Record<ResourceType, ProjectResource[]>);

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
            <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 'saved'
                ? 'Photos you saved from the Ideas gallery'
                : 'Save inspiration, products, vendors, and more'}
            </p>
          </div>
        </div>
        {activeTab === 'collection' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        )}
        {activeTab === 'saved' && (
          <Link
            href="/ideas"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Grid3X3 className="h-4 w-4" />
            Browse Ideas
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'saved'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Ideas
              {savedPhotos.length > 0 && (
                <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                  {savedPhotos.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'collection'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              My Collection
              {resources.length > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {resources.length}
                </span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Saved Ideas Tab Content */}
      {activeTab === 'saved' && (
        <>
          {savedPhotosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : savedPhotos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved ideas yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Browse the Ideas gallery and save photos you love to see them here.
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Grid3X3 className="h-4 w-4" />
                Browse Ideas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/ideas/photo/${photo.id}`}>
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={photo.caption || photo.projectTitle || 'Saved idea'}
                        fill
                        className="object-cover"
                        unoptimized={(photo.thumbnailUrl || photo.imageUrl).includes('localhost')}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  </Link>

                  {/* Photo info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {photo.projectTitle && (
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {photo.projectTitle}
                          </p>
                        )}
                        {photo.roomCategories && photo.roomCategories.length > 0 && (
                          <p className="text-xs text-gray-500 truncate">
                            {photo.roomCategories
                              .map((cat) => getRoomCategoryLabel(cat))
                              .join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnsavePhoto(photo.id)}
                        disabled={unsavingPhotoId === photo.id}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Remove from saved"
                      >
                        {unsavingPhotoId === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
                        )}
                      </button>
                    </div>
                    {photo.businessName && (
                      <Link
                        href={photo.professionalId && photo.proSlug ? `/pros/${photo.professionalId}/${photo.proSlug}` : '#'}
                        className="text-xs text-primary-600 hover:text-primary-700 mt-1 block truncate"
                      >
                        by {photo.businessName}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Collection Tab Content */}
      {activeTab === 'collection' && (
        <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas, products, vendors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ResourceType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {resourceTypeConfig[type].label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFavoritesOnly
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Add New Item</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type Selection */}
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map((type) => {
                const config = resourceTypeConfig[type];
                const Icon = iconMap[config.icon];
                return (
                  <button
                    key={type}
                    onClick={() => setNewResource({ ...newResource, type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      newResource.type === type
                        ? `${config.bgColor} ${config.color} border-current`
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newResource.title || ''}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder={`Enter ${resourceTypeConfig[newResource.type || 'idea'].label.toLowerCase()} title`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Type-specific fields */}
            {(newResource.type === 'link' || newResource.type === 'idea' || newResource.type === 'product') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newResource.type === 'link' ? 'URL *' : 'Source URL'}
                </label>
                <input
                  type="url"
                  value={newResource.type === 'link' ? newResource.url || '' : newResource.sourceUrl || ''}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      [newResource.type === 'link' ? 'url' : 'sourceUrl']: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {newResource.type === 'product' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
                <input
                  type="number"
                  value={newResource.price || ''}
                  onChange={(e) =>
                    setNewResource({ ...newResource, price: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newResource.notes || ''}
                onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
                rows={2}
                placeholder="Add any notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddResource}
                disabled={!newResource.title?.trim() || saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lightbulb className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || typeFilter !== 'all' || showFavoritesOnly
              ? 'No items found'
              : 'No saved items yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery || typeFilter !== 'all' || showFavoritesOnly
              ? 'Try adjusting your filters or search query.'
              : 'Start saving inspiration, products, vendors, and more for your home projects.'}
          </p>
          {!searchQuery && typeFilter === 'all' && !showFavoritesOnly && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const config = resourceTypeConfig[resource.type];
            const Icon = iconMap[config.icon];

            return (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 ${config.bgColor} rounded-lg shrink-0`}>
                        {Icon && <Icon className={`h-4 w-4 ${config.color}`} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">{resource.title}</div>
                        <div className={`text-xs ${config.color}`}>{config.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleFavorite(resource.id)}
                        className={`p-1.5 rounded transition-colors ${
                          resource.isFavorite
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-gray-300 hover:text-amber-500'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${resource.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuOpen(actionMenuOpen === resource.id ? null : resource.id)
                          }
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {actionMenuOpen === resource.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => handleDelete(resource.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {resource.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.notes}</p>
                  )}

                  {/* Type-specific display */}
                  {resource.type === 'product' && resource.productData?.price && (
                    <div className="mt-2 font-semibold text-gray-900">
                      AED {resource.productData.price.toLocaleString()}
                    </div>
                  )}

                  {resource.type === 'link' && resource.linkData?.url && (
                    <a
                      href={resource.linkData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Link
                    </a>
                  )}

                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-400 text-xs">
                          +{resource.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}
