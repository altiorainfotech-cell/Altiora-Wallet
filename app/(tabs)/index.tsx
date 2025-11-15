import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { EthereumIcon } from "../../components/icons";
import MiniChart from "../../components/MiniChart";
import Sheet from "../../components/Sheet";
import PrimaryButton from "../../components/PrimaryButton";
import { useWalletUi } from "../../context/WalletUiContext";
import { useUser } from "../../hooks/useUser";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { getPortfolioAnalytics, getPnL, getPriceAlerts, getPriceHistory } from "../../lib/api";

export default function Home() {
  const router = useRouter();
  const { user, loading, error } = useUser();

  // Debug logging
  React.useEffect(() => {
    console.log('Home: User state:', { user, loading, error });
  }, [user, loading, error]);
  const {
    accounts,
    activeIndex,
    setActiveIndex,
    networks,
    networkIndex,
    setNetworkIndex,
    tokens,
    nfts,
    totalPortfolioValue,
    portfolioChange24h,
    addMockAccount,
    removeAccount,
    recoveryPhraseWords,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  } = useWalletUi();
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [networksOpen, setNetworksOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"tokens" | "nfts">("tokens");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tokenFilter, setTokenFilter] = useState<"all" | "gainers" | "losers">("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyPhrase, setVerifyPhrase] = useState("");
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [portfolioChartData, setPortfolioChartData] = useState<number[]>([]);

  const active = accounts[activeIndex] || accounts[0];

  // Fetch portfolio chart data (ETH price history as proxy for portfolio)
  useEffect(() => {
    const fetchPortfolioChart = async () => {
      try {
        const { points } = await getPriceHistory('ETH', 30, 'daily');
        if (points && points.length > 0) {
          const prices = points.map((p: any) => p.usd);
          setPortfolioChartData(prices);
        }
      } catch (error) {
        console.log('Failed to fetch portfolio chart data:', error);
      }
    };
    fetchPortfolioChart();
  }, []);

  // Use images from assets/nft for NFT thumbnails
  const nftAssetImages = useMemo(() => [
    require("../../assets/nft/01.png"),
    // require("../../assets/nft/02.png"), // add if you place 02.png
    require("../../assets/nft/03.png"),
    require("../../assets/nft/04.png"),
    require("../../assets/nft/05.png"),
    require("../../assets/nft/06.png"),
  ], []);

  const copyAddress = async () => {
    if (active?.address) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Clipboard.setStringAsync(active.address);
      Alert.alert("Copied!", "Address copied to clipboard");
    }
  };

  const handleTabPress = (tab: "tokens" | "nfts") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const accountList = useMemo(
    () =>
      accounts.map((a, i) => (
        <TouchableOpacity
          key={a.id}
          style={styles.listItem}
          onPress={() => {
            if (i === activeIndex) {
              setAccountsOpen(false);
              return;
            }
            // Require phrase only when switching to an older account
            if (i < activeIndex) {
              setTargetIndex(i);
              setVerifyPhrase("");
              setVerifyOpen(true);
            } else {
              setActiveIndex(i);
              setAccountsOpen(false);
            }
          }}
        >
          <Text style={[styles.listTitle, i === activeIndex && { color: colors.primary }]}>{a.label}</Text>
          <Text style={styles.listSub}>{a.address}</Text>
        </TouchableOpacity>
      )),
    [accounts, activeIndex]
  );

  const networkList = useMemo(
    () =>
      networks.map((n, i) => (
        <TouchableOpacity key={n.id} style={styles.listItem}
          onPress={() => { setNetworkIndex(i); setNetworksOpen(false); }}>
          <Text style={[styles.listTitle, i === networkIndex && { color: colors.primary }]}>{n.name}</Text>
          <Text style={styles.listSub}>{n.symbol}</Text>
        </TouchableOpacity>
      )),
    [networks, networkIndex]
  );

  const filteredTokens = useMemo(() => {
    if (tokenFilter === "gainers") return tokens.filter(t => t.change24h >= 0);
    if (tokenFilter === "losers") return tokens.filter(t => t.change24h < 0);
    return tokens;
  }, [tokens, tokenFilter]);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12', '#050608']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNetworksOpen(true);
              }}
              style={styles.networkSelector}
            >
              <Ionicons name="globe" size={20} color={colors.primary} />
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAccountsOpen(true);
              }}
              style={styles.accountSelector}
            >
              <View style={styles.accountIcon}>
                <Ionicons name="person" size={14} color={colors.primary} />
              </View>
              <Text style={styles.accountAddress}>{active?.address || "Account"}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(modals)/watchlist" as any);
              }}
            >
              <Ionicons name="star-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotificationsOpen(true);
              }}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/settings" as any);
              }}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.tokenList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Portfolio Value */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              copyAddress();
            }}
          >
            <LinearGradient
              colors={[colors.card, '#1A1E28', colors.card]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.portfolioSection}
            >
              {loading ? (
                <Text style={[styles.welcomeText, { color: colors.textDim }]}>
                  Loading user...
                </Text>
              ) : error ? (
                <Text style={[styles.welcomeText, { color: colors.error, fontSize: 12 }]}>
                  Error: {error}
                </Text>
              ) : user?.displayName ? (
                <Text style={styles.welcomeText}>
                  Welcome, {user.displayName}!
                </Text>
              ) : user ? (
                <Text style={[styles.welcomeText, { fontSize: 12, color: colors.textDim }]}>
                  Welcome! (No display name set)
                </Text>
              ) : (
                <Text style={[styles.welcomeText, { fontSize: 12, color: colors.textDim }]}>
                  Not signed in
                </Text>
              )}
              <View style={styles.portfolioHeader}>
                <View>
                  <Text style={styles.portfolioLabel}>Total Balance</Text>
                  <Text style={styles.portfolioValue}>
                    {balanceVisible ? `$${totalPortfolioValue}` : '••••••••'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setBalanceVisible(!balanceVisible);
                  }}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={colors.textDim}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.portfolioChange}>
                <View style={[styles.changeBadge, { backgroundColor: portfolioChange24h >= 0 ? colors.success + '20' : colors.error + '20' }]}>
                  <Ionicons
                    name={portfolioChange24h >= 0 ? "trending-up" : "trending-down"}
                    size={16}
                    color={portfolioChange24h >= 0 ? colors.success : colors.error}
                  />
                  <Text style={[styles.changeText, { color: portfolioChange24h >= 0 ? colors.success : colors.error }]}>
                    {balanceVisible
                      ? `${portfolioChange24h >= 0 ? "+" : ""}${portfolioChange24h.toFixed(2)}%`
                      : '••••'
                    }
                  </Text>
                </View>
                <Text style={styles.changeSubtext}>
                  {balanceVisible
                    ? `$${Math.abs((parseFloat(totalPortfolioValue) * portfolioChange24h) / 100).toFixed(2)} today`
                    : '••••••'
                  }
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Analytics Widgets */}
          <View style={styles.analyticsSection}>
            <TouchableOpacity 
              style={styles.analyticsCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigate to detailed analytics
              }}
            >
              <LinearGradient colors={['#6AA3FF20', '#6AA3FF10']} style={styles.analyticsGradient}>
                <View style={styles.analyticsHeader}>
                  <Ionicons name="trending-up" size={20} color={colors.success} />
                  <Text style={styles.analyticsTitle}>Portfolio Performance</Text>
                </View>
                {portfolioChartData.length > 0 && (
                  <View style={{ marginVertical: spacing.sm }}>
                    <MiniChart
                      data={portfolioChartData}
                      width={120}
                      height={40}
                      color={colors.success}
                      strokeWidth={1.5}
                    />
                  </View>
                )}
                <Text style={styles.analyticsValue}>
                  {portfolioChange24h >= 0 ? '+' : ''}{portfolioChange24h.toFixed(2)}%
                </Text>
                <Text style={styles.analyticsSubtext}>30-day return</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.analyticsCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(modals)/watchlist');
              }}
            >
              <LinearGradient colors={['#4ECDC420', '#4ECDC410']} style={styles.analyticsGradient}>
                <View style={styles.analyticsHeader}>
                  <Ionicons name="notifications" size={20} color={colors.warning} />
                  <Text style={styles.analyticsTitle}>Price Alerts</Text>
                </View>
                <Text style={styles.analyticsValue}>3</Text>
                <Text style={styles.analyticsSubtext}>Active alerts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(modals)/send' as any);
              }}
            >
              <LinearGradient
                colors={['#6AA3FF30', '#6AA3FF20']}
                style={styles.actionBtnGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '30' }]}>
                  <Ionicons name="arrow-up" size={20} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Send</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(modals)/receive' as any);
              }}
            >
              <LinearGradient
                colors={['#4ECDC430', '#4ECDC420']}
                style={styles.actionBtnGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '30' }]}>
                  <Ionicons name="arrow-down" size={20} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Receive</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(modals)/swap' as any);
              }}
            >
              <LinearGradient
                colors={['#FFD93D30', '#FFD93D20']}
                style={styles.actionBtnGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warning + '30' }]}>
                  <Ionicons name="swap-horizontal" size={20} color={colors.warning} />
                </View>
                <Text style={styles.actionText}>Swap</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(modals)/buy' as any);
              }}
            >
              <LinearGradient
                colors={['#FF6B6B30', '#FF6B6B20']}
                style={styles.actionBtnGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.error + '30' }]}>
                  <Ionicons name="card" size={20} color={colors.error} />
                </View>
                <Text style={styles.actionText}>Buy</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, selectedTab === "tokens" && styles.tabActive]}
              onPress={() => handleTabPress("tokens")}
            >
              <Text style={[styles.tabText, selectedTab === "tokens" && styles.tabTextActive]}>Tokens</Text>
              {selectedTab === "tokens" && <View style={styles.tabIndicator} />}
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === "nfts" && styles.tabActive]}
              onPress={() => handleTabPress("nfts")}
            >
              <Text style={[styles.tabText, selectedTab === "nfts" && styles.tabTextActive]}>NFTs</Text>
              {selectedTab === "nfts" && <View style={styles.tabIndicator} />}
            </Pressable>
          </View>

          <View style={styles.sortButtons}>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    selectedTab === "tokens" ? "Networks" : "Collections",
                    selectedTab === "tokens"
                      ? "Filter by network:\n• Ethereum\n• Polygon\n• Binance Smart Chain\n• Arbitrum"
                      : "Filter by collection:\n• Top Collections\n• Trending\n• Recent"
                  );
                }}
              >
                <Text style={styles.sortBtnText}>{selectedTab === "tokens" ? "Popular networks" : "Top collections"}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFiltersOpen(true);
                }}
              >
                <Ionicons name="funnel-outline" size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  addMockAccount();
                }}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

          {selectedTab === "tokens" ? (
            <>
              {filteredTokens.map((token) => (
                <View key={token.id} style={styles.tokenItemWrapper}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/(modals)/token-detail?tokenId=${token.id}`);
                    }}
                    style={({ pressed }) => [
                      styles.tokenItem,
                      pressed && styles.tokenItemPressed
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.card, colors.card + 'DD']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tokenItemGradient}
                    >
                      <View style={styles.tokenLeft}>
                        <View style={[styles.tokenIconContainer, { backgroundColor: token.color + "20" }]}>
                          {token.iconType === 'custom' && token.icon === 'ethereum' ? (
                            <EthereumIcon size={24} />
                          ) : (
                            <Ionicons name={token.icon as any} size={24} color={token.color} />
                          )}
                        </View>
                        <View style={styles.tokenInfo}>
                          <Text style={styles.tokenName}>{token.name}</Text>
                          <View style={styles.tokenChange}>
                            <View style={[styles.changePill, { backgroundColor: token.change24h >= 0 ? colors.success + '15' : colors.error + '15' }]}>
                              <Ionicons
                                name={token.change24h >= 0 ? "arrow-up" : "arrow-down"}
                                size={10}
                                color={token.change24h >= 0 ? colors.success : colors.error}
                              />
                              <Text style={[styles.tokenChangeText, { color: token.change24h >= 0 ? colors.success : colors.error }]}>
                                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.tokenRight}>
                        <Text style={styles.tokenValue}>
                          {balanceVisible ? `$${token.usdValue}` : '••••'}
                        </Text>
                        <Text style={styles.tokenBalance}>
                          {balanceVisible ? `${token.balance} ${token.symbol}` : '••••'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                  <TouchableOpacity
                    style={styles.watchlistButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      if (isInWatchlist(token.id)) {
                        removeFromWatchlist(token.id);
                      } else {
                        addToWatchlist(token.id);
                      }
                    }}
                  >
                    <Ionicons
                      name={isInWatchlist(token.id) ? "star" : "star-outline"}
                      size={20}
                      color={isInWatchlist(token.id) ? colors.primary : colors.textDim}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.nftGrid}>
              {(
                (nfts && nfts.length > 0)
                  ? nfts
                  : [
                      { id: 'nft-temp-1', name: 'Azuki #4521', collection: 'Azuki', color: '#C14AFF' },
                      { id: 'nft-temp-2', name: 'BAYC #839', collection: 'Bored Ape YC', color: '#F9C23C' },
                      { id: 'nft-temp-3', name: 'MAYC #1201', collection: 'Mutant Ape YC', color: '#8BE38B' },
                      { id: 'nft-temp-4', name: 'Doodle #201', collection: 'Doodles', color: '#FF8FA3' },
                      { id: 'nft-temp-5', name: 'Pudgy #9901', collection: 'Pudgy Penguins', color: '#6AC6FF' },
                      { id: 'nft-temp-6', name: 'mfers #101', collection: 'mfers', color: '#9E9E9E' },
                    ]
              ).map((nft: any, idx: number) => (
                <Pressable
                  key={nft.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={({ pressed }) => [
                    styles.nftCard,
                    pressed && styles.nftCardPressed
                  ]}
                >
                  <View style={[styles.nftArt, { backgroundColor: nft.color + "30" }]}>
                    <Image
                      source={nftAssetImages[idx % nftAssetImages.length]}
                      style={{ width: '100%', height: '100%', borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text numberOfLines={1} style={styles.nftName}>{nft.name}</Text>
                  <Text numberOfLines={1} style={styles.nftCollection}>{nft.collection}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      <Sheet visible={accountsOpen} onClose={() => setAccountsOpen(false)}>
        <Text style={styles.sheetTitle}>Your accounts</Text>
        <ScrollView style={{ marginTop: spacing.md }}>{accountList}</ScrollView>
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Create New Account"
          style={{ alignSelf: 'stretch' }}
          icon={<Ionicons name="add" size={18} color="white" />}
          onPress={() => {
            addMockAccount();
            setAccountsOpen(false);
            router.push('/(modals)/recovery-phrase2');
          }}
        />
        {accounts.length > 1 && (
          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton
              title="Delete Active Account"
              style={{ alignSelf: 'stretch', backgroundColor: '#FF3B30' }}
              icon={<Ionicons name="trash" size={18} color="white" />}
              onPress={() => {
                setAccountsOpen(false);
                setDeletePhrase("");
                setTimeout(() => {
                  setDeleteOpen(true);
                }, 200);
              }}
            />
          </View>
        )}
      </Sheet>

      <Sheet visible={networksOpen} onClose={() => setNetworksOpen(false)}>
        <Text style={styles.sheetTitle}>Select network</Text>
        <ScrollView style={{ marginTop: spacing.md }}>{networkList}</ScrollView>
      </Sheet>

      <Sheet visible={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Text style={styles.sheetTitle}>Filter tokens</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => { setTokenFilter('all'); setFiltersOpen(false); }}>
          <Text style={[styles.listTitle, tokenFilter === 'all' && { color: colors.primary }]}>All</Text>
          <Text style={styles.listSub}>Show all tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => { setTokenFilter('gainers'); setFiltersOpen(false); }}>
          <Text style={[styles.listTitle, tokenFilter === 'gainers' && { color: colors.primary }]}>Gainers</Text>
          <Text style={styles.listSub}>24h change ≥ 0%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => { setTokenFilter('losers'); setFiltersOpen(false); }}>
          <Text style={[styles.listTitle, tokenFilter === 'losers' && { color: colors.primary }]}>Losers</Text>
          <Text style={styles.listSub}>24h change {'<'} 0%</Text>
        </TouchableOpacity>
      </Sheet>

      <Sheet visible={notificationsOpen} onClose={() => setNotificationsOpen(false)}>
        <Text style={styles.sheetTitle}>Notifications</Text>
        {/* App updates */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={[styles.listTitle, { marginBottom: spacing.sm }]}>Updates</Text>
          <Text style={styles.listSub}>No new updates</Text>
        </View>

        {/* Trending tokens */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[styles.listTitle, { marginBottom: spacing.sm }]}>Trending</Text>
          {(
            [...tokens]
              .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
              .slice(0, 5)
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.listItem}
              onPress={() => {
                setNotificationsOpen(false);
                router.push(`/(modals)/token-detail?tokenId=${t.id}`);
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.listTitle}>{t.name}</Text>
                <Text style={[styles.listTitle, { color: t.change24h >= 0 ? colors.success : colors.error }]}>
                  {t.change24h >= 0 ? '+' : ''}{t.change24h}%
                </Text>
              </View>
              <Text style={styles.listSub}>Tap to open details</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Sheet>

      {/* Verify phrase before switching to older account */}
      <Sheet visible={verifyOpen} onClose={() => setVerifyOpen(false)}>
        <Text style={styles.sheetTitle}>🔐 Verify Recovery Phrase</Text>
        <Text style={{ color: colors.textDim, marginTop: spacing.sm, marginBottom: spacing.md }}>
          For security, enter your 12-word recovery phrase to switch to the selected account.
        </Text>
        <TextInput
          value={verifyPhrase}
          onChangeText={setVerifyPhrase}
          placeholder="Type or paste your recovery phrase here..."
          placeholderTextColor={colors.textDim}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          style={{
            marginTop: spacing.sm,
            minHeight: 100,
            borderWidth: 2,
            borderColor: verifyPhrase && normalize(verifyPhrase) !== normalize(recoveryPhraseWords.join(' ')) ? colors.error : colors.border,
            backgroundColor: colors.card,
            color: colors.text,
            borderRadius: 12,
            padding: spacing.md,
            textAlignVertical: 'top',
            fontSize: 14
          }}
        />
        {verifyPhrase && normalize(verifyPhrase) !== normalize(recoveryPhraseWords.join(' ')) && (
          <Text style={{ color: colors.error, fontSize: 12, marginTop: spacing.xs }}>
            Recovery phrase doesn't match
          </Text>
        )}
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Confirm & Switch Account"
          icon={<Ionicons name="checkmark" size={18} color="white" />}
          disabled={normalize(verifyPhrase) !== normalize(recoveryPhraseWords.join(' ')) || targetIndex == null}
          onPress={() => {
            if (targetIndex == null) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setActiveIndex(targetIndex);
            setVerifyPhrase("");
            setVerifyOpen(false);
            setAccountsOpen(false);
            setTargetIndex(null);
            Alert.alert('✅ Success', 'Account switched successfully');
          }}
        />
        <TouchableOpacity
          style={{ marginTop: spacing.sm, alignItems: 'center', padding: spacing.sm }}
          onPress={() => {
            setVerifyPhrase("");
            setVerifyOpen(false);
            setTargetIndex(null);
          }}
        >
          <Text style={{ color: colors.textDim, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </Sheet>

      <Sheet visible={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <Text style={styles.sheetTitle}>⚠️ Confirm Deletion</Text>
        <Text style={{ color: colors.textDim, marginTop: spacing.sm, marginBottom: spacing.xs }}>
          This action cannot be undone. Enter your 12-word recovery phrase to delete the active account.
        </Text>
        <Text style={{ color: colors.error, fontSize: 12, marginBottom: spacing.sm }}>
          Current phrase: {recoveryPhraseWords.join(' ')}
        </Text>
        <TextInput
          value={deletePhrase}
          onChangeText={setDeletePhrase}
          placeholder="Type or paste your recovery phrase here..."
          placeholderTextColor={colors.textDim}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          style={{
            marginTop: spacing.md,
            minHeight: 100,
            borderWidth: 2,
            borderColor: deletePhrase && normalize(deletePhrase) !== normalize(recoveryPhraseWords.join(' ')) ? colors.error : colors.border,
            backgroundColor: colors.card,
            color: colors.text,
            borderRadius: 12,
            padding: spacing.md,
            textAlignVertical: 'top',
            fontSize: 14
          }}
        />
        {deletePhrase && normalize(deletePhrase) !== normalize(recoveryPhraseWords.join(' ')) && (
          <Text style={{ color: colors.error, fontSize: 12, marginTop: spacing.xs }}>
            Recovery phrase doesn't match
          </Text>
        )}
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Confirm Delete Account"
          icon={<Ionicons name="trash" size={18} color="white" />}
          style={{ backgroundColor: colors.error }}
          disabled={normalize(deletePhrase) !== normalize(recoveryPhraseWords.join(' '))}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const indexToDelete = activeIndex;

            // Close sheets first
            setDeletePhrase("");
            setDeleteOpen(false);
            setAccountsOpen(false);

            // Then remove account after UI has settled
            setTimeout(() => {
              removeAccount(indexToDelete);
              Alert.alert('Account Deleted', 'Account has been removed successfully');
            }, 150);
          }}
        />
        <TouchableOpacity
          style={{ marginTop: spacing.sm, alignItems: 'center', padding: spacing.sm }}
          onPress={() => {
            setDeletePhrase("");
            setDeleteOpen(false);
          }}
        >
          <Text style={{ color: colors.textDim, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40'
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  networkSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card + 'CC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card + 'CC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  accountIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center"
  },
  accountAddress: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerIcon: { padding: spacing.xs },

  // Portfolio
  portfolioSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border + '60',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  welcomeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
    letterSpacing: 0.5
  },
  portfolioHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  portfolioLabel: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  portfolioValue: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1
  },
  eyeButton: {
    padding: spacing.sm,
    backgroundColor: colors.chip,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  portfolioChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700"
  },
  changeSubtext: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600"
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + '60',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4
  },
  actionBtnGradient: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card + 'AA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center"
  },
  tabActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  tabText: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "700"
  },
  tabTextActive: {
    color: colors.primary
  },
  tabIndicator: {
    position: "absolute",
    bottom: 4,
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2
  },

  // Token List
  tokenList: {
    flex: 1,
    backgroundColor: colors.bg
  },
  sortButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1
  },
  sortBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500"
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },

  // Token Item
  tokenItemWrapper: {
    position: "relative",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  tokenItem: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + '80',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  tokenItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }]
  },
  watchlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10
  },
  tokenItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1
  },
  tokenIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6
  },
  tokenInfo: {
    flex: 1
  },
  tokenName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  tokenChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  changePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 8
  },
  tokenChangeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  tokenRight: {
    alignItems: "flex-end"
  },
  tokenValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4
  },
  tokenBalance: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "600"
  },

  // NFT Grid
  nftGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  nftCard: {
    width: "47%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border + '80',
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6
  },
  nftCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  },
  nftArt: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + '40'
  },
  nftName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  nftCollection: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 3,
    fontWeight: "600"
  },

  // Analytics Section
  analyticsSection: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  analyticsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + '60'
  },
  analyticsGradient: {
    padding: spacing.md
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  analyticsTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600"
  },
  analyticsValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  analyticsSubtext: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "500"
  },

  // Sheet styles
  sheetTitle: { color: colors.text, fontWeight: "700", fontSize: 18 },
  listItem: { paddingVertical: spacing.md, borderBottomColor: colors.border, borderBottomWidth: 1 },
  listTitle: { color: colors.text, fontWeight: "700" },
  listSub: { color: colors.textDim, marginTop: 4 },
});


