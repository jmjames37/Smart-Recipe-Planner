import { create } from 'zustand';
import {
  Allergen,
  MacroPreference,
  Recipe,
  RecipeDetail,
  RecipeSummary,
} from '../types';

interface RecipeState {
  imageUri: string | null;
  detectedIngredients: string[];
  currentRecipes: Recipe[];
  allShownTitles: string[];
  macroPreference: MacroPreference;
  excludedAllergens: Allergen[];
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
  getRecipeById: (id: string) => Recipe | undefined;
  reset: () => void;
}

const initialState: RecipeState = {
  imageUri: null,
  detectedIngredients: [],
  currentRecipes: [],
  allShownTitles: [],
  macroPreference: 'balanced',
  excludedAllergens: [],
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

  getRecipeById: (id) => get().currentRecipes.find((r) => r.id === id),

  // Clear session data but keep macroPreference and excludedAllergens — they're
  // user settings, not per-photo state, so they survive starting a new photo.
  reset: () =>
    set((state) => ({
      ...initialState,
      macroPreference: state.macroPreference,
      excludedAllergens: state.excludedAllergens,
    })),
}));
