import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { generateRecipeList } from '../services/claude';
import RecipeCard from '../components/RecipeCard';
import MacroSelector from '../components/MacroSelector';
import { MacroPreference } from '../types';

export default function RecipesScreen() {
  const router = useRouter();
  const {
    imageUri,
    detectedIngredients,
    currentRecipes,
    allShownTitles,
    macroPreference,
    excludedAllergens,
    isLoading,
    setResults,
    replaceResults,
    setMacroPreference,
    setLoading,
    setError,
  } = useRecipeStore();

  // ─── Refresh ──────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);

    try {
      const result = await generateRecipeList(
        imageUri,
        allShownTitles,
        macroPreference,
        excludedAllergens
      );
      setResults(result.detectedIngredients, result.recipes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      Alert.alert('Could Not Refresh', message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Macro focus change ───────────────────────────────────────────────────
  // Switching focus regenerates a fresh batch for that macro (no exclusions),
  // so results aren't constrained by titles shown under the previous focus.

  const handleMacroChange = async (next: MacroPreference) => {
    if (next === macroPreference || isLoading) return;
    setMacroPreference(next);
    if (!imageUri) return;

    setLoading(true);
    setError(null);

    try {
      const result = await generateRecipeList(
        imageUri,
        [],
        next,
        excludedAllergens
      );
      replaceResults(result.detectedIngredients, result.recipes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      Alert.alert('Could Not Update Recipes', message);
    } finally {
      setLoading(false);
    }
  };

  const batchNumber = Math.ceil(allShownTitles.length / 5);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Detected ingredients strip ── */}
        {detectedIngredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionLabel}>INGREDIENTS DETECTED</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {detectedIngredients.map((item, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Macro focus ── */}
        <View style={styles.macroSection}>
          <MacroSelector
            value={macroPreference}
            onChange={handleMacroChange}
            disabled={isLoading}
          />
        </View>

        {/* ── List header ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {currentRecipes.length} Recipe{currentRecipes.length !== 1 ? 's' : ''}
          </Text>
          {batchNumber > 1 && (
            <Text style={styles.batchLabel}>Batch {batchNumber}</Text>
          )}
        </View>

        {/* ── Cards or loading ── */}
        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text style={styles.loadingText}>Finding new recipes…</Text>
          </View>
        ) : (
          currentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            />
          ))
        )}

        {/* Bottom padding so last card clears the sticky footer */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Sticky refresh footer ── */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Text style={styles.refreshIcon}>🔄</Text>
            <Text style={styles.refreshLabel}>Try Different Recipes</Text>
          </TouchableOpacity>
          {allShownTitles.length > 5 && (
            <Text style={styles.footerNote}>
              {allShownTitles.length} recipes shown — no repeats
            </Text>
          )}
        </View>
      )}
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

  // Ingredients
  ingredientsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9DB8A7',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Macro focus
  macroSection: {
    marginBottom: 20,
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2E21',
  },
  batchLabel: {
    fontSize: 13,
    color: '#9DB8A7',
    fontWeight: '500',
  },

  // Loading
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B8C77',
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#EDF3EF',
    backgroundColor: '#FAFAF8',
    gap: 8,
  },
  refreshBtn: {
    backgroundColor: '#1A2E21',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshIcon: {
    fontSize: 18,
  },
  refreshLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9DB8A7',
  },
});
