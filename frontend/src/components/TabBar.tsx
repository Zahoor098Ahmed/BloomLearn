import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TabScreen } from "../types";
import { colors } from "../theme";

interface TabBarProps {
  active: TabScreen;
  onChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

const TABS: { key: TabScreen; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", icon: "home" },
  { key: "speak", icon: "chatbubble-ellipses" },
  { key: "schedule", icon: "calendar" },
  { key: "games", icon: "game-controller" },
  { key: "progress", icon: "stats-chart" },
];

export default function TabBar({ active, onChange, labels }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.item}>
            <Ionicons name={tab.icon} size={22} color={isActive ? colors.forest : colors.textLight} />
            <Text style={[styles.label, { color: isActive ? colors.forest : colors.textLight, fontWeight: isActive ? "700" : "500" }]}>
              {labels[tab.key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 10,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 11 },
});
