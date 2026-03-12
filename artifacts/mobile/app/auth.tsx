import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

type Mode = "choose" | "user-login" | "user-register" | "admin-login";

function InputField({
  icon, placeholder, value, onChangeText, secure, keyboardType, error,
}: {
  icon: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; secure?: boolean;
  keyboardType?: "default" | "phone-pad"; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.field, !!error && styles.fieldError]}>
        <Feather name={icon as any} size={17} color="#94A3B8" />
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType || "default"}
          textAlign="right"
          autoCapitalize="none"
        />
        {secure && (
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={8}>
            <Feather name={show ? "eye-off" : "eye"} size={16} color="#94A3B8" />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.fieldErrText}>{error}</Text> : null}
    </View>
  );
}

export default function AuthScreen() {
  const { adminLogin, userLogin, userRegister, currentUser, adminLoggedIn } = useApp();
  const [mode, setMode] = useState<Mode>("choose");
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  React.useEffect(() => {
    if (currentUser) router.replace("/(user-tabs)/buy");
    else if (adminLoggedIn) router.replace("/(tabs)/dashboard");
  }, [currentUser, adminLoggedIn]);

  // User login state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const reset = () => { setPhone(""); setPassword(""); setName(""); setAdminPw(""); setErrors({}); };

  const handleUserLogin = async () => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = "أدخل رقم الهاتف";
    if (!password.trim()) errs.pw = "أدخل كلمة المرور";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = userLogin(phone.trim(), password);
    setLoading(false);
    if (!ok) setErrors({ pw: "رقم الهاتف أو كلمة المرور غير صحيحة" });
  };

  const handleUserRegister = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "أدخل الاسم";
    if (!phone.trim()) errs.phone = "أدخل رقم الهاتف";
    else if (!/^07/.test(phone.trim())) errs.phone = "رقم الهاتف يجب أن يبدأ بـ 07";
    if (!password.trim() || password.length < 4) errs.pw = "كلمة المرور 4 أحرف على الأقل";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = userRegister(name, phone.trim(), password);
    setLoading(false);
    if (!result.success) setErrors({ phone: result.error || "خطأ في التسجيل" });
  };

  const handleAdminLogin = async () => {
    if (!adminPw.trim()) { setErrors({ admin: "أدخل كلمة المرور" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = adminLogin(adminPw);
    setLoading(false);
    if (!ok) setErrors({ admin: "كلمة المرور غير صحيحة" });
  };

  if (mode === "choose") {
    return (
      <View style={styles.container}>
        <View style={[styles.chooseInner, { paddingTop: topPad + 20 }]}>
          <View style={styles.logoMini}>
            <Feather name="credit-card" size={30} color="#fff" />
          </View>
          <Text style={styles.chooseTitle}>حسين</Text>
          <Text style={styles.chooseSub}>بطاقات الكترونية</Text>

          <Pressable
            style={({ pressed }) => [styles.chooseBtn, { backgroundColor: "#00A651" }, pressed && styles.pressed]}
            onPress={() => { reset(); setMode("user-login"); }}
          >
            <Feather name="user" size={20} color="#fff" />
            <Text style={styles.chooseBtnText}>دخول كمستخدم</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.chooseBtn, { backgroundColor: "#0F172A" }, pressed && styles.pressed]}
            onPress={() => { reset(); setMode("admin-login"); }}
          >
            <Feather name="shield" size={20} color="#fff" />
            <Text style={styles.chooseBtnText}>دخول كمشرف</Text>
          </Pressable>

          <Pressable onPress={() => { reset(); setMode("user-register"); }}>
            <Text style={styles.registerLink}>
              مستخدم جديد؟ <Text style={{ color: "#00A651" }}>سجّل الآن</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.formInner, { paddingTop: topPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => { reset(); setMode("choose"); }}>
          <Feather name="arrow-right" size={20} color="#0F172A" />
        </Pressable>

        <View style={styles.formHeader}>
          <View style={[styles.formIcon, {
            backgroundColor: mode === "admin-login" ? "#0F172A" : "#00A651"
          }]}>
            <Feather
              name={mode === "admin-login" ? "shield" : mode === "user-register" ? "user-plus" : "user"}
              size={28} color="#fff"
            />
          </View>
          <Text style={styles.formTitle}>
            {mode === "user-login" ? "تسجيل دخول" : mode === "user-register" ? "حساب جديد" : "دخول المشرف"}
          </Text>
          <Text style={styles.formSub}>
            {mode === "user-login" ? "أدخل رقم هاتفك وكلمة المرور"
              : mode === "user-register" ? "أنشئ حسابك للشراء وتتبع طلباتك"
              : "منطقة المشرف المحمية"}
          </Text>
        </View>

        <View style={styles.formCard}>
          {mode === "user-register" && (
            <InputField icon="user" placeholder="الاسم الكامل" value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: "" })); }}
              error={errors.name} />
          )}

          {mode !== "admin-login" && (
            <InputField icon="phone" placeholder="رقم الهاتف (07XXXXXXXX)" value={phone}
              onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: "" })); }}
              keyboardType="phone-pad" error={errors.phone} />
          )}

          <InputField
            icon="lock"
            placeholder={mode === "admin-login" ? "كلمة مرور المشرف" : "كلمة المرور"}
            value={mode === "admin-login" ? adminPw : password}
            onChangeText={(v) => {
              if (mode === "admin-login") { setAdminPw(v); setErrors((e) => ({ ...e, admin: "" })); }
              else { setPassword(v); setErrors((e) => ({ ...e, pw: "" })); }
            }}
            secure error={mode === "admin-login" ? errors.admin : errors.pw}
          />

          <Pressable
            style={({ pressed }) => [styles.submitBtn, {
              backgroundColor: mode === "admin-login" ? "#0F172A" : "#00A651"
            }, pressed && styles.pressed, loading && { opacity: 0.7 }]}
            onPress={mode === "user-login" ? handleUserLogin : mode === "user-register" ? handleUserRegister : handleAdminLogin}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? "جاري التحقق..." : mode === "user-register" ? "إنشاء حساب" : "دخول"}
            </Text>
          </Pressable>

          {mode === "user-login" && (
            <Pressable onPress={() => { reset(); setMode("user-register"); }} style={{ alignSelf: "center" }}>
              <Text style={styles.switchText}>
                مستخدم جديد؟ <Text style={{ color: "#00A651" }}>سجّل الآن</Text>
              </Text>
            </Pressable>
          )}
          {mode === "user-register" && (
            <Pressable onPress={() => { reset(); setMode("user-login"); }} style={{ alignSelf: "center" }}>
              <Text style={styles.switchText}>
                لديك حساب؟ <Text style={{ color: "#00A651" }}>سجّل الدخول</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  chooseInner: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 32, gap: 16,
  },
  logoMini: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "#00A651",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#00A651", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    marginBottom: 4,
  },
  chooseTitle: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#0F172A" },
  chooseSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#64748B", marginBottom: 12 },
  chooseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, width: "100%", paddingVertical: 16, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  chooseBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  registerLink: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  formInner: { paddingHorizontal: 24, paddingBottom: 40, gap: 20, flexGrow: 1 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  formHeader: { alignItems: "center", gap: 8 },
  formIcon: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  formTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#0F172A" },
  formSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center" },
  formCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  fieldWrap: { gap: 5 },
  field: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F8FAFC", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldError: { borderColor: "#EF4444" },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#0F172A" },
  fieldErrText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", textAlign: "right" },
  submitBtn: {
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  switchText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
});
