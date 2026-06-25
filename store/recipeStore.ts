import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Allergen,
  MacroPreference,
  Recipe,
  RecipeDetail,
  RecipeSummary,
} from '../types';

const SAVED_KEY = '@smart_recipe_planner:saved_recipes';

interface RecipeState {
  imageUri: string | null;
  detectedIngredients: string[];
  currentRecipes: Recipe[];
  allShownTitles: string[];
  macroPreference: MacroPreference;
  excludedAllergens: Allergen[];
  savedRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
}

interface RecipeActions {
  setImageUri: (uri: string) => void;
  setResults: (ingredients: string[], recipes: RecipeSummary[]) => void;
  replaceResults: (ingredients: string[], recipes: RecipeSummary[]) => void;
  setRecipeDetail: (id: string, detail: RecipeDetail) => void;
  setMacroPreference: (pref: MacroPreference) => void;
  toggleAllergen: (allergen: Allergen) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Checks current session AND saved recipes
  getRecipeById: (id: string) => Recipe | undefined;
  // Saved recipes
  loadSavedRecipes: () => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  unsaveRecipe: (id: string) => Promise<void>;
  isRecipeSaved: (id: string) => boolean;
  reset: () => void;
}

const initialState: RecipeState = {
  imageUri: null,
  detectedIngredients: [],
  currentRecipes: [],
  allShownTitles: [],
  macroPreference: 'balanced',
  excludedAllergens: [],
  savedRecipes: [],
  isLoading: false,
  error: null,
};

export const useRecipeStore = create<RecipeState & RecipeActions>((set, get) => ({
  ...initialState,

  setImageUri: (uri) => set({ imageUri: uri }),

  // Append-and-accumulate: used for the initial batch and "Try Different
  // Recipes", so allShownTitles grows and Claude never repeats a title.
  setResults: (ingredients, recipes) => {
    const newTitles = recipes.map((r) => r.title);
    set((state) => ({
      detectedIngredients: ingredients,
      currentRecipes: recipes,
      allShownTitles: [...state.allShownTitles, ...newTitles],
    }));
  },

  // Fresh start: used when the macro focus changes, so the new batch isn't
  // constrained by titles shown under a different macro.
  replaceResults: (ingredients, recipes) =>
    set({
      detectedIngredients: ingredients,
      currentRecipes: recipes,
      allShownTitles: recipes.map((r) => r.title),
    }),

  // Merge phase-2 ingredients/steps into the matching summary in place.
  setRecipeDetail: (id, detail) =>
    set((state) => ({
      currentRecipes: state.currentRecipes.map((r) =>
        r.id === id ? { ...r, ...detail } : r
      ),
    })),

  setMacroPreference: (macroPreference) => set({ macroPreference }),

  toggleAllergen: (allergen) =>
    set((state) => ({
      excludedAllergens: state.excludedAllergens.includes(allergen)
        ? state.excludedAllergens.filter((a) => a !== allergen)
        : [...state.excludedAllergens, allergen],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Check the active session first, then fall back to saved recipes so the
  // detail screen works whether reached from the list or the saved tab.
  getRecipeById: (id) => {
    const { currentRecipes, savedRecipes } = get();
    return (
      currentRecipes.find((r) => r.id === id) ??
      savedRecipes.find((r) => r.id === id)
    );
  },

  // ─── Saved recipes (AsyncStorage-backed) ────────────────────────────────────

  loadSavedRecipes: async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      if (raw) set({ savedRecipes: JSON.parse(raw) });
    } catch {
      // Non-fatal — start with an empty list if storage is unavailable.
    }
  },

  saveRecipe: async (recipe) => {
    const { savedRecipes } = get();
    if (savedRecipes.some((r) => r.id === recipe.id)) return;
    const updated = [recipe, ...savedRecipes];
    set({ savedRecipes: updated });
    try {
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch {
      set({ savedRecipes }); // revert optimistic update
    }
  },

  unsaveRecipe: async (id) => {
    const { savedRecipes } = get();
    const updated = savedRecipes.filter((r) => r.id !== id);
    set({ savedRecipes: updated });
    try {
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch {
      set({ savedRecipes }); // revert on failure
    }
  },

  isRecipeSaved: (id) => get().savedRecipes.some((r) => r.id === id),

  // Clear session data but keep user settings and saved recipes across resets.
  reset: () =>
    set((state) => ({
      ...initialState,
      macroPreference: state.macroPreference,
      excludedAllergens: state.excludedAllergens,
      savedRecipes: state.savedRecipes,
    })),
}));
