import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, CardRequest } from "@/context/AppContext";

const OP_COLORS: Record<string, string> = {
  zain: "#00A651", orange: "#FF6B00", umniah: "#E31E24",
};
const OP_NAMES: Record<string, string> = {
  zain: "زين", orange: "أورنج", umniah: "أمنية",
};

const STATUS_CFG = {
  pending: { label: "قيد الانتظار", color: "#F59E0B", bg: "#FEF3C7", icon: "clock" },
  approved: { label: "تمت الموافقة", color: "#10B981", bg: "#D1FAE5", icon: "check-circle" },
  rejected: { label: "مرفوض", color: "#EF4444", bg: "#FEE2E2", icon: "x-circle" },
};

function RequestCard({ req }: { req: CardRequest }) {
  const opColor = OP_COLORS[req.operator];
  const status = STATUS_CFG[req.status];
  const dateStr = new Date(req.requestDate).toLocaleDateString("ar-JO", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <View style={[styles.card, { borderLeftColor: opColor, borderLeftWidth: 4 }]}>
      <View style={styles.cardTop}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Feather name={status.icon as any} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.cardName}>{req.cardName}</Text>
          <View style={[styles.opBadge, { backgroundColor: opColor + "20" }]}>
            <View style={[styles.opDot, { backgroundColor: opColor }]} />
            <Text style={[styles.opText, { color: opColor }]}>{OP_NAMES[req.operator]}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardMid}>
        <Text style={styles.cardDate}>{dateStr}</Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.cardPrice, { color: opColor }]}>{req.cardPrice} JD</Text>
          <Text style={styles.cardPhone}>→ {req.userPhone}</Text>
        </View>
      </View>
      {req.status === "approved" && (
        <View style={styles.approvedNote}>
          <Feather name="check-circle" size={13} color="#10B981" />
          <Text style={styles.approvedNoteText}>تم الشحن على رقمك بنجاح</Text>
        </View>
      )}
      {req.status === "rejected" && req.adminNote && (
        <View style={styles.rejectedNote}>
          <Feather name="info" size={13} color="#EF4444" />
          <Text style={styles.rejectedNoteText}>{req.adminNote}</Text>
        </View>
      )}
    </View>
  );
}

export default function PurchasesScreen() {
  const { currentUser, getUserRequests } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myRequests = currentUser ? getUserRequests(currentUser.id) : [];
  const pending = myRequests.filter((r) => r.status === "pending").length;
  const approved = myRequests.filter((r) => r.status === "approved").length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>طلباتي</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="clock" size={13} color="#F59E0B" />
            <Text style={[styles.statChipText, { color: "#F59E0B" }]}>{pending} قيد الانتظار</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: "#D1FAE5" }]}>
            <Feather name="check-circle" size={13} color="#10B981" />
            <Text style={[styles.statChipText, { color: "#10B981" }]}>{approved} منجز</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {myRequests.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={52} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptySub}>اطلب بطاقة من تبويب البطاقات</Text>
          </View>
        ) : (
          myRequests.map((req) => <RequestCard key={req.id} req={req} />)
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
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  statsRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A", textAlign: "right" },
  opBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4,
  },
  opDot: { width: 6, height: 6, borderRadius: 3 },
  opText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardMid: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  cardPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardPhone: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
  approvedNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#D1FAE5", borderRadius: 10, padding: 8,
  },
  approvedNoteText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#065F46", flex: 1, textAlign: "right" },
  rejectedNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEE2E2", borderRadius: 10, padding: 8,
  },
  rejectedNoteText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#991B1B", flex: 1, textAlign: "right" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#94A3B8" },
});
