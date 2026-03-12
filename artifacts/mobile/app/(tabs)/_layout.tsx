import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NativeTabLayout() {
  return (
    <NativeTabs initialRouteName="cards">
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>الرئيسية</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cards">
        <Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} />
        <Label>البطاقات</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Icon sf={{ default: "list.bullet.clipboard", selected: "list.bullet.clipboard.fill" }} />
        <Label>التقارير</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="customers">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>العملاء</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="cards"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00A651",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: "#E2E8F0",
          elevation: 0,
          paddingBottom: insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "البطاقات",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="creditcard.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="credit-card" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "التقارير",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="list.bullet.clipboard" tintColor={color} size={22} />
            ) : (
              <Feather name="file-text" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "العملاء",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.2.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="users" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
