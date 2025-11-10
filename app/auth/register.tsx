import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import PrimaryButton from '../../components/PrimaryButton';
import { register } from '../../lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await register(email.trim(), password, name || undefined);
      Alert.alert('Account created');
      router.back();
    } catch (e: any) {
      Alert.alert('Register failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <TextInput style={styles.input} placeholder="Display name" placeholderTextColor={colors.textDim} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textDim} autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textDim} secureTextEntry value={password} onChangeText={setPassword} />
      <PrimaryButton title={loading ? 'Creating...' : 'Create Account'} onPress={onSubmit} disabled={loading || !email || !password} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 20, fontWeight: '600', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text },
});

