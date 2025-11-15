import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getItem, setItem } from '@/lib/storage';

export default function IndexGate() {
  const router = useRouter();
  const forceOnboarding = process.env.EXPO_PUBLIC_FORCE_ONBOARDING === 'true';

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (forceOnboarding) {
          try { await setItem('hasOnboarded', 'false'); } catch {}
          router.replace('/onboarding');
          return;
        }
        const value = await getItem('hasOnboarded');
        if (value === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        // On any error, default to onboarding
        router.replace('/onboarding');
      }
    };
    checkOnboarding();
  }, [router, forceOnboarding]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1021' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
