import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert, Linking, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, CardRequest } from "@/context/AppContext";

const OP_COLORS: Record<string, string> = {
  zain: "#00A651", orange: "#FF6B00", umniah: "#E31E24",
};
const OP_NAMES: Record<string, string> = {
  zain: "زين", orange: "أورنج", umniah: "أمنية",
};

function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (cleaned.startsWith("0")) return "962" + cleaned.slice(1);
  if (cleaned.startsWith("962")) return cleaned;
  return "962" + cleaned;
}

function sendWhatsApp(phone: string, cardName: string, cardPrice: number, isConfirmation = false) {
  const formatted = formatPhoneForWhatsApp(phone);
  const message = isConfirmation
    ? `السلام عليكم 🎉\n` +
      `تم شحن طلبك بنجاح!\n\n` +
      `✅ ${cardName} (${cardPrice} JD)\n` +
      `تم الشحن على رقمك. شكراً لتعاملك معنا 🙏`
    : `السلام عليكم 👋\n` +
      `طلبك لـ ${cardName} (${cardPrice} JD) جاهز للمعالجة.\n\n` +
      `يرجى إتمام الدفع عبر رابط الدفع:\n` +
      `*AYOUB272*\n\n` +
      `بمجرد تأكيد الدفع سيتم شحن الرقم فوراً ✅`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${formatted}?text=${encoded}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("خطأ", "لا يمكن فتح واتساب. تأكد من تثبيت التطبيق.")
  );
}

