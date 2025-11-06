import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { useWalletUi } from "../../context/WalletUiContext";

export default function RecoveryPhraseModal() {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const { recoveryPhraseWords: phrase } = useWalletUi();

  const copyPhrase = async () => {
    await Clipboard.setStringAsync(phrase.join(" "));
    Alert.alert("Copied", "Your recovery phrase has been copied.", [
      { text: "Stay on page" },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, "#0A0D12"]} style={styles.gradient}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Secret Recovery Phrase</Text>
              <Text style={styles.headerSubtitle}>Write it down and store securely</Text>
            </View>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            <View style={styles.warning}>
              <Ionicons name="warning" size={18} color={"#FFD93D"} />
              <Text style={styles.warningText}>
                Never share this phrase. Anyone with it can access your assets.
              </Text>
            </View>

            <View style={styles.grid}>
              {phrase.map((word, i) => (
                <View key={`${word}-${i}`} style={styles.wordBox}>
                  <Text style={styles.wordIndex}>{i + 1}.</Text>
                  <Text style={styles.wordText}>{hidden ? "••••••" : word}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={() => setHidden(!hidden)}>
                <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={colors.text} />
                <Text style={styles.actionText}>{hidden ? "Show" : "Hide"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={copyPhrase}>
                <Ionicons name="copy-outline" size={18} color={colors.text} />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryText}>I wrote it down</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  headerSubtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.lg,
    borderRadius: 12,
  },
  warningText: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, paddingHorizontal: spacing.lg },
  wordBox: { width: "47%", flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  wordIndex: { color: colors.textDim, fontWeight: "700", width: 20, textAlign: "right" },
  wordText: { color: colors.text, fontWeight: "700", flex: 1 },
  actions: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.md, justifyContent: "center", borderRadius: 12, flex: 1 },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.text, fontWeight: "700" },
  primaryBtn: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, alignItems: "center", paddingVertical: spacing.md },
  primaryText: { color: "white", fontWeight: "800" },
});
