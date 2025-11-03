import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletUiProvider } from "../context/WalletUiContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WalletUiProvider>
          <StatusBar style="light" />
          {/* Root stack: tabs + modal routes */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)/send" options={{ presentation: "modal" }} />
            <Stack.Screen name="(modals)/receive" options={{ presentation: "modal" }} />
          </Stack>
        </WalletUiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
