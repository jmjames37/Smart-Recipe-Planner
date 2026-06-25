import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Allergen } from '../types';
import { ALLERGENS } from '../constants/allergens';

interface AllergenSelectorProps {
  excluded: Allergen[];
  onToggle: (allergen: Allergen) => void;
  disabled?: boolean;
}

export default function AllergenSelector({
  excluded,
  onToggle,
  disabled = false,
}: AllergenSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>ALLERGENS TO AVOID</Text>

      <View style={[styles.chips, disabled && styles.chipsDisabled]}>
        {ALLERGENS.map((a) => {
          const active = excluded.includes(a.key);
          return (
            <TouchableOpacity
              key={a.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => !disabled && onToggle(a.key)}
              activeOpacity={disabled ? 1 : 0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled }}
              accessibilityLabel={`${active ? 'Avoiding' : 'Allowing'} ${a.label}`}
            >
              <Text style={styles.chipEmoji}>{a.emoji}</Text>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {a.label}
              </Text>
              {active && <Text style={styles.chipCheck}>✕</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>
        Best effort only — AI can miss hidden ingredients. If you have a severe
        allergy, always verify every ingredient yourself.
      </Text>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsDisabled: {
    opacity: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E3EDE7',
  },
  chipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B8C77',
  },
  chipLabelActive: {
    color: '#991B1B',
  },
  chipCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    marginLeft: 1,
  },
  disclaimer: {
    fontSize: 11,
    color: '#B08968',
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
