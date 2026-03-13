import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Operator } from "@/context/AppContext";

const OP_CFG = {
  zain: { name: "زين", color: "#00A651", light: "#E8F8EF" },
  orange: { name: "أورنج", color: "#FF6B00", light: "#FFF0E6" },
  umniah: { name: "أمنية", color: "#E31E24", light: "#FDEAEA" },
};

export default function CardsScreen() {
  const { adminLoggedIn, cards, updateCardPrice } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [activeOp, setActiveOp] = useState<Operator>("zain");
  const [editCard, setEditCard] = useState<typeof cards[0] | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  React.useEffect(() => {
    if (!adminLoggedIn) router.replace("/auth");
  }, [adminLoggedIn]);

  if (!adminLoggedIn) return null;

  const filtered = cards.filter((c) => c.operator === activeOp);
  const cfg = OP_CFG[activeOp];

  const openEdit = (card: typeof cards[0]) => {
    setEditCard(card);
    setNewPrice(card.price.toString());
    setPriceError("");
  };

  const savePrice = () => {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) { setPriceError("أدخل سعر صحيح"); return; }
    if (!editCard) return;
    updateCardPrice(editCard.id, val);
    setEditCard(null);
    Alert.alert("تم الحفظ", `تم تحديث سعر ${editCard.name} إلى ${val.toFixed(2)} JD`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>إدارة البطاقات</Text>
        <Text style={styles.headerSub}>اضغط على البطاقة لتعديل السعر • اضغط بيع مباشر للبيع النقدي</Text>
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {filtered.map((card) => {
          const c = OP_CFG[card.operator];
          const isCustom = card.price !== card.value;
          return (
            <View
              key={card.id}
              style={[styles.cardRow, { borderLeftColor: c.color, borderLeftWidth: 4 }]}
            >
              {/* Card info */}
              <Pressable
                style={styles.cardInfoArea}
                onPress={() => openEdit(card)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.editBadge, { backgroundColor: c.color + "15" }]}>
                    <Feather name="edit-2" size={12} color={c.color} />
                    <Text style={[styles.editText, { color: c.color }]}>تعديل السعر</Text>
                  </View>
                  {isCustom && (
                    <View style={styles.customBadge}>
                      <Feather name="check" size={10} color="#00A651" />
                      <Text style={styles.customText}>سعر مخصص</Text>
                    </View>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <View style={styles.priceRow}>
                    {isCustom && (
                      <Text style={styles.origPrice}>{card.value} JD</Text>
                    )}
                    <Text style={[styles.cardPrice, { color: c.color }]}>{card.price} JD</Text>
                  </View>
                </View>
              </Pressable>

              {/* Direct sale button */}
              <Pressable
                style={[styles.saleBtn, { backgroundColor: c.color }]}
                onPress={() => router.push({ pathname: "/sale-modal", params: { cardId: card.id } })}
              >
                <Feather name="zap" size={14} color="#fff" />
                <Text style={styles.saleBtnText}>بيع</Text>
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit price modal */}
      <Modal visible={!!editCard} transparent animationType="slide" onRequestClose={() => setEditCard(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>تعديل السعر</Text>
            {editCard && (
              <>
                <View style={[styles.modalPreview, {
                  backgroundColor: OP_CFG[editCard.operator].light,
                  borderColor: OP_CFG[editCard.operator].color + "30",
                }]}>
                  <Text style={[styles.modalCardName, { color: OP_CFG[editCard.operator].color }]}>
                    {editCard.name}
                  </Text>
                  <Text style={styles.modalOrigPrice}>القيمة الأصلية: {editCard.value} JD</Text>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>السعر الجديد (JD)</Text>
                  <TextInput
                    style={[styles.priceInput, priceError ? styles.inputError : null]}
                    value={newPrice}
                    onChangeText={(v) => { setNewPrice(v); setPriceError(""); }}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    textAlign="right"
                    autoFocus
                  />
                  {priceError ? <Text style={styles.errText}>{priceError}</Text> : null}
                </View>
              </>
            )}
            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditCard(null)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: editCard ? OP_CFG[editCard.operator].color : "#00A651" }]}
                onPress={savePrice}
              >
                <Text style={styles.saveBtnText}>حفظ</Text>
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
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 4,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "right" },
  opTabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "flex-end" },
  opTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F1F5F9" },
  opTabText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#64748B" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  cardRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardInfoArea: {
    flex: 1, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 16,
  },
  cardLeft: { gap: 6 },
  editBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  editText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  customBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "#D1FAE5",
  },
  customText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#065F46" },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A", textAlign: "right" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  origPrice: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8", textDecorationLine: "line-through" },
  cardPrice: { fontSize: 20, fontFamily: "Inter_700Bold" },
  saleBtn: {
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    width: 56, alignSelf: "stretch", gap: 3,
  },
  saleBtnText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "center" },
  modalPreview: { borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "flex-end", gap: 4 },
  modalCardName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalOrigPrice: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#64748B", textAlign: "right" },
  priceInput: {
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 14, fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A",
  },
  inputError: { borderColor: "#EF4444" },
  errText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", textAlign: "right" },
  modalBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#64748B" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
});
