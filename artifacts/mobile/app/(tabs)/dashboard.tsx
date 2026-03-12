import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Operator } from "@/context/AppContext";

const OP_CFG = {
  zain: { name: "زين", color: "#00A651", light: "#E8F8EF" },
  orange: { name: "أورنج", color: "#FF6B00", light: "#FFF0E6" },
  umniah: { name: "أمنية", color: "#E31E24", light: "#FDEAEA" },
};

function StatCard({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={styles.statVal}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const {
    adminLoggedIn, adminLogout, sales, users,
    getTotalRevenue, getTotalDebt, getOperatorSales, pendingRequestsCount,
  } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  React.useEffect(() => {
    if (!adminLoggedIn) router.replace("/auth");
  }, [adminLoggedIn]);

  if (!adminLoggedIn) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => { adminLogout(); router.replace("/auth"); }} style={styles.logoutBtn}>
          <Feather name="log-out" size={16} color="#EF4444" />
        </Pressable>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerSub}>مشرف النظام</Text>
          <Text style={styles.headerTitle}>حسين</Text>
        </View>
      </View>

      {pendingRequestsCount > 0 && (
        <Pressable style={styles.notifBanner} onPress={() => router.push("/(tabs)/requests")}>
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={styles.notifText}>لديك {pendingRequestsCount} طلب بانتظار موافقتك</Text>
          <Feather name="bell" size={16} color="#fff" />
        </Pressable>
      )}

      <View style={styles.statsGrid}>
        <StatCard icon="dollar-sign" label="إجمالي المبيعات" value={`${getTotalRevenue().toFixed(2)} JD`} color="#00A651" />
        <StatCard icon="alert-circle" label="الديون المستحقة" value={`${getTotalDebt().toFixed(2)} JD`} color="#EF4444" />
        <StatCard icon="users" label="عدد المستخدمين" value={users.length.toString()} color="#3B82F6" />
        <StatCard icon="shopping-bag" label="عمليات البيع" value={sales.length.toString()} color="#8B5CF6" />
      </View>

      <Text style={styles.sectionTitle}>مبيعات حسب الشركة</Text>
      <View style={styles.opGrid}>
        {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
          const cfg = OP_CFG[op];
          const count = getOperatorSales(op);
          return (
            <View key={op} style={[styles.opCard, { backgroundColor: cfg.light }]}>
              <View style={[styles.opCircle, { backgroundColor: cfg.color }]}>
                <Text style={styles.opCircleText}>{count}</Text>
              </View>
              <Text style={[styles.opName, { color: cfg.color }]}>{cfg.name}</Text>
              <Text style={styles.opSub}>عملية</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#0F172A" },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 11, backgroundColor: "#FEE2E2",
    alignItems: "center", justifyContent: "center",
  },
  notifBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#EF4444", borderRadius: 16, padding: 14,
  },
  notifText: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" },
  statsGrid: { gap: 10 },
  statCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0F172A" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  opGrid: { flexDirection: "row", gap: 10 },
  opCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 6 },
  opCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  opCircleText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  opName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  opSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
});
