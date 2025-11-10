import React from "react";
import { Modal, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export default function Sheet({ visible, onClose, children, height = 420 }: { visible: boolean; onClose: () => void; children: React.ReactNode; height?: number }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.sheet, { maxHeight: height }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  keyboardAvoid: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border
  },
});
