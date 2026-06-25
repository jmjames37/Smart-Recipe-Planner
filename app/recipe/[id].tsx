import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useRecipeStore } from '../../store/recipeStore';

const DIFFICULTY: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FEF3C7', text: '#92400E' },
  Hard:   { bg: '#FEE2E2', text: '#991B1B' },
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipeStore((s) => s.getRecipeById(id));

  // ─── Not found ────────────────────────────────────────────────────────────

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundIcon}>🤔</Text>
          <Text style={styles.notFoundTitle}>Recipe Not Found</Text>
          <Text style={styles.notFoundText}>
            Go back and select a recipe from the list.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const diff = DIFFICULTY[recipe.difficulty] ?? DIFFICULTY.Easy;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.text }]}>
                {recipe.difficulty}
              </Text>
            </View>
            {recipe.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Stats card ── */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{recipe.prepTime}</Text>
            <Text style={styles.statLabel}>Prep</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🍳</Text>
            <Text style={styles.statValue}>{recipe.cookTime}</Text>
            <Text style={styles.statLabel}>Cook</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{recipe.servings}</Text>
            <Text style={styles.statLabel}>Serves</Text>
          </View>
        </View>

        {/* ── Ingredients ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛒</Text>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{recipe.ingredients.length}</Text>
            </View>
          </View>

          {recipe.ingredients.map((ing, i) => (
            <View
              key={i}
              style={[
                styles.ingredientRow,
                i === recipe.ingredients.length - 1 && styles.ingredientRowLast,
              ]}
            >
              <View style={styles.ingredientDot} />
              <Text style={styles.ingredientAmount}>{ing.amount}</Text>
              <Text style={styles.ingredientName}>{ing.name}</Text>
            </View>
          ))}
        </View>

        {/* ── Instructions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{recipe.steps.length}</Text>
            </View>
          </View>

          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  notFoundIcon: { fontSize: 52 },
  notFoundTitle: { fontSize: 20, fontWeight: '700', color: '#1A2E21' },
  notFoundText: { fontSize: 15, color: '#6B8C77', textAlign: 'center' },

  // Hero
  hero: {
    gap: 10,
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A2E21',
    lineHeight: 34,
  },
  recipeDescription: {
    fontSize: 15,
    color: '#6B8C77',
    lineHeight: 23,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tag: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7E8D4',
  },
  tagText: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '500',
  },

  // Stats
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#1A2E21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E21',
  },
  statLabel: {
    fontSize: 12,
    color: '#9DB8A7',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EDF3EF',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1A2E21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F5F2',
  },
  sectionIcon: { fontSize: 20 },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2E21',
  },
  countPill: {
    backgroundColor: '#E8F5E9',
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F8F6',
  },
  ingredientRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  ingredientDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#52B788',
    flexShrink: 0,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D6A4F',
    minWidth: 72,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: '#1A2E21',
    textTransform: 'capitalize',
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#1A2E21',
    lineHeight: 24,
  },
});
