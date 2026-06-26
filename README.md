# Smart Recipe Planner

A React Native / Expo app (mobile **and** web) that analyses a photo of your ingredients using Claude's vision AI and suggests 5 personalised recipes — with macro preferences, allergen filters, and saved recipes. Refresh for 5 more, no repeats guaranteed.

**🌐 Live demo:** https://smart-recipe-planner-s8rp-pea79eci4-jmjames37s-projects.vercel.app/home

## Features

- **Photo capture** — take a photo or pick from your gallery
- **AI ingredient detection** — Claude identifies everything visible in the shot
- **5 structured recipes** — title, description, difficulty, prep/cook time, servings, full ingredient list, step-by-step instructions
- **Fast, streamed loading** — the recipe list appears quickly from lightweight summaries; full ingredients and steps stream in on demand when you open a recipe
- **Macro focus** — bias suggestions toward Balanced, High Protein, High Carb, or High Fat
- **Allergen filters** — exclude any of the 9 major allergens; recipes (and their detailed steps) avoid them and their common derived forms
- **Saved recipes** — bookmark any recipe and find it later under the **Saved** tab; saves persist across app launches (on-device, AsyncStorage)
- **Endless refresh** — tap "Try Different Recipes" for 5 new suggestions; previously shown recipes are excluded automatically
- **Smart error handling** — clear prompt to retry if no food is detected in the photo; request timeouts and automatic retries on transient API errors
- **Server-side API key** — the Anthropic key never ships in the client; all AI calls go through a serverless proxy

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Expo (SDK 54) + Expo Router (tab + stack navigation) |
| Language | TypeScript |
| State | Zustand |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via a serverless proxy + streaming (`expo/fetch`) |
| Persistence | `@react-native-async-storage/async-storage` (saved recipes) |
| Image handling | expo-image-picker + expo-image-manipulator |
| Web / hosting | react-native-web + Vercel (static SPA + serverless function) |

## How it works

The app never calls Anthropic directly. It POSTs to a small **serverless proxy**
(`api/messages.ts`) that holds the API key server-side and forwards the request to
the Anthropic Messages API (streaming responses straight through). This keeps the
key out of the client bundle and removes browser CORS issues.

```
App (web / mobile) ──▶ /api/messages (Vercel function, holds the key)
                              └──▶ api.anthropic.com/v1/messages
```

Recipe generation is **two-phase**: a fast vision call returns 5 lightweight
summaries for the list, then a per-recipe streaming call fills in ingredients and
steps when you open a recipe.

## Prerequisites

- **Node.js 18+** — check with `node -v`
- **npm** — bundled with Node
- **Expo Go** — the free app on your iOS/Android device (App Store / Google Play)
- **Anthropic API key** — from [console.anthropic.com](https://console.anthropic.com)
- **A Vercel account** — to host the API proxy (the key lives there, not on-device)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/jmjames37/Smart-Recipe-Planner.git
cd Smart-Recipe-Planner
npm install
```

### 2. Deploy the proxy (holds your API key server-side)

```bash
npm i -g vercel
vercel link                                    # link this repo to a Vercel project
vercel env add ANTHROPIC_API_KEY production     # paste your sk-ant-... key when prompted
vercel --prod                                   # deploy; note the URL it prints
```

> The Anthropic key is set as **`ANTHROPIC_API_KEY`** in Vercel (server-side).
> It is **not** prefixed `EXPO_PUBLIC_` and never reaches the client.

### 3. Point the app at your proxy

```bash
cp .env.example .env
```

Set the proxy URL in `.env` (used by the mobile app and local web dev):

```
EXPO_PUBLIC_PROXY_URL=https://your-app.vercel.app
```

> On the deployed web build this can be left blank — the app calls the
> same-origin `/api/messages`.

### 4. Start the dev server

```bash
npx expo start
```

Scan the QR code with Expo Go (iPhone: Camera app → tap the banner; Android: Expo
Go → Scan QR code).

### Running on a simulator (optional)

```bash
npx expo start --ios       # Requires Xcode (Mac only)
npx expo start --android   # Requires Android Studio
```

> **Note:** the camera only works on a physical device. The photo gallery picker
> works on simulators.

## Web deployment (Vercel)

The same codebase exports to a static web SPA:

```bash
npx expo export -p web   # outputs to ./dist
```

`vercel.json` configures the build command (`expo export -p web`), output
directory (`dist`), the SPA rewrite, and routes `/api/*` to the serverless
function. Pushing/deploying to Vercel serves the web app and the proxy together.
See the deeper notes (and gotchas) in `VERCEL.md` if present.

## Project structure

```
app/
  _layout.tsx            Root stack; hydrates saved recipes on launch
  index.tsx              Redirects "/" to the tab navigator
  (tabs)/
    _layout.tsx          Tab bar (Discover / Saved)
    home.tsx             Camera / capture + macro + allergen options
    saved.tsx            Saved recipes list
  recipes.tsx            Recipe list (summaries) screen
  recipe/[id].tsx        Recipe detail (streams full recipe; save toggle)

api/
  messages.ts           Serverless proxy to the Anthropic API (key stays server-side)

components/
  RecipeCard.tsx         Tappable recipe summary card
  MacroSelector.tsx      Balanced / Protein / Carb / Fat selector
  AllergenSelector.tsx   Multi-select allergen exclusions

constants/
  allergens.ts           Allergen labels + derived-form hints for the prompt

services/
  claude.ts              Calls the proxy; two-phase + streaming generation, retries

store/
  recipeStore.ts         Zustand global state + AsyncStorage-backed saved recipes

types/
  index.ts               TypeScript interfaces

metro.config.js          Web: resolve zustand's CommonJS build (avoids import.meta)
vercel.json              Vercel build, SPA rewrite, and /api routing
```

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Vercel project (server) | Your Anthropic key. Used only by `api/messages.ts`; never sent to the client. |
| `EXPO_PUBLIC_PROXY_URL` | Client (`.env`) | Absolute URL of the deployed proxy, used by the native app and local web dev. Leave blank on the deployed web build (same-origin). |

> `EXPO_PUBLIC_`-prefixed variables are bundled into the client build, so they must
> **never** hold secrets. The Anthropic key is intentionally server-only. Do not
> commit your `.env` file.

## License

MIT
