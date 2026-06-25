import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { RecipeResponse } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// claude-sonnet-4-6 supports vision and strikes the right balance of quality and speed
const MODEL = 'claude-sonnet-4-6';

async function compressAndEncodeImage(uri: string): Promise<string> {
  // Resize to max 1024px wide and compress to keep payload manageable
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return base64;
}

export async function generateRecipes(
  imageUri: string,
  excludedTitles: string[] = []
): Promise<RecipeResponse> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Anthropic API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
    );
  }

  const base64Image = await compressAndEncodeImage(imageUri);

  const exclusionClause =
    excludedTitles.length > 0
      ? `\n\nCRITICAL: Do NOT suggest any of these recipes that were already shown: ${excludedTitles.map((t) => `"${t}"`).join(', ')}. Suggest entirely different recipes.`
      : '';

  const systemPrompt = `You are a professional chef. Analyze ingredient photos and return recipe suggestions as valid JSON only — no markdown code fences, no commentary, just the raw JSON object.`;

  const userPrompt = `Analyze this photo and identify all visible ingredients. Then suggest exactly 5 recipes that can realistically be made with those ingredients (you may assume common pantry staples like salt, pepper, oil, butter, flour, sugar, and basic spices are available).${exclusionClause}

Return ONLY this JSON structure:
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
      "ingredients": [
        { "amount": "2 cups", "name": "all-purpose flour" },
        { "amount": "1 tsp", "name": "salt" }
      ],
      "steps": [
        "Preheat oven to 375°F (190°C) and grease a 9-inch baking pan.",
        "In a large bowl, whisk together flour, sugar, baking powder, and salt.",
        "In a separate bowl, mix wet ingredients until well combined.",
        "Fold wet ingredients into dry ingredients until just combined — do not overmix.",
        "Pour batter into prepared pan and bake 25–30 minutes until a toothpick comes out clean.",
        "Cool for 10 minutes before slicing and serving."
      ],
      "tags": ["quick", "vegetarian", "baked"]
    }
  ]
}

Rules:
- difficulty must be exactly one of: "Easy", "Medium", or "Hard"
- steps must be detailed and actionable (minimum 5 steps per recipe, written as full sentences)
- ingredients list must be complete with precise amounts
- tags should be 2–4 concise descriptors (e.g. "quick", "gluten-free", "one-pan", "spicy")
- Return exactly 5 recipes`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
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
            {
              type: 'text',
              text: userPrompt,
            },
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

  // Strip markdown code fences if the model wraps output despite instructions
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse recipe data from API response.');
  }

  const parsed: RecipeResponse = JSON.parse(jsonMatch[0]);

  // Stamp unique IDs so navigation lookups are reliable
  parsed.recipes = parsed.recipes.map((recipe, index) => ({
    ...recipe,
    id: `${Date.now()}-${index}`,
  }));

  return parsed;
}
