import { Ionicons } from "@expo/vector-icons";
import { EthereumIcon } from "../../components/icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "../../components/PrimaryButton";
import { useWalletUi } from "../../context/WalletUiContext";
import { buyToken, isAuthed } from "../../lib/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function BuyModal() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex, tokens } = useWalletUi();
  const [amount, setAmount] = useState("1,284");
  const [selectedToken, setSelectedToken] = useState("pepe");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const active = accounts[activeIndex];
  const net = networks[networkIndex];
  const token = tokens.find(t => t.id === selectedToken) || tokens[0];

  const handleGetQuotes = async () => {
    const fiatAmt = parseFloat(amount.replace(/,/g, ''));

    if (!fiatAmt || fiatAmt <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (fiatAmt < 10) {
      Alert.alert("Minimum Purchase", "Minimum purchase amount is $10");
      return;
    }

    // Calculate crypto amount based on token price
    const tokenPrice = parseFloat(token.price);
    const cryptoAmt = fiatAmt / tokenPrice;
    const processingFee = fiatAmt * 0.015;
    const totalFiat = fiatAmt + processingFee;

    Alert.alert(
      "Confirm Purchase",
      `Buy ${cryptoAmt.toFixed(6)} ${token.symbol} for $${totalFiat.toFixed(2)}?\n\nAmount: $${fiatAmt}\nFee (1.5%): $${processingFee.toFixed(2)}\nTotal: $${totalFiat.toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: async () => {
            try {
              // Call API to record purchase transaction
              if (isAuthed()) {
                const result = await buyToken({
                  walletAddress: active.address,
                  tokenId: selectedToken,
                  cryptoAmount: cryptoAmt,
                  fiatAmount: fiatAmt,
                  fiatCurrency: selectedCurrency,
                  paymentMethod: 'card',
                  chain: net.id
                });
                console.log('Buy transaction recorded:', result);
              } else {
                console.log('Not authenticated, purchase simulated locally');
                // For demo purposes, still show success even if not authenticated
              }

              Alert.alert(
                "Purchase Successful!",
                `You bought ${cryptoAmt.toFixed(6)} ${token.symbol} for $${totalFiat.toFixed(2)}!\n\nThe crypto will appear in your wallet shortly.`,
                [
                  { text: "View Transactions", onPress: () => router.push('/(tabs)/transactions') },
                  { text: "Done", onPress: () => router.back() }
                ]
              );
            } catch (error: any) {
              console.error('Buy error:', error);
              Alert.alert("Failed", error.message || "Purchase failed. Please try again.");
            }
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
            <Text style={styles.headerTitle}>Amount to buy</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Account Selector */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.accountSelector}>
                <View style={[styles.accountIcon, { backgroundColor: colors.error + "30" }]}>
                  <View style={styles.accountDot} />
                  <Text style={styles.accountLabel}>Account 1 (0xE94b...3bFf)</Text>
                </View>
                <View style={styles.accountRight}>
                  <Ionicons name="flag" size={16} color={colors.textDim} />
                  <Ionicons name="chevron-down" size={16} color={colors.text} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Token Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>You want to buy</Text>
              <TouchableOpacity style={styles.tokenSelector}>
                <View style={styles.tokenLeft}>
                  <View style={[styles.tokenIcon, { backgroundColor: token.color + "20" }]}>
                    {token.iconType === 'custom' && token.icon === 'ethereum' ? (
                      <EthereumIcon size={24} color={token.color} />
                    ) : (
                      <Ionicons name={token.icon as any} size={24} color={token.color} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.balanceText}>Current balance: 0 PEPE</Text>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textDim}
                />
                <TouchableOpacity style={styles.currencySelector}>
                  <Text style={styles.currencyText}>{selectedCurrency}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Update payment method</Text>
              <TouchableOpacity style={styles.paymentMethod}>
                <View style={styles.paymentLeft}>
                  <Ionicons name="card" size={20} color={colors.text} />
                  <Text style={styles.paymentText}>Debit or Credit</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                You'll be redirected to a payment provider to complete your purchase. Quotes are estimates and may vary.
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Get Quotes Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.quoteBtn} onPress={handleGetQuotes}>
              <LinearGradient
                colors={[colors.primary, "#4A8FFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quoteBtnGradient}
              >
                <Text style={styles.quoteBtnText}>Get quotes</Text>
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
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  cancelText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600"
  },

  // Section
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm
  },

  // Account Selector
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  accountIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error
  },
  accountLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  accountRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },

  // Token Selector
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  tokenName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  tokenSymbol: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2
  },
  balanceText: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: spacing.xs
  },

  // Amount
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  currencySymbol: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginRight: spacing.xs
  },
  amountInput: {
    flex: 1,
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    padding: 0
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  currencyText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },

  // Payment Method
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  paymentText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },

  // Info Box
  infoBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primary + "15",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  infoText: {
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
  quoteBtn: {
    borderRadius: 16,
    overflow: "hidden"
  },
  quoteBtnGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: "center"
  },
  quoteBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  }
});
