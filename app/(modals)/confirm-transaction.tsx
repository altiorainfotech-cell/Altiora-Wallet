import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function ConfirmTransactionModal() {
  const router = useRouter();
  const { accounts, activeIndex, tokens } = useWalletUi();

  const active = accounts[activeIndex];
  const ethToken = tokens.find(t => t.symbol === "ETH") || tokens[0];

  const handleTransfer = () => {
    Alert.alert(
      "Transaction Submitted",
      "Your transaction has been submitted to the network",
      [
        {
          text: "OK",
          onPress: () => router.back()
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
            <Text style={styles.headerTitle}>Transfer request</Text>
            <TouchableOpacity>
              <Ionicons name="close-circle-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Display */}
            <View style={styles.amountSection}>
              <View style={[styles.tokenIcon, { backgroundColor: ethToken.color + "20" }]}>
                <Ionicons name={ethToken.icon as any} size={40} color={ethToken.color} />
              </View>
              <Text style={styles.amount}>0.0002 wETH</Text>
              <Text style={styles.usdValue}>$66.26</Text>
            </View>

            {/* Transfer Direction */}
            <View style={styles.transferSection}>
              <View style={styles.transferRow}>
                <View style={styles.addressBox}>
                  <View style={[styles.addressIcon, { backgroundColor: colors.error + "30" }]}>
                    <View style={styles.addressDot} />
                  </View>
                  <Text style={styles.addressText}>DeFi Account</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textDim} />
                <View style={styles.addressBox}>
                  <View style={[styles.addressIcon, { backgroundColor: colors.primary + "30" }]}>
                    <Ionicons name="globe" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.addressText}>mocqithing.eth</Text>
                </View>
              </View>
            </View>

            {/* Deceptive Request Warning */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="alert-circle" size={32} color={colors.error} />
              </View>
              <Text style={styles.warningTitle}>This is a deceptive request</Text>
              <Text style={styles.warningDescription}>
                If you approve this request, a third party known for scams might take all your assets.
              </Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>Estimated fee</Text>
                  <Ionicons name="help-circle-outline" size={16} color={colors.textDim} />
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValue}>$43.56  0.0884 ETH</Text>
                  <TouchableOpacity>
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>Speed</Text>
                </View>
                <View style={styles.detailRight}>
                  <View style={styles.speedBadge}>
                    <Ionicons name="flash" size={12} color={colors.warning} />
                    <Text style={styles.speedText}>Market</Text>
                    <Text style={styles.speedTime}>&lt; 30 sec</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Simulation Results */}
            <View style={styles.simulationSection}>
              <Text style={styles.simulationTitle}>Simulation results</Text>
              <View style={styles.simulationBox}>
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>You send</Text>
                  <Text style={styles.simulationValue}>0.0002 wETH</Text>
                </View>
                <View style={styles.simulationDivider} />
                <View style={styles.simulationRow}>
                  <Text style={styles.simulationLabel}>Interacting with</Text>
                  <Text style={styles.simulationValue}>mocqithing.eth</Text>
                </View>
              </View>
            </View>

            {/* Additional Warnings */}
            <View style={styles.infoBox}>
              <Ionicons name="warning-outline" size={20} color={colors.warning} />
              <Text style={styles.infoText}>
                Always verify the recipient address before confirming. Cryptocurrency transactions cannot be reversed.
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
              style={styles.transferBtn}
              onPress={handleTransfer}
            >
              <LinearGradient
                colors={[colors.primary, "#4A8FFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.transferGradient}
              >
                <Text style={styles.transferText}>Transfer</Text>
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

  // Amount Section
  amountSection: {
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
  amount: {
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

  // Transfer Section
  transferSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  transferRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error
  },
  addressText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },

  // Warning Card
  warningCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.error + "15",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.error + "40",
    alignItems: "center",
    marginBottom: spacing.lg
  },
  warningHeader: {
    marginBottom: spacing.md
  },
  warningTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.sm,
    textAlign: "center"
  },
  warningDescription: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },

  // Details Section
  detailsSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm
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
  detailRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  speedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.warning + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  speedText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600"
  },
  speedTime: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "500"
  },

  // Simulation Section
  simulationSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  simulationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  simulationBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  simulationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs
  },
  simulationLabel: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500"
  },
  simulationValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  simulationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm
  },

  // Info Box
  infoBox: {
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
  infoText: {
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
  transferBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden"
  },
  transferGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: "center"
  },
  transferText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  }
});
