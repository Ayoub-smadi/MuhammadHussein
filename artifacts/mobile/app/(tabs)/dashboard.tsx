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

const OP_ICON: Record<string, string> = {
  zain: "#00A651", orange: "#FF6B00", umniah: "#E31E24",
};

export default function DashboardScreen() {
  const {
    adminLoggedIn, adminLogout, sales, users,
    getTotalRevenue, getTotalDebt, getOperatorSales,
    pendingRequestsCount, getTodayRevenue, getTodaySalesCount,
  } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  React.useEffect(() => {
    if (!adminLoggedIn) router.replace("/auth");
  }, [adminLoggedIn]);

  if (!adminLoggedIn) return null;

  const recentSales = sales.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => { adminLogout(); router.replace("/auth"); }}
          style={styles.logoutBtn}
        >
          <Feather name="log-out" size={16} color="#EF4444" />
        </Pressable>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerSub}>مشرف النظام</Text>
          <Text style={styles.headerTitle}>حسين</Text>
        </View>
      </View>

      {/* Pending alert */}
      {pendingRequestsCount > 0 && (
        <Pressable style={styles.notifBanner} onPress={() => router.push("/(tabs)/requests")}>
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={styles.notifText}>لديك {pendingRequestsCount} طلب بانتظار موافقتك</Text>
          <Feather name="bell" size={16} color="#fff" />
        </Pressable>
      )}

      {/* Today card */}
      <View style={styles.todayCard}>
        <View style={styles.todayLeft}>
          <View style={styles.todayIconWrap}>
            <Feather name="sun" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.todayLabel}>إيرادات اليوم</Text>
          <Text style={styles.todayVal}>{getTodayRevenue().toFixed(2)} JD</Text>
          <View style={styles.todayChip}>
            <Feather name="shopping-bag" size={11} color="#F59E0B" />
            <Text style={styles.todayChipText}>{getTodaySalesCount()} عملية اليوم</Text>
          </View>
        </View>
        <View style={styles.todayDivider} />
        <View style={styles.todayRight}>
          <View style={styles.todayMiniStat}>
            <Text style={styles.todayMiniVal}>{getTotalRevenue().toFixed(0)} JD</Text>
            <Text style={styles.todayMiniLabel}>إجمالي الإيرادات</Text>
          </View>
          <View style={[styles.todayMiniStat, { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12 }]}>
            <Text style={[styles.todayMiniVal, { color: "#FCA5A5" }]}>{getTotalDebt().toFixed(0)} JD</Text>
            <Text style={styles.todayMiniLabel}>إجمالي الديون</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Pressable style={styles.statCard} onPress={() => router.push("/(tabs)/customers")}>
          <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
            <Feather name="users" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.statVal, { color: "#3B82F6" }]}>{users.length}</Text>
          <Text style={styles.statLabel}>العملاء</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push("/(tabs)/reports")}>
          <View style={[styles.statIcon, { backgroundColor: "#F5F3FF" }]}>
            <Feather name="shopping-bag" size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.statVal, { color: "#8B5CF6" }]}>{sales.length}</Text>
          <Text style={styles.statLabel}>المبيعات</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push("/(tabs)/requests")}>
          <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="clock" size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.statVal, { color: "#F59E0B" }]}>{pendingRequestsCount}</Text>
          <Text style={styles.statLabel}>معلقة</Text>
        </Pressable>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>وصول سريع</Text>
      <View style={styles.quickActions}>
        <Pressable style={styles.qaBtn} onPress={() => router.push("/(tabs)/cards")}>
          <View style={[styles.qaIcon, { backgroundColor: "#E8F8EF" }]}>
            <Feather name="credit-card" size={22} color="#00A651" />
          </View>
          <Text style={styles.qaLabel}>البطاقات</Text>
        </Pressable>
        <Pressable style={styles.qaBtn} onPress={() => router.push("/(tabs)/requests")}>
          <View style={[styles.qaIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="bell" size={22} color="#F59E0B" />
          </View>
          <Text style={styles.qaLabel}>الطلبات</Text>
        </Pressable>
        <Pressable style={styles.qaBtn} onPress={() => router.push("/(tabs)/customers")}>
          <View style={[styles.qaIcon, { backgroundColor: "#EFF6FF" }]}>
            <Feather name="users" size={22} color="#3B82F6" />
          </View>
          <Text style={styles.qaLabel}>العملاء</Text>
        </Pressable>
        <Pressable style={styles.qaBtn} onPress={() => router.push("/(tabs)/reports")}>
          <View style={[styles.qaIcon, { backgroundColor: "#F5F3FF" }]}>
            <Feather name="file-text" size={22} color="#8B5CF6" />
          </View>
          <Text style={styles.qaLabel}>التقارير</Text>
        </Pressable>
      </View>

      {/* Operator breakdown */}
      <Text style={styles.sectionTitle}>مبيعات حسب الشركة</Text>
      <View style={styles.opGrid}>
        {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
          const cfg = OP_CFG[op];
          const count = getOperatorSales(op);
          const pct = sales.length > 0 ? Math.round((count / sales.length) * 100) : 0;
          return (
            <View key={op} style={[styles.opCard, { backgroundColor: cfg.light }]}>
              <View style={[styles.opCircle, { backgroundColor: cfg.color }]}>
                <Text style={styles.opCircleText}>{count}</Text>
              </View>
              <Text style={[styles.opName, { color: cfg.color }]}>{cfg.name}</Text>
              <Text style={styles.opPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Pressable onPress={() => router.push("/(tabs)/reports")}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </Pressable>
            <Text style={styles.sectionTitle}>آخر العمليات</Text>
          </View>
          <View style={styles.recentList}>
            {recentSales.map((sale) => {
              const opColor = OP_ICON[sale.operator];
              const dateStr = new Date(sale.saleDate).toLocaleDateString("ar-JO", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              });
              return (
                <View key={sale.id} style={styles.recentRow}>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.recentDate}>{dateStr}</Text>
                    <Text style={styles.recentName}>{sale.customerName}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ alignItems: "flex-start" }}>
                    <Text style={[styles.recentAmt, { color: opColor }]}>{sale.paidAmount.toFixed(2)} JD</Text>
                    <Text style={styles.recentCard}>{sale.cardName}</Text>
                  </View>
                  <View style={[styles.recentDot, { backgroundColor: opColor }]} />
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 110 }} />
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

  todayCard: {
    backgroundColor: "#0F172A", borderRadius: 20, padding: 20,
    flexDirection: "row", gap: 16,
  },
  todayLeft: { flex: 1, gap: 6 },
  todayIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  todayLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  todayVal: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  todayChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start",
  },
  todayChipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#F59E0B" },
  todayDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  todayRight: { width: 130, justifyContent: "center", gap: 12 },
  todayMiniStat: { gap: 2 },
  todayMiniVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", textAlign: "left" },
  todayMiniLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },

  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },

  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#3B82F6" },

  quickActions: { flexDirection: "row", gap: 10 },
  qaBtn: { flex: 1, alignItems: "center", gap: 8 },
  qaIcon: {
    width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#64748B" },

  opGrid: { flexDirection: "row", gap: 10 },
  opCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 6 },
  opCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  opCircleText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  opName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  opPct: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },

  recentList: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  recentRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  recentDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  recentAmt: { fontSize: 15, fontFamily: "Inter_700Bold" },
  recentCard: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
});
