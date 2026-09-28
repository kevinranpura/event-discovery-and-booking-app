import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../constants';
import { EventFilters } from '../types';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: FilterModalProps) {
  const update = (key: keyof EventFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Events</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Category */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isActive = filters.category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => update('category', isActive ? '' : cat.name)}
                    style={[
                      styles.catChip,
                      isActive && styles.catChipActive,
                    ]}
                  >
                    <Ionicons
                      name={cat.iconName as any}
                      size={14}
                      color={isActive ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.catText,
                        isActive && styles.catTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date */}
            <InputField
              label="Date (YYYY-MM-DD)"
              value={filters.date || ''}
              onChangeText={(v) => update('date', v)}
              placeholder="2026-12-31"
              leftIcon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />

            {/* Price Range */}
            <Text style={styles.sectionLabel}>Price Range</Text>
            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Min ($)"
                  value={filters.minPrice || ''}
                  onChangeText={(v) => update('minPrice', v)}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  leftIcon="card-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Max ($)"
                  value={filters.maxPrice || ''}
                  onChangeText={(v) => update('maxPrice', v)}
                  placeholder="500"
                  keyboardType="decimal-pad"
                  leftIcon="card-outline"
                />
              </View>
            </View>

            {/* Location */}
            <InputField
              label="Location / City"
              value={filters.location || ''}
              onChangeText={(v) => update('location', v)}
              placeholder="New York"
              leftIcon="location-outline"
            />
          </ScrollView>

          {/* Actions */}
          <View style={styles.footer}>
            <PrimaryButton
              title="Clear All"
              onPress={onClear}
              variant="secondary"
              fullWidth={false}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title="Apply Filters"
              onPress={onApply}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
  },
  content: { padding: 20, paddingBottom: 10 },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  catText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  catTextActive: { color: COLORS.primary, fontWeight: '700' },
  priceRow: { flexDirection: 'row', gap: 12 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
});
