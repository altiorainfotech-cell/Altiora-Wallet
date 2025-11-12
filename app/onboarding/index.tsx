import { setItem } from '@/lib/storage';
import spacing from '@/theme/spacing';
import colors from '@/theme/colors';
import Sheet from '@/components/Sheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWalletUi } from '@/context/WalletUiContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { googleSignIn } from '@/lib/api';
import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ViewToken, ViewabilityConfig } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  primaryButton?: string;
  secondaryButton?: string;
};

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome Aboard!',
    subtitle:
      'Your trusted companion into the world of decentralized finance. Digital wallet for managing your crypto and NFTs starts now.',
    image: require('@/assets/images/wallet.png'),
    primaryButton: 'Next',
  },
  {
    id: '2',
    title: 'Secure & Easy Setup',
    subtitle:
      'Create a new wallet or import an existing one. Your keys, your crypto. Stay in full control of your assets.',
    image: require('@/assets/images/wallet_success.png'),
    primaryButton: 'Next',
  },
  {
    id: '3',
    title: 'Your Recovery Phrase',
    subtitle:
      'We will generate a secure recovery phrase for you. Keep it safe — it’s the only way to restore your wallet.',
    image: require('@/assets/images/import_wallet.png'),
    primaryButton: 'Next',
  },
  {
    id: '4',
    title: 'Ready to Start',
    subtitle:
      'Your wallet is confirmed and ready! Manage your crypto, NFTs, and DeFi assets all in one place.',
    image: require('@/assets/images/confirmation.png'),
    primaryButton: 'Next',
  },
  {
    id: '5',
    title: 'Get Started with Ease',
    subtitle:
      'Secure your financial future with a few easy steps. Your decentralized wallet awaits.',
    image: require('@/assets/images/wallet_alt.png'),
    primaryButton: 'Continue',
    secondaryButton: 'Import from wallet',
  },
];

 
export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openImport?: string }>();
  const { width } = useWindowDimensions();
  const { addMockAccount } = useWalletUi();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Responsive sizing
  const isLargeScreen = width > 768;
  const imageSize = isLargeScreen ? Math.min(width * 0.4, 400) : Math.min(width * 0.7, 350);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index!);
      }
    }
  ).current;

  const viewConfig = useRef<ViewabilityConfig>({ viewAreaCoveragePercentThreshold: 50 }).current;
  // For web deep-linking: open the import sheet if asked
  React.useEffect(() => {
    // @ts-ignore already imported via alias
    if ((params as any)?.openImport === '1') {
      setImportOpen(true);
    }
  }, [params]);

  const handlePrimaryAction = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      return;
    }
    // Last slide - Continue into app (create wallet flow)
    try {
      await setItem('hasOnboarded', 'true');
    } catch (e) {}
    router.replace('/(tabs)');
  };

  const handleSecondaryAction = () => {
    if (currentIndex === slides.length - 1) {
      setImportOpen(true);
    }
  };

  const handleSkip = async () => {
    try {
      await setItem('hasOnboarded', 'true');
    } catch (e) {}
    router.replace('/(tabs)');
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      await googleSignIn(idToken);
      await setItem('hasOnboarded', 'true');
      Alert.alert('Success', 'Signed in with Google');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Google Sign-In failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={['#6B5DD8', '#7B6FE0', '#8A82E8']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Skip Button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Image Container */}
              <View style={[styles.imageContainer, isLargeScreen && styles.imageContainerLarge]}>
                <Image
                  source={item.image}
                  style={[
                    styles.image,
                    { width: imageSize, height: imageSize }
                  ]}
                  resizeMode="contain"
                />
              </View>

              {/* Text Content */}
              <View style={[styles.textContainer, isLargeScreen && styles.textContainerLarge]}>
                <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>{item.title}</Text>
                <Text style={[styles.subtitle, isLargeScreen && styles.subtitleLarge]}>{item.subtitle}</Text>
              </View>

              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {slides.map((_, index) => {
                  const inputRange = [
                    (index - 1) * SCREEN_WIDTH,
                    index * SCREEN_WIDTH,
                    (index + 1) * SCREEN_WIDTH,
                  ];

                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                  });

                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          width: dotWidth,
                          opacity,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                {currentIndex === slides.length - 1 ? (
                  /* Last Slide - Show Google Sign-In Buttons */
                  <>
                    <GoogleSignInButton
                      onSuccess={handleGoogleSignIn}
                      mode="signup"
                    />

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={handleSecondaryAction}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      <Text style={styles.secondaryButtonText}>Import existing wallet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.tertiaryButton}
                      onPress={handleSkip}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      <Text style={styles.tertiaryButtonText}>Skip for now</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  /* Other Slides - Show Next Button */
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePrimaryAction}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={currentIndex === 2 ? 'wallet-outline' : 'arrow-forward'}
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.primaryButtonText}>{item.primaryButton}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            try {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            } catch {}
          }, 100);
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Import options sheet (from last screen) */}
      <Sheet visible={importOpen} onClose={() => setImportOpen(false)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Add Account</Text>
          <TouchableOpacity onPress={() => setImportOpen(false)}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, opacity: 0.9, fontWeight: '800', marginBottom: 8 }}>Create a new account</Text>
          <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => { setImportOpen(false); addMockAccount(); router.replace('/(tabs)'); router.push('/(modals)/recovery-phrase2'); }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Ethereum account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => { setImportOpen(false); addMockAccount(); router.replace('/(tabs)'); }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Solana account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, opacity: 0.9, fontWeight: '800', marginBottom: 8 }}>Import a wallet or account</Text>
          <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => { setImportOpen(false); router.push('/(modals)/import-wallet'); }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Secret Recovery Phrase</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => { /* TODO: private key import */ }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Private Key</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, opacity: 0.9, fontWeight: '800', marginBottom: 8 }}>Connect an account</Text>
          <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => { /* TODO: hardware wallet connect */ }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Hardware wallet</Text>
          </TouchableOpacity>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B5DD8',
  },
  slide: {
    width: SCREEN_WIDTH,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: 350,
    maxHeight: 350,
  },
  textContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.lg,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  buttonsContainer: {
    gap: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  primaryButton: {
    backgroundColor: '#1F1F3D',
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%'
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  tertiaryButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  // Responsive styles for larger screens
  imageContainerLarge: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
  },
  textContainerLarge: {
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
  },
  titleLarge: {
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
  },
  subtitleLarge: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
});


