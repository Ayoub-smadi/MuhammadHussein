import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/auth"), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.inner, {
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
      }]}>
        <View style={styles.logo}>
          <Feather name="credit-card" size={48} color="#fff" />
        </View>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: "#E31E24" }]} />
          <View style={[styles.dot, { backgroundColor: "#FF6B00" }]} />
          <View style={[styles.dot, { backgroundColor: "#00A651" }]} />
        </View>
        <Text style={styles.name}>حسين</Text>
        <Text style={styles.sub}>بطاقات الكترونية</Text>
        <View style={styles.badges}>
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
        <View style={styles.loader}>
          <View style={[styles.ldot, { backgroundColor: "#00A651" }]} />
          <View style={[styles.ldot, { backgroundColor: "#FF6B00" }]} />
          <View style={[styles.ldot, { backgroundColor: "#E31E24" }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  logo: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: "#00A651",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#00A651", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 10,
    marginBottom: 4,
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 40, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  sub: { fontSize: 18, fontFamily: "Inter_400Regular", color: "#64748B" },
  badges: { flexDirection: "row", gap: 10, marginTop: 4 },
  badge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  loader: { flexDirection: "row", gap: 8, marginTop: 40 },
  ldot: { width: 8, height: 8, borderRadius: 4, opacity: 0.7 },
});
