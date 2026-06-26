# Smart Recipe Planner

A React Native / Expo mobile app that analyses a photo of your ingredients using Claude's vision AI and suggests 5 personalised recipes. Refresh for 5 more — no repeats guaranteed.

## Features

- **Photo capture** — take a photo or pick from your gallery
- **AI ingredient detection** — Claude identifies everything visible in the shot
- **5 structured recipes** — title, description, difficulty, prep/cook time, servings, full ingredient list, step-by-step instructions
- **Endless refresh** — tap "Try Different Recipes" to get 5 new suggestions; previously shown recipes are excluded automatically
- **Recipe detail screen** — clean, readable layout with numbered steps and measured ingredients
- **Saved recipes** — bookmark any recipe and find it later under the **Saved** tab; saves persist across app launches (stored on-device with AsyncStorage)
- **Macro focus** — bias suggestions toward Balanced, High Protein, High Carb, or High Fat
- **Allergen filters** — exclude any of the 9 major allergens; recipes (and their detailed steps) avoid them and their common derived forms
- **Fast, streamed detail** — the list loads quickly from lightweight summaries, and full ingredients/steps stream in on demand when you open a recipe

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Expo (SDK 54) + Expo Router (tab + stack navigation) |
| Language | TypeScript |
| State | Zustand |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via REST + streaming (`expo/fetch`) |
| Image handling | expo-image-picker + expo-image-manipulator |
| Persistence | `@react-native-async-storage/async-storage` (saved recipes) |
| Web | react-native-web + react-dom (for `expo export -p web`) |

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** — check with `node -v`, install from [nodejs.org](https://nodejs.org) if needed
- **npm** — bundled with Node
- **Expo Go** — install the free app on your iOS or Android device from the App Store / Google Play
- **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

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

Open `.env` in any text editor and replace the placeholder:

```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start the dev server

```bash
npx expo start
```

You'll see a QR code in the terminal.

### 4. Open on your device

- **iPhone** — open the Camera app, scan the QR code, tap the Expo Go banner
- **Android** — open the Expo Go app, tap "Scan QR code", scan the code

The app will load on your device. Any code changes you save will reload automatically.

### Running on a simulator (optional)

```bash
npx expo start --ios       # Requires Xcode (Mac only)
npx expo start --android   # Requires Android Studio
```

> **Note:** The camera only works on a physical device. The photo gallery picker works on simulators.

## Project structure

```
app/
  _layout.tsx          Root stack; hydrates saved recipes on launch
  index.tsx            Redirects "/" to the tab navigator
  (tabs)/
    _layout.tsx        Tab bar (Discover / Saved)
    home.tsx           Camera / capture + macro + allergen options
    saved.tsx          Saved recipes list
  recipes.tsx          Recipe list (summaries) screen
  recipe/[id].tsx      Recipe detail screen (streams full recipe; save toggle)

components/
  RecipeCard.tsx       Tappable recipe summary card
  MacroSelector.tsx    Balanced / Protein / Carb / Fat selector
  AllergenSelector.tsx Multi-select allergen exclusions

constants/
  allergens.ts         Allergen labels + derived-form hints

services/
  claude.ts            Anthropic API (vision list + streamed detail), retry/timeout

store/
  recipeStore.ts       Zustand global state + AsyncStorage-backed saved recipes

types/
  index.ts             TypeScript interfaces
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | Your Anthropic API key |

Variables prefixed with `EXPO_PUBLIC_` are bundled into the client build. Do **not** commit your `.env` file.

## Deploying to web (Netlify)

The app also exports as a static web build.

```bash
npx expo export -p web   # outputs to ./dist
```

Netlify settings:

| Setting | Value |
|---------|-------|
| Build command | `expo export -p web` |
| Publish directory | `dist` |
| Environment | set `EXPO_PUBLIC_ANTHROPIC_API_KEY` in **Site settings → Environment variables** |

The web build requires `react-dom` and `react-native-web` (already in `package.json`),
so a clean `npm install` on the build server pulls them in automatically.

> ⚠️ The Anthropic API key is bundled into the **client** for both the mobile and
> web builds, so on a public web deploy it is visible to anyone. For production,
> proxy the Anthropic calls through a backend you control rather than shipping the
> key. (Camera/photo capture is also limited on web compared to the native app.)

## License

MIT
