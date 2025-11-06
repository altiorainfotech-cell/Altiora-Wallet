import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function ImportWalletModal() {
  const router = useRouter();
  const [phrase, setPhrase] = useState('');

  const onImport = () => {
    const words = phrase.trim().split(/\s+/);
    if (words.length < 12) {
      Alert.alert('Invalid phrase', 'Please enter at least 12 words.', [
        { text: 'Try again', style: 'cancel' },
        { text: 'Choose another option', onPress: () => router.replace('/onboarding?openImport=1') }
      ]);
      return;
    }
    Alert.alert('Imported', 'Wallet imported successfully');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Import Wallet</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>Enter your secret recovery phrase</Text>
          <TextInput
            value={phrase}
            onChangeText={setPhrase}
            placeholder="Enter 12/24 words"
            placeholderTextColor={colors.textDim}
            multiline
            style={styles.input}
          />

          <TouchableOpacity style={styles.primary} onPress={onImport} activeOpacity={0.85}>
            <Text style={styles.primaryText}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primary, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }]} onPress={() => router.replace('/onboarding?openImport=1')} activeOpacity={0.85}>
            <Text style={[styles.primaryText, { color: colors.text }]}>Other options</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  container: { padding: spacing.lg },
  label: { color: colors.text, marginBottom: spacing.sm, fontWeight: '700' },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  primary: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', paddingVertical: spacing.md },
  primaryText: { color: 'white', fontWeight: '800' },
});
