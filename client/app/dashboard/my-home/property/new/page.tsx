'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Home, Plus, X } from 'lucide-react';
import {
  createProperty,
  type CreatePropertyInput,
  type RoomInput,
} from '@/lib/services/property';
import {
  EMIRATES,
  OWNERSHIP_TYPES,
  PROPERTY_TYPES,
  ROOM_TYPES,
} from '@homezy/shared';

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePropertyInput>({
    name: '',
    emirate: 'dubai',
    neighborhood: '',
    fullAddress: '',
    ownershipType: 'owned',
    propertyType: 'apartment',
    bedrooms: undefined,
    bathrooms: undefined,
    sizeSqFt: undefined,
    yearBuilt: undefined,
    rooms: [],
    isPrimary: true,
  });

  const [newRoom, setNewRoom] = useState<RoomInput>({
    name: '',
    type: 'bedroom',
    floor: undefined,
    notes: '',
  });
  const [showRoomForm, setShowRoomForm] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.name.trim()) return;

    setFormData((prev) => ({
      ...prev,
      rooms: [...(prev.rooms || []), { ...newRoom }],
    }));

    setNewRoom({
      name: '',
      type: 'bedroom',
      floor: undefined,
      notes: '',
    });
    setShowRoomForm(false);
  };

  const handleRemoveRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a property name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const property = await createProperty(formData);
      router.push(`/dashboard/my-home/property/${property.id}`);
    } catch (err: any) {
      console.error('Failed to create property:', err);
      setError(err.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/my-home/property"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Property</h1>
          <p className="text-gray-600 mt-1">Add a new property to your portfolio</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Property Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Property Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., My Dubai Apartment"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Property Type & Ownership */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ownershipType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ownership *
                </label>
                <select
                  id="ownershipType"
                  name="ownershipType"
                  value={formData.ownershipType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {OWNERSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === 'owned' ? 'Owned' : 'Rental'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emirate" className="block text-sm font-medium text-gray-700 mb-1">
                  Emirate *
                </label>
                <select
                  id="emirate"
                  name="emirate"
                  value={formData.emirate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {EMIRATES.map((emirate) => (
                    <option key={emirate.id} value={emirate.id}>
                      {emirate.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                  Neighborhood / Area
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="e.g., Downtown, Marina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <textarea
                id="fullAddress"
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleInputChange}
                placeholder="Building name, street, etc."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms ?? ''}
                onChange={handleInputChange}
                min={0}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms ?? ''}
                onChange={handleInputChange}
                min={0}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="sizeSqFt" className="block text-sm font-medium text-gray-700 mb-1">
                Size (sqft)
              </label>
              <input
                type="number"
                id="sizeSqFt"
                name="sizeSqFt"
                value={formData.sizeSqFt ?? ''}
                onChange={handleInputChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                value={formData.yearBuilt ?? ''}
                onChange={handleInputChange}
                min={1900}
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Rooms</h2>
            {!showRoomForm && (
              <button
                type="button"
                onClick={() => setShowRoomForm(true)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                Add Room
              </button>
            )}
          </div>

          {/* Room List */}
          {formData.rooms && formData.rooms.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.rooms.map((room, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{room.name}</div>
                      <div className="text-sm text-gray-500">
                        {getRoomTypeLabel(room.type)}
                        {room.floor !== undefined && ` | Floor ${room.floor}`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Room Form */}
          {showRoomForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="e.g., Master Bedroom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {ROOM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getRoomTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    value={newRoom.floor ?? ''}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        floor: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    placeholder="e.g., 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={newRoom.notes}
                    onChange={(e) => setNewRoom({ ...newRoom, notes: e.target.value })}
                    placeholder="Optional notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddRoom}
                  disabled={!newRoom.name.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showRoomForm && formData.rooms?.length === 0 && (
            <p className="text-sm text-gray-500">
              No rooms added yet. You can add rooms now or later.
            </p>
          )}
        </div>

        {/* Primary Property */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <div className="font-medium text-gray-900">Set as primary property</div>
              <div className="text-sm text-gray-500">
                Your primary property will be used as default for new projects and services
              </div>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/my-home/property"
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
