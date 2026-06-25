import { fetch as expoFetch } from 'expo/fetch';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  Allergen,
  Ingredient,
  MacroPreference,
  RecipeDetail,
  RecipeListResponse,
  RecipeSummary,
} from '../types';
import { ALLERGENS } from '../constants/allergens';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// claude-sonnet-4-6 supports vision and strikes the right balance of quality and speed
const MODEL = 'claude-sonnet-4-6';

function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Anthropic API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
    );
  }
  return apiKey;
}

const COMMON_HEADERS = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
  'anthropic-version': '2023-06-01',
});

// A short instruction nudging the macro split of generated recipes. Balanced
// returns an empty string so behavior is unchanged when no focus is chosen.
function macroClause(pref: MacroPreference): string {
  switch (pref) {
    case 'protein':
      return '\n\nIMPORTANT: Strongly favor HIGH-PROTEIN recipes — prioritize lean meats, fish, eggs, dairy, legumes, or tofu, and keep protein the dominant macronutrient in each dish.';
    case 'carb':
      return '\n\nIMPORTANT: Strongly favor HIGH-CARBOHYDRATE recipes — build dishes around grains, pasta, rice, potatoes, bread, or starchy vegetables so carbohydrates are the dominant macronutrient.';
    case 'fat':
      return '\n\nIMPORTANT: Strongly favor HIGH-FAT recipes — emphasize healthy fats like avocado, nuts, seeds, olive oil, cheese, or fatty fish so fat is the dominant macronutrient.';
    case 'balanced':
    default:
      return '';
  }
}

// A hard restriction listing excluded allergens and their common derived forms.
// Explicitly overrides the pantry-staple assumption so e.g. butter isn't used
// when milk is excluded.
function allergenClause(excluded: Allergen[]): string {
  if (excluded.length === 0) return '';

  const lines = excluded
    .map((key) => {
      const info = ALLERGENS.find((a) => a.key === key);
      return info ? `- ${info.label} (also avoid: ${info.derived})` : null;
    })
    .filter(Boolean)
    .join('\n');

  return `\n\nCRITICAL ALLERGEN RESTRICTION: The user is allergic to the following. Do NOT include any of these allergens — or ANY ingredient derived from or containing them — in any recipe, ingredient list, or step:\n${lines}\nThis OVERRIDES the pantry-staple assumption: do not use an excluded allergen even as a common staple (e.g. if Milk is restricted, do not use butter; if Wheat is restricted, do not use wheat flour). Every recipe must be completely free of these allergens — use safe substitutes where needed.`;
}

// Pull the first JSON object out of a model response, tolerating stray code
// fences or prose despite the prompt asking for raw JSON.
function extractJson<T>(rawText: string): T {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Could not parse recipe data from API response.');
  }
  return JSON.parse(match[0]) as T;
}

async function compressAndEncodeImage(uri: string): Promise<string> {
  // 768px keeps the photo readable for ingredient detection while trimming
  // upload size and vision-processing time vs. a larger image.
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 768 });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Failed to encode image for analysis.');
  }

  return result.base64;
}

