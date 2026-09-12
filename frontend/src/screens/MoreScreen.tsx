import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, AppScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  onNavigate: (screen: AppScreen) => void;
  onBack: () => void;
  onSwitchChild: () => void;
}

const ROWS: { icon: keyof typeof Ionicons.glyphMap; labelKey: TKey; screen: AppScreen; color: string }[] = [
  { icon: "mic-circle", labelKey: "rowVoiceCommandMatch", screen: "voice-command", color: colors.forest },
  { icon: "sparkles", labelKey: "rowCategoryBuilder", screen: "category-builder", color: colors.greenDeep },
  { icon: "albums", labelKey: "rowMyCategories", screen: "my-categories", color: colors.blueDeep },
  { icon: "book", labelKey: "rowPhraseLibrary", screen: "phrase-library", color: colors.indigoAccent },
  { icon: "list-circle", labelKey: "rowContentReviewQueue", screen: "review-queue", color: colors.pinkDeep },
  { icon: "image", labelKey: "rowSentencePicture", screen: "sentence-picture", color: colors.purpleDeep },
  { icon: "flag", labelKey: "rowMilestones", screen: "rewards", color: colors.yellowDeep },
  { icon: "leaf", labelKey: "rowCalmDown", screen: "calm-down", color: colors.greenDeep },
  { icon: "medkit", labelKey: "rowDoctorPanel", screen: "doctor-panel", color: colors.pinkDeep },
  { icon: "people", labelKey: "rowAllChildren", screen: "parent-hub", color: colors.blueDeep },
  { icon: "settings", labelKey: "rowSettingsLanguage", screen: "accessibility", color: colors.purpleDeep },
];

export default function MoreScreen({ child, onNavigate, onBack, onSwitchChild }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>{tt("moreTitle")}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {/* Featured Admin Control Center Card */}
          <Pressable
            onPress={() => onNavigate("admin-panel")}
            style={styles.adminBanner}
          >
            <View style={styles.adminBannerIcon}>
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.adminBannerTitle}>{tt("adminControlCenterTitle")}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tt("adminBadgeShort")}</Text>
                </View>
              </View>
              <Text style={styles.adminBannerSub}>
                {tt("adminControlCenterSub")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </Pressable>

          {ROWS.map((r) => (
            <Pressable key={r.screen} onPress={() => onNavigate(r.screen)} style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: r.color + "22" }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text style={styles.rowLabel}>{tt(r.labelKey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </Pressable>
          ))}

          <Pressable onPress={onSwitchChild} style={[styles.row, { marginTop: 12 }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.cardMuted }]}>
              <Ionicons name="log-out" size={20} color={colors.textMid} />
            </View>
            <Text style={styles.rowLabel}>{tt("switchChildLabel").replace("{name}", child.name)}</Text>
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
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#0f172a",
    borderRadius: radius,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 4,
  },
  adminBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBannerTitle: { fontSize: 16, fontWeight: "800", color: "white" },
  adminBannerSub: { fontSize: 11.5, color: "#94a3b8", marginTop: 2 },
  badge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "900" },
});
