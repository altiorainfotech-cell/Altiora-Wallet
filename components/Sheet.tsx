import React from "react";
import { Modal, View, Pressable, StyleSheet } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function Sheet({ visible, onClose, children, height = 420 }: { visible: boolean; onClose: () => void; children: React.ReactNode; height?: number }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { height }]}>{children}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
});
