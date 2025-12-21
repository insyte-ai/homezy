/**
 * Search Bar Component
 * Autocomplete service search for the dashboard
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { searchServices, SubService } from '../../services/services';

interface SearchBarProps {
  onServiceSelect: (service: SubService) => void;
  placeholder?: string;
}

export function SearchBar({ onServiceSelect, placeholder = 'What do you need help with?' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchServices(text);
        setResults(data);
      } catch (err) {
        if (__DEV__) console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (service: SubService) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    Keyboard.dismiss();
    onServiceSelect(service);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    setShowResults(false);
    Keyboard.dismiss();
  };

  const renderResult = ({ item }: { item: SubService }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      <View style={styles.resultIcon}>
        <Ionicons name="construct-outline" size={20} color={colors.primary[500]} />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.name}</Text>
        {item.category && (
          <Text style={styles.resultCategory}>{item.category}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={colors.text.tertiary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalContent}>
            {/* Search Input in Modal */}
            <View style={styles.modalInputContainer}>
              <Ionicons name="search" size={20} color={colors.text.tertiary} />
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.text.tertiary}
                value={query}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                  <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Results List */}
            <View style={styles.resultsContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderResult}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                />
              ) : query.length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={32} color={colors.text.tertiary} />
                  <Text style={styles.emptyText}>No services found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              ) : (
                <View style={styles.hintContainer}>
                  <Ionicons name="bulb-outline" size={24} color={colors.primary[500]} />
                  <Text style={styles.hintText}>
                    Type at least 2 characters to search for services
                  </Text>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container for search bar
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    padding: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    marginTop: 50,
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultsContainer: {
    minHeight: 150,
    maxHeight: 350,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  resultCategory: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[2],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  hintText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  closeButton: {
    padding: spacing[4],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  closeButtonText: {
    ...textStyles.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
});

export default SearchBar;
