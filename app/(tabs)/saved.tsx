import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../../store/recipeStore';
import { Recipe } from '../../types';

const DIFFICULTY: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FEF3C7', text: '#92400E' },
  Hard:   { bg: '#FEE2E2', text: '#991B1B' },
};

export default function SavedScreen() {
  const router = useRouter();
  const savedRecipes = useRecipeStore((s) => s.savedRecipes);
  const unsaveRecipe = useRecipeStore((s) => s.unsaveRecipe);

  const handleUnsave = (recipe: Recipe) => {
    Alert.alert(
      'Remove Recipe',
      `Remove "${recipe.title}" from saved recipes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => unsaveRecipe(recipe.id),
        },
      ]
    );
  };

  // ─── Empty state ───────────────────────────────────────────────────────────

  if (savedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconRing}>
            <Ionicons name="bookmark-outline" size={40} color="#52B788" />
          </View>
          <Text style={styles.emptyTitle}>No saved recipes yet</Text>
          <Text style={styles.emptySubtitle}>
            Open any recipe and tap the bookmark icon to save it here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Recipe row ────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Recipe }) => {
    const diff = DIFFICULTY[item.difficulty] ?? DIFFICULTY.Easy;
    const hasDetail = !!item.steps;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/recipe/${item.id}`)}
        activeOpacity={0.75}
      >
        <View style={styles.cardMain}>
          {/* Title + difficulty */}
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.text }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color="#9DB8A7" />
              <Text style={styles.metaText}>{item.prepTime} prep</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={13} color="#9DB8A7" />
              <Text style={styles.metaText}>{item.cookTime} cook</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color="#9DB8A7" />
              <Text style={styles.metaText}>Serves {item.servings}</Text>
            </View>
            {hasDetail && (
              <>
                <View style={styles.metaDot} />
                <View style={styles.fullBadge}>
                  <Text style={styles.fullBadgeText}>Full recipe</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Unsave button */}
        <TouchableOpacity
          style={styles.unsaveBtn}
          onPress={() => handleUnsave(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="bookmark" size={20} color="#2D6A4F" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ─── List ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {savedRecipes.length} saved recipe{savedRecipes.length !== 1 ? 's' : ''}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 14,
  },
  emptyIconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2E21',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B8C77',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9DB8A7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#1A2E21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E21',
    lineHeight: 22,
  },
  diffBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B8C77',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#9DB8A7',
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C7E8D4',
  },
  fullBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fullBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2D6A4F',
  },

  // Unsave button
  unsaveBtn: {
    paddingTop: 2,
  },
});
