import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import PrimaryButton from '../../components/PrimaryButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { register, googleSignIn } from '../../lib/api';

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

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      const res = await googleSignIn(idToken);
      try {
        // Cache display name for fallback UI
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const storage = require('../../lib/storage');
        if (res?.user?.displayName && storage?.setItem) {
          await storage.setItem('lastUserName', res.user.displayName);
        }
      } catch {}
      Alert.alert('Success', 'Account created with Google');
      router.back();
    } catch (e: any) {
      Alert.alert('Google Sign-In failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>

      {/* Google Sign-In */}
      <GoogleSignInButton onSuccess={handleGoogleSignIn} mode="signup" />

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email/Password Registration */}
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textDim,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text },
});

