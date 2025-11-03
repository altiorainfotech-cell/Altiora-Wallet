import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Share, Clipboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function ReceiveModal() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex } = useWalletUi();
  const acc = accounts[activeIndex];
  const net = networks[networkIndex];

  const copyAddress = () => {
    if (acc?.address) {
      Clipboard.setString(acc.address);
      Alert.alert("Copied!", "Address copied to clipboard");
    }
  };

  const shareAddress = async () => {
    if (acc?.address) {
      try {
        await Share.share({
          message: `My ${net.name} address: ${acc.address}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Receive {net.symbol}</Text>
              <Text style={styles.subtitle}>Scan QR or share address</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.qrContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.qr}
              >
                <Ionicons name="qr-code-outline" size={160} color={colors.bg} />
              </LinearGradient>
              <Text style={styles.qrHelp}>Scan this QR code to receive {net.symbol}</Text>
            </View>

            <View style={styles.networkBadge}>
              <Ionicons name="globe" size={16} color={colors.primary} />
              <Text style={styles.networkText}>{net.name} Network</Text>
            </View>

            <View style={styles.addrBox}>
              <Text style={styles.addrLabel}>Your {net.name} Address</Text>
              <Text style={styles.addrValue} numberOfLines={2}>
                {acc?.address || "No address"}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={copyAddress}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="copy-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={shareAddress}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="share-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Only send {net.symbol} to this address. Sending other assets may result in permanent loss.
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  container: { flex: 1, padding: spacing.lg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { alignItems: "center", flex: 1 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.textDim, fontSize: 13, marginTop: 2 },

  content: { flex: 1, alignItems: "center" },

  qrContainer: { alignItems: "center", marginBottom: spacing.xl },
  qr: {
    width: 240,
    height: 240,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  qrHelp: { color: colors.textDim, fontSize: 13, textAlign: "center" },

  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg
  },
  networkText: { color: colors.primary, fontSize: 13, fontWeight: "600" },

  addrBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    marginBottom: spacing.lg
  },
  addrLabel: { color: colors.textDim, fontSize: 13, marginBottom: 8, fontWeight: "600" },
  addrValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "monospace",
    lineHeight: 20
  },

  actions: {
    flexDirection: "row",
    gap: spacing.lg,
    width: "100%",
    marginBottom: spacing.lg
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm
  },
  actionText: { color: colors.text, fontSize: 15, fontWeight: "600" },

  warningBox: {
    backgroundColor: colors.warning + "15",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + "30",
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    width: "100%"
  },
  warningText: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    flex: 1
  }
});
