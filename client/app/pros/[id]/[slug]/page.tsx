'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Clock,
  Share2,
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
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { getPublicProfile } from '@/lib/services/professional';
import { getProfessionalReviews, type Review } from '@/lib/services/reviews';
import { VerificationBadges } from '@/components/pro/VerificationBadges';
import { ProfileStats } from '@/components/pro/ProfileStats';
import { MultiStepLeadForm } from '@/components/lead-form/MultiStepLeadForm';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id, slug } = params as { id: string; slug: string };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [showLeadForm, setShowLeadForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (activeSection === 'reviews' && reviews.length === 0 && !reviewsLoading) {
      fetchReviews();
    }
  }, [activeSection]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getProfessionalReviews(id);
      setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getPublicProfile(id);
      setProfile(data.professional);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load professional profile');
      // Redirect to 404 or professionals search page
      router.push('/pros');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.businessName || 'Professional Profile',
          text: profile?.proProfile?.tagline || 'Check out this professional on Homezy',
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const handleRequestQuote = () => {
    setShowLeadForm(true);
  };

  // Generate SEO metadata
  const generateSEO = () => {
    if (!profile || !profile.proProfile) return null;

    const proProfile = profile.proProfile;
    const primaryEmirate = proProfile.serviceAreas?.[0]?.emirate || 'UAE';
    const primaryCategory = proProfile.categories?.[0] || 'Home Services';
    const title = `${profile.businessName} - ${primaryCategory} in ${primaryEmirate} | Homezy`;
    const description = proProfile.bio
      ? proProfile.bio.substring(0, 160)
      : `${profile.businessName} is a ${proProfile.verificationStatus === 'comprehensive' ? 'verified' : ''} professional offering ${primaryCategory} services in ${primaryEmirate}. ${proProfile.rating > 0 ? `Rated ${proProfile.rating}/5 stars.` : ''}`;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const imageUrl = profile.profilePhoto || '';

    return {
      title,
      description,
      url,
      imageUrl,
      keywords: [
        ...proProfile.categories,
        primaryEmirate,
        profile.businessName,
        'home services',
        'UAE professionals',
      ].join(', '),
    };
  };

  // Generate structured data (JSON-LD)
  const generateStructuredData = () => {
    if (!profile || !profile.proProfile) return null;

    const proProfile = profile.proProfile;
    const primaryEmirate = proProfile.serviceAreas?.[0]?.emirate || '';
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': typeof window !== 'undefined' ? window.location.href : '',
      name: profile.businessName,
      image: profile.profilePhoto || '',
      description: proProfile.bio || `Professional ${proProfile.categories?.[0]} services in ${primaryEmirate}`,
      priceRange: proProfile.hourlyRateMin && proProfile.hourlyRateMax
        ? `AED ${proProfile.hourlyRateMin} - AED ${proProfile.hourlyRateMax}`
        : undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: primaryEmirate,
        addressCountry: 'AE',
      },
      ...(proProfile.rating > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: proProfile.rating,
          reviewCount: proProfile.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      ...(proProfile.yearsInBusiness && {
        foundingDate: new Date().getFullYear() - proProfile.yearsInBusiness,
      }),
      ...(proProfile.teamSize && {
        numberOfEmployees: proProfile.teamSize,
      }),
      ...(proProfile.languages && proProfile.languages.length > 0 && {
        knowsLanguage: proProfile.languages,
      }),
      serviceArea: proProfile.serviceAreas?.map((area: any) => ({
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          addressLocality: area.emirate,
          addressCountry: 'AE',
        },
        ...(area.serviceRadius && {
          geoRadius: `${area.serviceRadius}km`,
        }),
      })) || [],
      areaServed: proProfile.serviceAreas?.map((area: any) => ({
        '@type': 'City',
        name: area.emirate,
      })) || [],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: proProfile.categories?.map((category: string, index: number) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: category,
            position: index + 1,
          },
        })) || [],
      },
    };

    return structuredData;
  };

  const seo = generateSEO();
  const structuredData = generateStructuredData();

  if (loading) {
    return (
      <>
        <PublicHeader />
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
        <PublicFooter />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Professional not found</p>
        </div>
        <PublicFooter />
      </>
    );
  }

  const { proProfile } = profile;
  const sections = ['about', 'services', 'reviews', 'portfolio', 'verification'];

  return (
    <>
      {/* SEO Meta Tags */}
      {seo && (
        <Head>
          {/* Primary Meta Tags */}
          <title>{seo.title}</title>
          <meta name="title" content={seo.title} />
          <meta name="description" content={seo.description} />
          <meta name="keywords" content={seo.keywords} />
          <link rel="canonical" href={seo.url} />

          {/* Robots Meta */}
          <meta
            name="robots"
            content={proProfile.verificationStatus === 'approved' ? 'index, follow' : 'noindex, nofollow'}
          />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="profile" />
          <meta property="og:url" content={seo.url} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          {seo.imageUrl && <meta property="og:image" content={seo.imageUrl} />}
          <meta property="og:site_name" content="Homezy" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={seo.url} />
          <meta property="twitter:title" content={seo.title} />
          <meta property="twitter:description" content={seo.description} />
          {seo.imageUrl && <meta property="twitter:image" content={seo.imageUrl} />}
        </Head>
      )}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <PublicHeader />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href="/pros"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Browse Professionals
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{profile.businessName}</span>
          </nav>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Photo */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={`${profile.businessName} - ${proProfile.categories?.[0] || 'Professional'} in ${proProfile.serviceAreas?.[0]?.emirate || 'UAE'}`}
                  className="w-full h-full object-cover"
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
                  <div className="flex items-center gap-1 text-blue-600 text-sm">
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRequestQuote}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  Request Quote
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
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
                    ? 'border-blue-600 text-blue-600'
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
                      <Briefcase className="h-5 w-5 text-blue-600" />
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
                      <Users className="h-5 w-5 text-blue-600" />
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
                      <Globe className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Languages</p>
                        <p className="font-semibold text-gray-900">
                          {proProfile.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {proProfile.businessType && (
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Business Type</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {proProfile.businessType.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}
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
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-blue-600" />
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
                        <MapPin className="h-5 w-5 text-blue-600" />
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

            {/* Reviews Section */}
            {activeSection === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Customer Reviews
                  {proProfile.reviewCount > 0 && (
                    <span className="text-lg font-normal text-gray-500 ml-2">
                      ({proProfile.reviewCount})
                    </span>
                  )}
                </h2>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border-b border-gray-100 pb-4">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Be the first to leave a review after completing a project
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Average Rating Summary */}
                    {proProfile.rating > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">
                              {proProfile.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(proProfile.rating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {proProfile.reviewCount} review{proProfile.reviewCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Individual Reviews */}
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.overallRating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">
                                {review.overallRating}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {review.wouldRecommend && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                              <CheckCircle className="h-3 w-3" />
                              Recommends
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4">{review.reviewText}</p>

                        {/* Category Ratings */}
                        {review.categoryRatings && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                            {Object.entries(review.categoryRatings).map(([category, rating]) => (
                              <div key={category} className="flex items-center gap-2">
                                <span className="text-gray-500 capitalize">
                                  {category.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="font-medium text-gray-900">{rating}/5</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Section */}
            {activeSection === 'portfolio' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
                {projects && projects.length > 0 ? (
                  <div className="space-y-8">
                    {projects.map((project: any) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Project Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {project.serviceCategory} • Completed {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-gray-700 mt-3">{project.description}</p>
                          )}
                        </div>

                        {/* Project Photos */}
                        <div className="p-4">
                          {project.photos && project.photos.length > 0 ? (
                            <div className="space-y-4">
                              {/* Main/After Photos */}
                              {(() => {
                                const mainPhotos = project.photos.filter((p: any) => p.photoType === 'main' || p.photoType === 'after');
                                const beforePhotos = project.photos.filter((p: any) => p.photoType === 'before');

                                return (
                                  <>
                                    {mainPhotos.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Project Photos</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                          {mainPhotos.map((photo: any) => (
                                            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                              <div className="relative w-full h-full">
                                                <Image
                                                  src={photo.thumbnailUrl || photo.imageUrl}
                                                  alt={photo.caption || `${project.name} photo`}
                                                  fill
                                                  className="object-cover"
                                                  unoptimized={(photo.thumbnailUrl || photo.imageUrl).includes('localhost')}
                                                />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Before/After Comparison */}
                                    {beforePhotos.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-700 mb-2">Before</h4>
                                          <div className="grid grid-cols-2 gap-2">
                                            {beforePhotos.map((photo: any) => (
                                              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <div className="relative w-full h-full">
                                                  <Image
                                                    src={photo.thumbnailUrl || photo.imageUrl}
                                                    alt={`${project.name} - Before`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={(photo.thumbnailUrl || photo.imageUrl).includes('localhost')}
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        {project.photos.filter((p: any) => p.photoType === 'after').length > 0 && (
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">After</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              {project.photos.filter((p: any) => p.photoType === 'after').map((photo: any) => (
                                                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                  <div className="relative w-full h-full">
                                                    <Image
                                                      src={photo.thumbnailUrl || photo.imageUrl}
                                                      alt={`${project.name} - After`}
                                                      fill
                                                      className="object-cover"
                                                      unoptimized={(photo.thumbnailUrl || photo.imageUrl).includes('localhost')}
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">No photos available</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-12">
                    No portfolio projects yet.
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
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
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

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="font-semibold text-lg mb-3">Ready to get started?</h3>
              <p className="text-blue-50 text-sm mb-4">
                Request a quote and get responses from this professional within hours.
              </p>
              <button
                onClick={handleRequestQuote}
                className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Direct Lead Form */}
    {showLeadForm && (
      <MultiStepLeadForm
        serviceId={proProfile.categories?.[0] || 'general contracting'}
        onClose={() => setShowLeadForm(false)}
        professionalId={id}
        professionalName={profile.businessName}
        professionalPhoto={profile.profilePhoto}
      />
    )}
    <PublicFooter />
    </>
  );
}