// ─── Phase 1: recipe list (vision) ──────────────────────────────────────────
// Returns detected ingredients plus 5 lightweight summaries — no ingredient
// amounts or steps — so the list screen renders fast.
export async function generateRecipeList(
  imageUri: string,
  excludedTitles: string[] = [],
  macroPreference: MacroPreference = 'balanced',
  excludedAllergens: Allergen[] = []
): Promise<RecipeListResponse> {
  const apiKey = getApiKey();
  const base64Image = await compressAndEncodeImage(imageUri);

  const exclusionClause =
    excludedTitles.length > 0
      ? `\n\nCRITICAL: Do NOT suggest any of these recipes that were already shown: ${excludedTitles.map((t) => `"${t}"`).join(', ')}. Suggest entirely different recipes.`
      : '';

  const systemPrompt = `You are a professional chef. Analyze ingredient photos and return recipe suggestions as valid JSON only — no markdown code fences, no commentary, just the raw JSON object.`;

  const userPrompt = `Analyze this photo and identify all visible ingredients. Then suggest exactly 5 recipes that can realistically be made with those ingredients (you may assume common pantry staples like salt, pepper, oil, butter, flour, sugar, and basic spices are available).${exclusionClause}${macroClause(macroPreference)}

${allergenClause(excludedAllergens)}

Return ONLY this JSON structure — short summaries only, do NOT include ingredient amounts or cooking steps:
{
  "detectedIngredients": ["ingredient1", "ingredient2"],
  "recipes": [
    {
      "id": "r1",
      "title": "Recipe Title",
      "description": "A single compelling sentence describing the dish and its key flavors.",
      "prepTime": "15 mins",
      "cookTime": "30 mins",
      "servings": 4,
      "difficulty": "Easy",
      "tags": ["quick", "vegetarian", "baked"]
    }
  ]
}

Rules:
- difficulty must be exactly one of: "Easy", "Medium", or "Hard"
- tags should be 2–4 concise descriptors (e.g. "quick", "gluten-free", "one-pan", "spicy")
- Return exactly 5 recipes`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: COMMON_HEADERS(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            { type: 'text', text: userPrompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as any)?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Anthropic API error: ${message}`);
  }

  const data = await response.json();
  const rawText: string = data.content[0].text;
  const parsed = extractJson<RecipeListResponse>(rawText);

  // Stamp unique IDs so navigation lookups are reliable
  parsed.recipes = parsed.recipes.map((recipe, index) => ({
    ...recipe,
    id: `${Date.now()}-${index}`,
  }));

  return parsed;
}

// ─── Phase 2: recipe detail (streaming, text-only) ──────────────────────────
// Generates ingredient amounts and steps for ONE recipe. No image is re-sent —
// the detected ingredients and the chosen recipe are enough context — and the
// response is streamed so the detail screen can show live progress.
export async function generateRecipeDetail(
  recipe: RecipeSummary,
  detectedIngredients: string[],
  macroPreference: MacroPreference = 'balanced',
  excludedAllergens: Allergen[] = [],
  onProgress?: (charCount: number) => void
): Promise<RecipeDetail> {
  const apiKey = getApiKey();

  const systemPrompt = `You are a professional chef. Return recipe details as valid JSON only — no markdown code fences, no commentary, just the raw JSON object.`;

  const userPrompt = `Detected ingredients from the user's photo: ${detectedIngredients.join(', ')} (plus common pantry staples like salt, pepper, oil, butter, flour, sugar, and basic spices).

Write the full ingredient list and method for this recipe:
- Title: ${recipe.title}
- Description: ${recipe.description}
- Difficulty: ${recipe.difficulty}
- Prep: ${recipe.prepTime} · Cook: ${recipe.cookTime} · Serves: ${recipe.servings}${macroClause(macroPreference)}${allergenClause(excludedAllergens)}

Return ONLY this JSON structure:
{
  "ingredients": [
    { "amount": "2 cups", "name": "all-purpose flour" },
    { "amount": "1 tsp", "name": "salt" }
  ],
  "steps": [
    "Preheat oven to 375°F (190°C) and grease a 9-inch baking pan.",
    "In a large bowl, whisk together the dry ingredients."
  ]
}

Rules:
- ingredients must be complete with precise amounts
- steps must be detailed, actionable full sentences (4–6 steps)`;

  const response = await expoFetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: COMMON_HEADERS(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1536,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as any)?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Anthropic API error: ${message}`);
  }

  const fullText = await readSseText(response, onProgress);
  const parsed = extractJson<RecipeDetail>(fullText);

  if (!Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
    throw new Error('Recipe detail response was incomplete.');
  }
  // Normalize in case the model returns bare strings for ingredients.
  parsed.ingredients = parsed.ingredients.map((ing: any): Ingredient =>
    typeof ing === 'string' ? { amount: '', name: ing } : ing
  );

  return parsed;
}

// Read an Anthropic SSE stream, accumulate the text deltas, and report progress
// as bytes arrive. Falls back to a buffered read if the body isn't streamable.
async function readSseText(
  response: Awaited<ReturnType<typeof expoFetch>>,
  onProgress?: (charCount: number) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return response.text();
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const event = JSON.parse(payload);
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          fullText += event.delta.text;
          onProgress?.(fullText.length);
        }
      } catch {
        // Ignore non-JSON keepalive lines.
      }
    }
  }

  return fullText;
}
