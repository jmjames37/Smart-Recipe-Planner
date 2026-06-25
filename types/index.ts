export interface Ingredient {
  amount: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
}

export interface RecipeResponse {
  detectedIngredients: string[];
  recipes: Recipe[];
}
