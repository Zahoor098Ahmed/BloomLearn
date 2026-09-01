import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, AppScreen } from "../types";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  onNavigate: (screen: AppScreen) => void;
  onBack: () => void;
  onSwitchChild: () => void;
}

const ROWS: { icon: keyof typeof Ionicons.glyphMap; label: string; screen: AppScreen; color: string }[] = [
  { icon: "sparkles", label: "Category Builder", screen: "category-builder", color: colors.greenDeep },
  { icon: "albums", label: "My Categories", screen: "my-categories", color: colors.blueDeep },
  { icon: "image", label: "Sentence Picture", screen: "sentence-picture", color: colors.purpleDeep },
  { icon: "star", label: "Rewards & Stars", screen: "rewards", color: colors.yellowDeep },
  { icon: "leaf", label: "Calm Down", screen: "calm-down", color: colors.greenDeep },
  { icon: "medkit", label: "Doctor Panel", screen: "doctor-panel", color: colors.pinkDeep },
  { icon: "people", label: "All Children", screen: "parent-hub", color: colors.blueDeep },
  { icon: "settings", label: "Settings & Language", screen: "accessibility", color: colors.purpleDeep },
];

export default function MoreScreen({ child, onNavigate, onBack, onSwitchChild }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {ROWS.map((r) => (
            <Pressable key={r.screen} onPress={() => onNavigate(r.screen)} style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: r.color + "22" }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </Pressable>
          ))}

          <Pressable onPress={onSwitchChild} style={[styles.row, { marginTop: 12 }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.cardMuted }]}>
              <Ionicons name="log-out" size={20} color={colors.textMid} />
            </View>
            <Text style={styles.rowLabel}>Switch Child ({child.name})</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, flexDirection: "row", alignItems: "center", gap: 14, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  body: { padding: 20, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textDark },
});
