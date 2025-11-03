import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function AccountCard({ title, address, balance, symbol, badge }: { title: string; address: string; balance: string; symbol: string; badge: string }) {
  return (
    <LinearGradient 
      colors={['#1A1F2E', '#242B3D']} 
      start={{x: 0, y: 0}} 
      end={{x: 1, y: 1}}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Non-custodial • Secure</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>
      
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance}>{balance}</Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        <Text style={styles.usdValue}>≈ $0.00 USD</Text>
      </View>
      
      <View style={styles.addressSection}>
        <Text style={styles.addressLabel}>Address</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addr}>{address}</Text>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { 
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  title: { color: colors.text, fontWeight: "700", fontSize: 18 },
  subtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  badge: { 
    backgroundColor: colors.primary + "20", 
    paddingHorizontal: spacing.sm, 
    paddingVertical: 4, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "40"
  },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: "600" },
  
  balanceSection: { marginBottom: spacing.lg },
  balanceLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  balanceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  balance: { color: colors.text, fontSize: 32, fontWeight: "800" },
  symbol: { color: colors.textDim, marginLeft: spacing.sm, fontSize: 18, fontWeight: "600" },
  usdValue: { color: colors.textDim, fontSize: 14 },
  
  addressSection: {},
  addressLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addr: { color: colors.text, fontSize: 14, fontFamily: "monospace", flex: 1 },
  copyBtn: { padding: spacing.sm, marginLeft: spacing.sm },
});
