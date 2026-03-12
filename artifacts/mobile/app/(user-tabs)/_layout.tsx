import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NativeUserTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="buy">
        <Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} />
        <Label>البطاقات</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="purchases">
        <Icon sf={{ default: "bag", selected: "bag.fill" }} />
        <Label>طلباتي</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>حسابي</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicUserTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00A651",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? "#111" : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: isDark ? "#333" : "#E2E8F0",
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "#111" : "#FFFFFF" }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="buy"
        options={{
          title: "البطاقات",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="creditcard.fill" tintColor={color} size={22} />
              : <Feather name="credit-card" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "طلباتي",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="bag.fill" tintColor={color} size={22} />
              : <Feather name="shopping-bag" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="person.circle.fill" tintColor={color} size={22} />
              : <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function UserTabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeUserTabLayout />;
  }
  return <ClassicUserTabLayout />;
}
