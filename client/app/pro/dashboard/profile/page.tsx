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
  Plus,
  X,
  Camera,
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Images,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '@/lib/services/professional';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';
import { CharacterCounter } from '@/components/pro/CharacterCounter';
import { ProjectCard, ProjectModal, PhotoManager } from '@/components/projects';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  type ProjectStatsResponse,
} from '@/lib/services/projects';
import type { ProProject, CreateProProjectInput, UpdateProProjectInput } from '@homezy/shared';
import toast from 'react-hot-toast';

type Tab = 'basic' | 'services' | 'pricing' | 'availability' | 'verification' | 'portfolio';

type AvailabilityMode = 'business_hours' | 'any_time';

interface VerificationDocument {
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date | string;
  rejectionReason?: string;
}

interface DocumentType {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'license',
    label: 'Trade/Business License',
    description: 'PDF, PNG, JPG up to 10MB',
    required: true,
  },
  {
    id: 'vat',
    label: 'VAT Certificate',
    description: 'Tax Registration Number (TRN) certificate',
    required: true,
  },
];

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

  // Availability state
  const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>('business_hours');
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [tempSchedule, setTempSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);

  // Verification state
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({});
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  // Form validation errors
  const [bioError, setBioError] = useState<string>('');

  // Service categories state
  const [availableServices, setAvailableServices] = useState<SubService[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Portfolio state
  const [projects, setProjects] = useState<ProProject[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<ProjectStatsResponse | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ProProject | null>(null);

  const tabs = [
    { id: 'basic' as Tab, name: 'Basic Info', icon: User },
    { id: 'services' as Tab, name: 'Services & Areas', icon: Briefcase },
    { id: 'pricing' as Tab, name: 'Pricing', icon: DollarSign },
    { id: 'availability' as Tab, name: 'Availability', icon: Calendar },
    { id: 'portfolio' as Tab, name: 'Portfolio', icon: Images },
    { id: 'verification' as Tab, name: 'Verification', icon: ShieldCheck },
  ];

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  useEffect(() => {
    fetchProfile();
    loadAvailableServices();
  }, []);

  // Load portfolio when tab is switched to portfolio
  useEffect(() => {
    if (activeTab === 'portfolio' && projects.length === 0 && !portfolioLoading) {
      loadPortfolioData();
    }
  }, [activeTab]);

  const loadPortfolioData = async () => {
    try {
      setPortfolioLoading(true);
      const [projectsData, statsData] = await Promise.all([
        listProjects(),
        getProjectStats(),
      ]);
      setProjects(projectsData.projects);
      setPortfolioStats(statsData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Portfolio handlers
  const handleCreateProject = async (input: CreateProProjectInput) => {
    const project = await createProject(input);
    setProjects((prev) => [project, ...prev]);
    await loadPortfolioData(); // Refresh stats
    toast.success('Project created successfully');
  };

  const handleUpdateProject = async (input: UpdateProProjectInput) => {
    if (!editingProject) return;
    const updated = await updateProject(editingProject.id, input);
    setProjects((prev) =>
      prev.map((p) => (p.id === editingProject.id ? updated : p))
    );
    toast.success('Project updated successfully');
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project and all its photos?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      await loadPortfolioData(); // Refresh stats
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleProjectUpdate = (updatedProject: ProProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    if (viewingProject?.id === updatedProject.id) {
      setViewingProject(updatedProject);
    }
  };

  const openEditModal = (project: ProProject) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const loadAvailableServices = async () => {
    try {
      const services = await getAllSubservices();
      setAvailableServices(services.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  // Filter services for dropdown (exclude already selected by ID)
  // Uses same logic as homepage SearchBar - searches name, category, keywords, and service types
  const filteredServices = availableServices
    .map((service) => {
      // If no search query, include all non-selected services
      if (!serviceSearch.trim()) {
        return !formData.categories.includes(service.id) ? service : null;
      }

      // Skip already selected services
      if (formData.categories.includes(service.id)) return null;

      const query = serviceSearch.toLowerCase();
      const nameMatch = service.name.toLowerCase().includes(query);
      const categoryMatch = service.category?.toLowerCase().includes(query);
      const matchedKeyword = service.keywords?.find((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      const matchedType = service.serviceTypes?.find((type) =>
        type.name.toLowerCase().includes(query)
      );

      if (nameMatch || categoryMatch || matchedKeyword || matchedType) {
        return {
          ...service,
          matchedKeyword: matchedKeyword || null,
          matchedType: matchedType?.name || null,
        };
      }
      return null;
    })
    .filter((service): service is NonNullable<typeof service> => service !== null);

  // Helper to get service name by ID
  const getServiceName = (serviceId: string): string => {
    const service = availableServices.find((s) => s.id === serviceId);
    return service?.name || serviceId;
  };

  const addCategory = (serviceId: string) => {
    if (!formData.categories.includes(serviceId)) {
      handleChange('categories', [...formData.categories, serviceId]);
    }
    setServiceSearch('');
    setShowServiceDropdown(false);
  };

  const removeCategory = (serviceId: string) => {
    handleChange('categories', formData.categories.filter((c) => c !== serviceId));
  };

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

      // Load verification data
      setVerificationDocuments(proProfile?.verificationDocuments || []);
      setVerificationStatus(proProfile?.verificationStatus || 'pending');

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

  // Verification document handlers
  const getDocumentByType = (type: string): VerificationDocument | undefined => {
    return verificationDocuments.find((doc) => doc.type === type);
  };

  const handleDocumentUpload = async (type: string, file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setDocErrors((prev) => ({ ...prev, [type]: 'File size must be less than 10MB' }));
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setDocErrors((prev) => ({ ...prev, [type]: 'File must be PDF, PNG, or JPG' }));
      return;
    }

    setDocErrors((prev) => ({ ...prev, [type]: '' }));
    setUploadingDoc((prev) => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pros/me/verification/upload`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();

      // Update local state with the new document
      setVerificationDocuments((prev) => {
        const existing = prev.findIndex((doc) => doc.type === type);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = result.data.document;
          return updated;
        }
        return [...prev, result.data.document];
      });

      toast.success('Document uploaded successfully');

      // Refresh profile to get updated completeness
      await fetchProfile();
    } catch (error) {
      console.error('Upload error:', error);
      setDocErrors((prev) => ({
        ...prev,
        [type]: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      }));
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const handleSave = async () => {
    // Validate bio length
    if (formData.bio.trim() && formData.bio.trim().length < 50) {
      setBioError('Bio must be at least 50 characters for profile completion');
      // Switch to basic tab to show the error
      setActiveTab('basic');
      return;
    }

    try {
      setSaving(true);

      // Send editable fields including categories
      const updateData: any = {
        businessName: formData.businessName,
        tagline: formData.tagline,
        bio: formData.bio,
        yearsInBusiness: formData.yearsInBusiness,
        teamSize: formData.teamSize,
        languages: formData.languages,
        categories: formData.categories,
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

    // Clear bio error when user types enough characters
    if (field === 'bio' && bioError && value.trim().length >= 50) {
      setBioError('');
    }
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

  // Add an emirate to service areas
  const addServiceEmirate = (emirate: string) => {
    const alreadyAdded = formData.serviceAreas.some((area) => area.emirate === emirate);
    if (!alreadyAdded) {
      handleChange('serviceAreas', [
        ...formData.serviceAreas,
        { emirate, neighborhoods: [], willingToTravelOutside: false },
      ]);
    }
  };

  // Remove an emirate from service areas
  const removeServiceEmirate = (emirate: string) => {
    handleChange('serviceAreas', formData.serviceAreas.filter((area) => area.emirate !== emirate));
  };

  // Get list of emirates not yet added
  const availableEmirates = emirates.filter(
    (emirate) => !formData.serviceAreas.some((area) => area.emirate === emirate)
  );

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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    bioError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Tell homeowners about your experience, specializations, and what makes you stand out..."
                />
                <div className="flex justify-between mt-1">
                  {bioError ? (
                    <p className="text-xs text-red-600">{bioError}</p>
                  ) : (
                    <p className={`text-xs ${formData.bio.trim().length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.bio.trim().length >= 50
                        ? `✓ ${formData.bio.trim().length} characters`
                        : `Min 50 characters required (${formData.bio.trim().length}/50)`}
                    </p>
                  )}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Categories</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select all the services you offer. This helps homeowners find you.
                </p>

                {/* Search and add services */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowServiceDropdown(false), 200);
                    }}
                    placeholder="Search and add services..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {showServiceDropdown && filteredServices.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {!serviceSearch && (
                        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b sticky top-0">
                          {filteredServices.length} services available - type to filter
                        </div>
                      )}
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => addCategory(service.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-gray-400">
                            {service.category && `${service.category} • `}
                            {service.group || 'Home Service'}
                            {(service.matchedKeyword || service.matchedType) && (
                              <span className="text-primary-600 font-medium">
                                {' • '}{service.matchedKeyword || service.matchedType}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showServiceDropdown && serviceSearch && filteredServices.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No services found matching "{serviceSearch}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected categories */}
                <div className="flex flex-wrap gap-2">
                  {formData.categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No services selected yet. Search above to add services.</p>
                  ) : (
                    formData.categories.map((categoryId) => (
                      <span
                        key={categoryId}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                      >
                        {getServiceName(categoryId)}
                        <button
                          onClick={() => removeCategory(categoryId)}
                          className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                          title="Remove service"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {formData.categories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    {formData.categories.length} service{formData.categories.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Areas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the emirates where you provide services.
                </p>

                {/* Emirate selection dropdown */}
                {availableEmirates.length > 0 && (
                  <div className="mb-4">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addServiceEmirate(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Add an emirate...</option>
                      {availableEmirates.map((emirate) => (
                        <option key={emirate} value={emirate}>
                          {emirate}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected emirates as chips */}
                <div className="flex flex-wrap gap-2">
                  {formData.serviceAreas.length === 0 ? (
                    <p className="text-sm text-gray-500">No emirates selected yet. Select from the dropdown above.</p>
                  ) : (
                    formData.serviceAreas.map((area) => (
                      <span
                        key={area.emirate}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                      >
                        {area.emirate}
                        <button
                          onClick={() => removeServiceEmirate(area.emirate)}
                          className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                          title="Remove emirate"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {formData.serviceAreas.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    {formData.serviceAreas.length} emirate{formData.serviceAreas.length !== 1 ? 's' : ''} selected
                  </p>
                )}
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

          {/* Verification Tab */}
          {activeTab === 'verification' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verification Documents</h3>
                    <p className="text-sm text-gray-600">
                      Upload your documents to get verified and start claiming leads
                    </p>
                  </div>
                  {verificationStatus === 'approved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {DOCUMENT_TYPES.map((docType) => {
                    const existingDoc = getDocumentByType(docType.id);
                    const isUploading = uploadingDoc[docType.id];
                    const error = docErrors[docType.id];

                    return (
                      <div key={docType.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {docType.label} {docType.required && <span className="text-red-500">*</span>}
                        </label>

                        {existingDoc ? (
                          <div className={`border rounded-lg p-4 ${getStatusColor(existingDoc.status)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-900">{docType.label}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(existingDoc.status)}
                                    <span className="text-sm">{getStatusText(existingDoc.status)}</span>
                                  </div>
                                  {existingDoc.status === 'rejected' && existingDoc.rejectionReason && (
                                    <p className="text-sm text-red-600 mt-1">
                                      Reason: {existingDoc.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={existingDoc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  View
                                </a>
                                {existingDoc.status !== 'approved' && (
                                  <label className="text-sm text-gray-600 hover:text-gray-700 font-medium cursor-pointer">
                                    {isUploading ? 'Uploading...' : 'Replace'}
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDocumentUpload(docType.id, file);
                                        e.target.value = '';
                                      }}
                                      className="hidden"
                                      disabled={isUploading}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center block cursor-pointer transition-colors ${
                              isUploading
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium text-primary-600">Click to upload</span>
                                </p>
                                <p className="text-xs text-gray-500">{docType.description}</p>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDocumentUpload(docType.id, file);
                                e.target.value = '';
                              }}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        )}

                        {error && (
                          <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {verificationDocuments.length > 0 && verificationDocuments.some((d) => d.status === 'pending') && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Your documents are being reviewed. This typically takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                )}
              </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              {portfolioStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Images className="h-4 w-4" />
                      <span className="text-sm">Projects</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{portfolioStats.totalProjects}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm">Published Photos</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{portfolioStats.publishedPhotos}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">Total Views</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{portfolioStats.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Total Saves</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{portfolioStats.totalSaves.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
                  <p className="text-sm text-gray-600">
                    Showcase your work to attract more clients
                  </p>
                </div>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </button>
              </div>

              {/* Loading State */}
              {portfolioLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              )}

              {/* Empty State */}
              {!portfolioLoading && projects.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Images className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first project to start showcasing your work on the Ideas page.
                  </p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Project
                  </button>
                </div>
              )}

              {/* Viewing a Project's Photos */}
              {viewingProject ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <button
                        onClick={() => setViewingProject(null)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2"
                      >
                        ← Back to Projects
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">{viewingProject.name}</h3>
                      <p className="text-sm text-gray-600">{viewingProject.description}</p>
                    </div>
                  </div>
                  <PhotoManager
                    project={viewingProject}
                    onClose={() => setViewingProject(null)}
                    onProjectUpdate={handleProjectUpdate}
                  />
                </div>
              ) : (
                /* Project List */
                !portfolioLoading && projects.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={openEditModal}
                        onDelete={handleDeleteProject}
                        onViewPhotos={setViewingProject}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Pro Tip */}
              {!portfolioLoading && projects.length > 0 && !viewingProject && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary-900">
                      <p className="font-medium mb-1">Pro Tip</p>
                      <p className="text-neutral-900">
                        Professionals with 10+ photos get 3x more quote requests. Add before & after photos to showcase your transformation skills.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Modal */}
          {showProjectModal && (
            <ProjectModal
              project={editingProject}
              onClose={closeProjectModal}
              onSave={async (input) => {
                if (editingProject) {
                  await handleUpdateProject(input as UpdateProProjectInput);
                } else {
                  await handleCreateProject(input as CreateProProjectInput);
                }
              }}
            />
          )}

          {/* Save Button (not shown for verification or availability or portfolio - they have their own) */}
          {activeTab !== 'verification' && activeTab !== 'availability' && activeTab !== 'portfolio' && (
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
