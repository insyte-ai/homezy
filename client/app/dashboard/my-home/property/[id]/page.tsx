'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Home,
  Plus,
  X,
  Edit2,
  Trash2,
  Save,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Star,
  Check,
} from 'lucide-react';
import {
  getPropertyById,
  updateProperty,
  addRoom,
  updateRoom,
  deleteRoom,
  type Property,
  type UpdatePropertyInput,
  type RoomInput,
} from '@/lib/services/property';
import {
  EMIRATES,
  OWNERSHIP_TYPES,
  PROPERTY_TYPES,
  ROOM_TYPES,
} from '@homezy/shared';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePropertyInput>({});

  // Room management state
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState<RoomInput>({
    name: '',
    type: 'bedroom',
    floor: undefined,
    notes: '',
  });
  const [roomSaving, setRoomSaving] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPropertyById(propertyId);
      setProperty(data);
      setFormData({
        name: data.name,
        emirate: data.emirate,
        neighborhood: data.neighborhood,
        fullAddress: data.fullAddress,
        ownershipType: data.ownershipType,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sizeSqFt: data.sizeSqFt,
        yearBuilt: data.yearBuilt,
      });
    } catch (err) {
      console.error('Failed to load property:', err);
      setError('Failed to load property. Please try again.');
    } finally {
      setIsLoading(false);
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!property) return;

    try {
      setIsSaving(true);
      setError(null);
      const updated = await updateProperty(propertyId, formData);
      setProperty(updated);
      setIsEditing(false);
      setSuccessMessage('Property updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update property:', err);
      setError(err.response?.data?.message || 'Failed to update property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (property) {
      setFormData({
        name: property.name,
        emirate: property.emirate,
        neighborhood: property.neighborhood,
        fullAddress: property.fullAddress,
        ownershipType: property.ownershipType,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sizeSqFt: property.sizeSqFt,
        yearBuilt: property.yearBuilt,
      });
    }
    setIsEditing(false);
  };

  const handleAddRoom = async () => {
    if (!newRoom.name.trim()) return;

    try {
      setRoomSaving(true);
      const updated = await addRoom(propertyId, newRoom);
      setProperty(updated);
      setNewRoom({ name: '', type: 'bedroom', floor: undefined, notes: '' });
      setShowRoomForm(false);
      setSuccessMessage('Room added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to add room:', err);
      setError(err.response?.data?.message || 'Failed to add room. Please try again.');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleUpdateRoom = async (roomId: string) => {
    const room = property?.rooms.find((r) => r.id === roomId);
    if (!room) return;

    try {
      setRoomSaving(true);
      const updated = await updateRoom(propertyId, roomId, {
        name: room.name,
        type: room.type,
        floor: room.floor,
        notes: room.notes,
      });
      setProperty(updated);
      setEditingRoomId(null);
      setSuccessMessage('Room updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update room:', err);
      setError(err.response?.data?.message || 'Failed to update room. Please try again.');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      setRoomSaving(true);
      const updated = await deleteRoom(propertyId, roomId);
      setProperty(updated);
      setSuccessMessage('Room deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete room:', err);
      setError(err.response?.data?.message || 'Failed to delete room. Please try again.');
    } finally {
      setRoomSaving(false);
    }
  };

  const getRoomTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  const getEmirateName = (emirateId: string) => {
    const emirate = EMIRATES.find((e) => e.id === emirateId);
    return emirate?.name || emirateId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Property not found</h2>
        <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
        <Link
          href="/dashboard/my-home/property"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/my-home/property"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              {property.isPrimary && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Star className="h-3 w-3" />
                  Primary
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.neighborhood
                ? `${property.neighborhood}, ${getEmirateName(property.emirate)}`
                : getEmirateName(property.emirate)}
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Property Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
        </div>

        <div className="p-6 space-y-6">
          {isEditing ? (
            <>
              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType || ''}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ownership
                  </label>
                  <select
                    name="ownershipType"
                    value={formData.ownershipType || ''}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emirate
                  </label>
                  <select
                    name="emirate"
                    value={formData.emirate || ''}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms ?? ''}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms ?? ''}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size (sqft)
                  </label>
                  <input
                    type="number"
                    name="sizeSqFt"
                    value={formData.sizeSqFt ?? ''}
                    onChange={handleInputChange}
                    min={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt ?? ''}
                    onChange={handleInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  name="fullAddress"
                  value={formData.fullAddress || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          ) : (
            <>
              {/* View Mode */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Property Type</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Ownership</div>
                  <div className="font-medium text-gray-900">
                    {property.ownershipType === 'owned' ? 'Owned' : 'Rental'}
                  </div>
                </div>

                {property.bedrooms !== undefined && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bedrooms</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-400" />
                      {property.bedrooms}
                    </div>
                  </div>
                )}

                {property.bathrooms !== undefined && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bathrooms</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Bath className="h-4 w-4 text-gray-400" />
                      {property.bathrooms}
                    </div>
                  </div>
                )}

                {property.sizeSqFt && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Size</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-gray-400" />
                      {property.sizeSqFt.toLocaleString()} sqft
                    </div>
                  </div>
                )}

                {property.yearBuilt && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Year Built</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {property.yearBuilt}
                    </div>
                  </div>
                )}
              </div>

              {property.fullAddress && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Full Address</div>
                  <div className="font-medium text-gray-900">{property.fullAddress}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rooms Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Rooms ({property.rooms?.length || 0})
          </h2>
          {!showRoomForm && (
            <button
              onClick={() => setShowRoomForm(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Room
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Add Room Form */}
          {showRoomForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
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
                    Room Type
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={newRoom.floor ?? ''}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        floor: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newRoom.notes}
                    onChange={(e) => setNewRoom({ ...newRoom, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddRoom}
                  disabled={!newRoom.name.trim() || roomSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {roomSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Room
                </button>
                <button
                  onClick={() => setShowRoomForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rooms List */}
          {property.rooms && property.rooms.length > 0 ? (
            <div className="space-y-3">
              {property.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{room.name}</div>
                      <div className="text-sm text-gray-500">
                        {getRoomTypeLabel(room.type)}
                        {room.floor !== undefined && ` | Floor ${room.floor}`}
                        {room.notes && ` | ${room.notes}`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={roomSaving}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No rooms added yet. Add rooms to better organize your property.
            </p>
          )}
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Profile Completeness</h3>
          <span className="text-lg font-semibold text-gray-900">
            {property.profileCompleteness}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all"
            style={{ width: `${property.profileCompleteness}%` }}
          />
        </div>
        {property.profileCompleteness < 100 && (
          <p className="text-sm text-gray-500 mt-2">
            Add more details to complete your property profile.
          </p>
        )}
      </div>
    </div>
  );
}
