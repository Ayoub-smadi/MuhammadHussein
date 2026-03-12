import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Operator, Sale } from "@/context/AppContext";

const OP_CFG = {
  zain: { name: "زين", color: "#00A651" },
  orange: { name: "أورنج", color: "#FF6B00" },
  umniah: { name: "أمنية", color: "#E31E24" },
};

function SaleCard({ sale, onDelete }: { sale: Sale; onDelete: () => void }) {
  const op = OP_CFG[sale.operator];
  const date = new Date(sale.saleDate).toLocaleDateString("ar-JO", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return (
    <View style={[styles.saleCard, { borderLeftColor: op.color, borderLeftWidth: 4 }]}>
      <View style={styles.saleTop}>
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Feather name="trash-2" size={15} color="#EF4444" />
        </Pressable>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={styles.saleName}>{sale.customerName}</Text>
          <Text style={styles.salePhone}>{sale.customerPhone}</Text>
        </View>
      </View>
      <View style={styles.saleMid}>
        <View style={[styles.opBadge, { backgroundColor: op.color + "20" }]}>
          <View style={[styles.opDot, { backgroundColor: op.color }]} />
          <Text style={[styles.opText, { color: op.color }]}>{op.name}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.cardName}>{sale.cardName}</Text>
          <Text style={[styles.saleAmt, { color: op.color }]}>{sale.cardValue} JD</Text>
        </View>
      </View>
      <View style={styles.saleFoot}>
        <Text style={styles.saleDate}>{date}</Text>
        {sale.debt > 0 && (
          <View style={styles.debtBadge}>
            <Text style={styles.debtBadgeText}>دين: {sale.debt.toFixed(2)} JD</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { adminLoggedIn, sales, deleteSale, getTotalDebt, getTotalRevenue } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [filterOp, setFilterOp] = useState<Operator | "all">("all");
  const [showDebts, setShowDebts] = useState(false);

  React.useEffect(() => {
    if (!adminLoggedIn) router.replace("/auth");
  }, [adminLoggedIn]);

  if (!adminLoggedIn) return null;

  const filtered = useMemo(() =>
    sales.filter((s) => {
      if (filterOp !== "all" && s.operator !== filterOp) return false;
      if (showDebts && s.debt === 0) return false;
      return true;
    }), [sales, filterOp, showDebts]);

  const handleDelete = (id: string) => {
    Alert.alert("حذف العملية", "هل تريد حذف هذه العملية؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteSale(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerStats}>
            <View style={[styles.statChip, { backgroundColor: "#E8F8EF" }]}>
              <Text style={[styles.statVal, { color: "#00A651" }]}>{getTotalRevenue().toFixed(0)} JD</Text>
              <Text style={styles.statLbl}>مبيعات</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.statVal, { color: "#EF4444" }]}>{getTotalDebt().toFixed(0)} JD</Text>
              <Text style={styles.statLbl}>ديون</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>التقارير</Text>
        </View>
        <View style={styles.filtersRow}>
          <Pressable
            style={[styles.filterChip, showDebts && styles.filterActive]}
            onPress={() => setShowDebts((v) => !v)}
          >
            <Feather name="alert-circle" size={12} color={showDebts ? "#fff" : "#EF4444"} />
            <Text style={[styles.filterChipText, showDebts && { color: "#fff" }]}>ذوو ديون</Text>
          </Pressable>
          {(["all", "zain", "orange", "umniah"] as const).map((op) => (
            <Pressable
              key={op}
              style={[styles.filterChip, filterOp === op && styles.filterActive,
                op !== "all" && filterOp === op && { backgroundColor: OP_CFG[op as Operator].color }]}
              onPress={() => setFilterOp(op)}
            >
              <Text style={[styles.filterChipText, filterOp === op && { color: "#fff" }]}>
                {op === "all" ? "الكل" : OP_CFG[op as Operator].name}
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
          <View style={styles.empty}>
            <Feather name="file-text" size={52} color="#CBD5E1" />
            <Text style={styles.emptyText}>لا توجد عمليات</Text>
          </View>
        ) : (
          filtered.map((s) => (
            <SaleCard key={s.id} sale={s} onDelete={() => handleDelete(s.id)} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 10,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A" },
  headerStats: { flexDirection: "row", gap: 8 },
  statChip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: "flex-end" },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#64748B" },
  filtersRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F1F5F9",
  },
  filterActive: { backgroundColor: "#0F172A" },
  filterChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  saleCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  saleTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  deleteBtn: { padding: 4 },
  saleName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  salePhone: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  saleMid: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  opBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  opDot: { width: 6, height: 6, borderRadius: 3 },
  opText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardName: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "right" },
  saleAmt: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right" },
  saleFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saleDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  debtBadge: { backgroundColor: "#FEE2E2", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  debtBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#94A3B8" },
});
