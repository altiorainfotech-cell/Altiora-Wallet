import React from "react";
import { StyleSheet, Text, Pressable, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function PrimaryButton({ title, onPress, style, disabled, icon }: { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean; icon?: React.ReactNode }) {
  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && styles.btnPressed,
        style
      ]}
    >
      <LinearGradient
        colors={disabled ? [colors.card, colors.card] : [colors.primary, '#5A8FE8', colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.contentRow}>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  btnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  gradient: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5
  },
});
