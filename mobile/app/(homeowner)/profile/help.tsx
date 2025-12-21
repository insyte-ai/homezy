/**
 * Help & Support Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import Constants from 'expo-constants';

interface HelpItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
}

function HelpItem({ icon, label, description, onPress }: HelpItemProps) {
  return (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.helpIcon}>
        <Ionicons name={icon} size={22} color={colors.primary[500]} />
      </View>
      <View style={styles.helpInfo}>
        <Text style={styles.helpLabel}>{label}</Text>
        {description && <Text style={styles.helpDescription}>{description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.tertiary}
        />
      </View>
      {isExpanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

const FAQ_ITEMS = [
  {
    question: 'How do I request a service?',
    answer:
      'Tap the search bar on the home screen or select a service category. Fill in the details about your project and submit your request. Professionals will review your request and send quotes.',
  },
  {
    question: 'How do I compare quotes?',
    answer:
      'Go to your Service Requests and tap on a request to see all received quotes. Compare prices, reviews, and professional profiles to choose the best fit for your project.',
  },
  {
    question: 'Are the professionals verified?',
    answer:
      'Yes, all professionals on Homezy go through a verification process. Look for the verified badge on their profile. Verified professionals have submitted their trade license and ID documents.',
  },
  {
    question: 'How do payments work?',
    answer:
      'Payments are handled directly between you and the professional. Homezy helps you find and connect with professionals, but payment terms are agreed upon with your chosen professional.',
  },
  {
    question: 'What if I have an issue with a service?',
    answer:
      'Contact the professional directly through the messaging feature. If the issue is not resolved, contact our support team and we will help mediate.',
  },
];

export default function HelpScreen() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleBack = () => {
    router.back();
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@homezy.co?subject=App Support Request');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+97142345678');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/97142345678');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.homezy.co/help');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.sectionContent}>
            <HelpItem
              icon="mail-outline"
              label="Email Support"
              description="support@homezy.co"
              onPress={handleEmail}
            />
            <HelpItem
              icon="call-outline"
              label="Call Us"
              description="+971 4 234 5678"
              onPress={handlePhone}
            />
            <HelpItem
              icon="logo-whatsapp"
              label="WhatsApp"
              description="Message us on WhatsApp"
              onPress={handleWhatsApp}
            />
            <HelpItem
              icon="globe-outline"
              label="Help Center"
              description="Visit our help website"
              onPress={handleWebsite}
            />
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionContent}>
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={32} color={colors.primary[500]} />
          </View>
          <Text style={styles.appName}>Homezy</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
          <Text style={styles.appTagline}>Your home services companion</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    paddingHorizontal: spacing[1],
  },
  sectionContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  helpInfo: {
    flex: 1,
  },
  helpLabel: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  helpDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  faqItem: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
    fontWeight: '500',
  },
  faqAnswer: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[3],
    lineHeight: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  appName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  appVersion: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  appTagline: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
});
