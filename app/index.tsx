import { Redirect } from 'expo-router';

// The real home screen lives in app/(tabs)/home.tsx.
// This redirect ensures "/" always lands on the tab navigator.
export default function Index() {
  return <Redirect href="/home" />;
}
