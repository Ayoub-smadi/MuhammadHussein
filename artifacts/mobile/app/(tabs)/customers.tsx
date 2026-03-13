import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, AppUser } from "@/context/AppContext";

function UserCard({ user, onPress }: { user: AppUser; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.userCard, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userPhone}>{user.phone}</Text>
      </View>
      {user.debt > 0 && (
        <View style={styles.debtChip}>
          <Text style={styles.debtChipText}>{user.debt.toFixed(2)} JD</Text>
        </View>
      )}
      <Feather name="chevron-left" size={18} color="#CBD5E1" />
    </Pressable>
  );
}

type EditField = "name" | "phone" | "password" | "debt";

export default function CustomersScreen() {
  const { adminLoggedIn, users, updateUser, updateUserDebt, deleteUser, getUserRequests, getUserSales } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editField, setEditField] = useState<EditField | null>(null);
  const [editVal, setEditVal] = useState("");
  const [addDebtAmt, setAddDebtAmt] = useState("");
  const [addDebtNote, setAddDebtNote] = useState("");

  React.useEffect(() => {
    if (!adminLoggedIn) router.replace("/auth");
  }, [adminLoggedIn]);

  if (!adminLoggedIn) return null;

  const filtered = useMemo(() =>
    users.filter((u) =>
      u.name.includes(search) || u.phone.includes(search)
    ), [users, search]);

  const openEdit = (field: EditField) => {
    if (!selectedUser) return;
    setEditField(field);
    setEditVal(
      field === "debt" ? selectedUser.debt.toString() :
      field === "name" ? selectedUser.name :
      field === "phone" ? selectedUser.phone : ""
    );
  };

  const saveEdit = () => {
    if (!selectedUser || !editField) return;
    if (editField === "debt") {
      const val = parseFloat(editVal);
      if (isNaN(val) || val < 0) { Alert.alert("خطأ", "أدخل قيمة صحيحة"); return; }
      updateUserDebt(selectedUser.id, val);
    } else {
      if (!editVal.trim()) { Alert.alert("خطأ", "الحقل لا يمكن أن يكون فارغاً"); return; }
      updateUser(selectedUser.id, { [editField]: editVal.trim() });
    }
    setEditField(null);
    const updated = users.find((u) => u.id === selectedUser.id);
    if (updated) setSelectedUser(updated);
  };

  const handleAddDebt = () => {
    if (!selectedUser) return;
    const amt = parseFloat(addDebtAmt);
    if (isNaN(amt) || amt <= 0) { Alert.alert("خطأ", "أدخل مبلغ صحيح"); return; }
    const newDebt = selectedUser.debt + amt;
    updateUserDebt(selectedUser.id, newDebt);
    setAddDebtAmt("");
    setAddDebtNote("");
    const updated = users.find((u) => u.id === selectedUser.id);
    if (updated) setSelectedUser({ ...updated, debt: newDebt });
    Alert.alert("تم", `تم إضافة ${amt.toFixed(2)} JD للدين. المجموع: ${newDebt.toFixed(2)} JD`);
  };

  const EDIT_FIELD_LABELS: Record<EditField, string> = {
    name: "الاسم",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    debt: "الدين المستحق (JD)",
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>العملاء ({users.length})</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث بالاسم أو الهاتف..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
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
            <Feather name="users" size={52} color="#CBD5E1" />
            <Text style={styles.emptyText}>{search ? "لا نتائج" : "لا يوجد عملاء مسجلون"}</Text>
          </View>
        ) : (
          filtered.map((u) => (
            <UserCard key={u.id} user={u} onPress={() => setSelectedUser(u)} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* User detail modal */}
      <Modal
        visible={!!selectedUser && !editField}
        transparent animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {selectedUser && (
              <>
                <View style={styles.modalUserHead}>
                  <Pressable onPress={() => setSelectedUser(null)} style={styles.modalClose}>
                    <Feather name="x" size={18} color="#64748B" />
                  </Pressable>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{selectedUser.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                  <Text style={styles.modalUserPhone}>{selectedUser.phone}</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.sectionLabel}>بيانات الحساب</Text>
                  {(["name", "phone", "password"] as EditField[]).map((f) => (
                    <Pressable key={f} style={styles.infoRow} onPress={() => openEdit(f)}>
                      <Feather name="edit-2" size={14} color="#94A3B8" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>{EDIT_FIELD_LABELS[f]}</Text>
                        <Text style={styles.infoVal}>
                          {f === "password" ? "••••••" : selectedUser[f as keyof AppUser]?.toString()}
                        </Text>
                      </View>
                    </Pressable>
                  ))}

                  <Text style={[styles.sectionLabel, { marginTop: 12 }]}>الدين المستحق</Text>
                  <View style={[styles.debtBox, { borderColor: selectedUser.debt > 0 ? "#EF4444" : "#E2E8F0" }]}>
                    <Text style={[styles.debtTotal, { color: selectedUser.debt > 0 ? "#EF4444" : "#10B981" }]}>
                      {selectedUser.debt.toFixed(2)} JD
                    </Text>
                    <View style={styles.debtActions}>
                      <Pressable style={styles.debtEditBtn} onPress={() => openEdit("debt")}>
                        <Feather name="edit-2" size={13} color="#64748B" />
                        <Text style={styles.debtEditText}>تعديل</Text>
                      </Pressable>
                      {selectedUser.debt > 0 && (
                        <Pressable
                          style={styles.debtClearBtn}
                          onPress={() => {
                            Alert.alert("تصفير الدين", "هل تريد تصفير الدين؟", [
                              { text: "إلغاء", style: "cancel" },
                              { text: "تصفير", onPress: () => {
                                updateUserDebt(selectedUser.id, 0);
                                setSelectedUser({ ...selectedUser, debt: 0 });
                              }},
                            ]);
                          }}
                        >
                          <Feather name="check-circle" size={13} color="#10B981" />
                          <Text style={styles.debtClearText}>تصفير</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  <Text style={[styles.sectionLabel, { marginTop: 12 }]}>إضافة دين جديد</Text>
                  <View style={styles.addDebtBox}>
                    <TextInput
                      style={styles.addDebtInput}
                      placeholder="المبلغ (JD)"
                      placeholderTextColor="#94A3B8"
                      value={addDebtAmt}
                      onChangeText={setAddDebtAmt}
                      keyboardType="decimal-pad"
                      textAlign="right"
                    />
                    <Pressable style={styles.addDebtBtn} onPress={handleAddDebt}>
                      <Feather name="plus" size={16} color="#fff" />
                      <Text style={styles.addDebtBtnText}>إضافة دين</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.deleteUserBtn}
                    onPress={() => {
                      if (!selectedUser) return;
                      Alert.alert(
                        "حذف العميل",
                        `هل تريد حذف حساب "${selectedUser.name}" نهائياً؟ لا يمكن التراجع.`,
                        [
                          { text: "إلغاء", style: "cancel" },
                          {
                            text: "حذف",
                            style: "destructive",
                            onPress: () => {
                              deleteUser(selectedUser.id);
                              setSelectedUser(null);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                    <Text style={styles.deleteUserBtnText}>حذف الحساب نهائياً</Text>
                  </Pressable>

                  <View style={{ height: 40 }} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit field modal */}
      <Modal
        visible={!!editField}
        transparent animationType="slide"
        onRequestClose={() => setEditField(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.editModalTitle}>
              {editField ? EDIT_FIELD_LABELS[editField] : ""}
            </Text>
            <TextInput
              style={styles.editInput}
              value={editVal}
              onChangeText={setEditVal}
              keyboardType={editField === "debt" || editField === "phone" ? "decimal-pad" : "default"}
              secureTextEntry={editField === "password"}
              textAlign="right"
              autoFocus
            />
            <View style={styles.editBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditField(null)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>حفظ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 10,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "right" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F1F5F9", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#0F172A" },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  userCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#0F172A",
    alignItems: "center", justifyContent: "center",
  },
  userAvatarText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0F172A" },
  userPhone: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  debtChip: {
    backgroundColor: "#FEE2E2", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  debtChipText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#EF4444" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: "#94A3B8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "90%",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 12 },
  modalUserHead: { alignItems: "center", gap: 6, marginBottom: 16, position: "relative" },
  modalClose: {
    position: "absolute", right: 0, top: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  modalAvatar: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: "#0F172A",
    alignItems: "center", justifyContent: "center",
  },
  modalAvatarText: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold" },
  modalUserName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0F172A" },
  modalUserPhone: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textAlign: "right", marginBottom: 8 },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, marginBottom: 8,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", textAlign: "right" },
  infoVal: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0F172A", textAlign: "right" },
  debtBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 2, padding: 14,
  },
  debtTotal: { fontSize: 24, fontFamily: "Inter_700Bold" },
  debtActions: { gap: 6 },
  debtEditBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F1F5F9", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  debtEditText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  debtClearBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#D1FAE5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  debtClearText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#065F46" },
  addDebtBox: { flexDirection: "row", gap: 10 },
  addDebtInput: {
    flex: 1, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#E2E8F0", padding: 12, fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#0F172A",
  },
  addDebtBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EF4444", borderRadius: 12, paddingHorizontal: 16,
  },
  addDebtBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  editModalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16,
  },
  editModalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0F172A", textAlign: "center" },
  editInput: {
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 16, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#0F172A",
  },
  editBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#64748B" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: "#00A651", alignItems: "center" },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  deleteUserBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#FEE2E2", borderRadius: 14, paddingVertical: 14, marginTop: 8,
  },
  deleteUserBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#EF4444" },
});
