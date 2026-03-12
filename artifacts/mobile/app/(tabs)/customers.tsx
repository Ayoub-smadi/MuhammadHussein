import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const OPERATOR_COLORS: Record<string, string> = {
  zain: "#00A651",
  orange: "#FF6B00",
  umniah: "#E31E24",
};

export default function CustomersScreen() {
  const { sales, customers } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    return customers.filter(
      (c) =>
        c.name.includes(search) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const getCustomerSales = (phone: string) =>
    sales.filter((s) => s.customerPhone === phone);

  const getCustomerDebt = (phone: string) =>
    getCustomerSales(phone).reduce((sum, s) => sum + s.debt, 0);

  const getCustomerTotal = (phone: string) =>
    getCustomerSales(phone).reduce((sum, s) => sum + s.paidAmount, 0);

  const selectedCustomer = selected
    ? customers.find((c) => c.phone === selected)
    : null;
  const selectedSales = selected ? getCustomerSales(selected) : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>العملاء</Text>
        <Text style={styles.headerSub}>{customers.length} عميل مسجل</Text>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث بالاسم أو الهاتف..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
          <Feather name="search" size={18} color="#94A3B8" />
        </View>
      </View>

      {selectedCustomer ? (
        <View style={styles.detailContainer}>
          <Pressable style={styles.backBtn} onPress={() => setSelected(null)}>
            <Feather name="arrow-right" size={20} color="#0F172A" />
            <Text style={styles.backText}>رجوع</Text>
          </Pressable>
          <View style={styles.customerDetailCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {selectedCustomer.name.charAt(0)}
              </Text>
            </View>
            <Text style={styles.customerDetailName}>{selectedCustomer.name}</Text>
            <Text style={styles.customerDetailPhone}>{selectedCustomer.phone}</Text>
            <View style={styles.customerStatsRow}>
              <View style={styles.custStat}>
                <Text style={styles.custStatVal}>
                  {getCustomerTotal(selectedCustomer.phone).toFixed(2)} JD
                </Text>
                <Text style={styles.custStatLabel}>المدفوع</Text>
              </View>
              <View style={styles.custStatDiv} />
              <View style={styles.custStat}>
                <Text style={[styles.custStatVal, { color: getCustomerDebt(selectedCustomer.phone) > 0 ? "#EF4444" : "#00A651" }]}>
                  {getCustomerDebt(selectedCustomer.phone).toFixed(2)} JD
                </Text>
                <Text style={styles.custStatLabel}>الديون</Text>
              </View>
              <View style={styles.custStatDiv} />
              <View style={styles.custStat}>
                <Text style={styles.custStatVal}>
                  {getCustomerSales(selectedCustomer.phone).length}
                </Text>
                <Text style={styles.custStatLabel}>مبيعات</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionTitle}>سجل المشتريات</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedSales.map((sale) => (
              <View key={sale.id} style={styles.miniSaleRow}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.miniSaleCard}>{sale.cardName}</Text>
                  <Text style={styles.miniSaleDate}>
                    {new Date(sale.saleDate).toLocaleDateString("ar-JO")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.miniOpDot,
                    { backgroundColor: OPERATOR_COLORS[sale.operator] },
                  ]}
                />
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.miniSalePaid}>
                    {sale.paidAmount.toFixed(2)} JD
                  </Text>
                  {sale.debt > 0 && (
                    <Text style={styles.miniSaleDebt}>
                      دين: {sale.debt.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Feather name="users" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {search ? "لا توجد نتائج" : "لا يوجد عملاء بعد"}
              </Text>
            </View>
          ) : (
            filtered.map((customer) => {
              const debt = getCustomerDebt(customer.phone);
              const total = getCustomerTotal(customer.phone);
              const numSales = getCustomerSales(customer.phone).length;
              return (
                <Pressable
                  key={customer.phone}
                  style={({ pressed }) => [
                    styles.customerCard,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => setSelected(customer.phone)}
                >
                  <View style={styles.customerLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {customer.name.charAt(0)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <View style={styles.customerMeta}>
                      <Text style={styles.customerPhone}>{customer.phone}</Text>
                      <Text style={styles.customerSales}>{numSales} مبيعة</Text>
                    </View>
                    {debt > 0 && (
                      <View style={styles.debtBadge}>
                        <Feather name="alert-circle" size={11} color="#EF4444" />
                        <Text style={styles.debtBadgeText}>
                          دين: {debt.toFixed(2)} JD
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.customerTotal}>
                      {total.toFixed(2)} JD
                    </Text>
                    <Feather name="chevron-left" size={16} color="#CBD5E1" />
                  </View>
                </Pressable>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  customerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  customerLeft: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#00A651",
  },
  customerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
  },
  customerMeta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  customerPhone: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  customerSales: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  customerTotal: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  debtBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  debtBadgeText: {
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
  detailContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#0F172A",
  },
  customerDetailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  customerDetailName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  customerDetailPhone: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  customerStatsRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 12,
    width: "100%",
    justifyContent: "space-around",
  },
  custStat: { alignItems: "center", gap: 4 },
  custStatVal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  custStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  custStatDiv: {
    width: 1,
    height: 36,
    backgroundColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 12,
  },
  miniSaleRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  miniOpDot: { width: 8, height: 8, borderRadius: 4 },
  miniSaleCard: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
  },
  miniSaleDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  miniSalePaid: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#00A651",
  },
  miniSaleDebt: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
  },
});
