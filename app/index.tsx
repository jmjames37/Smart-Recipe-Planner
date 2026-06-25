import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { generateRecipeList } from '../services/claude';
import MacroSelector from '../components/MacroSelector';
import AllergenSelector from '../components/AllergenSelector';

export default function HomeScreen() {
  const router = useRouter();
  const {
    setImageUri,
    setResults,
    setLoading,
    setError,
    isLoading,
    reset,
    macroPreference,
    setMacroPreference,
    excludedAllergens,
    toggleAllergen,
  } = useRecipeStore();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  // ─── Permission helpers ───────────────────────────────────────────────────

  const requestCamera = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Access Required',
        'Enable camera access in Settings to photograph your ingredients.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestLibrary = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Access Required',
        'Enable photo library access in Settings to choose an ingredient photo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // ─── Image capture ────────────────────────────────────────────────────────

  const handleTakePhoto = async () => {
    if (!(await requestCamera())) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });
    if (!result.canceled) setCapturedUri(result.assets[0].uri);
  };

  const handlePickFromGallery = async () => {
    if (!(await requestLibrary())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });
    if (!result.canceled) setCapturedUri(result.assets[0].uri);
  };

  // ─── Analysis ─────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!capturedUri) return;
    reset();
    setLoading(true);
    setError(null);
    setImageUri(capturedUri);

    try {
      const result = await generateRecipeList(
        capturedUri,
        [],
        macroPreference,
        excludedAllergens
      );
      setResults(result.detectedIngredients, result.recipes);
      router.push('/recipes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      Alert.alert('Could Not Analyze Photo', message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {!capturedUri ? (
        /* ── Landing / capture screen ── */
        <View style={styles.landingScreen}>
          <View style={styles.heroSection}>
            <View style={styles.iconRing}>
              <Text style={styles.heroEmoji}>🥗</Text>
            </View>
            <Text style={styles.appTitle}>Smart Recipe Planner</Text>
            <Text style={styles.appSubtitle}>
              Photograph your ingredients and get 5 personalised recipe ideas in seconds.
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTakePhoto}>
              <Text style={styles.primaryBtnIcon}>📸</Text>
              <Text style={styles.primaryBtnLabel}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickFromGallery}>
              <Text style={styles.secondaryBtnLabel}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tip}>
            Tip: lay ingredients flat on a light surface for best results
          </Text>
        </View>
      ) : (
        /* ── Photo preview screen ── */
        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={styles.previewScreen}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.previewHeading}>Your Ingredients</Text>

          <View style={styles.imageFrame}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
          </View>

          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color="#2D6A4F" />
              <Text style={styles.loadingTitle}>Analysing ingredients…</Text>
              <Text style={styles.loadingSubtitle}>Finding 5 recipes just for you</Text>
            </View>
          ) : (
            <View style={styles.previewActions}>
              <MacroSelector
                value={macroPreference}
                onChange={setMacroPreference}
              />
              <AllergenSelector
                excluded={excludedAllergens}
                onToggle={toggleAllergen}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze}>
                <Text style={styles.primaryBtnLabel}>Find Recipes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => setCapturedUri(null)}
              >
                <Text style={styles.ghostBtnLabel}>Use a Different Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },

  // Landing
  landingScreen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroEmoji: {
    fontSize: 52,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A2E21',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6B8C77',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  actionSection: {
    gap: 12,
  },
  tip: {
    textAlign: 'center',
    color: '#9DB8A7',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 20,
  },

  // Preview
  previewScroll: {
    flex: 1,
  },
  previewScreen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  previewHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A2E21',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageFrame: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2E21',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6B8C77',
  },
  previewActions: {
    gap: 12,
  },

  // Shared buttons
  primaryBtn: {
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnIcon: {
    fontSize: 22,
  },
  primaryBtnLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: '#2D6A4F',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnLabel: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostBtnLabel: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '600',
  },
});
