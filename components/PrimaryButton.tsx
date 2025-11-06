import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function PrimaryButton({ title, onPress, style, disabled, icon }: { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.btn, disabled && { opacity: 0.5 }, style]}>
      <View style={styles.contentRow}>
        {icon}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: 12 },
  contentRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  text: { color: "white", fontWeight: "600", fontSize: 16 },
});