function RequestItem({
  req,
  onApprove,
  onReject,
}: {
  req: CardRequest;
  onApprove: () => void;
  onReject: (note: string) => void;
}) {
  const opColor = OP_COLORS[req.operator];
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");
  const dateStr = new Date(req.requestDate).toLocaleDateString("ar-JO", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const isPending = req.status === "pending";

  return (
    <View style={[styles.reqCard, !isPending && styles.reqCardDone]}>
      <View style={[styles.reqAccent, { backgroundColor: opColor }]} />
      <View style={styles.reqBody}>
        <View style={styles.reqTop}>
          <View style={[styles.statusDot, {
            backgroundColor:
              req.status === "pending" ? "#F59E0B" :
              req.status === "approved" ? "#10B981" : "#EF4444",
          }]} />
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.reqUserName}>{req.userName}</Text>
            <Text style={styles.reqUserPhone}>{req.userPhone}</Text>
          </View>
        </View>

        <View style={styles.reqMid}>
          <View style={[styles.opBadge, { backgroundColor: opColor + "20" }]}>
            <View style={[styles.opDot, { backgroundColor: opColor }]} />
            <Text style={[styles.opText, { color: opColor }]}>{OP_NAMES[req.operator]}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.reqCardName}>{req.cardName}</Text>
            <Text style={[styles.reqPrice, { color: opColor }]}>{req.cardPrice} JD</Text>
          </View>
        </View>

        <Text style={styles.reqDate}>{dateStr}</Text>

        {isPending && (
          <>
            <Pressable
              style={({ pressed }) => [styles.whatsappBtn, pressed && { opacity: 0.82 }]}
              onPress={() => sendWhatsApp(req.userPhone, req.cardName, req.cardPrice)}
            >
              <View style={styles.whatsappIcon}>
                <Feather name="message-circle" size={16} color="#fff" />
              </View>
              <Text style={styles.whatsappBtnText}>أرسل رابط الدفع عبر واتساب</Text>
              <Feather name="external-link" size={14} color="#25D366" />
            </Pressable>

            <View style={styles.reqActions}>
              <Pressable
                style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.8 }]}
                onPress={() => setShowReject(true)}
              >
                <Feather name="x" size={15} color="#EF4444" />
                <Text style={styles.rejectBtnText}>رفض</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.approveBtn, { backgroundColor: opColor }, pressed && { opacity: 0.8 }]}
                onPress={() => Alert.alert(
                  "تأكيد الموافقة",
                  `شحن ${req.cardName} على رقم ${req.userPhone}؟`,
                  [
                    { text: "إلغاء", style: "cancel" },
                    {
                      text: "موافقة وشحن",
                      onPress: () => {
                        onApprove();
                        setTimeout(() => {
                          Alert.alert(
                            "تم الشحن ✅",
                            "هل تريد إرسال رسالة تأكيد للزبون عبر واتساب؟",
                            [
                              { text: "لا شكراً", style: "cancel" },
                              {
                                text: "إرسال واتساب",
                                onPress: () => sendWhatsApp(req.userPhone, req.cardName, req.cardPrice, true),
                              },
                            ]
                          );
                        }, 300);
                      },
                    },
                  ]
                )}
              >
                <Feather name="zap" size={15} color="#fff" />
                <Text style={styles.approveBtnText}>موافقة وشحن</Text>
              </Pressable>
            </View>
          </>
        )}

        {!isPending && (
          <View style={[styles.resolvedBadge, {
            backgroundColor: req.status === "approved" ? "#D1FAE5" : "#FEE2E2",
          }]}>
            <Feather
              name={req.status === "approved" ? "check-circle" : "x-circle"}
              size={13}
              color={req.status === "approved" ? "#10B981" : "#EF4444"}
            />
            <Text style={[styles.resolvedText, {
              color: req.status === "approved" ? "#065F46" : "#991B1B",
            }]}>
              {req.status === "approved" ? "✅ تم الشحن بنجاح" : `مرفوض${req.adminNote ? ": " + req.adminNote : ""}`}
            </Text>
          </View>
        )}
      </View>

      <Modal visible={showReject} transparent animationType="slide" onRequestClose={() => setShowReject(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>سبب الرفض (اختياري)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="اكتب سبب الرفض..."
              placeholderTextColor="#94A3B8"
              value={note}
              onChangeText={setNote}
              multiline
              textAlign="right"
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowReject(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={styles.rejectConfirmBtn}
                onPress={() => { setShowReject(false); onReject(note); }}
              >
                <Text style={styles.rejectConfirmText}>رفض الطلب</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function RequestsScreen() {
  const { requests, approveRequest, rejectRequest, pendingRequestsCount } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const filtered = filter === "pending"
    ? requests.filter((r) => r.status === "pending")
    : requests;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          {pendingRequestsCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
          <Text style={styles.headerTitle}>طلبات الشراء</Text>
        </View>
        <View style={styles.filterRow}>
          {(["pending", "all"] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterActiveText]}>
                {f === "pending" ? "بانتظار الموافقة" : "الكل"}
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
            <Feather name="bell" size={52} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {filter === "pending" ? "لا توجد طلبات معلقة" : "لا توجد طلبات"}
            </Text>
          </View>
        ) : (
          filtered.map((req) => (
            <RequestItem
              key={req.id}
              req={req}
              onApprove={() => approveRequest(req.id)}
              onReject={(n) => rejectRequest(req.id, n)}
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
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A" },
  pendingBadge: {
    backgroundColor: "#EF4444", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
  },
  pendingBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  filterRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#F1F5F9",
  },
  filterActive: { backgroundColor: "#0F172A" },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  filterActiveText: { color: "#FFFFFF" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12 },
  reqCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, flexDirection: "row", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  reqCardDone: { opacity: 0.8 },
  reqAccent: { width: 4 },
  reqBody: { flex: 1, padding: 14, gap: 8 },
  reqTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  reqUserName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  reqUserPhone: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  reqMid: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  opBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  opDot: { width: 6, height: 6, borderRadius: 3 },
  opText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  reqCardName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0F172A", textAlign: "right" },
  reqPrice: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "right" },
  reqDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "right" },

  whatsappBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F0FDF4", borderWidth: 1.5, borderColor: "#25D366",
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    marginTop: 2,
  },
  whatsappIcon: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: "#25D366",
    alignItems: "center", justifyContent: "center",
  },
  whatsappBtnText: {
    flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#15803D", textAlign: "right",
  },

  reqActions: { flexDirection: "row", gap: 8 },
  rejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    borderWidth: 1.5, borderColor: "#EF4444", borderRadius: 12, paddingVertical: 10,
  },
  rejectBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
  approveBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    borderRadius: 12, paddingVertical: 10,
  },
  approveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

  resolvedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, padding: 8,
  },
  resolvedText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "center" },
  noteInput: {
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: "#0F172A",
    minHeight: 80, textAlignVertical: "top",
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#64748B" },
  rejectConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#EF4444", alignItems: "center" },
  rejectConfirmText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#94A3B8" },
});
