import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Operator } from "@/context/AppContext";

const OP_CFG = {
  zain: { name: "زين", color: "#00A651", light: "#E8F8EF", dark: "#007A3D" },
  orange: { name: "أورنج", color: "#FF6B00", light: "#FFF0E6", dark: "#CC5500" },
  umniah: { name: "أمنية", color: "#E31E24", light: "#FDEAEA", dark: "#B01519" },
};

export default function BuyScreen() {
  const { cards, currentUser, addRequest } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [activeOp, setActiveOp] = useState<Operator>("zain");
  const [selectedCard, setSelectedCard] = useState<typeof cards[0] | null>(null);
  const [confirming, setConfirming] = useState(false);

  const filtered = cards.filter((c) => c.operator === activeOp);
  const cfg = OP_CFG[activeOp];

  const handleRequest = () => {
    if (!selectedCard || !currentUser) return;
    setConfirming(false);
    addRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      operator: selectedCard.operator,
      cardValue: selectedCard.value,
      cardPrice: selectedCard.price,
    });
    setSelectedCard(null);
    Alert.alert(
      "تم إرسال الطلب",
      `تم إرسال طلب شراء ${selectedCard.name} بنجاح.\nسيتم الشحن على رقمك ${currentUser.phone} بعد موافقة المشرف.`,
      [{ text: "حسناً" }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={styles.headerHi}>أهلاً، {currentUser?.name}</Text>
          <Text style={styles.headerTitle}>اختر بطاقتك</Text>
        </View>
        {currentUser && currentUser.debt > 0 && (
          <View style={styles.debtAlert}>
            <Feather name="alert-circle" size={13} color="#EF4444" />
            <Text style={styles.debtAlertText}>دين: {currentUser.debt.toFixed(2)} JD</Text>
          </View>
        )}
      </View>

      <View style={styles.opTabs}>
        {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
          const c = OP_CFG[op];
          return (
            <Pressable
              key={op}
              style={[styles.opTab, activeOp === op && { backgroundColor: c.color }]}
              onPress={() => setActiveOp(op)}
            >
              <Text style={[styles.opTabText, activeOp === op && { color: "#fff" }]}>{c.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {filtered.map((card) => {
          const c = OP_CFG[card.operator];
          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.light, borderColor: c.color + "40" },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => { setSelectedCard(card); setConfirming(true); }}
            >
              <View style={[styles.cardTop, { backgroundColor: c.color }]}>
                <Text style={styles.cardOpName}>{c.name}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardVal, { color: c.color }]}>{card.value}</Text>
                <Text style={[styles.cardJD, { color: c.dark }]}>JD</Text>
              </View>
              <View style={styles.cardFoot}>
                <Text style={[styles.cardPrice, { color: c.dark }]}>{card.price} JD</Text>
                <View style={[styles.requestBtn, { backgroundColor: c.color }]}>
                  <Feather name="send" size={13} color="#fff" />
                  <Text style={styles.requestBtnText}>طلب</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={confirming} transparent animationType="slide" onRequestClose={() => setConfirming(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>تأكيد الطلب</Text>
            {selectedCard && (
              <>
                <View style={[styles.modalCardPreview, {
                  backgroundColor: OP_CFG[selectedCard.operator].light,
                  borderColor: OP_CFG[selectedCard.operator].color + "30",
                }]}>
                  <Text style={[styles.modalCardName, { color: OP_CFG[selectedCard.operator].color }]}>
                    {selectedCard.name}
                  </Text>
                  <Text style={styles.modalCardPrice}>السعر: {selectedCard.price} JD</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Feather name="phone" size={14} color="#64748B" />
                  <Text style={styles.modalInfoText}>
                    سيتم الشحن على رقم: <Text style={{ fontFamily: "Inter_700Bold" }}>{currentUser?.phone}</Text>
                  </Text>
                </View>
                <View style={styles.modalInfo}>
                  <Feather name="info" size={14} color="#64748B" />
                  <Text style={styles.modalInfoText}>بانتظار موافقة المشرف قبل الشحن</Text>
                </View>
              </>
            )}
            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setConfirming(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, { backgroundColor: OP_CFG[selectedCard?.operator || "zain"].color }]}
                onPress={handleRequest}
              >
                <Text style={styles.confirmBtnText}>أرسل الطلب</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  headerHi: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "right" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  debtAlert: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FEE2E2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  debtAlertText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
  opTabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "flex-end" },
  opTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F1F5F9" },
  opTabText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#64748B" },
  scroll: { flex: 1 },
  grid: { padding: 14, flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  card: {
    width: "47%", borderRadius: 18, borderWidth: 1.5, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardTop: { padding: 12, alignItems: "flex-end" },
  cardOpName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  cardBody: { padding: 14, flexDirection: "row", alignItems: "flex-end", gap: 3, justifyContent: "flex-end" },
  cardVal: { fontSize: 38, fontFamily: "Inter_700Bold" },
  cardJD: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 5 },
  cardFoot: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)",
  },
  cardPrice: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  requestBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
  },
  requestBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "center" },
  modalCardPreview: {
    borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "flex-end", gap: 4,
  },
  modalCardName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalCardPrice: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
  modalInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalInfoText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", flex: 1, textAlign: "right" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: "#F1F5F9", alignItems: "center",
  },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#64748B" },
  confirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  confirmBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
});
