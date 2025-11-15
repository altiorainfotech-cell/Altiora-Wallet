import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import {
  getBiometricInfo,
  promptEnableBiometric,
  BiometricType,
} from '../../lib/biometric';

export default function BiometricSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [biometricInfo, setBiometricInfo] = useState<{
    supported: boolean;
    enrolled: boolean;
    enabled: boolean;
    types: BiometricType[];
    name: string;
  } | null>(null);

  useEffect(() => {
    loadBiometricInfo();
  }, []);

  const loadBiometricInfo = async () => {
    setLoading(true);
    try {
      const info = await getBiometricInfo();
      setBiometricInfo(info);

      // If not supported or not enrolled, skip this screen
      if (!info.supported || !info.enrolled) {
        handleSkip();
      }
    } catch (error) {
      console.error('Error loading biometric info:', error);
      handleSkip();
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    setEnabling(true);
    try {
      const result = await promptEnableBiometric();

      if (result.enabled) {
        Alert.alert(
          'Success',
          `${biometricInfo?.name} has been enabled for quick and secure access.`,
          [{ text: 'Continue', onPress: handleContinue }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Failed to enable biometric authentication. You can enable it later in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enable biometric authentication');
    } finally {
      setEnabling(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const getBiometricIcon = () => {
    if (!biometricInfo) return 'finger-print';

    if (biometricInfo.types.includes('FACIAL_RECOGNITION')) {
      return 'scan';
    }
    if (biometricInfo.types.includes('FINGERPRINT')) {
      return 'finger-print';
    }
    if (biometricInfo.types.includes('IRIS')) {
      return 'eye';
    }
    return 'lock-closed';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking device capabilities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!biometricInfo || !biometricInfo.supported || !biometricInfo.enrolled) {
    return null; // Screen will auto-skip
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[colors.primary + '10', colors.background]}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.iconGradient}
            >
              <Ionicons
                name={getBiometricIcon()}
                size={80}
                color={colors.card}
              />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Enable {biometricInfo.name}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            Use {biometricInfo.name} for quick and secure access to your wallet.
            Your biometric data stays on your device and is never shared.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Ionicons name="flash" size={24} color={colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Quick Access</Text>
                <Text style={styles.benefitDescription}>
                  Unlock your wallet instantly
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Secure</Text>
                <Text style={styles.benefitDescription}>
                  Military-grade biometric security
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Ionicons name="lock-closed" size={24} color={colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Private</Text>
                <Text style={styles.benefitDescription}>
                  Your data never leaves your device
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEnableBiometric}
            disabled={enabling}
          >
            {enabling ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Ionicons name={getBiometricIcon()} size={20} color={colors.card} />
                <Text style={styles.primaryButtonText}>
                  Enable {biometricInfo.name}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
            disabled={enabling}
          >
            <Text style={styles.secondaryButtonText}>
              I'll do this later
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textDim,
    fontSize: 16,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  benefitsContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textDim,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
