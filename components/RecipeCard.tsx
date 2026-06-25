import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const DIFFICULTY: Record<Recipe['difficulty'], { bg: string; text: string }> = {
  Easy:   { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FEF3C7', text: '#92400E' },
  Hard:   { bg: '#FEE2E2', text: '#991B1B' },
};

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const diff = DIFFICULTY[recipe.difficulty];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
          <Text style={[styles.diffText, { color: diff.text }]}>
            {recipe.difficulty}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {recipe.description}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱</Text>
          <View>
            <Text style={styles.metaLabel}>PREP</Text>
            <Text style={styles.metaValue}>{recipe.prepTime}</Text>
          </View>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🍳</Text>
          <View>
            <Text style={styles.metaLabel}>COOK</Text>
            <Text style={styles.metaValue}>{recipe.cookTime}</Text>
          </View>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>👥</Text>
          <View>
            <Text style={styles.metaLabel}>SERVES</Text>
            <Text style={styles.metaValue}>{recipe.servings}</Text>
          </View>
        </View>

        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <View style={styles.tagRow}>
          {recipe.tags.slice(0, 4).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#1A2E21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2E21',
    lineHeight: 23,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  diffText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Description
  description: {
    fontSize: 14,
    color: '#6B8C77',
    lineHeight: 21,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 15,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9DB8A7',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2E21',
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EDF3EF',
  },
  chevron: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 20,
    color: '#2D6A4F',
    fontWeight: '600',
    lineHeight: 24,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7E8D4',
  },
  tagText: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500',
  },
});
