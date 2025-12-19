/**
 * Pro Profile Screen
 * Displays detailed professional profile with tabs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getProProfile, getProReviews, ProProfile, Review } from '../../../src/services/pro';
import { VerificationBadges } from '../../../src/components/pro/VerificationBadges';
import { ProfileStats } from '../../../src/components/pro/ProfileStats';
import { Button } from '../../../src/components/ui';
import { useLeadFormStore } from '../../../src/store/leadFormStore';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'about' | 'services' | 'reviews' | 'portfolio';

export default function ProProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const { setTargetProfessionalId, reset: resetLeadForm } = useLeadFormStore();

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [profileData, reviewsData] = await Promise.all([
        getProProfile(id),
        getProReviews(id, { limit: 10 }).catch(() => ({ reviews: [] })),
      ]);

      setProfile(profileData);
      setReviews(reviewsData.reviews || []);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!profile) return;

    try {
      await Share.share({
        title: profile.businessName,
        message: `Check out ${profile.businessName} on Homezy!`,
        // In production, this would be a deep link or web URL
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleRequestQuote = () => {
    if (!id) return;
    resetLeadForm();
    setTargetProfessionalId(id);
    router.push('/(homeowner)/create-request/');
  };

  const formatCategory = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.photoContainer}>
            {profile.portfolio?.[0]?.images?.[0] ? (
              <Image
                source={{ uri: profile.portfolio[0].images[0] }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="business" size={40} color={colors.text.tertiary} />
              </View>
            )}
          </View>

          <Text style={styles.businessName}>{profile.businessName}</Text>

          <VerificationBadges
            verificationStatus={profile.verificationStatus}
            size="md"
          />

          {profile.tagline && (
            <Text style={styles.tagline}>{profile.tagline}</Text>
          )}

          <ProfileStats
            rating={profile.rating}
            reviewCount={profile.reviewCount}
            responseTimeHours={profile.responseTime}
            projectsCompleted={profile.completedJobs}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Request Quote"
              onPress={handleRequestQuote}
              fullWidth
              leftIcon={<Ionicons name="chatbubble-outline" size={18} color="#fff" />}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {(['about', 'services', 'reviews', 'portfolio'] as TabType[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'about' && (
            <AboutTab profile={profile} />
          )}
          {activeTab === 'services' && (
            <ServicesTab profile={profile} formatCategory={formatCategory} />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab reviews={reviews} />
          )}
          {activeTab === 'portfolio' && (
            <PortfolioTab portfolio={profile.portfolio || []} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// About Tab Component
function AboutTab({ profile }: { profile: ProProfile }) {
  return (
    <View style={styles.tabSection}>
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Details</Text>
        <View style={styles.detailsList}>
          {profile.yearsInBusiness && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>
                {profile.yearsInBusiness} year{profile.yearsInBusiness !== 1 ? 's' : ''} in business
              </Text>
            </View>
          )}
          {profile.employeeCount && (
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>
                Team of {profile.employeeCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.socialLinks}>
            {profile.socialLinks.website && (
              <TouchableOpacity style={styles.socialLink}>
                <Ionicons name="globe-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.socialLinkText}>Website</Text>
              </TouchableOpacity>
            )}
            {profile.socialLinks.instagram && (
              <TouchableOpacity style={styles.socialLink}>
                <Ionicons name="logo-instagram" size={20} color={colors.primary[500]} />
                <Text style={styles.socialLinkText}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// Services Tab Component
function ServicesTab({ profile, formatCategory }: { profile: ProProfile; formatCategory: (cat: string) => string }) {
  return (
    <View style={styles.tabSection}>
      {profile.services && profile.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesList}>
            {profile.services.map((service, index) => (
              <View key={index} style={styles.serviceBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                <Text style={styles.serviceText}>{formatCategory(service)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.serviceAreas && profile.serviceAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Areas</Text>
          <View style={styles.areasList}>
            {profile.serviceAreas.map((area, index) => (
              <View key={index} style={styles.areaBadge}>
                <Ionicons name="location" size={14} color={colors.primary[500]} />
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabSection}>
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>
                  {review.homeownerName?.charAt(0) || 'U'}
                </Text>
              </View>
              <View>
                <Text style={styles.reviewerName}>{review.homeownerName || 'Anonymous'}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.reviewRating}>
              <Ionicons name="star" size={14} color={colors.warning[500]} />
              <Text style={styles.reviewRatingText}>{review.overallRating.toFixed(1)}</Text>
            </View>
          </View>
          {review.reviewText && (
            <Text style={styles.reviewText}>{review.reviewText}</Text>
          )}
          {review.jobCategory && (
            <Text style={styles.reviewCategory}>
              Service: {review.jobCategory}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// Portfolio Tab Component
function PortfolioTab({ portfolio }: { portfolio: any[] }) {
  if (portfolio.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Ionicons name="images-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyText}>No portfolio items yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabSection}>
      {portfolio.map((item, index) => (
        <View key={item.id || index} style={styles.portfolioCard}>
          {item.images && item.images.length > 0 && (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.portfolioImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.portfolioInfo}>
            <Text style={styles.portfolioTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.portfolioDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {item.category && (
              <View style={styles.portfolioMeta}>
                <Ionicons name="folder-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.portfolioMetaText}>{item.category}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  shareButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
    gap: spacing[3],
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...textStyles.button,
    color: '#fff',
  },
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    padding: layout.screenPadding,
    gap: spacing[3],
    backgroundColor: colors.background.primary,
  },
  photoContainer: {
    marginBottom: spacing[2],
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessName: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  tagline: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
    marginTop: spacing[2],
  },
  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
  },
  tab: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginRight: spacing[2],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  // Tab Content
  tabContent: {
    minHeight: 300,
  },
  tabSection: {
    padding: layout.screenPadding,
    gap: spacing[6],
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  detailsList: {
    gap: spacing[3],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  detailText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  socialLinkText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
    fontWeight: '500',
  },
  // Services
  servicesList: {
    gap: spacing[2],
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  serviceText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  areasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
  },
  areaText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
  },
  // Reviews
  reviewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    ...textStyles.body,
    color: colors.primary[700],
    fontWeight: '600',
  },
  reviewerName: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  reviewDate: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewRatingText: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  reviewText: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  reviewCategory: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  // Portfolio
  portfolioCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: 200,
  },
  portfolioInfo: {
    padding: spacing[4],
    gap: spacing[2],
  },
  portfolioTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  portfolioDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  portfolioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  portfolioMetaText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  // Empty State
  emptyTab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[3],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
});
