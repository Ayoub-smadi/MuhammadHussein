import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

export default function AccountScreen() {
  const { currentUser, getUserRequests, getUserSales, userLogout } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!currentUser) return null;

  const myRequests = getUserRequests(currentUser.id);
  const approved = myRequests.filter((r) => r.status === "approved").length;
  const pending = myRequests.filter((r) => r.status === "pending").length;
  const totalSpent = myRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.cardPrice, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.pageTitle}>حسابي</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentUser.name.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userPhone}>{currentUser.phone}</Text>
        {currentUser.debt > 0 && (
          <View style={styles.debtBanner}>
            <Feather name="alert-triangle" size={16} color="#F59E0B" />
            <View>
              <Text style={styles.debtBannerLabel}>دين مستحق</Text>
              <Text style={styles.debtBannerVal}>{currentUser.debt.toFixed(2)} JD</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#E8F8EF" }]}>
            <Feather name="check-circle" size={20} color="#00A651" />
          </View>
          <Text style={styles.statVal}>{approved}</Text>
          <Text style={styles.statLabel}>طلب مقبول</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="clock" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statVal}>{pending}</Text>
          <Text style={styles.statLabel}>قيد الانتظار</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
            <Feather name="trending-up" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statVal}>{totalSpent.toFixed(0)} JD</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>معلومات الحساب</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoVal}>{currentUser.name}</Text>
          <View style={styles.infoLabel}>
            <Feather name="user" size={14} color="#64748B" />
            <Text style={styles.infoLabelText}>الاسم</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoVal}>{currentUser.phone}</Text>
          <View style={styles.infoLabel}>
            <Feather name="phone" size={14} color="#64748B" />
            <Text style={styles.infoLabelText}>رقم الهاتف</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoVal, { color: currentUser.debt > 0 ? "#EF4444" : "#00A651" }]}>
            {currentUser.debt.toFixed(2)} JD
          </Text>
          <View style={styles.infoLabel}>
            <Feather name="credit-card" size={14} color="#64748B" />
            <Text style={styles.infoLabelText}>الرصيد المستحق</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
        onPress={() => { userLogout(); router.replace("/auth"); }}
      >
        <Feather name="log-out" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </Pressable>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 20, gap: 16 },
  pageTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  profileCard: {
    backgroundColor: "#0F172A", borderRadius: 20, padding: 24,
    alignItems: "center", gap: 8,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "#00A651", alignItems: "center", justifyContent: "center",
    shadowColor: "#00A651", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userPhone: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  debtBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FEF3C7", borderRadius: 12, padding: 12,
    marginTop: 4, width: "100%",
  },
  debtBannerLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E", textAlign: "right" },
  debtBannerVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#92400E", textAlign: "right" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    alignItems: "flex-end", gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0F172A" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  infoCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16,
  },
  infoLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabelText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
  infoVal: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FEE2E2", borderRadius: 16, paddingVertical: 16,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
});
