import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

export default function LoginScreen() {
  const { login, isAuthenticated } = useApp();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال كلمة المرور");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const success = login(password);
    setLoading(false);
    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("خطأ", "كلمة المرور غير صحيحة");
      setPassword("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Feather name="credit-card" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>بطاقات الاتصالات</Text>
          <Text style={styles.subtitle}>نظام إدارة المبيعات</Text>
        </View>

        <View style={styles.operatorsRow}>
          <View style={[styles.badge, { backgroundColor: "#00A651" }]}>
            <Text style={styles.badgeText}>زين</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#FF6B00" }]}>
            <Text style={styles.badgeText}>أورنج</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#E31E24" }]}>
            <Text style={styles.badgeText}>أمنية</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>
          <Text style={styles.cardSubtitle}>أدخل كلمة مرور المشرف</Text>

          <View style={styles.inputWrap}>
            <Feather
              name="lock"
              size={18}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
              textAlign="right"
            />
            <Pressable
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={8}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#94A3B8"
              />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && styles.loginBtnPressed,
              loading && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginBtnText}>جاري التحقق...</Text>
            ) : (
              <>
                <Text style={styles.loginBtnText}>دخول</Text>
                <Feather name="arrow-left" size={18} color="#fff" />
              </>
            )}
          </Pressable>

          <Text style={styles.hint}>كلمة المرور: admin123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#00A651",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#00A651",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
  },
  operatorsRow: {
    flexDirection: "row",
    gap: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
    marginTop: -8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  loginBtn: {
    backgroundColor: "#00A651",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#00A651",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  hint: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
