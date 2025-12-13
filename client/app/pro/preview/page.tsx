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
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  Briefcase,
  Users,
  Globe,
  Award,
  Shield,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { getMyProfilePreview } from '@/lib/services/professional';
import { VerificationBadges } from '@/components/pro/VerificationBadges';
import { ProfileStats } from '@/components/pro/ProfileStats';
import toast from 'react-hot-toast';

export default function ProfilePreviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfilePreview();
      setProfile(data.professional);
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
          <div className="container-custom py-8">
            <div className="animate-pulse">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
                  <div className="flex gap-4">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-custom py-8">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Mode Banner */}
      <div className="bg-primary-600 text-white">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5" />
              <span className="font-medium">
                Preview Mode - This is how homeowners will see your profile
              </span>
            </div>
            <Link
              href="/pro/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Photo */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {profile.profilePhoto ? (
                <Image
                  src={profile.profilePhoto}
                  alt={profile.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.businessName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.businessName}
                  </h1>
                  {proProfile.tagline && (
                    <p className="text-lg text-gray-600 mb-3">{proProfile.tagline}</p>
                  )}
                </div>
              </div>

              {/* Verification & Stats */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <VerificationBadges
                  verificationStatus={proProfile.verificationStatus}
                  size="md"
                />
                {proProfile.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">
                      {proProfile.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600">
                      ({proProfile.reviewCount} reviews)
                    </span>
                  </div>
                )}
                {proProfile.responseTimeHours < 24 && (
                  <div className="flex items-center gap-1 text-primary-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Responds in ~{proProfile.responseTimeHours} hours</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {proProfile.serviceAreas && proProfile.serviceAreas.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Serves {proProfile.serviceAreas.map((area: any) => area.emirate).join(', ')}
                  </span>
                </div>
              )}

              {/* Preview Note */}
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-primary-50 text-neutral-900 rounded-lg text-sm border border-primary-200">
                  <span className="font-medium">Note:</span> Once verified, homeowners will see "Request Quote" and "Share" buttons here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom">
          <nav className="flex gap-8">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-4 px-2 border-b-2 font-medium transition capitalize ${
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
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {activeSection === 'about' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                {proProfile.bio ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {proProfile.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No description provided yet.
                  </p>
                )}

                {/* Business Details */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  {proProfile.yearsInBusiness && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-primary-600" />
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
                      <Users className="h-5 w-5 text-primary-600" />
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
                      <Globe className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Languages</p>
                        <p className="font-semibold text-gray-900">
                          {proProfile.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary-600" />
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Services Offered
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proProfile.categories.map((category: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                  ))}
                </div>

                {/* Service Areas */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Service Areas
                  </h3>
                  {proProfile.serviceAreas.map((area: any, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary-600" />
                        <span className="font-semibold text-gray-900">
                          {area.emirate}
                        </span>
                      </div>
                      {area.neighborhoods && area.neighborhoods.length > 0 && (
                        <div className="ml-7 flex flex-wrap gap-2">
                          {area.neighborhoods.map((neighborhood: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                            >
                              {neighborhood}
                            </span>
                          ))}
                        </div>
                      )}
                      {area.serviceRadius && (
                        <p className="ml-7 text-sm text-gray-600 mt-1">
                          Service radius: {area.serviceRadius} km
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pricing Info */}
                {(proProfile.hourlyRateMin || proProfile.minimumProjectSize) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                    {proProfile.hourlyRateMin && (
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Hourly Rate:</span> AED{' '}
                        {proProfile.hourlyRateMin}
                        {proProfile.hourlyRateMax &&
                          proProfile.hourlyRateMax !== proProfile.hourlyRateMin &&
                          ` - ${proProfile.hourlyRateMax}`}{' '}
                        per hour
                      </p>
                    )}
                    {proProfile.minimumProjectSize && (
                      <p className="text-gray-700">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
                {proProfile.portfolio && proProfile.portfolio.length > 0 ? (
                  <div className="space-y-8">
                    {proProfile.portfolio.map((item: any, index: number) => (
                      <div
                        key={item.id || index}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Project Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {item.title}
                                {item.isFeatured && (
                                  <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                                    Featured
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.category} • Completed {new Date(item.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-gray-700 mt-3">{item.description}</p>
                          )}
                        </div>

                        {/* Project Images */}
                        <div className="p-4 space-y-4">
                          {/* Main Images */}
                          {item.images && item.images.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Project Photos</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {item.images.map((img: string, imgIndex: number) => (
                                  <div key={imgIndex} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={img}
                                        alt={`${item.title} - Photo ${imgIndex + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized={img.includes('localhost')}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Before/After Images */}
                          {((item.beforeImages && item.beforeImages.length > 0) || (item.afterImages && item.afterImages.length > 0)) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Before Images */}
                              {item.beforeImages && item.beforeImages.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Before</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {item.beforeImages.map((img: string, imgIndex: number) => (
                                      <div key={imgIndex} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <div className="relative w-full h-full">
                                          <Image
                                            src={img}
                                            alt={`${item.title} - Before ${imgIndex + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized={img.includes('localhost')}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* After Images */}
                              {item.afterImages && item.afterImages.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">After</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {item.afterImages.map((img: string, imgIndex: number) => (
                                      <div key={imgIndex} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <div className="relative w-full h-full">
                                          <Image
                                            src={img}
                                            alt={`${item.title} - After ${imgIndex + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized={img.includes('localhost')}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-12">
                    No portfolio items yet.
                  </p>
                )}
              </div>
            )}

            {/* Verification Section */}
            {activeSection === 'verification' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Credentials & Verification
                </h2>

                <div className="space-y-4">
                  {/* Verification Status */}
                  <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-lg">
                    <Shield className="h-6 w-6 text-primary-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Verification Status
                      </h3>
                      <VerificationBadges
                        verificationStatus={proProfile.verificationStatus}
                        size="md"
                      />
                      {proProfile.verificationStatus === 'comprehensive' && (
                        <p className="text-sm text-gray-700 mt-2">
                          This professional has completed comprehensive verification including
                          background check, references, and portfolio review.
                        </p>
                      )}
                      {proProfile.verificationStatus === 'basic' && (
                        <p className="text-sm text-gray-700 mt-2">
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
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Verified Documents
                        </h3>
                        <div className="space-y-2">
                          {proProfile.verificationDocuments
                            .filter((doc: any) => doc.status === 'approved')
                            .map((doc: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                              >
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-gray-900 capitalize">
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
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Professional Stats</h3>
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
            <div className="bg-primary-50 border border-primary-200 rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-3 text-primary-900">Preview Mode</h3>
              <p className="text-primary-700 text-sm mb-4">
                Once verified, homeowners will see a "Request Quote" button here to contact you directly.
              </p>
              <Link
                href="/pro/dashboard/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
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
