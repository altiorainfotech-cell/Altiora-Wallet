import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import AccountCard from "../../components/AccountCard";
import PrimaryButton from "../../components/PrimaryButton";
import Sheet from "../../components/Sheet";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function Home() {
  const router = useRouter();
  const { accounts, activeIndex, setActiveIndex, networks, networkIndex, setNetworkIndex, addMockAccount } = useWalletUi();
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [networksOpen, setNetworksOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoLinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header with wallet info */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good evening</Text>
                <Text style={styles.subGreeting}>Non-Custodial Multichain Wallet</Text>
              </View>
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => router.push("/(tabs)/settings")}
              >
                <Ionicons name="settings-outline" size={24} color={colors.textDim} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerSelectors}>
              <TouchableOpacity onPress={() => setAccountsOpen(true)} style={styles.headerChip}>
                <View style={styles.chipIcon}>
                  <Ionicons name="wallet" size={16} color={colors.primary} />
                </View>
                <Text style={styles.headerText}>{active?.label || "Wallet"}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setNetworksOpen(true)} style={styles.headerChip}>
                <View style={styles.chipIcon}>
                  <Ionicons name="globe" size={16} color={colors.primary} />
                </View>
                <Text style={styles.headerText}>{net.name}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Account Card */}
          <View style={styles.cardContainer}>
            <ExpoLinearGradient 
              colors={['#1A1F2E', '#242B3D']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 1}}
              style={styles.enhancedCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{active?.label || "Main Account"}</Text>
                  <Text style={styles.cardSubtitle}>Non-custodial • Secure</Text>
                </View>
                <View style={styles.networkBadge}>
                  <Text style={styles.networkBadgeText}>{net.name}</Text>
                </View>
              </View>
              
              <View style={styles.balanceSection}>
                <View style={styles.balanceLabelRow}>
                  <Text style={styles.balanceLabel}>Total Balance</Text>
                  <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                    <Ionicons
                      name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.balance}>
                    {balanceVisible ? (active?.balance || "0.0000") : "••••••"}
                  </Text>
                  {balanceVisible && <Text style={styles.symbol}>{net.symbol}</Text>}
                </View>
                <Text style={styles.usdValue}>
                  {balanceVisible ? "≈ $0.00 USD" : "••••••"}
                </Text>
              </View>
              
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Address</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
                    {active?.address || "0x...."}
                  </Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </ExpoLinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.sendBtn]}
              onPress={() => router.push("/(modals)/send")}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="arrow-up" size={22} color="white" />
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.receiveBtn]}
              onPress={() => router.push("/(modals)/receive")}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="arrow-down" size={22} color="white" />
              </View>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.swapBtn]}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="swap-horizontal" size={22} color="white" />
              </View>
              <Text style={styles.actionText}>Swap</Text>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet Features</Text>
            <View style={styles.featuresGrid}>
              <TouchableOpacity onPress={addMockAccount} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Add Account</Text>
                <Text style={styles.featureDesc}>Create new wallet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Security</Text>
                <Text style={styles.featureDesc}>Backup & recovery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="analytics" size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Portfolio</Text>
                <Text style={styles.featureDesc}>Track assets</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="link" size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>DApps</Text>
                <Text style={styles.featureDesc}>Connect to apps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ExpoLinearGradient>

      <Sheet visible={accountsOpen} onClose={() => setAccountsOpen(false)}>
        <Text style={styles.sheetTitle}>Your accounts</Text>
        <ScrollView style={{ marginTop: spacing.md }}>{accountList}</ScrollView>
      </Sheet>

      <Sheet visible={networksOpen} onClose={() => setNetworksOpen(false)}>
        <Text style={styles.sheetTitle}>Select network</Text>
        <ScrollView style={{ marginTop: spacing.md }}>{networkList}</ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Header styles
  header: { marginBottom: spacing.xl },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  greeting: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subGreeting: { color: colors.textDim, fontSize: 13, marginTop: 4, fontWeight: "500" },
  settingsBtn: { padding: spacing.sm, marginTop: -4 },
  headerSelectors: { flexDirection: "row", gap: spacing.md },
  headerChip: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: spacing.sm, 
    backgroundColor: colors.card, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1
  },
  chipIcon: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: colors.chip, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerText: { color: colors.text, fontWeight: "600", flex: 1 },
  
  // Enhanced card styles
  cardContainer: { marginBottom: spacing.xl },
  enhancedCard: { 
    borderRadius: 20, 
    padding: spacing.lg, 
    borderWidth: 1, 
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  cardTitle: { color: colors.text, fontWeight: "700", fontSize: 18 },
  cardSubtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  networkBadge: { 
    backgroundColor: colors.primary + "20", 
    paddingHorizontal: spacing.sm, 
    paddingVertical: 4, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "40"
  },
  networkBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "600" },

  balanceSection: { marginBottom: spacing.lg },
  balanceLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  balanceLabel: { color: colors.textDim, fontSize: 12 },
  balanceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  balance: { color: colors.text, fontSize: 32, fontWeight: "800" },
  symbol: { color: colors.textDim, marginLeft: spacing.sm, fontSize: 18, fontWeight: "600" },
  usdValue: { color: colors.textDim, fontSize: 14 },
  
  addressSection: {},
  addressLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  address: { color: colors.text, fontSize: 14, fontFamily: "monospace", flex: 1 },
  copyBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  
  // Action buttons
  actions: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg + 2,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  sendBtn: {
    backgroundColor: "#FF6B6B",
  },
  receiveBtn: {
    backgroundColor: "#4ECDC4",
  },
  swapBtn: {
    backgroundColor: colors.primary,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  actionText: { color: "white", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
  
  // Features section
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.text, fontWeight: "700", fontSize: 20, marginBottom: spacing.lg },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg + 4,
    borderWidth: 1,
    borderColor: colors.border,
    width: "47%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  featureIcon: { marginBottom: spacing.sm + 2 },
  featureTitle: { color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 4 },
  featureDesc: { color: colors.textDim, fontSize: 12, textAlign: "center", lineHeight: 16 },
  
  // Sheet styles
  sheetTitle: { color: colors.text, fontWeight: "700", fontSize: 18 },
  listItem: { paddingVertical: spacing.md, borderBottomColor: colors.border, borderBottomWidth: 1 },
  listTitle: { color: colors.text, fontWeight: "700" },
  listSub: { color: colors.textDim, marginTop: 4 },
});
