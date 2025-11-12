import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getItem, setItem } from '@/lib/storage';

export default function IndexGate() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
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
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1021' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
