'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  Plus,
  ArrowLeft,
  MapPin,
  Home,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';
import {
  getMyProperties,
  deleteProperty,
  setPrimaryProperty,
  type Property,
} from '@/lib/services/property';
import { EMIRATES, OWNERSHIP_TYPES, PROPERTY_TYPES } from '@homezy/shared';

export default function PropertyPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { properties } = await getMyProperties();
      setProperties(properties);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(propertyId);
      await deleteProperty(propertyId);
      setProperties(properties.filter((p) => p.id !== propertyId));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (propertyId: string) => {
    try {
      setSettingPrimaryId(propertyId);
      await setPrimaryProperty(propertyId);
      // Reload properties to get updated primary status
      await loadProperties();
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to set primary property:', err);
      alert('Failed to set primary property. Please try again.');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const getEmirateName = (emirateId: string) => {
    const emirate = EMIRATES.find((e) => e.id === emirateId);
    return emirate?.name || emirateId;
  };

  const getPropertyTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getOwnershipLabel = (type: string) => {
    return type === 'owned' ? 'Owned' : 'Rental';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">My Property</h1>
            <p className="text-gray-600 mt-1">
              Manage your property details and rooms
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/my-home/property/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <House className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first property to start tracking your home improvement projects, services, and expenses.
          </p>
          <Link
            href="/dashboard/my-home/property/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Property Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Home className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {property.name}
                        </h3>
                        {property.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <Star className="h-3 w-3" />
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.neighborhood
                          ? `${property.neighborhood}, ${getEmirateName(property.emirate)}`
                          : getEmirateName(property.emirate)}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(actionMenuOpen === property.id ? null : property.id)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>

                    {actionMenuOpen === property.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActionMenuOpen(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <Link
                            href={`/dashboard/my-home/property/${property.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit Property
                          </Link>
                          {!property.isPrimary && (
                            <button
                              onClick={() => handleSetPrimary(property.id)}
                              disabled={settingPrimaryId === property.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {settingPrimaryId === property.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                              Set as Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(property.id)}
                            disabled={deletingId === property.id}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === property.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete Property
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Home className="h-4 w-4" />
                    <span>{getPropertyTypeLabel(property.propertyType)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                      {getOwnershipLabel(property.ownershipType)}
                    </span>
                  </div>
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  )}
                  {property.sizeSqFt && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Ruler className="h-4 w-4" />
                      <span>{property.sizeSqFt.toLocaleString()} sqft</span>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Built {property.yearBuilt}</span>
                    </div>
                  )}
                </div>

                {/* Rooms Summary */}
                {property.rooms && property.rooms.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{property.rooms.length} rooms</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span>
                        {property.rooms
                          .slice(0, 3)
                          .map((r) => r.name)
                          .join(', ')}
                        {property.rooms.length > 3 && ` +${property.rooms.length - 3} more`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Profile Completeness */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Profile completeness</span>
                    <span className="font-medium text-gray-900">
                      {property.profileCompleteness}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${property.profileCompleteness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* View Details Link */}
              <Link
                href={`/dashboard/my-home/property/${property.id}`}
                className="block px-5 py-3 bg-gray-50 text-sm font-medium text-primary-600 hover:bg-gray-100 transition-colors text-center"
              >
                View & Edit Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
