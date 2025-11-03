import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "../../components/PrimaryButton";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function StakeModal() {
  const router = useRouter();
  const { accounts, activeIndex, tokens } = useWalletUi();
  const [amount, setAmount] = useState("");

  const active = accounts[activeIndex];
  const ethToken = tokens.find(t => t.symbol === "ETH") || tokens[0];

  const handleStake = () => {
    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    Alert.alert(
      "Confirm Staking",
      `Stake ${amount} wETH?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "Staking initiated successfully");
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
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Stake</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Token Display */}
            <View style={styles.tokenDisplay}>
              <View style={[styles.tokenIcon, { backgroundColor: ethToken.color + "20" }]}>
                <Ionicons name={ethToken.icon as any} size={40} color={ethToken.color} />
              </View>
              <Text style={styles.amountLabel}>0.0002 wETH</Text>
              <Text style={styles.usdValue}>$66.26</Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Staking from</Text>
                <View style={styles.accountBadge}>
                  <View style={styles.accountDot} />
                  <Text style={styles.accountText}>Account 1</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Interacting with</Text>
                <View style={styles.protocolBadge}>
                  <View style={styles.protocolIcon} />
                  <Text style={styles.protocolText}>OxEpT...4A3</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Network</Text>
                <View style={styles.networkBadge}>
                  <Ionicons name="globe" size={14} color={colors.primary} />
                  <Text style={styles.networkText}>Ethereum Main Network</Text>
                </View>
              </View>
            </View>

            {/* Rewards Info */}
            <View style={styles.rewardsSection}>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Reward rate</Text>
                <View style={styles.helpIcon}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
                </View>
                <Text style={styles.rewardValue}>2.5%</Text>
              </View>

              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Est. annual reward</Text>
                <Text style={styles.rewardValue}>$334.99  0.13 ETH</Text>
              </View>

              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Reward frequency</Text>
                <View style={styles.helpIcon}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
                </View>
                <Text style={styles.rewardValue}>12 hours</Text>
              </View>
            </View>

            {/* Unstaking Time */}
            <View style={styles.unstakingSection}>
              <View style={styles.unstakingRow}>
                <Text style={styles.unstakingLabel}>Unstaking time</Text>
                <View style={styles.helpIcon}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
                </View>
                <Text style={styles.unstakingValue}>1 to 11 days</Text>
              </View>
            </View>

            {/* Legal Links */}
            <View style={styles.legalSection}>
              <TouchableOpacity>
                <Text style={styles.legalLink}>Terms of service</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>  •  </Text>
              <TouchableOpacity>
                <Text style={styles.legalLink}>Risk disclosure</Text>
              </TouchableOpacity>
            </View>

            {/* Warning Box */}
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text style={styles.warningText}>
                Your funds will be locked for the staking period. Make sure you understand the risks before proceeding.
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleStake}
            >
              <LinearGradient
                colors={[colors.primary, "#4A8FFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>Confirm</Text>
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
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },

  // Token Display
  tokenDisplay: {
    alignItems: "center",
    paddingVertical: spacing.xl
  },
  tokenIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  amountLabel: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  usdValue: {
    color: colors.textDim,
    fontSize: 16,
    fontWeight: "500"
  },

  // Info Section
  infoSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm
  },
  infoLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500",
    flex: 1
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.error + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error
  },
  accountText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  protocolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  protocolIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.warning
  },
  protocolText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  networkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600"
  },

  // Rewards Section
  rewardsSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  rewardLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500",
    flex: 1
  },
  helpIcon: {
    marginLeft: spacing.xs
  },
  rewardValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: "auto"
  },

  // Unstaking Section
  unstakingSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  unstakingRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  unstakingLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500",
    flex: 1
  },
  unstakingValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: "auto"
  },

  // Legal Section
  legalSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  legalLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600"
  },
  legalDivider: {
    color: colors.textDim,
    fontSize: 13
  },

  // Warning Box
  warningBox: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.warning + "15",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + "30",
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

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  cancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden"
  },
  confirmGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: "center"
  },
  confirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  }
});
