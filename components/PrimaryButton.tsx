import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function PrimaryButton({ title, onPress, style, disabled }: { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.btn, disabled && { opacity: 0.5 }, style]}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: 12 },
  text: { color: "white", fontWeight: "600", fontSize: 16 },
});
