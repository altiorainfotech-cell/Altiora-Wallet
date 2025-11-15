import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { isAuthed, logout } from "../../lib/api";
import {
  getBiometricInfo,
  promptEnableBiometric,
  disableBiometric,
  isBiometricEnabled,
} from "../../lib/biometric";

export default function Settings() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricName, setBiometricName] = useState("Biometric");
  const [loadingBiometric, setLoadingBiometric] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const authed = useMemo(() => isAuthed(), []);

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    setLoadingBiometric(true);
    try {
      const info = await getBiometricInfo();
      setBiometricSupported(info.supported && info.enrolled);
      setBiometricEnabled(info.enabled);
      setBiometricName(info.name);
    } catch (error) {
      console.error('Error loading biometric status:', error);
    } finally {
      setLoadingBiometric(false);
    }
  };

  const handleBackup = () => {
    router.push("/(modals)/recovery-phrase2");
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricSupported) {
      Alert.alert(
        "Not Available",
        "Biometric authentication is not available on this device. Make sure Face ID or fingerprint is set up in your device settings."
      );
      return;
    }

    if (value) {
      // Enable biometric
      const result = await promptEnableBiometric();
      if (result.enabled) {
        setBiometricEnabled(true);
        Alert.alert(
          `${biometricName} Enabled`,
          `Your wallet is now protected with ${biometricName}. You'll need to authenticate when opening the app.`
        );
      } else {
        Alert.alert(
          "Authentication Failed",
          result.error || "Could not enable biometric authentication"
        );
      }
    } else {
      // Disable biometric
      Alert.alert(
        `Disable ${biometricName}?`,
        `You will no longer be able to unlock your wallet with ${biometricName}. You can re-enable this anytime.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: async () => {
              await disableBiometric();
              setBiometricEnabled(false);
              Alert.alert(
                "Disabled",
                `${biometricName} authentication has been disabled`
              );
            }
          }
        ]
      );
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      value ? "Notifications Enabled" : "Notifications Disabled",
      value
        ? "You will now receive transaction alerts"
        : "Transaction notifications have been disabled"
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "This feature will allow you to update your wallet password",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => Alert.alert("Coming Soon", "Password change functionality will be available soon")
        }
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      "Language Selection",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => Alert.alert("Language", "English selected") },
        { text: "Spanish", onPress: () => Alert.alert("Language", "Spanish selected") },
        { text: "French", onPress: () => Alert.alert("Language", "French selected") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleCurrency = () => {
    Alert.alert(
      "Currency Selection",
      "Choose your preferred display currency",
      [
        { text: "USD", onPress: () => Alert.alert("Currency", "USD selected") },
        { text: "EUR", onPress: () => Alert.alert("Currency", "EUR selected") },
        { text: "GBP", onPress: () => Alert.alert("Currency", "GBP selected") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      "Help & Support",
      "Get help with your wallet:\n\n• FAQ & Guides\n• Contact Support\n• Community Forum\n• Video Tutorials",
      [
        { text: "Visit FAQ", onPress: () => Alert.alert("Opening FAQ...") },
        { text: "Contact Support", onPress: () => Alert.alert("Support", "Email: support@wallet.com") },
        { text: "Close", style: "cancel" }
      ]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      "Terms of Service",
      "By using this wallet, you agree to:\n\n• Non-custodial nature of the service\n• Your responsibility for securing keys\n• No liability for lost funds\n• Compliance with local regulations",
      [
        { text: "Read Full Terms", onPress: () => Alert.alert("Opening terms...") },
        { text: "Close", style: "cancel" }
      ]
    );
  };

  const handleVersionInfo = () => {
    Alert.alert(
      "App Information",
      "Non-Custodial Wallet v1.0.0\n\n" +
      "Build: 100\n" +
      "Released: 2025\n\n" +
      "A secure, decentralized wallet where you control your private keys.",
      [{ text: "OK" }]
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {biometricSupported ? biometricName : "Biometric Lock"}
                  </Text>
                  <Text style={styles.itemDesc}>
                    {biometricSupported
                      ? `Use ${biometricName} to unlock`
                      : "Not available on this device"}
                  </Text>
                </View>
              </View>
              {loadingBiometric ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={!biometricSupported}
                  trackColor={{ false: colors.border, true: colors.primary + "80" }}
                  thumbColor={biometricEnabled ? colors.primary : colors.textDim}
                />
              )}
            </View>

            <TouchableOpacity style={styles.item} onPress={handleChangePassword}>
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
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textDim}
              />
            </View>

            <TouchableOpacity style={styles.item} onPress={handleLanguage}>
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

            <TouchableOpacity style={styles.item} onPress={handleCurrency}>
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

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {!authed ? (
              <>
                <TouchableOpacity style={styles.item} onPress={() => router.push('/auth/login')}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                      <Ionicons name="log-in" size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>Login</Text>
                      <Text style={styles.itemDesc}>Access your account</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => router.push('/auth/register')}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "#4ECDC4" + "20" }]}>
                      <Ionicons name="person-add" size={20} color="#4ECDC4" />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>Register</Text>
                      <Text style={styles.itemDesc}>Create a new account</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.item} onPress={async () => { await logout(); Alert.alert('Logged out'); }}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "#FF6B6B" + "20" }]}>
                    <Ionicons name="log-out" size={20} color="#FF6B6B" />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>Logout</Text>
                    <Text style={styles.itemDesc}>Sign out from this device</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
              </TouchableOpacity>
            )}
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <TouchableOpacity style={styles.item} onPress={handleHelpSupport}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="help-circle" size={20} color={colors.primary} />
                </View>
                <Text style={styles.itemTitle}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={handleTermsOfService}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFD93D" + "20" }]}>
                  <Ionicons name="document-text" size={20} color="#FFD93D" />
                </View>
                <Text style={styles.itemTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={handleVersionInfo}>
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
            </TouchableOpacity>
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
  container: { padding: spacing.lg, paddingBottom: 140 },

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
