import colors from '@/theme/colors';
import spacing from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Global flag to ensure redirect URI is logged only once across all component instances
let hasLoggedRedirectGlobal = false;

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: string) => void;
  mode?: 'signin' | 'signup';
}

export default function GoogleSignInButton({ onSuccess, onError, mode = 'signin' }: GoogleSignInButtonProps) {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  const useProxy = process.env.EXPO_PUBLIC_USE_AUTH_PROXY === 'true';

  // For AuthSession (Authorization Code + PKCE), always use the Web OAuth client ID across platforms.
  const clientId = useMemo(() => webClientId, [webClientId]);

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  // For Expo Go development, we need to use a redirect URI that Google accepts
  // The URIs you've already added to Google Console will work for web testing
  const redirectUri = useMemo(() => {
    // Web: generate based on current origin; Native: use custom scheme
    const uri = Platform.OS === 'web'
      ? AuthSession.makeRedirectUri()
      : AuthSession.makeRedirectUri({ scheme: 'walletui' });

    // Log redirect URI only once globally during development
    if (__DEV__ && !hasLoggedRedirectGlobal) {
      console.log('Google OAuth Redirect URI:', uri);
      hasLoggedRedirectGlobal = true;
    }

    return uri;
  }, []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      // PKCE is automatically enabled for code flow
    },
    discovery
  );

  useEffect(() => {
    async function exchangeCodeForToken() {
      if (response?.type === 'success' && response.params.code && request?.codeVerifier) {
        try {
          // Exchange authorization code for tokens
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId: clientId || '',
              code: response.params.code,
              redirectUri,
              extraParams: {
                code_verifier: request.codeVerifier,
              },
            },
            discovery!
          );

          if (tokenResponse.idToken) {
            onSuccess(tokenResponse.idToken);
          } else {
            const errorMsg = 'No ID token received from Google';
            console.error(errorMsg);
            if (onError) {
              onError(errorMsg);
            } else {
              Alert.alert('Error', errorMsg);
            }
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to exchange authorization code';
          console.error('Token exchange error:', error);
          if (onError) {
            onError(errorMsg);
          } else {
            Alert.alert('Error', errorMsg);
          }
        }
      } else if (response?.type === 'error') {
        const errorMsg = response.error?.message || 'Google Sign-In failed';
        console.error('Google Sign-In error:', response.error);
        if (onError) {
          onError(errorMsg);
        } else {
          Alert.alert('Sign-In Error', errorMsg);
        }
      }
    }

    exchangeCodeForToken();
  }, [response, request]);

  const handleGoogleSignIn = async () => {
    if (!clientId) {
      Alert.alert('Error', 'Google Sign-In is not configured. Please check your environment variables.');
      return;
    }

    if (!request) {
      Alert.alert('Error', 'Google Sign-In is initializing. Please try again in a moment.');
      return;
    }

    try {
      // For AuthSession v7, useProxy option is deprecated in types; cast to any for runtime support
      const promptOptions: any = useProxy ? { useProxy: true, projectNameForProxy: process.env.EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME } : undefined;
      await (promptAsync as any)(promptOptions);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to start Google Sign-In';
      console.error('Google Sign-In error:', error);
      if (onError) {
        onError(errorMsg);
      } else {
        Alert.alert('Sign-In Error', errorMsg);
      }
    }
  };

  if (!clientId) {
    return (
      <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-google" size={20} color="#999" />
        </View>
        <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
          Google Sign-In (Not Configured)
        </Text>
      </TouchableOpacity>
    );
  }

  const buttonText = mode === 'signin' ? 'Continue with Google' : 'Sign up with Google';
  const isLoading = !request;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="logo-google" size={20} color="#4285F4" />
      </View>
      <Text style={styles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.bg,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.textDim,
  },
});
