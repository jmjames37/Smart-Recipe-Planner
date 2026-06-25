import { create } from 'zustand';
import { Recipe } from '../types';

interface RecipeState {
  imageUri: string | null;
  detectedIngredients: string[];
  currentRecipes: Recipe[];
  allShownTitles: string[];
  isLoading: boolean;
  error: string | null;
}

interface RecipeActions {
  setImageUri: (uri: string) => void;
  setResults: (ingredients: string[], recipes: Recipe[]) => void;
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
  isLoading: false,
  error: null,
};

export const useRecipeStore = create<RecipeState & RecipeActions>((set, get) => ({
  ...initialState,

  setImageUri: (uri) => set({ imageUri: uri }),

  setResults: (ingredients, recipes) => {
    const newTitles = recipes.map((r) => r.title);
    set((state) => ({
      detectedIngredients: ingredients,
      currentRecipes: recipes,
      allShownTitles: [...state.allShownTitles, ...newTitles],
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getRecipeById: (id) => get().currentRecipes.find((r) => r.id === id),

  reset: () => set(initialState),
}));
