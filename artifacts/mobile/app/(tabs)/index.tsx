import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.statCard,
        pressed && onPress ? { opacity: 0.8, transform: [{ scale: 0.97 }] } : {},
      ]}
      onPress={onPress}
    >
      <View style={[styles.statIconWrap, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function OperatorCard({
  name,
  color,
  sales,
  icon,
}: {
  name: string;
  color: string;
  sales: number;
  icon: string;
}) {
  return (
    <View style={[styles.opCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={[styles.opDot, { backgroundColor: color + "20" }]}>
        <View style={[styles.opDotInner, { backgroundColor: color }]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.opName}>{name}</Text>
        <Text style={styles.opSales}>{sales} مبيعة</Text>
      </View>
      <Text style={[styles.opBadge, { color, backgroundColor: color + "15" }]}>
        {icon}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { getTotalRevenue, getTotalDebt, getTotalSales, getOperatorSales, sales, logout } = useApp();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const revenue = getTotalRevenue();
  const debt = getTotalDebt();
  const total = getTotalSales();

  const recentSales = sales.slice(0, 5);

  const operatorColors: Record<string, string> = {
    zain: "#00A651",
    orange: "#FF6B00",
    umniah: "#E31E24",
  };

  const operatorNames: Record<string, string> = {
    zain: "زين",
    orange: "أورنج",
    umniah: "أمنية",
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 8 },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace("/");
          }}
        >
          <Feather name="log-out" size={18} color="#64748B" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>مرحباً، المشرف</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("ar-JO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Feather name="user" size={22} color="#00A651" />
        </View>
      </View>

      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>إجمالي الإيرادات</Text>
        <Text style={styles.revenueValue}>{revenue.toFixed(2)} JD</Text>
        {debt > 0 && (
          <View style={styles.debtRow}>
            <Feather name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.debtText}>ديون: {debt.toFixed(2)} JD</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="shopping-cart"
          label="إجمالي المبيعات"
          value={total.toString()}
          color="#00A651"
          bg="#E8F8EF"
        />
        <StatCard
          icon="alert-triangle"
          label="إجمالي الديون"
          value={`${debt.toFixed(1)} JD`}
          color="#EF4444"
          bg="#FEE2E2"
        />
        <StatCard
          icon="trending-up"
          label="المحصّل"
          value={`${revenue.toFixed(1)} JD`}
          color="#3B82F6"
          bg="#EFF6FF"
        />
        <StatCard
          icon="users"
          label="العملاء"
          value={
            Array.from(new Set(sales.map((s) => s.customerPhone))).length.toString()
          }
          color="#8B5CF6"
          bg="#F5F3FF"
        />
      </View>

      <Text style={styles.sectionTitle}>المبيعات حسب الشركة</Text>
      <View style={styles.operatorsWrap}>
        {(["zain", "orange", "umniah"] as const).map((op) => (
          <OperatorCard
            key={op}
            name={operatorNames[op]}
            color={operatorColors[op]}
            sales={getOperatorSales(op)}
            icon={op === "zain" ? "Z" : op === "orange" ? "O" : "U"}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>آخر المبيعات</Text>
      {recentSales.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="inbox" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>لا توجد مبيعات بعد</Text>
          <Text style={styles.emptySubtext}>ابدأ بإضافة مبيعة جديدة</Text>
        </View>
      ) : (
        <View style={styles.salesList}>
          {recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleRow}>
              <View
                style={[
                  styles.saleOpDot,
                  { backgroundColor: operatorColors[sale.operator] },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.saleCustomer}>{sale.customerName}</Text>
                <Text style={styles.saleCard}>{sale.cardName}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.salePrice}>{sale.paidAmount.toFixed(2)} JD</Text>
                {sale.debt > 0 && (
                  <Text style={styles.saleDebt}>دين: {sale.debt.toFixed(2)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    textAlign: "right",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  revenueCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    gap: 4,
  },
  revenueLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  revenueValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  debtText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 12,
  },
  operatorsWrap: { gap: 10, marginBottom: 20 },
  opCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  opDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  opDotInner: { width: 12, height: 12, borderRadius: 6 },
  opName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
    textAlign: "right",
  },
  opSales: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
  },
  opBadge: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    width: 32,
    height: 32,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 32,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#64748B",
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  salesList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  saleOpDot: { width: 10, height: 10, borderRadius: 5 },
  saleCustomer: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
    textAlign: "right",
  },
  saleCard: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
  },
  salePrice: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#00A651",
  },
  saleDebt: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
  },
});
