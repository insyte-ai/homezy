'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react';
import {
  Resource,
  ResourceStatus,
  ResourceCategory,
  ResourceType,
  RESOURCE_TYPE_LABELS,
} from '@/types/resource';
import { getAllResourcesAdmin, deleteResource, bulkDeleteResources, bulkUpdateResources } from '@/lib/services/resources';
import { CATEGORY_INFO } from '@/data/resources';

export default function AdminResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });

  useEffect(() => {
    loadResources();
  }, [statusFilter, categoryFilter, typeFilter]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const result = await getAllResourcesAdmin({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        type: typeFilter || undefined,
        search: searchQuery || undefined,
        limit: 50,
      });

      setResources(result.resources);
      setTotal(result.pagination.total);

      // Calculate stats
      const allResources = await getAllResourcesAdmin({ limit: 1000 });
      const published = allResources.resources.filter(r => r.status === ResourceStatus.PUBLISHED).length;
      const draft = allResources.resources.filter(r => r.status === ResourceStatus.DRAFT).length;
      const archived = allResources.resources.filter(r => r.status === ResourceStatus.ARCHIVED).length;
      setStats({
        total: allResources.pagination.total,
        published,
        draft,
        archived,
      });
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteResource(id);
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} resources?`)) return;

    try {
      await bulkDeleteResources(selectedIds);
      setSelectedIds([]);
      loadResources();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete resources');
    }
  };

  const handleBulkStatusUpdate = async (status: ResourceStatus) => {
    if (selectedIds.length === 0) return;

    try {
      await bulkUpdateResources(selectedIds, { status });
      setSelectedIds([]);
      loadResources();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update resources');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === resources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(resources.map(r => r.id || r._id || ''));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status?: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case ResourceStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="h-3 w-3" />
            Draft
          </span>
        );
      case ResourceStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            <Archive className="h-3 w-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">Manage your resource center content</p>
        </div>
        <Link
          href="/admin/resources/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Resource
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value={ResourceStatus.PUBLISHED}>Published</option>
            <option value={ResourceStatus.DRAFT}>Draft</option>
            <option value={ResourceStatus.ARCHIVED}>Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {CATEGORY_INFO.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {Object.entries(RESOURCE_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-primary-700 font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate(ResourceStatus.PUBLISHED)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(ResourceStatus.ARCHIVED)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No resources found</p>
            <Link
              href="/admin/resources/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first resource
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === resources.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Views</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resources.map((resource) => {
                const id = resource.id || resource._id || '';
                const category = CATEGORY_INFO.find(c => c.slug === resource.category);
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelect(id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{resource.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{resource.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category?.name || resource.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {RESOURCE_TYPE_LABELS[resource.type as ResourceType] || resource.type}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(resource.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {resource.viewCount || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === id ? null : id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>
                        {showActions === id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <Link
                              href={`/resources/${resource.category}/${resource.slug}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                            <Link
                              href={`/admin/resources/${id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                setShowActions(null);
                                handleDelete(id);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
