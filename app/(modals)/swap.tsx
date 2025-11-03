import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function SwapModal() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex, tokens } = useWalletUi();

  const [fromTokenId, setFromTokenId] = useState("eth");
  const [toTokenId, setToTokenId] = useState("usdc");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);

  const active = accounts[activeIndex];
  const net = networks[networkIndex];
  const fromToken = tokens.find(t => t.id === fromTokenId) || tokens[0];
  const toToken = tokens.find(t => t.id === toTokenId) || tokens[1];

  // Calculate exchange rate and output amount
  const exchangeRate = useMemo(() => {
    const fromPrice = parseFloat(fromToken.price);
    const toPrice = parseFloat(toToken.price);
    return fromPrice / toPrice;
  }, [fromToken, toToken]);

  const toAmount = useMemo(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) return "0.00";
    const amount = parseFloat(fromAmount) * exchangeRate;
    return amount.toFixed(6);
  }, [fromAmount, exchangeRate]);

  const estimatedGasFee = "0.0015"; // Mock gas fee
  const gasFeeUSD = (parseFloat(estimatedGasFee) * parseFloat(tokens[0].price)).toFixed(2);

  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (parseFloat(fromAmount) > parseFloat(fromToken.balance)) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    Alert.alert(
      "Confirm Swap",
      `Swap ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}?\n\nGas Fee: ${estimatedGasFee} ETH (~$${gasFeeUSD})`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "Swap executed successfully!");
            router.back();
          }
        }
      ]
    );
  };

  const handleSwitchTokens = () => {
    setFromTokenId(toTokenId);
    setToTokenId(fromTokenId);
    if (fromAmount) {
      setFromAmount(toAmount);
    }
  };

  const handleSetMax = () => {
    setFromAmount(fromToken.balance);
  };

  const TokenSelector = ({
    token,
    onPress,
    label
  }: {
    token: typeof fromToken;
    onPress: () => void;
    label: string;
  }) => (
    <View style={styles.tokenSection}>
      <Text style={styles.tokenSectionLabel}>{label}</Text>
      <TouchableOpacity style={styles.tokenSelector} onPress={onPress}>
        <View style={styles.tokenLeft}>
          <View style={[styles.tokenIcon, { backgroundColor: token.color + "20" }]}>
            <Ionicons name={token.icon as any} size={28} color={token.color} />
          </View>
          <View>
            <Text style={styles.tokenName}>{token.symbol}</Text>
            <Text style={styles.tokenBalance}>Balance: {token.balance}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  if (showFromTokens || showToTokens) {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  setShowFromTokens(false);
                  setShowToTokens(false);
                }}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Select Token</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textDim} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tokens..."
                placeholderTextColor={colors.textDim}
              />
            </View>

            <ScrollView style={styles.tokenList}>
              {tokens
                .filter(t => showFromTokens ? t.id !== toTokenId : t.id !== fromTokenId)
                .map((token) => (
                  <TouchableOpacity
                    key={token.id}
                    style={styles.tokenListItem}
                    onPress={() => {
                      if (showFromTokens) {
                        setFromTokenId(token.id);
                        setShowFromTokens(false);
                      } else {
                        setToTokenId(token.id);
                        setShowToTokens(false);
                      }
                    }}
                  >
                    <View style={styles.tokenListLeft}>
                      <View style={[styles.tokenIcon, { backgroundColor: token.color + "20" }]}>
                        <Ionicons name={token.icon as any} size={28} color={token.color} />
                      </View>
                      <View>
                        <Text style={styles.tokenListName}>{token.name}</Text>
                        <Text style={styles.tokenListSymbol}>{token.symbol}</Text>
                      </View>
                    </View>
                    <View style={styles.tokenListRight}>
                      <Text style={styles.tokenListBalance}>{token.balance}</Text>
                      <Text style={styles.tokenListValue}>${token.usdValue}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.headerTitle}>Swap Tokens</Text>
              <Text style={styles.headerSubtitle}>Trade instantly</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* From Token Section */}
            <View style={styles.swapCard}>
              <TokenSelector
                token={fromToken}
                onPress={() => setShowFromTokens(true)}
                label="From"
              />

              <View style={styles.amountSection}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.0"
                  placeholderTextColor={colors.textDim}
                  value={fromAmount}
                  onChangeText={setFromAmount}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity style={styles.maxBtn} onPress={handleSetMax}>
                  <Text style={styles.maxBtnText}>MAX</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.usdValue}>
                ≈ ${fromAmount ? (parseFloat(fromAmount) * parseFloat(fromToken.price)).toFixed(2) : "0.00"} USD
              </Text>
            </View>

            {/* Switch Button */}
            <View style={styles.switchContainer}>
              <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchTokens}>
                <LinearGradient
                  colors={[colors.primary, "#4A8FFF"]}
                  style={styles.switchBtnGradient}
                >
                  <Ionicons name="swap-vertical" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* To Token Section */}
            <View style={styles.swapCard}>
              <TokenSelector
                token={toToken}
                onPress={() => setShowToTokens(true)}
                label="To"
              />

              <View style={styles.amountSection}>
                <Text style={styles.amountOutput}>{toAmount}</Text>
              </View>

              <Text style={styles.usdValue}>
                ≈ ${toAmount ? (parseFloat(toAmount) * parseFloat(toToken.price)).toFixed(2) : "0.00"} USD
              </Text>
            </View>

            {/* Exchange Rate */}
            {fromAmount && parseFloat(fromAmount) > 0 && (
              <View style={styles.rateCard}>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>Rate</Text>
                  <View style={styles.rateValue}>
                    <Text style={styles.rateText}>
                      1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
                    </Text>
                    <Ionicons name="refresh" size={16} color={colors.primary} />
                  </View>
                </View>
              </View>
            )}

            {/* Swap Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Swap Details</Text>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>Slippage Tolerance</Text>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
                </View>
                <TouchableOpacity style={styles.slippageBtn}>
                  <Text style={styles.detailValue}>{slippage}%</Text>
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Network Fee</Text>
                <Text style={styles.detailValue}>{estimatedGasFee} ETH (~${gasFeeUSD})</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Route</Text>
                <View style={styles.routeBadge}>
                  <Text style={styles.routeText}>Uniswap V3</Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Minimum Received</Text>
                <Text style={styles.detailValue}>
                  {toAmount ? (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6) : "0.00"} {toToken.symbol}
                </Text>
              </View>
            </View>

            {/* Warning Box */}
            <View style={styles.warningBox}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.warningText}>
                This swap is routed through Uniswap V3 for the best exchange rate
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Swap Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.swapButton,
                (!fromAmount || parseFloat(fromAmount) <= 0) && styles.swapButtonDisabled
              ]}
              onPress={handleSwap}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            >
              <LinearGradient
                colors={
                  !fromAmount || parseFloat(fromAmount) <= 0
                    ? [colors.textDim, colors.textDim]
                    : [colors.primary, "#4A8FFF"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.swapButtonGradient}
              >
                <Text style={styles.swapButtonText}>
                  {!fromAmount || parseFloat(fromAmount) <= 0 ? "Enter Amount" : "Review Swap"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  settingsBtn: { padding: spacing.xs },

  // Swap Card
  swapCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },

  // Token Section
  tokenSection: {
    marginBottom: spacing.md
  },
  tokenSectionLabel: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm
  },
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  tokenName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  tokenBalance: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2
  },

  // Amount Section
  amountSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  amountInput: {
    flex: 1,
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    padding: 0
  },
  amountOutput: {
    flex: 1,
    color: colors.text,
    fontSize: 32,
    fontWeight: "800"
  },
  maxBtn: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  maxBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  usdValue: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "500"
  },

  // Switch Button
  switchContainer: {
    alignItems: "center",
    marginVertical: -spacing.lg
  },
  switchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.bg
  },
  switchBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  // Rate Card
  rateCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rateLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500"
  },
  rateValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  rateText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },

  // Details Card
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  detailsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  detailLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500"
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm
  },
  slippageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  routeBadge: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  routeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "600"
  },

  // Warning Box
  warningBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.success + "15",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + "30",
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  warningText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    flex: 1
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  swapButton: {
    borderRadius: 16,
    overflow: "hidden"
  },
  swapButtonDisabled: {
    opacity: 0.5
  },
  swapButtonGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: "center"
  },
  swapButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  },

  // Token List Screen
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  tokenList: {
    flex: 1,
    marginTop: spacing.md
  },
  tokenListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tokenListLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  tokenListName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  tokenListSymbol: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2
  },
  tokenListRight: {
    alignItems: "flex-end"
  },
  tokenListBalance: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  tokenListValue: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2
  }
});
