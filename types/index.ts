export interface Ingredient {
  amount: string;
  name: string;
}

// Macronutrient emphasis the user can request for generated recipes.
export type MacroPreference = 'balanced' | 'protein' | 'carb' | 'fat';

// The 9 major allergens (FDA + FASTER Act) the user can choose to exclude.
export type Allergen =
  | 'milk'
  | 'eggs'
  | 'peanuts'
  | 'treenuts'
  | 'wheat'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

// Lightweight recipe card shown in the list. Generated in phase 1 (vision call)
// without ingredients/steps so the list appears quickly.
export interface RecipeSummary {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

// The heavy fields, generated on demand in phase 2 (per-recipe, text-only call).
export interface RecipeDetail {
  ingredients: Ingredient[];
  steps: string[];
}

// A recipe may exist as a summary only (detail not yet loaded) or fully hydrated.
export type Recipe = RecipeSummary & Partial<RecipeDetail>;

export interface RecipeListResponse {
  detectedIngredients: string[];
  recipes: RecipeSummary[];
}
