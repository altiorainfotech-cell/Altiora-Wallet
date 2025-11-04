import spacing from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { setItem } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
    primaryButton: 'Continue',
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
    title: 'Import a Wallet',
    subtitle:
      'Already have a wallet? Import it using your secret recovery phrase or private keys to access your assets.',
    image: require('@/assets/images/import_wallet.png'),
    primaryButton: 'Import Wallet',
    secondaryButton: 'Skip',
  },
  {
    id: '4',
    title: 'Ready to Start',
    subtitle:
      'Your wallet is confirmed and ready! Manage your crypto, NFTs, and DeFi assets all in one place.',
    image: require('@/assets/images/confirmation.png'),
    primaryButton: 'Get Started',
  },
  {
    id: '5',
    title: 'Get Started with Ease',
    subtitle:
      'Secure your financial future with a few easy steps. Your decentralized wallet awaits.',
    image: require('@/assets/images/wallet_alt.png'),
    primaryButton: 'Create Wallet',
    secondaryButton: "Got a wallet? Let's import it",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Responsive sizing
  const isLargeScreen = width > 768;
  const imageSize = isLargeScreen ? Math.min(width * 0.4, 400) : Math.min(width * 0.7, 350);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handlePrimaryAction = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Last slide - Create Wallet
      try {
        await setItem('hasOnboarded', 'true');
      } catch (e) {}
      router.replace('/(tabs)');
    }
  };

  const handleSecondaryAction = () => {
    if (currentIndex === 2) {
      // Import screen - skip to next
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else if (currentIndex === slides.length - 1) {
      // Last screen - go to import screen
      flatListRef.current?.scrollToIndex({ index: 2 });
    }
  };

  const handleSkip = async () => {
    try {
      await setItem('hasOnboarded', 'true');
    } catch (e) {}
    router.replace('/(tabs)');
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
                {/* Primary Button */}
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

                {/* Secondary Button */}
                {item.secondaryButton && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSecondaryAction}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>{item.secondaryButton}</Text>
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />
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
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
