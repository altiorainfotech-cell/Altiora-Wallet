import React from "react";
import { SafeAreaView, Text, View, Platform, StyleSheet } from "react-native";

export default function HomeStub() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Wallet</Text>
      <View style={styles.card}>
        <Text style={styles.body}>Home stub is wired. ThemeProvider active when installed.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === "android" ? 40 : 60,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#262626",
    borderRadius: 16,
    padding: 24,
  },
  body: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

