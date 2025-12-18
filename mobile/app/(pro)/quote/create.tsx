/**
 * Submit Quote Screen
 * Professional creates a quote for a claimed lead
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { getLeadById, Lead } from '../../../src/services/leads';
import { submitQuote } from '../../../src/services/quotes';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Item categories
const ITEM_CATEGORIES = [
  { id: 'labor', label: 'Labor', icon: 'person' },
  { id: 'materials', label: 'Materials', icon: 'cube' },
  { id: 'permits', label: 'Permits', icon: 'document' },
  { id: 'equipment', label: 'Equipment', icon: 'construct' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
] as const;

type ItemCategory = typeof ITEM_CATEGORIES[number]['id'];

interface QuoteItem {
  id: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export default function CreateQuoteScreen() {
  const { leadId } = useLocalSearchParams<{ leadId: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', category: 'labor', quantity: 1, unitPrice: 0 },
  ]);
  const [approach, setApproach] = useState('');
  const [warranty, setWarranty] = useState('');
  const [questions, setQuestions] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [completionDate, setCompletionDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    if (!leadId) {
      setError('No lead specified');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const leadData = await getLeadById(leadId);
      setLead(leadData);
    } catch (err) {
      console.error('Error loading lead:', err);
      setError('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Alert.alert(
      'Discard Quote?',
      'Are you sure you want to discard this quote? Your changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  // Quote items management
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        category: 'labor',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      Alert.alert('Error', 'You must have at least one item in your quote.');
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vat = subtotal * 0.05; // 5% VAT
  const total = subtotal + vat;

  // Duration calculation
  const durationDays = Math.ceil(
    (completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleSubmit = async () => {
    // Validation
    if (!lead) return;

    const invalidItems = items.filter(
      (item) => !item.description.trim() || item.unitPrice <= 0
    );
    if (invalidItems.length > 0) {
      Alert.alert('Error', 'Please fill in all item descriptions and prices.');
      return;
    }

    if (!approach.trim()) {
      Alert.alert('Error', 'Please describe your approach for this project.');
      return;
    }

    if (durationDays <= 0) {
      Alert.alert('Error', 'Completion date must be after start date.');
      return;
    }

    try {
      setIsSubmitting(true);

      await submitQuote(lead.id, {
        estimatedStartDate: startDate.toISOString(),
        estimatedCompletionDate: completionDate.toISOString(),
        estimatedDurationDays: durationDays,
        items: items.map((item) => ({
          description: item.description,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
        approach: approach.trim(),
        warranty: warranty.trim() || undefined,
        questions: questions.trim() || undefined,
      });

      Alert.alert(
        'Quote Submitted!',
        'Your quote has been sent to the homeowner. You\'ll be notified when they respond.',
        [{ text: 'OK', onPress: () => router.replace('/(pro)/(tabs)/quotes') }]
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to submit quote. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Quote</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lead) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Quote</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Lead not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Quote</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lead Summary */}
          <View style={styles.leadSummary}>
            <Text style={styles.leadCategory}>{lead.category}</Text>
            <Text style={styles.leadTitle}>{lead.title}</Text>
          </View>

          {/* Timeline Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.fieldLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.text.tertiary} />
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateField}>
                <Text style={styles.fieldLabel}>Completion Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.text.tertiary} />
                  <Text style={styles.dateText}>{formatDate(completionDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={16} color={colors.primary[600]} />
              <Text style={styles.durationText}>
                Estimated duration: {durationDays} day{durationDays !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Quote Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quote Items</Text>
              <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                <Ionicons name="add" size={20} color={colors.primary[600]} />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNumber}>Item {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeItemButton}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Category Selection */}
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        item.category === cat.id && styles.categoryChipActive,
                      ]}
                      onPress={() => updateItem(item.id, 'category', cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={item.category === cat.id ? '#fff' : colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          item.category === cat.id && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Description */}
                <Text style={styles.fieldLabel}>Description *</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.description}
                  onChangeText={(text) => updateItem(item.id, 'description', text)}
                  placeholder="e.g., Full bathroom renovation labor"
                  placeholderTextColor={colors.text.tertiary}
                />

                {/* Quantity & Price */}
                <View style={styles.priceRow}>
                  <View style={styles.quantityField}>
                    <Text style={styles.fieldLabel}>Qty</Text>
                    <TextInput
                      style={styles.numberInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) =>
                        updateItem(item.id, 'quantity', parseInt(text) || 0)
                      }
                      keyboardType="number-pad"
                      placeholder="1"
                      placeholderTextColor={colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Unit Price (AED) *</Text>
                    <TextInput
                      style={styles.numberInput}
                      value={item.unitPrice > 0 ? item.unitPrice.toString() : ''}
                      onChangeText={(text) =>
                        updateItem(item.id, 'unitPrice', parseFloat(text) || 0)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.totalField}>
                    <Text style={styles.fieldLabel}>Total</Text>
                    <Text style={styles.itemTotal}>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                </View>

                {/* Notes (optional) */}
                <Text style={styles.fieldLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.notes}
                  onChangeText={(text) => updateItem(item.id, 'notes', text)}
                  placeholder="Additional details about this item..."
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            ))}
          </View>

          {/* Approach Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Approach *</Text>
            <Text style={styles.sectionDescription}>
              Describe how you'll complete this project and what sets you apart.
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={approach}
              onChangeText={setApproach}
              placeholder="Explain your methodology, experience with similar projects, and why the homeowner should choose you..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Warranty Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warranty (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={warranty}
              onChangeText={setWarranty}
              placeholder="e.g., 1-year warranty on labor, 2-year warranty on materials"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* Questions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions for Homeowner (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={questions}
              onChangeText={setQuestions}
              placeholder="Any questions you need answered before starting work..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Quote Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Quote Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (5%)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(vat)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Quote</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={completionDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowEndPicker(false);
              if (date) setCompletionDate(date);
            }}
          />
        )}
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
  headerTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
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
    paddingHorizontal: layout.screenPadding,
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  leadSummary: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  leadCategory: {
    ...textStyles.caption,
    color: colors.primary[600],
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  leadTitle: {
    ...textStyles.h4,
    color: colors.primary[800],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  sectionDescription: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  addItemText: {
    ...textStyles.bodySmall,
    color: colors.primary[600],
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dateText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  durationText: {
    ...textStyles.bodySmall,
    color: colors.primary[700],
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  itemNumber: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  removeItemButton: {
    padding: spacing[1],
  },
  categoryScroll: {
    marginBottom: spacing[3],
    marginLeft: -spacing[1],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing[2],
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryChipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  textArea: {
    minHeight: 100,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  quantityField: {
    width: 70,
  },
  priceField: {
    flex: 1,
  },
  totalField: {
    width: 100,
  },
  numberInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...textStyles.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  itemTotal: {
    ...textStyles.body,
    color: colors.primary[600],
    fontWeight: '600',
    padding: spacing[3],
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
    marginTop: spacing[2],
    marginBottom: 0,
  },
  summaryLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  summaryLabelTotal: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  summaryValueTotal: {
    ...textStyles.h3,
    color: colors.primary[600],
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: spacing[6],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primary[300],
  },
  submitButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
});
