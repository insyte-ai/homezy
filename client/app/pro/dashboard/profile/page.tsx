'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  Save,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  Camera,
  Loader2,
} from 'lucide-react';
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '@/lib/services/professional';
import { CharacterCounter } from '@/components/pro/CharacterCounter';
import toast from 'react-hot-toast';

type Tab = 'basic' | 'services' | 'pricing' | 'availability' | 'links';

type AvailabilityMode = 'business_hours' | 'any_time';

interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  sunday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  monday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  tuesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  wednesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  thursday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  friday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  saturday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
};

const DAY_LABELS: Record<keyof WeeklySchedule, string> = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tues',
  wednesday: 'Wed',
  thursday: 'Thurs',
  friday: 'Fri',
  saturday: 'Sat',
};

const DAY_ORDER: (keyof WeeklySchedule)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Helper to format time for display (e.g., "09:00" -> "9:00 a.m.")
const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper to format schedule range
const formatScheduleRange = (schedule: DaySchedule): string => {
  if (!schedule.isAvailable) return 'Unavailable';

  const start = formatTimeDisplay(schedule.startTime);
  const end = schedule.endTime === '24:00' || schedule.endTime === '00:00'
    ? 'midnight'
    : formatTimeDisplay(schedule.endTime);

  return `${start} - ${end}`;
};

