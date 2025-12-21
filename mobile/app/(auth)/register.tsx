/**
 * Register screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/ui';
import { colors } from '../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../src/theme/spacing';
import { textStyles } from '../../src/theme/typography';
import { useAuthStore } from '../../src/store/authStore';
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth';

type UserRole = 'homeowner' | 'pro';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [role, setRole] = useState<UserRole>('homeowner');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Google auth with selected role
  const {
    signIn: googleSignIn,
    isLoading: googleLoading,
    error: googleError,
    isConfigured: googleConfigured,
  } = useGoogleAuth({ role });

  // Navigate after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });
      // Navigate to appropriate dashboard based on role
      router.replace('/');
    } catch (err) {
      // Error is already set in store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Homezy and start your home improvement journey
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'homeowner' && styles.roleOptionActive,
              ]}
              onPress={() => setRole('homeowner')}
            >
              <Ionicons
                name="home-outline"
                size={24}
                color={role === 'homeowner' ? colors.primary[600] : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.roleText,
                  role === 'homeowner' && styles.roleTextActive,
                ]}
              >
                Homeowner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'pro' && styles.roleOptionActive,
              ]}
              onPress={() => setRole('pro')}
            >
              <Ionicons
                name="construct-outline"
                size={24}
                color={role === 'pro' ? colors.primary[600] : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.roleText,
                  role === 'pro' && styles.roleTextActive,
                ]}
              >
                Professional
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign Up */}
          {googleError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{googleError}</Text>
            </View>
          )}
          <Button
            title={`Continue with Google as ${role === 'homeowner' ? 'Homeowner' : 'Professional'}`}
            variant="outline"
            onPress={googleSignIn}
            loading={googleLoading}
            disabled={!googleConfigured || isLoading}
            fullWidth
            leftIcon={
              <Ionicons name="logo-google" size={20} color={colors.text.primary} />
            }
            style={styles.googleButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or register with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Ionicons name="close" size={20} color={colors.error[500]} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                  required
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                  required
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />
              }
            />

            <Input
              label="Phone (Optional)"
              placeholder="+971 50 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon={
                <Ionicons name="call-outline" size={20} color={colors.text.tertiary} />
              }
            />

            <Input
              label="Password"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              required
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />
              }
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              required
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />
              }
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPadding,
  },
  backButton: {
    marginBottom: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  roleOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  roleText: {
    ...textStyles.label,
    color: colors.text.tertiary,
  },
  roleTextActive: {
    color: colors.primary[600],
  },
  googleButton: {
    marginBottom: spacing[4],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginHorizontal: spacing[3],
  },
  form: {
    marginBottom: spacing[4],
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  nameField: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error[700],
    flex: 1,
    marginRight: spacing[2],
  },
  button: {
    marginTop: spacing[2],
  },
  terms: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  termsLink: {
    color: colors.primary[600],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[1],
  },
  footerText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  footerLink: {
    ...textStyles.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
