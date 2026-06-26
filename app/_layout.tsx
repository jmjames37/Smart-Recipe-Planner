import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRecipeStore } from '../store/recipeStore';

export default function RootLayout() {
  const loadSavedRecipes = useRecipeStore((s) => s.loadSavedRecipes);

  // Hydrate saved recipes from AsyncStorage once on app launch.
  // (Zustand action identity is stable, so this runs only once.)
  useEffect(() => {
    loadSavedRecipes();
  }, [loadSavedRecipes]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAFAF8' },
          headerTintColor: '#1A2E21',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#FAFAF8' },
        }}
      >
        {/* Entry redirect to the tab group — no header/flash on web */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Tab group — header is managed by each tab screen */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Stack screens pushed over the tab bar */}
        <Stack.Screen
          name="recipes"
          options={{ title: 'Recipe Suggestions', headerBackTitle: 'Camera' }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{ title: 'Recipe', headerBackTitle: 'Recipes' }}
        />
      </Stack>
    </>
  );
}
