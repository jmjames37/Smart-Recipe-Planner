# Smart Recipe Planner

A React Native / Expo mobile app that analyses a photo of your ingredients using Claude's vision AI and suggests 5 personalised recipes. Refresh for 5 more — no repeats guaranteed.

## Features

- **Photo capture** — take a photo or pick from your gallery
- **AI ingredient detection** — Claude identifies everything visible in the shot
- **5 structured recipes** — title, description, difficulty, prep/cook time, servings, full ingredient list, step-by-step instructions
- **Endless refresh** — tap "Try Different Recipes" to get 5 new suggestions; previously shown recipes are excluded automatically
- **Recipe detail screen** — clean, readable layout with numbered steps and measured ingredients

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Expo (SDK 51) + Expo Router |
| Language | TypeScript |
| State | Zustand |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via REST |
| Image handling | expo-image-picker + expo-image-manipulator |

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/jmjames37/Smart-Recipe-Planner.git
cd Smart-Recipe-Planner
npm install
```

### 2. Add your API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your Anthropic API key:

```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run

```bash
# Start the Expo dev server
npx expo start

# Open on a physical device using the Expo Go app (scan the QR code)
# or on a simulator:
npx expo start --ios
npx expo start --android
```

> **Note:** Camera access requires a physical device. The gallery picker works on simulators.

## Project structure

```
app/
  _layout.tsx          Stack navigator root
  index.tsx            Camera / home screen
  recipes.tsx          Recipe list screen
  recipe/[id].tsx      Recipe detail screen

components/
  RecipeCard.tsx       Tappable recipe summary card

services/
  claude.ts            Anthropic API integration (vision + JSON recipe generation)

store/
  recipeStore.ts       Zustand global state

types/
  index.ts             TypeScript interfaces
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | Your Anthropic API key |

Variables prefixed with `EXPO_PUBLIC_` are bundled into the client build. Do **not** commit your `.env` file.

## License

MIT
