/**
 * Edit Business Profile Screen
 * Allows professionals to edit their business information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/store/authStore';
import { getMyProfile, updateProfile, ProProfile } from '../../../src/services/pro';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProProfile | null>(null);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data.profile);
      setBusinessName(data.profile.businessName || '');
      setPhone(data.profile.phone || '');
      setBio(data.profile.bio || '');
      setTagline(data.profile.tagline || '');
      setYearsInBusiness(data.profile.yearsInBusiness?.toString() || '');
      setEmployeeCount(data.profile.employeeCount?.toString() || '');
      setWebsite(data.profile.socialLinks?.website || '');
      setInstagram(data.profile.socialLinks?.instagram || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        businessName: businessName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        tagline: tagline.trim(),
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness, 10) : undefined,
        employeeCount: employeeCount ? parseInt(employeeCount, 10) : undefined,
        socialLinks: {
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
        },
      });

      // Update user in auth store
      if (user) {
        setUser({
          ...user,
          proProfile: {
            ...user.proProfile,
            businessName: businessName.trim(),
          },
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <Input
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Your business name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tagline</Text>
            <Input
              value={tagline}
              onChangeText={setTagline}
              placeholder="A brief tagline for your business"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="+971 XX XXX XXXX"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell customers about your business..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Years in Business</Text>
              <Input
                value={yearsInBusiness}
                onChangeText={setYearsInBusiness}
                placeholder="e.g. 5"
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Team Size</Text>
              <Input
                value={employeeCount}
                onChangeText={setEmployeeCount}
                placeholder="e.g. 10"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Online Presence</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <Input
              value={website}
              onChangeText={setWebsite}
              placeholder="https://www.example.com"
              keyboardType="url"
              autoCapitalize="none"
              leftIcon="globe-outline"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <Input
              value={instagram}
              onChangeText={setInstagram}
              placeholder="@yourbusiness"
              autoCapitalize="none"
              leftIcon="logo-instagram"
            />
          </View>
        </Card>

        {/* Stats (read-only) */}
        {profile && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.reviewCount}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.completedJobs}</Text>
                <Text style={styles.statLabel}>Jobs</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={isSaving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: layout.screenPadding,
  },
  section: {
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  label: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfWidth: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.primary[600],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  buttonContainer: {
    marginBottom: spacing[8],
  },
});
