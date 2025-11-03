import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function Settings() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleBackup = () => {
    Alert.alert(
      "Backup Wallet",
      "This will display your recovery phrase. Make sure you're in a private location.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => Alert.alert("Feature", "Backup feature coming soon") }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your wallet preferences</Text>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>

            <TouchableOpacity style={styles.item} onPress={handleBackup}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="key" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Backup Wallet</Text>
                  <Text style={styles.itemDesc}>Save your recovery phrase</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#4ECDC4" + "20" }]}>
                  <Ionicons name="finger-print" size={20} color="#4ECDC4" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Biometric Lock</Text>
                  <Text style={styles.itemDesc}>Use fingerprint/face ID</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={biometricEnabled ? colors.primary : colors.textDim}
              />
            </View>

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFD93D" + "20" }]}>
                  <Ionicons name="lock-closed" size={20} color="#FFD93D" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Change Password</Text>
                  <Text style={styles.itemDesc}>Update your password</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Notifications</Text>
                  <Text style={styles.itemDesc}>Transaction alerts</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textDim}
              />
            </View>

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FF6B6B" + "20" }]}>
                  <Ionicons name="language" size={20} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Language</Text>
                  <Text style={styles.itemDesc}>English</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#4ECDC4" + "20" }]}>
                  <Ionicons name="cash" size={20} color="#4ECDC4" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Currency</Text>
                  <Text style={styles.itemDesc}>USD</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="help-circle" size={20} color={colors.primary} />
                </View>
                <Text style={styles.itemTitle}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFD93D" + "20" }]}>
                  <Ionicons name="document-text" size={20} color="#FFD93D" />
                </View>
                <Text style={styles.itemTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#4ECDC4" + "20" }]}>
                  <Ionicons name="information-circle" size={20} color="#4ECDC4" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Version</Text>
                  <Text style={styles.itemDesc}>Non-Custodial Wallet</Text>
                </View>
              </View>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <Text style={styles.warningText}>
              Your keys, your crypto. This is a non-custodial wallet - only you have access to your funds.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },

  header: { marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: colors.textDim, fontSize: 14, marginTop: 4 },

  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },

  item: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },

  itemLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  itemDesc: { color: colors.textDim, fontSize: 13, marginTop: 2 },

  versionText: { color: colors.textDim, fontSize: 14, fontWeight: "600" },

  warningBox: {
    backgroundColor: colors.primary + "15",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginTop: spacing.md
  },
  warningText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    flex: 1
  }
});
