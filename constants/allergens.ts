import { Allergen } from '../types';

export interface AllergenInfo {
  key: Allergen;
  label: string;
  emoji: string;
  // Common derived / hidden forms, given to Claude so exclusion is thorough.
  derived: string;
}

// Single source of truth for the allergen UI and the prompt restriction text.
export const ALLERGENS: AllergenInfo[] = [
  {
    key: 'milk',
    label: 'Milk',
    emoji: '🥛',
    derived: 'butter, cheese, cream, yogurt, ghee, whey, casein, custard',
  },
  {
    key: 'eggs',
    label: 'Eggs',
    emoji: '🥚',
    derived: 'mayonnaise, aioli, meringue, albumin, egg wash',
  },
  {
    key: 'peanuts',
    label: 'Peanuts',
    emoji: '🥜',
    derived: 'peanut butter, peanut oil, groundnuts',
  },
  {
    key: 'treenuts',
    label: 'Tree Nuts',
    emoji: '🌰',
    derived: 'almonds, walnuts, cashews, pecans, pistachios, hazelnuts, nut butters, marzipan',
  },
  {
    key: 'wheat',
    label: 'Wheat',
    emoji: '🌾',
    derived: 'wheat flour, bread, pasta, couscous, breadcrumbs, seitan, soy sauce (contains wheat)',
  },
  {
    key: 'soy',
    label: 'Soy',
    emoji: '🫛',
    derived: 'soy sauce, tofu, tempeh, edamame, miso, soybean oil',
  },
  {
    key: 'fish',
    label: 'Fish',
    emoji: '🐟',
    derived: 'cod, bass, flounder, salmon, tuna, anchovies, fish sauce, Worcestershire sauce',
  },
  {
    key: 'shellfish',
    label: 'Shellfish',
    emoji: '🦐',
    derived: 'shrimp, prawns, crab, lobster, crayfish',
  },
  {
    key: 'sesame',
    label: 'Sesame',
    emoji: '🟤',
    derived: 'sesame seeds, sesame oil, tahini, hummus (tahini)',
  },
];
