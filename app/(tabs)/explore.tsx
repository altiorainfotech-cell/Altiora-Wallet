
import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWalletUi } from '@/context/WalletUiContext';
import { EthereumIcon } from '@/components/icons';



import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  const router = useRouter();
  const { tokens, networks, networkIndex } = useWalletUi();
  const activeNet = networks[networkIndex];
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
      headerImage={null}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/send')}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/swap')}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/connect-dapp')}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="apps" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/receive')}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>
      </View>

      {/* Network status */}
      <ThemedView style={styles.statusCard}>
        <Ionicons name="globe" size={18} color="#6AA3FF" />
        <ThemedText type="default" style={styles.statusText}>
          {activeNet?.name || 'Network'} • Status: Stable • Fees: Moderate
        </ThemedText>
      </ThemedView>

      {/* Trending Tokens */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Trending tokens</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <ThemedText type="link">View all</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tokenRow}>
        {tokens.slice(0, 8).map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.tokenCard}
            onPress={() => router.push(`/(modals)/token-detail?tokenId=${t.id}`)}
          >
            <View style={[styles.tokenIconCircle, { backgroundColor: `${t.color}20` }]}>
              {t.iconType === 'custom' && t.icon === 'ethereum' ? (
                <EthereumIcon size={20} color={t.color} />
              ) : (
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              )}
            </View>
            <Text style={styles.tokenName}>{t.symbol}</Text>
            <Text style={styles.tokenPrice}>${t.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Popular dApps */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Popular dApps</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(modals)/connect-dapp')}>
          <ThemedText type="link">Browse</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <View style={styles.grid}>
        {[
          { id: 'uniswap', label: 'Uniswap', icon: 'logo-octocat' },
          { id: 'aave', label: 'Aave', icon: 'logo-buffer' },
          { id: 'opensea', label: 'OpenSea', icon: 'logo-react' },
          { id: 'compound', label: 'Compound', icon: 'logo-nodejs' },
        ].map((d) => (
          <TouchableOpacity
            key={d.id}
            style={styles.gridItem}
            onPress={() => router.push('/(modals)/connect-dapp')}
          >
            <View style={styles.gridIconCircle}>
              <Ionicons name={d.icon as any} size={20} color="#6AA3FF" />
            </View>
            <Text style={styles.gridLabel}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(106,163,255,0.08)'
  },
  statusText: {
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6AA3FF',
  },
  actionLabel: {
    marginTop: 6,
    color: '#E6EAF2',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenRow: {
    gap: 12,
    paddingVertical: 6,
  },
  tokenCard: {
    width: 92,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    alignItems: 'center',
  },
  tokenIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tokenName: {
    color: '#E6EAF2',
    fontSize: 12,
    fontWeight: '700',
  },
  tokenPrice: {
    color: '#A8B0BF',
    fontSize: 11,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(106,163,255,0.12)'
  },
  gridLabel: {
    color: '#E6EAF2',
    fontSize: 14,
    fontWeight: '600',
  },
});