export default function ProProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [completeness, setCompleteness] = useState({ percentage: 0, missingSections: [] as string[] });

  // Profile photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    bio: '',
    yearsInBusiness: 0,
    teamSize: 0,
    languages: [] as string[],
    categories: [] as string[],
    serviceAreas: [] as Array<{
      emirate: string;
      neighborhoods: string[];
      serviceRadius?: number;
      willingToTravelOutside: boolean;
      extraTravelCost?: number;
    }>,
    hourlyRateMin: 0,
    hourlyRateMax: 0,
    minimumProjectSize: 0,
  });

  // Language input
  const [newLanguage, setNewLanguage] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');

  // Availability state
  const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>('business_hours');
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [tempSchedule, setTempSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);

  const tabs = [
    { id: 'basic' as Tab, name: 'Basic Info', icon: User },
    { id: 'services' as Tab, name: 'Services & Areas', icon: Briefcase },
    { id: 'pricing' as Tab, name: 'Pricing', icon: DollarSign },
    { id: 'availability' as Tab, name: 'Availability', icon: Calendar },
    { id: 'links' as Tab, name: 'Portfolio & Verification', icon: ExternalLink },
  ];

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      const { user, completeness: comp } = data;
      const proProfile = user?.proProfile;

      // Set profile photo
      setProfilePhoto(user?.profilePhoto || null);

      // Set form data with safe defaults (proProfile should always exist now)
      setFormData({
        businessName: proProfile?.businessName || '',
        tagline: proProfile?.tagline || '',
        bio: proProfile?.bio || '',
        yearsInBusiness: proProfile?.yearsInBusiness || 0,
        teamSize: proProfile?.teamSize || 0,
        languages: proProfile?.languages || [],
        categories: proProfile?.categories || [],
        serviceAreas: proProfile?.serviceAreas || [],
        hourlyRateMin: proProfile?.hourlyRateMin || 0,
        hourlyRateMax: proProfile?.hourlyRateMax || 0,
        minimumProjectSize: proProfile?.minimumProjectSize || 0,
      });

      // Load availability settings
      if (proProfile?.availability?.schedule) {
        const loadedSchedule = proProfile.availability.schedule as WeeklySchedule;
        setSchedule(loadedSchedule);
        setTempSchedule(loadedSchedule);
        // If any day has isAvailable false or custom hours, use business_hours mode
        setAvailabilityMode('business_hours');
      }

      setCompleteness(comp || { percentage: 0, missingSections: [] });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Only show toast for actual API errors
      if (error.response?.status === 401) {
        // Silent redirect - let auth middleware handle it
        return;
      }
      toast.error('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Only send editable fields (exclude categories which are set during onboarding)
      // Don't send serviceAreas if empty - they should be managed in the Services tab
      const updateData: any = {
        businessName: formData.businessName,
        tagline: formData.tagline,
        bio: formData.bio,
        yearsInBusiness: formData.yearsInBusiness,
        teamSize: formData.teamSize,
        languages: formData.languages,
        hourlyRateMin: formData.hourlyRateMin,
        hourlyRateMax: formData.hourlyRateMax,
        minimumProjectSize: formData.minimumProjectSize,
      };

      // Only include serviceAreas if they exist and have items
      if (formData.serviceAreas && formData.serviceAreas.length > 0) {
        updateData.serviceAreas = formData.serviceAreas;
      }

      await updateMyProfile(updateData);
      setHasChanges(false);
      setSaved(true);
      // Hide saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      // Refresh completeness silently
      await fetchProfile();
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      // Only show toast for errors
      const errorDetails = error.response?.data?.details;
      if (errorDetails && Array.isArray(errorDetails)) {
        const errorMessages = errorDetails.map((d: any) => d.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'Unable to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const url = await uploadProfilePhoto(file);
      setProfilePhoto(url);
      toast.success('Business logo updated successfully');
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      toast.error(error.message || 'Failed to upload logo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      handleChange('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    handleChange('languages', formData.languages.filter((l) => l !== lang));
  };

  const addServiceArea = () => {
    handleChange('serviceAreas', [
      ...formData.serviceAreas,
      { emirate: 'Dubai', neighborhoods: [], serviceRadius: 50, willingToTravelOutside: false },
    ]);
  };

  const removeServiceArea = (index: number) => {
    handleChange('serviceAreas', formData.serviceAreas.filter((_, i) => i !== index));
  };

  const updateServiceArea = (index: number, field: string, value: any) => {
    const updated = [...formData.serviceAreas];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('serviceAreas', updated);
  };

  const addNeighborhood = (areaIndex: number) => {
    if (newNeighborhood.trim()) {
      const updated = [...formData.serviceAreas];
      updated[areaIndex].neighborhoods.push(newNeighborhood.trim());
      handleChange('serviceAreas', updated);
      setNewNeighborhood('');
    }
  };

  const removeNeighborhood = (areaIndex: number, neighborhoodIndex: number) => {
    const updated = [...formData.serviceAreas];
    updated[areaIndex].neighborhoods = updated[areaIndex].neighborhoods.filter(
      (_, i) => i !== neighborhoodIndex
    );
    handleChange('serviceAreas', updated);
  };

  // Availability functions
  const openScheduleEditor = () => {
    setTempSchedule({ ...schedule });
    setEditingSchedule(true);
  };

  const saveScheduleChanges = () => {
    setSchedule({ ...tempSchedule });
    setEditingSchedule(false);
    setHasChanges(true);
  };

  const cancelScheduleEdit = () => {
    setTempSchedule({ ...schedule });
    setEditingSchedule(false);
  };

  const updateTempSchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setTempSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleAvailabilityModeChange = (mode: AvailabilityMode) => {
    setAvailabilityMode(mode);
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      await updateMyProfile({
        availability: {
          schedule,
          unavailableDates: [],
          maxAppointmentsPerDay: 5,
          bufferTimeMinutes: 30,
        },
      });
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      toast.error('Unable to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your professional profile and service information
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Completeness Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - completeness.percentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-600">
                    {completeness.percentage}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Complete</p>
                <p className="text-xs text-gray-600">
                  {completeness.missingSections.length} sections remaining
                </p>
              </div>
            </div>

            <Link
              href="/pro/preview"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Eye className="h-4 w-4" />
              Preview Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="max-w-4xl">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Business Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Logo
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Business logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                        <Camera className="h-4 w-4" />
                        {profilePhoto ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG, or WebP. Max 5MB. This appears on your public profile.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your Business Name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Changing this will update your public profile URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="One-line description of your business"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Appears below your business name</p>
                  <CharacterCounter current={formData.tagline.length} max={150} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Business
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  maxLength={500}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell homeowners about your experience, specializations, and what makes you stand out..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Min 50 characters recommended</p>
                  <CharacterCounter current={formData.bio.length} max={500} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business
                  </label>
                  <input
                    type="number"
                    value={formData.yearsInBusiness || ''}
                    onChange={(e) => handleChange('yearsInBusiness', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize || ''}
                    onChange={(e) => handleChange('teamSize', parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., English, Arabic"
                  />
                  <button
                    onClick={addLanguage}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-neutral-900 rounded-full text-sm"
                    >
                      {lang}
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="hover:bg-primary-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services & Areas Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Categories</h3>
                <p className="text-sm text-gray-600 mb-4">
                  These were set during onboarding. To modify, please contact support.
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-neutral-900 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Areas</h3>
                  <button
                    onClick={addServiceArea}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Area
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.serviceAreas.map((area, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Emirate
                            </label>
                            <select
                              value={area.emirate}
                              onChange={(e) =>
                                updateServiceArea(index, 'emirate', e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {emirates.map((emirate) => (
                                <option key={emirate} value={emirate}>
                                  {emirate}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Service Radius (km)
                            </label>
                            <input
                              type="number"
                              value={area.serviceRadius || ''}
                              onChange={(e) =>
                                updateServiceArea(
                                  index,
                                  'serviceRadius',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="50"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeServiceArea(index)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Neighborhoods (optional)
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={newNeighborhood}
                            onChange={(e) => setNewNeighborhood(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              (e.preventDefault(), addNeighborhood(index))
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., Downtown, Marina"
                          />
                          <button
                            onClick={() => addNeighborhood(index)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {area.neighborhoods.map((neighborhood, nIndex) => (
                            <span
                              key={nIndex}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                              {neighborhood}
                              <button
                                onClick={() => removeNeighborhood(index, nIndex)}
                                className="hover:bg-gray-200 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={area.willingToTravelOutside}
                            onChange={(e) =>
                              updateServiceArea(
                                index,
                                'willingToTravelOutside',
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            Willing to travel outside service area
                          </span>
                        </label>

                        {area.willingToTravelOutside && (
                          <input
                            type="number"
                            value={area.extraTravelCost || ''}
                            onChange={(e) =>
                              updateServiceArea(
                                index,
                                'extraTravelCost',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Extra cost"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {formData.serviceAreas.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No service areas added yet. Click "Add Area" to get started.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Rates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rate (AED/hour)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRateMin || ''}
                      onChange={(e) =>
                        handleChange('hourlyRateMin', parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Rate (AED/hour)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRateMax || ''}
                      onChange={(e) =>
                        handleChange('hourlyRateMax', parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="200"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank if you prefer project-based pricing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Project Size (AED)
                </label>
                <input
                  type="number"
                  value={formData.minimumProjectSize || ''}
                  onChange={(e) =>
                    handleChange('minimumProjectSize', parseInt(e.target.value) || 0)
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="1000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  The minimum project value you'll accept
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-900">
                    <p className="font-medium mb-1">Pricing Tips</p>
                    <ul className="space-y-1 text-neutral-900">
                      <li>• Set competitive rates based on UAE market standards</li>
                      <li>• Include your minimum to filter serious inquiries</li>
                      <li>• Update rates seasonally if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Add your availability.
              </h3>
              <p className="text-gray-600 mb-6">
                Your availability applies to all jobs, including direct leads and instant bookings.
              </p>

              {/* Radio Options */}
              <div className="space-y-4">
                {/* Option 1: Business Hours */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="availabilityMode"
                    checked={availabilityMode === 'business_hours'}
                    onChange={() => handleAvailabilityModeChange('business_hours')}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Use business hours</span>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Customers can only book you for jobs that start and end within set hours. They can still message you anytime.
                    </p>

                    {/* Schedule Display (only when business_hours is selected) */}
                    {availabilityMode === 'business_hours' && (
                      <div className="mt-4 border border-gray-200 rounded-lg p-4">
                        <div className="space-y-2">
                          {DAY_ORDER.map((day) => (
                            <div key={day} className="flex items-center justify-between py-1">
                              <span className="text-gray-700 w-16">{DAY_LABELS[day]}</span>
                              <span className={`text-sm ${schedule[day].isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                {formatScheduleRange(schedule[day])}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={openScheduleEditor}
                          className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 2: Any Time */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="availabilityMode"
                    checked={availabilityMode === 'any_time'}
                    onChange={() => handleAvailabilityModeChange('any_time')}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Use any open day or time</span>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Customers can book you any time your calendar is not blocked.
                    </p>
                  </div>
                </label>
              </div>

              {/* Save Button for Availability */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                {saved && !hasChanges && (
                  <span className="text-sm text-green-600 font-medium animate-fade-in">
                    ✓ Saved
                  </span>
                )}
                {hasChanges && (
                  <span className="text-sm text-gray-600">Unsaved changes</span>
                )}
                <button
                  onClick={saveAvailability}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Schedule Edit Modal */}
          {editingSchedule && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Business Hours</h3>
                  <p className="text-sm text-gray-600 mt-1">Set your working hours for each day</p>
                </div>

                <div className="p-6 space-y-4">
                  {DAY_ORDER.map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 w-24">
                        <input
                          type="checkbox"
                          checked={tempSchedule[day].isAvailable}
                          onChange={(e) => updateTempSchedule(day, 'isAvailable', e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{DAY_LABELS[day]}</span>
                      </label>

                      {tempSchedule[day].isAvailable ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={tempSchedule[day].startTime}
                            onChange={(e) => updateTempSchedule(day, 'startTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={tempSchedule[day].endTime}
                            onChange={(e) => updateTempSchedule(day, 'endTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 flex-1">Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={cancelScheduleEdit}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveScheduleChanges}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Save Hours
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                <p className="text-gray-600 mb-4">
                  Add photos of your completed projects to showcase your work
                </p>
                <Link
                  href="/pro/dashboard/portfolio"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Manage Portfolio
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
                <p className="text-gray-600 mb-4">
                  Upload your business license and insurance to get verified
                </p>
                <Link
                  href="/pro/dashboard/verification"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Upload Documents
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Save Button (not shown for links or availability - they have their own) */}
          {activeTab !== 'links' && activeTab !== 'availability' && (
            <div className="flex items-center justify-end gap-4 mt-6">
              {saved && !hasChanges && (
                <span className="text-sm text-green-600 font-medium animate-fade-in">
                  ✓ Saved
                </span>
              )}
              {hasChanges && (
                <span className="text-sm text-gray-600">Unsaved changes</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
