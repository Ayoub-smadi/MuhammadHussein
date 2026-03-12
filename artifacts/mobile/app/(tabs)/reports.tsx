import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
          <View
            style={[styles.opBadge, { backgroundColor: color + "20" }]}
          >
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
  const { sales, deleteSale, getTotalRevenue, getTotalDebt } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [filter, setFilter] = useState<"all" | "debt">("all");

  const filtered =
    filter === "debt" ? sales.filter((s) => s.debt > 0) : sales;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>سجل المبيعات</Text>

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
              <Text
                style={[
                  styles.filterBtnText,
                  filter === f && styles.filterBtnTextActive,
                ]}
              >
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterBtnActive: { backgroundColor: "#0F172A" },
  filterBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#64748B",
  },
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
  saleName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
  },
  salePhone: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
  },
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
  saleCardName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  saleBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  saleDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  salePaid: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#00A651",
  },
  saleDebt: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#EF4444",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
  },
});
