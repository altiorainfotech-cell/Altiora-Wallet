import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EthereumIcon } from "../../components/icons";
import Sheet from "../../components/Sheet";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function Home() {
  const router = useRouter();
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
    addMockAccount
  } = useWalletUi();
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [networksOpen, setNetworksOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"tokens" | "nfts">("tokens");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tokenFilter, setTokenFilter] = useState<"all" | "gainers" | "losers">("all");

  const active = accounts[activeIndex];
  const net = networks[networkIndex];

  const copyAddress = async () => {
    if (active?.address) {
      await Clipboard.setStringAsync(active.address);
      Alert.alert("Copied!", "Address copied to clipboard");
    }
  };

  const accountList = useMemo(
    () =>
      accounts.map((a, i) => (
        <TouchableOpacity key={a.id} style={styles.listItem}
          onPress={() => { setActiveIndex(i); setAccountsOpen(false); }}>
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setNetworksOpen(true)} style={styles.networkSelector}>
              <Ionicons name="globe" size={20} color={colors.primary} />
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAccountsOpen(true)} style={styles.accountSelector}>
              <View style={styles.accountIcon}>
                <Ionicons name="person" size={14} color={colors.primary} />
              </View>
              <Text style={styles.accountAddress}>{active?.address || "Account"}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push("/(tabs)/settings")}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.tokenList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        >
          {/* Portfolio Value */}
          <View style={styles.portfolioSection}>
            <View style={styles.portfolioHeader}>
              <Text style={styles.portfolioValue}>
                {balanceVisible ? `$${totalPortfolioValue}` : '****'}
              </Text>
              <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                <Ionicons
                  name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textDim}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.portfolioChange}>
              <Ionicons
                name={portfolioChange24h >= 0 ? "arrow-up" : "arrow-down"}
                size={14}
                color={portfolioChange24h >= 0 ? colors.success : colors.error}
              />
              <Text style={[styles.changeText, { color: portfolioChange24h >= 0 ? colors.success : colors.error }]}>
                {balanceVisible
                  ? `$${Math.abs((parseFloat(totalPortfolioValue) * portfolioChange24h) / 100).toFixed(2)} (${portfolioChange24h >= 0 ? "+" : ""}${portfolioChange24h.toFixed(2)}%)`
                  : '****'
                }
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "tokens" && styles.tabActive]}
              onPress={() => setSelectedTab("tokens")}
            >
              <Text style={[styles.tabText, selectedTab === "tokens" && styles.tabTextActive]}>Tokens</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "nfts" && styles.tabActive]}
              onPress={() => setSelectedTab("nfts")}
            >
              <Text style={[styles.tabText, selectedTab === "nfts" && styles.tabTextActive]}>NFTs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortButtons}>
              <TouchableOpacity style={styles.sortBtn}>
                <Text style={styles.sortBtnText}>{selectedTab === "tokens" ? "Popular networks" : "Top collections"}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFiltersOpen(true)}>
                <Ionicons name="funnel-outline" size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={addMockAccount}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

          {selectedTab === "tokens" ? (
            <>
              {filteredTokens.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenItem}
                  onPress={() => router.push(`/(modals)/token-detail?tokenId=${token.id}`)}
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
                        <Ionicons
                          name={token.change24h >= 0 ? "arrow-up" : "arrow-down"}
                          size={12}
                          color={token.change24h >= 0 ? colors.success : colors.error}
                        />
                        <Text style={[styles.tokenChangeText, { color: token.change24h >= 0 ? colors.success : colors.error }]}>
                          {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.tokenRight}>
                    <Text style={styles.tokenValue}>
                      {balanceVisible ? `$${token.usdValue}` : '****'}
                    </Text>
                    <Text style={styles.tokenBalance}>
                      {balanceVisible ? `${token.balance} ${token.symbol}` : '****'}
                    </Text>
                  </View>
                </TouchableOpacity>
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
              ).map((nft: any) => (
                <TouchableOpacity key={nft.id} style={styles.nftCard}>
                  <View style={[styles.nftArt, { backgroundColor: nft.color + "30" }]}>
                    <Ionicons name="image-outline" size={28} color={nft.color} />
                  </View>
                  <Text numberOfLines={1} style={styles.nftName}>{nft.name}</Text>
                  <Text numberOfLines={1} style={styles.nftCollection}>{nft.collection}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        </View>


      <Sheet visible={accountsOpen} onClose={() => setAccountsOpen(false)}>
        <Text style={styles.sheetTitle}>Your accounts</Text>
        <ScrollView style={{ marginTop: spacing.md }}>{accountList}</ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  networkSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1
  },
  accountIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  portfolioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  portfolioValue: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800"
  },
  portfolioChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600"
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: "transparent"
  },
  tabActive: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border
  },
  tabText: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "600"
  },
  tabTextActive: {
    color: colors.text
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
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1
  },
  tokenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  tokenInfo: {
    flex: 1
  },
  tokenName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2
  },
  tokenChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  tokenChangeText: {
    fontSize: 12,
    fontWeight: "600"
  },
  tokenRight: {
    alignItems: "flex-end"
  },
  tokenValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2
  },
  tokenBalance: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "500"
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm
  },
  nftArt: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  nftName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  nftCollection: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2
  },

  // Sheet styles
  sheetTitle: { color: colors.text, fontWeight: "700", fontSize: 18 },
  listItem: { paddingVertical: spacing.md, borderBottomColor: colors.border, borderBottomWidth: 1 },
  listTitle: { color: colors.text, fontWeight: "700" },
  listSub: { color: colors.textDim, marginTop: 4 },
});

