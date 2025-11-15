/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export type BiometricType = 'FINGERPRINT' | 'FACIAL_RECOGNITION' | 'IRIS' | 'NONE';

/**
 * Check if device supports biometric authentication
 */
export async function isBiometricSupported(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
}

/**
 * Check if user has enrolled biometrics (fingerprint/face registered)
 */
export async function hasBiometricEnrolled(): Promise<boolean> {
  try {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
}

/**
 * Get available biometric types on the device
 */
export async function getBiometricTypes(): Promise<BiometricType[]> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const biometricTypes: BiometricType[] = [];

    types.forEach((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          biometricTypes.push('FINGERPRINT');
          break;
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          biometricTypes.push('FACIAL_RECOGNITION');
          break;
        case LocalAuthentication.AuthenticationType.IRIS:
          biometricTypes.push('IRIS');
          break;
      }
    });

    return biometricTypes.length > 0 ? biometricTypes : ['NONE'];
  } catch (error) {
    console.error('Error getting biometric types:', error);
    return ['NONE'];
  }
}

/**
 * Get user-friendly name for biometric type
 */
export function getBiometricName(types: BiometricType[]): string {
  if (types.includes('FACIAL_RECOGNITION')) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
  }
  if (types.includes('FINGERPRINT')) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }
  if (types.includes('IRIS')) {
    return 'Iris Scan';
  }
  return 'Biometric';
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometric(
  reason: string = 'Authenticate to continue'
): Promise<{ success: boolean; error?: string }> {
  try {
    const compatible = await isBiometricSupported();
    if (!compatible) {
      return { success: false, error: 'Biometric authentication is not supported on this device' };
    }

    const enrolled = await hasBiometricEnrolled();
    if (!enrolled) {
      return { success: false, error: 'No biometric data enrolled. Please set up Face ID or fingerprint in your device settings' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // Allow fallback to device passcode
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error === 'user_cancel' ? 'Authentication cancelled' : 'Authentication failed'
      };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: error.message || 'Authentication failed' };
  }
}

/**
 * Check if biometric auth is enabled for the app
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled:', error);
    return false;
  }
}

/**
 * Enable or disable biometric authentication
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting biometric enabled:', error);
    throw error;
  }
}

/**
 * Prompt user to enable biometric authentication
 */
export async function promptEnableBiometric(): Promise<{ enabled: boolean; error?: string }> {
  try {
    const compatible = await isBiometricSupported();
    if (!compatible) {
      return { enabled: false, error: 'Device does not support biometric authentication' };
    }

    const enrolled = await hasBiometricEnrolled();
    if (!enrolled) {
      return { enabled: false, error: 'No biometric data enrolled on device' };
    }

    // Test authentication before enabling
    const types = await getBiometricTypes();
    const biometricName = getBiometricName(types);

    const result = await authenticateWithBiometric(
      `Enable ${biometricName} for quick and secure access`
    );

    if (result.success) {
      await setBiometricEnabled(true);
      return { enabled: true };
    } else {
      return { enabled: false, error: result.error };
    }
  } catch (error: any) {
    return { enabled: false, error: error.message || 'Failed to enable biometric authentication' };
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<void> {
  await setBiometricEnabled(false);
}

/**
 * Get biometric setup info for display
 */
export async function getBiometricInfo(): Promise<{
  supported: boolean;
  enrolled: boolean;
  enabled: boolean;
  types: BiometricType[];
  name: string;
}> {
  const supported = await isBiometricSupported();
  const enrolled = supported ? await hasBiometricEnrolled() : false;
  const enabled = enrolled ? await isBiometricEnabled() : false;
  const types: BiometricType[] = supported ? await getBiometricTypes() : ['NONE'];
  const name = getBiometricName(types);

  return { supported, enrolled, enabled, types, name };
}
