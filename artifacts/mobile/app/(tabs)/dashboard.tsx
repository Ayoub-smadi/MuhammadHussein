import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const { login } = useApp();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleLogin = async () => {
    if (!password.trim()) { setError("أدخل كلمة المرور"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = login(password);
    setLoading(false);
    if (ok) { onLogin(); }
    else { setError("كلمة المرور غير صحيحة"); setPassword(""); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.gateContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.gateInner, { paddingTop: topPad + 16 }]}>
        <View style={styles.lockWrap}>
          <Feather name="lock" size={36} color="#00A651" />
        </View>
        <Text style={styles.gateTitle}>منطقة المشرف</Text>
        <Text style={styles.gateSub}>
          سجّل الدخول للوصول إلى لوحة التحكم والإحصائيات
        </Text>

        <View style={styles.inputWrap}>
          <Feather name="lock" size={16} color="#94A3B8" />
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPw}
            value={password}
            onChangeText={(v) => { setPassword(v); setError(""); }}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            textAlign="right"
          />
          <Pressable onPress={() => setShowPw((p) => !p)} hitSlop={8}>
            <Feather name={showPw ? "eye-off" : "eye"} size={16} color="#94A3B8" />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {loading ? "جاري التحقق..." : "دخول"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const OPERATOR_COLORS: Record<string, string> = {
  zain: "#00A651",
  orange: "#FF6B00",
  umniah: "#E31E24",
};

const OPERATOR_NAMES: Record<string, string> = {
  zain: "زين",
  orange: "أورنج",
  umniah: "أمنية",
};

export default function DashboardScreen() {
  const { getTotalRevenue, getTotalDebt, getTotalSales, getOperatorSales, sales, logout, isAuthenticated } = useApp();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!loggedIn) {
    return <LoginGate onLogin={() => setLoggedIn(true)} />;
  }

  const revenue = getTotalRevenue();
  const debt = getTotalDebt();
  const total = getTotalSales();
  const recentSales = sales.slice(0, 5);
  const uniqueCustomers = Array.from(new Set(sales.map((s) => s.customerPhone))).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          style={styles.logoutBtn}
          onPress={() => { logout(); setLoggedIn(false); }}
        >
          <Feather name="log-out" size={18} color="#64748B" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>لوحة التحكم</Text>
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
            <Text style={styles.debtText}>ديون متبقية: {debt.toFixed(2)} JD</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="shopping-cart" label="إجمالي المبيعات" value={total.toString()} color="#00A651" bg="#E8F8EF" />
        <StatCard icon="alert-triangle" label="الديون" value={`${debt.toFixed(1)} JD`} color="#EF4444" bg="#FEE2E2" />
        <StatCard icon="trending-up" label="المحصّل" value={`${revenue.toFixed(1)} JD`} color="#3B82F6" bg="#EFF6FF" />
        <StatCard icon="users" label="العملاء" value={uniqueCustomers.toString()} color="#8B5CF6" bg="#F5F3FF" />
      </View>

      <Text style={styles.sectionTitle}>المبيعات حسب الشركة</Text>
      <View style={styles.operatorsWrap}>
        {(["zain", "orange", "umniah"] as const).map((op) => (
          <View key={op} style={[styles.opCard, { borderLeftColor: OPERATOR_COLORS[op], borderLeftWidth: 4 }]}>
            <View style={[styles.opDot, { backgroundColor: OPERATOR_COLORS[op] + "20" }]}>
              <View style={[styles.opDotInner, { backgroundColor: OPERATOR_COLORS[op] }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.opName}>{OPERATOR_NAMES[op]}</Text>
              <Text style={styles.opSales}>{getOperatorSales(op)} مبيعة</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>آخر المبيعات</Text>
      {recentSales.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="inbox" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>لا توجد مبيعات بعد</Text>
        </View>
      ) : (
        <View style={styles.salesList}>
          {recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleRow}>
              <View style={[styles.saleOpDot, { backgroundColor: OPERATOR_COLORS[sale.operator] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.saleCustomer}>{sale.customerName}</Text>
                <Text style={styles.saleCard}>{sale.cardName}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.salePrice}>{sale.paidAmount.toFixed(2)} JD</Text>
                {sale.debt > 0 && <Text style={styles.saleDebt}>دين: {sale.debt.toFixed(2)}</Text>}
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
  gateContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  gateInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 14,
  },
  lockWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gateTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "center",
  },
  gateSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    width: "100%",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  loginBtn: {
    backgroundColor: "#00A651",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
    shadowColor: "#00A651",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
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
  emptyWrap: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#94A3B8" },
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
  saleCustomer: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0F172A", textAlign: "right" },
  saleCard: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "right" },
  salePrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#00A651" },
  saleDebt: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444" },
});
