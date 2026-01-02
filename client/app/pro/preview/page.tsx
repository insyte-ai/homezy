'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  Users,
  Globe,
  Award,
  Shield,
  Eye,
  Images,
} from 'lucide-react';
import { getMyProfilePreview } from '@/lib/services/professional';
import { listProjects } from '@/lib/services/projects';
import { VerificationBadges } from '@/components/pro/VerificationBadges';
import { ProfileStats } from '@/components/pro/ProfileStats';
import type { ProProject } from '@homezy/shared';
import toast from 'react-hot-toast';

export default function ProfilePreviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<ProProject[]>([]);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, projectsData] = await Promise.all([
        getMyProfilePreview(),
        listProjects(),
      ]);
      setProfile(profileData.professional);
      setProjects(projectsData.projects);
    } catch (error: any) {
      console.error('Failed to load profile preview:', error);
      toast.error('Unable to load profile preview');
      router.push('/pro/dashboard/profile');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-6 sm:py-8">
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 mb-4 mx-auto sm:mx-0"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 sm:w-96 mb-6 mx-auto sm:mx-0"></div>
                  <div className="flex gap-4 justify-center sm:justify-start">
                    <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 sm:w-32"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 sm:w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-custom py-6 sm:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const { proProfile } = profile;
  const sections = ['about', 'services', 'portfolio', 'verification'];

  // Helper to check if URL is localhost
  const isLocalhostUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Mode Banner */}
      <div className="bg-primary-600 text-white">
        <div className="container-custom py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">Preview Mode - This is how homeowners will see your profile</span>
                <span className="sm:hidden">Preview Mode</span>
              </span>
            </div>
            <Link
              href="/pro/dashboard/profile"
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Profile Photo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {profile.businessName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profile.businessName}
                </h1>
                {proProfile.tagline && (
                  <p className="text-base sm:text-lg text-gray-600 mb-3">{proProfile.tagline}</p>
                )}
              </div>

              {/* Verification & Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4">
                <VerificationBadges
                  verificationStatus={proProfile.verificationStatus}
                  size="md"
                />
                {proProfile.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    <span className="font-semibold text-sm sm:text-base">
                      {proProfile.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 text-sm sm:text-base">
                      ({proProfile.reviewCount} reviews)
                    </span>
                  </div>
                )}
                {proProfile.responseTimeHours < 24 && (
                  <div className="flex items-center gap-1 text-primary-600 text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Responds in ~{proProfile.responseTimeHours} hours</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {proProfile.serviceAreas && proProfile.serviceAreas.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mb-4 text-sm sm:text-base">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Serves {proProfile.serviceAreas.map((area: any) => area.emirate).join(', ')}
                  </span>
                </div>
              )}

              {/* Preview Note */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <div className="px-3 sm:px-4 py-2 bg-primary-50 text-neutral-900 rounded-lg text-xs sm:text-sm border border-primary-200">
                  <span className="font-medium">Note:</span> Once verified, homeowners will see "Request Quote" and "Share" buttons here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom overflow-x-auto">
          <nav className="flex gap-4 sm:gap-6 lg:gap-8 min-w-max">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium transition capitalize text-sm sm:text-base whitespace-nowrap ${
                  activeSection === section
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container-custom py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About Section */}
            {activeSection === 'about' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About</h2>
                {proProfile.bio ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {proProfile.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-sm sm:text-base">
                    No description provided yet.
                  </p>
                )}

                {/* Business Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  {proProfile.yearsInBusiness && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Years in Business</p>
                        <p className="font-semibold text-gray-900">
                          {proProfile.yearsInBusiness} years
                        </p>
                      </div>
                    </div>
                  )}
                  {proProfile.teamSize && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="font-semibold text-gray-900">
                          {proProfile.teamSize} {proProfile.teamSize === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>
                  )}
                  {proProfile.languages && proProfile.languages.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Languages</p>
                        <p className="font-semibold text-gray-900">
                          {proProfile.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    {proProfile.businessType && (
                      <div>
                        <p className="text-sm text-gray-600">Business Type</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {proProfile.businessType.replace('-', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Services Section */}
            {activeSection === 'services' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Services Offered
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {proProfile.categories.map((category: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 sm:p-3 bg-primary-50 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{category}</span>
                    </div>
                  ))}
                </div>

                {/* Service Areas */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    Service Areas
                  </h3>
                  {proProfile.serviceAreas.map((area: any, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {area.emirate}
                        </span>
                      </div>
                      {area.neighborhoods && area.neighborhoods.length > 0 && (
                        <div className="ml-6 sm:ml-7 flex flex-wrap gap-1.5 sm:gap-2">
                          {area.neighborhoods.map((neighborhood: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded"
                            >
                              {neighborhood}
                            </span>
                          ))}
                        </div>
                      )}
                      {area.serviceRadius && (
                        <p className="ml-6 sm:ml-7 text-xs sm:text-sm text-gray-600 mt-1">
                          Service radius: {area.serviceRadius} km
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pricing Info */}
                {(proProfile.hourlyRateMin || proProfile.minimumProjectSize) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                    {proProfile.hourlyRateMin && (
                      <p className="text-gray-700 mb-2 text-sm sm:text-base">
                        <span className="font-medium">Hourly Rate:</span> AED{' '}
                        {proProfile.hourlyRateMin}
                        {proProfile.hourlyRateMax &&
                          proProfile.hourlyRateMax !== proProfile.hourlyRateMin &&
                          ` - ${proProfile.hourlyRateMax}`}{' '}
                        per hour
                      </p>
                    )}
                    {proProfile.minimumProjectSize && (
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-medium">Minimum Project:</span> AED{' '}
                        {proProfile.minimumProjectSize.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Section */}
            {activeSection === 'portfolio' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Portfolio</h2>
                {projects.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {projects.map((project) => {
                      const publishedPhotos = project.photos.filter(p => p.isPublishedToIdeas);
                      return (
                        <div
                          key={project.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Project Header */}
                          <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {project.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  {project.serviceCategory} • Completed {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              {publishedPhotos.length > 0 && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium w-fit">
                                  {publishedPhotos.length} on Ideas
                                </span>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-gray-700 mt-3 text-sm sm:text-base">{project.description}</p>
                            )}
                          </div>

                          {/* Project Photos */}
                          <div className="p-3 sm:p-4">
                            {project.photos.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {project.photos.slice(0, 8).map((photo) => (
                                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative">
                                    <Image
                                      src={photo.thumbnailUrl || photo.imageUrl}
                                      alt={photo.caption || project.name}
                                      fill
                                      className="object-cover"
                                      unoptimized={isLocalhostUrl(photo.thumbnailUrl || photo.imageUrl)}
                                    />
                                    {photo.photoType !== 'main' && (
                                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded capitalize">
                                        {photo.photoType}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {project.photos.length > 8 && (
                                  <div className="aspect-square rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                      +{project.photos.length - 8} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No photos added yet</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Images className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 italic text-sm sm:text-base">
                      No projects yet. Add projects to showcase your work.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Verification Section */}
            {activeSection === 'verification' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Credentials & Verification
                </h2>

                <div className="space-y-4">
                  {/* Verification Status */}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary-50 rounded-lg">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        Verification Status
                      </h3>
                      <VerificationBadges
                        verificationStatus={proProfile.verificationStatus}
                        size="md"
                      />
                      {proProfile.verificationStatus === 'comprehensive' && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2">
                          This professional has completed comprehensive verification including
                          background check, references, and portfolio review.
                        </p>
                      )}
                      {proProfile.verificationStatus === 'basic' && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2">
                          This professional has verified their business license and insurance
                          coverage.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Verified Documents */}
                  {proProfile.verificationDocuments &&
                    proProfile.verificationDocuments.some(
                      (doc: any) => doc.status === 'approved'
                    ) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                          Verified Documents
                        </h3>
                        <div className="space-y-2">
                          {proProfile.verificationDocuments
                            .filter((doc: any) => doc.status === 'approved')
                            .map((doc: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg"
                              >
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                <span className="text-gray-900 capitalize text-sm sm:text-base">
                                  {doc.type.replace('-', ' ')} Verified
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Professional Stats</h3>
              <ProfileStats
                rating={proProfile.rating}
                reviewCount={proProfile.reviewCount}
                responseTimeHours={proProfile.responseTimeHours}
                projectsCompleted={proProfile.projectsCompleted}
                quoteAcceptanceRate={proProfile.quoteAcceptanceRate}
                layout="vertical"
              />
            </div>

            {/* Preview Note */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary-900">Preview Mode</h3>
              <p className="text-primary-700 text-xs sm:text-sm mb-3 sm:mb-4">
                Once verified, homeowners will see a "Request Quote" button here to contact you directly.
              </p>
              <Link
                href="/pro/dashboard/profile"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-sm sm:text-base w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
