import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, Badge, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

function NativeAdminTabLayout() {
  const { pendingRequestsCount } = useApp();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>الرئيسية</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="requests">
        <Icon sf={{ default: "bell", selected: "bell.fill" }} />
        <Label>الطلبات</Label>
        {pendingRequestsCount > 0 && <Badge>{pendingRequestsCount}</Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="customers">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>العملاء</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cards">
        <Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} />
        <Label>البطاقات</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>التقارير</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicAdminTabLayout() {
  const { pendingRequestsCount } = useApp();
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
        name="dashboard"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="chart.bar.fill" tintColor={color} size={22} />
              : <Feather name="bar-chart-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "الطلبات",
          tabBarBadge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="bell.fill" tintColor={color} size={22} />
              : <Feather name="bell" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "العملاء",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="person.2.fill" tintColor={color} size={22} />
              : <Feather name="users" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "البطاقات",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="creditcard.fill" tintColor={color} size={22} />
              : <Feather name="credit-card" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "التقارير",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios"
              ? <SymbolView name="doc.text.fill" tintColor={color} size={22} />
              : <Feather name="file-text" size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

export default function AdminTabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeAdminTabLayout />;
  }
  return <ClassicAdminTabLayout />;
}
