import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "../../components/PrimaryButton";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function SendModal() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex } = useWalletUi();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const active = accounts[activeIndex];
  const net = networks[networkIndex];

  const handleSend = () => {
    if (!to.trim()) {
      Alert.alert("Error", "Please enter a recipient address");
      return;
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    Alert.alert(
      "Confirm Transaction",
      `Send ${amount} ${net.symbol} to ${to.substring(0, 10)}...?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "Transaction sent successfully");
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Send {net.symbol}</Text>
                <Text style={styles.subtitle}>Transfer funds securely</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>{active?.balance || "0.0000"}</Text>
                <Text style={styles.balanceSymbol}>{net.symbol}</Text>
              </View>
              <Text style={styles.balanceUsd}>≈ $0.00 USD</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Recipient Address</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="0x..."
                  placeholderTextColor={colors.textDim}
                  value={to}
                  onChangeText={setTo}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.inputIcon}>
                  <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Amount</Text>
                <TouchableOpacity onPress={() => setAmount(active?.balance || "0")}>
                  <Text style={styles.maxBtn}>MAX</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.textDim}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <Text style={styles.inputSymbol}>{net.symbol}</Text>
              </View>
              <Text style={styles.helperText}>≈ $0.00 USD</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Network</Text>
                <Text style={styles.infoValue}>{net.name}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Network Fee</Text>
                <Text style={styles.infoValue}>~$0.50</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            <PrimaryButton title="Review Transaction" onPress={handleSend} />
          </View>
        </KeyboardAvoidingView>
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

  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignItems: "center"
  },
  balanceLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  balanceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  balanceAmount: { color: colors.text, fontSize: 28, fontWeight: "800" },
  balanceSymbol: { color: colors.textDim, marginLeft: spacing.sm, fontSize: 16, fontWeight: "600" },
  balanceUsd: { color: colors.textDim, fontSize: 13 },

  field: { marginBottom: spacing.lg },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { color: colors.textDim, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  maxBtn: { color: colors.primary, fontSize: 14, fontWeight: "700" },

  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 4
  },
  input: {
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.md,
    flex: 1
  },
  inputIcon: { padding: spacing.sm },
  inputSymbol: { color: colors.textDim, fontSize: 16, fontWeight: "600", marginLeft: spacing.sm },
  helperText: { color: colors.textDim, fontSize: 12, marginTop: 6 },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm
  },
  infoLabel: { color: colors.textDim, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  infoDivider: { height: 1, backgroundColor: colors.border, marginVertical: 4 }
});
