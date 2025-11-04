import { Stack } from "expo-router";

export default function AppGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: "",
        gestureEnabled: true,
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
        }}
      />
    </Stack>
  );
}

