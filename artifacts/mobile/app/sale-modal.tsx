import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

import { useApp, Operator } from "@/context/AppContext";

const OPERATOR_CONFIG: Record<
  Operator,
  { name: string; color: string; lightColor: string }
> = {
  zain: { name: "زين", color: "#00A651", lightColor: "#E8F8EF" },
  orange: { name: "أورنج", color: "#FF6B00", lightColor: "#FFF0E6" },
  umniah: { name: "أمنية", color: "#E31E24", lightColor: "#FDEAEA" },
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "numeric" | "decimal-pad";
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, !!error && styles.fieldInputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType || "default"}
        textAlign="right"
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function SaleModal() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { cards, addSale } = useApp();
  const insets = useSafeAreaInsets();

  const card = cards.find((c) => c.id === cardId);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState(card ? card.price.toString() : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!card) {
    return (
      <View style={styles.center}>
        <Text>البطاقة غير موجودة</Text>
      </View>
    );
  }

  const cfg = OPERATOR_CONFIG[card.operator];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.name = "الاسم مطلوب";
    if (!customerPhone.trim()) errs.phone = "رقم الهاتف مطلوب";
    else if (!/^07[789]\d{7}$/.test(customerPhone.replace(/\s/g, ""))) {
      errs.phone = "رقم هاتف غير صحيح";
    }
    const paid = parseFloat(paidAmount);
    if (isNaN(paid) || paid < 0) errs.paid = "المبلغ غير صحيح";
    else if (paid > card.price) errs.paid = "المبلغ أكبر من سعر البطاقة";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const paid = parseFloat(paidAmount) || 0;
    const debt = card.price - paid;

    addSale({
      customerId: Date.now().toString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      cardId: card.id,
      cardName: card.name,
      operator: card.operator,
      cardValue: card.value,
      paidAmount: paid,
      debt: Math.max(0, debt),
    });

    setSaving(false);

    if (debt > 0) {
      Alert.alert(
        "تم البيع بنجاح",
        `تم تسجيل بيع ${card.name} للعميل ${customerName}.\nالمبلغ المتبقي (دين): ${debt.toFixed(2)} JD`,
        [{ text: "حسناً", onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        "تم البيع بنجاح",
        `تم بيع ${card.name} بنجاح للعميل ${customerName}!`,
        [{ text: "حسناً", onPress: () => router.back() }]
      );
    }
  };

  const paid = parseFloat(paidAmount) || 0;
  const debt = Math.max(0, card.price - paid);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.handle,
          { marginTop: insets.top + (Platform.OS === "web" ? 67 : 8) },
        ]}
      />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color="#64748B" />
        </Pressable>
        <Text style={styles.modalTitle}>تسجيل بيع جديد</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.cardPreview, { backgroundColor: cfg.lightColor, borderColor: cfg.color + "30" }]}>
          <View style={[styles.cardPreviewBadge, { backgroundColor: cfg.color }]}>
            <Text style={styles.cardPreviewOp}>{cfg.name}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.cardPreviewName, { color: cfg.color }]}>
              {card.name}
            </Text>
            <Text style={styles.cardPreviewPrice}>السعر: {card.price} JD</Text>
          </View>
          <View style={styles.cardPreviewValue}>
            <Text style={[styles.cardPreviewNum, { color: cfg.color }]}>
              {card.value}
            </Text>
            <Text style={styles.cardPreviewJD}>JD</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>بيانات العميل</Text>

        <Field
          label="اسم العميل"
          value={customerName}
          onChangeText={(v) => {
            setCustomerName(v);
            setErrors((e) => ({ ...e, name: "" }));
          }}
          placeholder="أدخل اسم العميل"
          error={errors.name}
        />

        <Field
          label="رقم الهاتف"
          value={customerPhone}
          onChangeText={(v) => {
            setCustomerPhone(v);
            setErrors((e) => ({ ...e, phone: "" }));
          }}
          placeholder="07XXXXXXXX"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Text style={styles.sectionTitle}>تفاصيل الدفع</Text>

        <Field
          label="المبلغ المدفوع (JD)"
          value={paidAmount}
          onChangeText={(v) => {
            setPaidAmount(v);
            setErrors((e) => ({ ...e, paid: "" }));
          }}
          placeholder={`${card.price}`}
          keyboardType="decimal-pad"
          error={errors.paid}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryVal}>{card.price.toFixed(2)} JD</Text>
            <Text style={styles.summaryLabel}>سعر البطاقة</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryVal, { color: "#00A651" }]}>
              {paid.toFixed(2)} JD
            </Text>
            <Text style={styles.summaryLabel}>المدفوع</Text>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryValLg,
                { color: debt > 0 ? "#EF4444" : "#00A651" },
              ]}
            >
              {debt.toFixed(2)} JD
            </Text>
            <Text style={styles.summaryLabel}>
              {debt > 0 ? "المتبقي (دين)" : "مسدد بالكامل"}
            </Text>
          </View>
        </View>

        {debt > 0 && (
          <View style={styles.debtWarning}>
            <Feather name="alert-triangle" size={16} color="#F59E0B" />
            <Text style={styles.debtWarningText}>
              سيتم تسجيل دين بقيمة {debt.toFixed(2)} JD على العميل
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: cfg.color },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            saving && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Text style={styles.saveBtnText}>جاري الحفظ...</Text>
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>تأكيد البيع</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  cardPreview: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardPreviewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cardPreviewOp: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  cardPreviewName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardPreviewPrice: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  cardPreviewValue: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  cardPreviewNum: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  cardPreviewJD: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#64748B",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
    marginTop: 4,
  },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#64748B",
    textAlign: "right",
  },
  fieldInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  fieldInputError: { borderColor: "#EF4444" },
  fieldError: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  summaryVal: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
  },
  summaryValLg: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  debtWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
  },
  debtWarningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#92400E",
    textAlign: "right",
  },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
