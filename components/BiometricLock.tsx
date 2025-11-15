import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import {
  authenticateWithBiometric,
  getBiometricInfo,
  isBiometricEnabled,
} from '../lib/biometric';

interface BiometricLockProps {
  children: React.ReactNode;
}

export default function BiometricLock({ children }: BiometricLockProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricStatus();

    // Listen for app state changes to lock when app goes to background
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        const info = await getBiometricInfo();
        setBiometricName(info.name);
        setIsLocked(true);
        // Auto-prompt authentication
        setTimeout(() => {
          handleAuthenticate();
        }, 500);
      }
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground
      const enabled = await isBiometricEnabled();
      if (enabled && !isLocked && !isAuthenticating) {
        setIsLocked(true);
        // Longer delay on Android to ensure app is fully in foreground
        setTimeout(() => {
          handleAuthenticate();
        }, 500);
      }
    }
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await authenticateWithBiometric(
        `Unlock your wallet with ${biometricName}`
      );

      if (result.success) {
        setIsLocked(false);
        setError(null);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={80} color={colors.card} />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Wallet</Text>

          {/* Instruction */}
          <Text style={styles.instruction}>
            Unlock with {biometricName}
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Authenticate Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleAuthenticate}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons
                  name="finger-print"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.buttonText}>Tap to Unlock</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    backgroundColor: colors.card + '20',
    padding: spacing.xl,
    borderRadius: 100,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: 16,
    color: colors.card + 'DD',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    minWidth: 200,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
