import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

type DApp = {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  chains: string[];
  category: string;
};

const POPULAR_DAPPS: DApp[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    url: "https://app.uniswap.org",
    icon: "swap-horizontal",
    description: "Decentralized exchange protocol",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
    category: "DeFi"
  },
  {
    id: "aave",
    name: "Aave",
    url: "https://app.aave.com",
    icon: "trending-up",
    description: "Decentralized lending protocol",
    chains: ["Ethereum", "Polygon", "Avalanche"],
    category: "DeFi"
  },
  {
    id: "opensea",
    name: "OpenSea",
    url: "https://opensea.io",
    icon: "images",
    description: "NFT marketplace",
    chains: ["Ethereum", "Polygon", "Solana"],
    category: "NFT"
  },
  {
    id: "compound",
    name: "Compound",
    url: "https://app.compound.finance",
    icon: "analytics",
    description: "Autonomous interest rate protocol",
    chains: ["Ethereum", "Polygon"],
    category: "DeFi"
  },
  {
    id: "curve",
    name: "Curve",
    url: "https://curve.fi",
    icon: "trending-down",
    description: "Stablecoin exchange",
    chains: ["Ethereum", "Polygon", "Arbitrum"],
    category: "DeFi"
  },
  {
    id: "pancakeswap",
    name: "PancakeSwap",
    url: "https://pancakeswap.finance",
    icon: "restaurant",
    description: "DEX on BSC",
    chains: ["Binance Smart Chain", "Ethereum"],
    category: "DeFi"
  }
];

export default function ConnectDAppModal() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex } = useWalletUi();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const active = accounts[activeIndex];
  const net = networks[networkIndex];

  const categories = ["All", "DeFi", "NFT", "Gaming", "Social"];

  const filteredDApps = POPULAR_DAPPS.filter(dapp => {
    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || dapp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = (dapp: DApp) => {
    Alert.alert(
      "Connect to dApp",
      `Connect ${active.label} to ${dapp.name}?\n\nSupported chains: ${dapp.chains.join(", ")}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: () => {
            Alert.alert("Connected!", `Successfully connected to ${dapp.name}`);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Connect to dApps</Text>
              <Text style={styles.headerSubtitle}>Multi-chain support</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textDim} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dApps..."
                placeholderTextColor={colors.textDim}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={colors.textDim} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryBtn, selectedCategory === category && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Account & Network */}
          <View style={styles.connectionInfo}>
            <View style={styles.connectionRow}>
              <View style={styles.connectionItem}>
                <Ionicons name="person-circle" size={16} color={colors.primary} />
                <Text style={styles.connectionText}>{active.label}</Text>
              </View>
              <View style={styles.connectionItem}>
                <Ionicons name="globe" size={16} color={colors.success} />
                <Text style={styles.connectionText}>{net.name}</Text>
              </View>
            </View>
          </View>

          {/* dApp List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dappList}>
            <Text style={styles.sectionTitle}>Popular dApps</Text>

            {filteredDApps.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={colors.textDim} />
                <Text style={styles.emptyText}>No dApps found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              </View>
            ) : (
              filteredDApps.map((dapp) => (
                <TouchableOpacity
                  key={dapp.id}
                  style={styles.dappCard}
                  onPress={() => handleConnect(dapp)}
                >
                  <View style={styles.dappLeft}>
                    <View style={[styles.dappIcon, { backgroundColor: colors.primary + "20" }]}>
                      <Ionicons name={dapp.icon as any} size={28} color={colors.primary} />
                    </View>
                    <View style={styles.dappInfo}>
                      <Text style={styles.dappName}>{dapp.name}</Text>
                      <Text style={styles.dappDescription}>{dapp.description}</Text>
                      <View style={styles.chainBadges}>
                        {dapp.chains.slice(0, 3).map((chain, index) => (
                          <View key={index} style={styles.chainBadge}>
                            <Text style={styles.chainBadgeText}>{chain}</Text>
                          </View>
                        ))}
                        {dapp.chains.length > 3 && (
                          <View style={styles.chainBadge}>
                            <Text style={styles.chainBadgeText}>+{dapp.chains.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>
              ))
            )}

            {/* Custom URL Section */}
            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>Custom dApp</Text>
              <View style={styles.customCard}>
                <Ionicons name="link" size={24} color={colors.primary} />
                <View style={styles.customInfo}>
                  <Text style={styles.customTitle}>Connect to custom dApp</Text>
                  <Text style={styles.customDescription}>
                    Enter a custom URL to connect to any Web3 application
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  headerSubtitle: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2
  },

  // Search Section
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: spacing.xs
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  categoriesContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  categoryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600"
  },
  categoryTextActive: {
    color: "white"
  },

  // Connection Info
  connectionInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  connectionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  connectionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },

  // dApp List
  dappList: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },

  // dApp Card
  dappCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  dappLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1
  },
  dappIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  dappInfo: {
    flex: 1
  },
  dappName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  dappDescription: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: spacing.sm
  },
  chainBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  chainBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8
  },
  chainBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "600"
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.md
  },
  emptySubtext: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.xs
  },

  // Custom Section
  customSection: {
    marginTop: spacing.lg
  },
  customCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed"
  },
  customInfo: {
    flex: 1
  },
  customTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4
  },
  customDescription: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18
  }
});
