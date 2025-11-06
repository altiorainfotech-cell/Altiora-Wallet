import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletUiProvider } from "../context/WalletUiContext";

export default function RootLayout() {
  // We're using the app directory at the root, not src/app
  // Optional wrappers for Theme and Redux to avoid missing deps until installed
  let ThemeProviderComp: any = ({ children }: any) => <>{children}</>;
  let theme: any = undefined;
  let ReduxProviderComp: any = ({ children }: any) => <>{children}</>;
  let store: any = undefined;

  // Disabled for now - not using styled-components or Redux yet
  // try {
  //   // @ts-ignore
  //   const sc = require("../src/styles/theme");
  //   // @ts-ignore
  //   const scn = require("styled-components/native");
  //   theme = sc?.default ?? sc;
  //   ThemeProviderComp = scn?.ThemeProvider ?? ThemeProviderComp;
  // } catch {}

  // try {
  //   // @ts-ignore
  //   const rr = require("react-redux");
  //   // @ts-ignore
  //   const st = require("../src/store");
  //   ReduxProviderComp = rr?.Provider ?? ReduxProviderComp;
  //   store = st?.store;
  // } catch {}

  const WithTheme = ({ children }: any) =>
    theme && ThemeProviderComp ? (
      <ThemeProviderComp theme={theme}>{children}</ThemeProviderComp>
    ) : (
      <>{children}</>
    );

  const WithRedux = ({ children }: any) =>
    store && ReduxProviderComp ? (
      <ReduxProviderComp store={store}>{children}</ReduxProviderComp>
    ) : (
      <>{children}</>
    );

  return (
    <WithRedux>
      <WithTheme>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <WalletUiProvider>
              <StatusBar style="light" />
              {/* Root stack: index gate + onboarding + tabs + modal routes */}
              <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(modals)/send" options={{ presentation: "modal" }} />
              <Stack.Screen name="(modals)/receive" options={{ presentation: "modal" }} />
              <Stack.Screen name="(modals)/import-wallet" options={{ presentation: "modal" }} />
              </Stack>
            </WalletUiProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </WithTheme>
    </WithRedux>
  );
}
