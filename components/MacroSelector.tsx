import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MacroPreference } from '../types';

interface MacroSelectorProps {
  value: MacroPreference;
  onChange: (pref: MacroPreference) => void;
  disabled?: boolean;
}

const OPTIONS: { key: MacroPreference; label: string; emoji: string }[] = [
  { key: 'balanced', label: 'Balanced', emoji: '⚖️' },
  { key: 'protein', label: 'Protein', emoji: '🥩' },
  { key: 'carb', label: 'Carbs', emoji: '🍞' },
  { key: 'fat', label: 'Fat', emoji: '🥑' },
];

export default function MacroSelector({
  value,
  onChange,
  disabled = false,
}: MacroSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>MACRO FOCUS</Text>
      <View style={[styles.row, disabled && styles.rowDisabled]}>
        {OPTIONS.map((opt) => {
          const selected = opt.key === value;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => !disabled && onChange(opt.key)}
              activeOpacity={disabled ? 1 : 0.7}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
            >
              <Text style={styles.pillEmoji}>{opt.emoji}</Text>
              <Text
                style={[styles.pillLabel, selected && styles.pillLabelSelected]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9DB8A7',
    letterSpacing: 1.4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  pill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderColor: '#E3EDE7',
  },
  pillSelected: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  pillEmoji: {
    fontSize: 17,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B8C77',
  },
  pillLabelSelected: {
    color: '#FFFFFF',
  },
});
