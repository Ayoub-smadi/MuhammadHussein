import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
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

import { useApp, Sale } from "@/context/AppContext";

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
          <Feather name="file-text" size={36} color="#00A651" />
        </View>
        <Text style={styles.gateTitle}>سجل المبيعات</Text>
        <Text style={styles.gateSub}>
          سجّل الدخول للوصول إلى تقارير المبيعات والديون
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

function SaleCard({ sale, onDelete }: { sale: Sale; onDelete: () => void }) {
  const color = OPERATOR_COLORS[sale.operator];
  const dateStr = new Date(sale.saleDate).toLocaleDateString("ar-JO", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.saleCard}>
      <View style={[styles.saleAccent, { backgroundColor: color }]} />
      <View style={styles.saleContent}>
        <View style={styles.saleTop}>
          <Pressable
            onPress={() =>
              Alert.alert("حذف البيع", "هل تريد حذف هذه المبيعة؟", [
                { text: "إلغاء", style: "cancel" },
                { text: "حذف", style: "destructive", onPress: onDelete },
              ])
            }
            hitSlop={8}
          >
            <Feather name="trash-2" size={16} color="#EF4444" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.saleName}>{sale.customerName}</Text>
            <Text style={styles.salePhone}>{sale.customerPhone}</Text>
          </View>
        </View>
        <View style={styles.saleMid}>
          <View style={[styles.opBadge, { backgroundColor: color + "20" }]}>
            <View style={[styles.opDot, { backgroundColor: color }]} />
            <Text style={[styles.opBadgeText, { color }]}>
              {OPERATOR_NAMES[sale.operator]}
            </Text>
          </View>
          <Text style={styles.saleCardName}>{sale.cardName}</Text>
        </View>
        <View style={styles.saleBottom}>
          <Text style={styles.saleDate}>{dateStr}</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.salePaid}>محصّل: {sale.paidAmount.toFixed(2)} JD</Text>
            {sale.debt > 0 && (
              <Text style={styles.saleDebt}>دين: {sale.debt.toFixed(2)} JD</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { sales, deleteSale, getTotalRevenue, getTotalDebt, isAuthenticated, logout } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);
  const [filter, setFilter] = useState<"all" | "debt">("all");

  if (!loggedIn) {
    return <LoginGate onLogin={() => setLoggedIn(true)} />;
  }

  const filtered =
    filter === "debt" ? sales.filter((s) => s.debt > 0) : sales;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.logoutBtn}
            onPress={() => { logout(); setLoggedIn(false); }}
          >
            <Feather name="log-out" size={16} color="#64748B" />
          </Pressable>
          <Text style={styles.headerTitle}>سجل المبيعات</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: "#E8F8EF" }]}>
            <Feather name="trending-up" size={14} color="#00A651" />
            <Text style={[styles.summaryText, { color: "#00A651" }]}>
              {getTotalRevenue().toFixed(2)} JD
            </Text>
          </View>
          {getTotalDebt() > 0 && (
            <View style={[styles.summaryChip, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={[styles.summaryText, { color: "#EF4444" }]}>
                {getTotalDebt().toFixed(2)} JD ديون
              </Text>
            </View>
          )}
        </View>

        <View style={styles.filterRow}>
          {(["all", "debt"] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                {f === "all" ? "الكل" : "الديون فقط"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Feather name="file-text" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {filter === "debt" ? "لا توجد ديون" : "لا توجد مبيعات"}
            </Text>
          </View>
        ) : (
          filtered.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              onDelete={() => deleteSale(sale.id)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
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
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_400Regular" },
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
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  filterRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterBtnActive: { backgroundColor: "#0F172A" },
  filterBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#64748B" },
  filterBtnTextActive: { color: "#FFFFFF" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12 },
  saleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  saleAccent: { width: 4 },
  saleContent: { flex: 1, padding: 14, gap: 8 },
  saleTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  saleName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  salePhone: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "right" },
  saleMid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  opBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  opDot: { width: 6, height: 6, borderRadius: 3 },
  opBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  saleCardName: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
  saleBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  saleDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  salePaid: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#00A651" },
  saleDebt: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#EF4444" },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#94A3B8" },
});
