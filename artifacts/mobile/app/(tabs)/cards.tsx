import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Operator } from "@/context/AppContext";

const OPERATOR_CONFIG = {
  zain: {
    name: "زين",
    nameEn: "ZAIN",
    color: "#00A651",
    lightColor: "#E8F8EF",
    darkColor: "#007A3D",
  },
  orange: {
    name: "أورنج",
    nameEn: "ORANGE",
    color: "#FF6B00",
    lightColor: "#FFF0E6",
    darkColor: "#CC5500",
  },
  umniah: {
    name: "أمنية",
    nameEn: "UMNIAH",
    color: "#E31E24",
    lightColor: "#FDEAEA",
    darkColor: "#B01519",
  },
};

function OperatorTab({
  operator,
  selected,
  onPress,
}: {
  operator: Operator;
  selected: boolean;
  onPress: () => void;
}) {
  const cfg = OPERATOR_CONFIG[operator];
  return (
    <Pressable
      style={[
        styles.opTab,
        selected && { backgroundColor: cfg.color },
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.opTabText, selected && { color: "#fff" }]}
      >
        {cfg.name}
      </Text>
    </Pressable>
  );
}

function TelecomCard({
  card,
  onBuy,
}: {
  card: { id: string; operator: Operator; name: string; value: number; price: number };
  onBuy: () => void;
}) {
  const cfg = OPERATOR_CONFIG[card.operator];

  return (
    <View style={[styles.card, { backgroundColor: cfg.lightColor, borderColor: cfg.color + "30" }]}>
      <View style={[styles.cardHeader, { backgroundColor: cfg.color }]}>
        <Text style={styles.cardOpName}>{cfg.name}</Text>
        <Text style={styles.cardOpEn}>{cfg.nameEn}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardChip}>
          <Feather name="credit-card" size={16} color={cfg.darkColor} />
        </View>
        <View style={styles.valueWrap}>
          <Text style={[styles.valueNum, { color: cfg.color }]}>{card.value}</Text>
          <Text style={[styles.valueCur, { color: cfg.darkColor }]}>JD</Text>
        </View>
        <Text style={styles.cardName}>{card.name}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.priceTag, { color: cfg.darkColor }]}>
          السعر: {card.price} JD
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.buyBtn,
            { backgroundColor: cfg.color },
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
          onPress={onBuy}
        >
          <Text style={styles.buyBtnText}>شراء</Text>
          <Feather name="shopping-cart" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const { cards } = useApp();
  const insets = useSafeAreaInsets();
  const [activeOp, setActiveOp] = useState<Operator>("zain");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const filteredCards = cards.filter((c) => c.operator === activeOp);

  const handleBuy = (cardId: string) => {
    router.push({ pathname: "/sale-modal", params: { cardId } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>البطاقات المتاحة</Text>
        <Text style={styles.headerSubtitle}>اختر الشركة والبطاقة للبيع</Text>
        <View style={styles.tabs}>
          {(["zain", "orange", "umniah"] as Operator[]).map((op) => (
            <OperatorTab
              key={op}
              operator={op}
              selected={activeOp === op}
              onPress={() => setActiveOp(op)}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {filteredCards.map((card) => (
          <TelecomCard
            key={card.id}
            card={card}
            onBuy={() => handleBuy(card.id)}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "right",
    marginBottom: 14,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  opTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  opTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#64748B",
  },
  scroll: { flex: 1 },
  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    padding: 12,
    alignItems: "flex-end",
  },
  cardOpName: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  cardOpEn: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 10,
  },
  cardBody: {
    padding: 14,
    alignItems: "flex-end",
    gap: 8,
  },
  cardChip: {
    width: 32,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  valueNum: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  valueCur: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  priceTag: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  buyBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
