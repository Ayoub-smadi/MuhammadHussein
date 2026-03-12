import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/cards");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <View style={styles.iconBg}>
            <Feather name="credit-card" size={44} color="#FFFFFF" />
          </View>
          <View style={styles.operatorsRow}>
            <View style={[styles.dot, { backgroundColor: "#E31E24" }]} />
            <View style={[styles.dot, { backgroundColor: "#FF6B00" }]} />
            <View style={[styles.dot, { backgroundColor: "#00A651" }]} />
          </View>
        </View>

        <Text style={styles.storeName}>سمية حسين</Text>
        <Text style={styles.storeTagline}>بطاقات الكترونية</Text>

        <View style={styles.operatorBadges}>
          <View style={[styles.badge, { backgroundColor: "#00A651" }]}>
            <Text style={styles.badgeText}>زين</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#FF6B00" }]}>
            <Text style={styles.badgeText}>أورنج</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#E31E24" }]}>
            <Text style={styles.badgeText}>أمنية</Text>
          </View>
        </View>

        <View style={styles.loadingRow}>
          <View style={[styles.loadingDot, { animationDelay: "0ms" }]} />
          <View style={[styles.loadingDot, { backgroundColor: "#FF6B00" }]} />
          <View style={[styles.loadingDot, { backgroundColor: "#E31E24" }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoWrap: {
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#00A651",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00A651",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  operatorsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeName: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  storeTagline: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    textAlign: "center",
  },
  operatorBadges: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 40,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00A651",
    opacity: 0.7,
  },
});
