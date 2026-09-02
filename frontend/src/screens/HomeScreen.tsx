import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radiusLg } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  onOpenMore: () => void;
  onOpenPictureTalk: () => void;
  labels: Record<TabScreen, string>;
}

type QuickItem = {
  labelKey: TKey;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  iconColor: string;
  go: (p: Props) => void;
};

const QUICK_ACCESS: QuickItem[] = [
  { labelKey: "qCommunicate", icon: "chatbubble-ellipses", bg: colors.blue, iconColor: colors.blueDeep, go: (p) => p.onTabChange("speak") },
  { labelKey: "todaysSchedule", icon: "calendar", bg: colors.yellow, iconColor: colors.yellowDeep, go: (p) => p.onTabChange("schedule") },
  { labelKey: "qPictureTalk", icon: "image", bg: colors.forestLight, iconColor: colors.forest, go: (p) => p.onOpenPictureTalk() },
  { labelKey: "qActivities", icon: "shapes", bg: colors.green, iconColor: colors.greenDeep, go: (p) => p.onTabChange("games") },
];

const TODAY_PREVIEW = [
  { icon: "🍳", labelKey: "sBreakfast" as TKey, time: "08:00", state: "done" as const, color: colors.yellow },
  { icon: "🧩", labelKey: "sPlayTime" as TKey, time: "09:00", state: "done" as const, color: colors.green },
  { icon: "💬", labelKey: "sAacSession" as TKey, time: "10:30", state: "now" as const, color: colors.blue },
  { icon: "🍽️", labelKey: "sLunch" as TKey, time: "12:00", state: "upcoming" as const, color: colors.orange },
];

export default function HomeScreen(props: Props) {
  const { child, tab, onTabChange, onOpenMore, labels } = props;
  const { settings } = useSettings();
  const lang = settings.language;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("morning", lang) : hour < 17 ? t("afternoon", lang) : t("evening", lang);
  const nextUp = TODAY_PREVIEW.find((i) => i.state === "now") ?? TODAY_PREVIEW.find((i) => i.state === "upcoming");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 22 }}>{child.age <= 6 ? "🧒" : "🧑"}</Text>
              </View>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.name}>{child.name}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <LangBadge dark />
              <Pressable onPress={onOpenMore} style={styles.settingsBtn} hitSlop={6}>
                <Ionicons name="settings-outline" size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {nextUp && (
            <Pressable onPress={() => onTabChange("schedule")} style={styles.nextUpRow}>
              <View style={styles.nextUpIconWrap}>
                <Text style={{ fontSize: 20 }}>{nextUp.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextUpLabel}>{nextUp.state === "now" ? t("happeningNow", lang) : t("nextLabel", lang)} · {nextUp.time}</Text>
                <Text style={styles.nextUpTitle}>{t(nextUp.labelKey, lang)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t("quickAccess", lang)}</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS.map((q) => (
              <Pressable key={q.labelKey} onPress={() => q.go(props)} style={[styles.quickTile, { backgroundColor: q.bg }]}>
                <View style={styles.quickIconBadge}>
                  <Ionicons name={q.icon} size={22} color={q.iconColor} />
                </View>
                <Text style={styles.quickLabel}>{t(q.labelKey, lang)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t("todaySchedule", lang)}</Text>
          <View style={{ gap: 12 }}>
            {TODAY_PREVIEW.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.scheduleRow,
                  item.state === "now" ? styles.scheduleRowNow : { backgroundColor: item.state === "done" ? colors.cardMuted : colors.card },
                ]}
              >
                <View style={[styles.scheduleIcon, { backgroundColor: item.color }]}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleLabel, item.state === "done" && { textDecorationLine: "line-through", color: colors.textLight }]}>
                    {t(item.labelKey, lang)}
                  </Text>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                </View>
                {item.state === "done" && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
                {item.state === "now" && (
                  <View style={styles.nowBadge}>
                    <Text style={styles.nowBadgeText}>{t("nowBadge", lang)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.forest,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  greeting: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  name: { color: "white", fontSize: 20, fontWeight: "800" },
  settingsBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  nextUpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 12,
    marginTop: 18,
  },
  nextUpIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  nextUpLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  nextUpTitle: { color: "white", fontSize: 15, fontWeight: "800", marginTop: 2 },
  body: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 32, gap: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1, marginTop: 6, marginBottom: 6 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  quickTile: {
    width: "47%",
    borderRadius: radiusLg,
    paddingVertical: 24,
    paddingHorizontal: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  quickIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scheduleRowNow: { backgroundColor: colors.card, borderColor: colors.forest, borderWidth: 2 },
  scheduleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  scheduleLabel: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  scheduleTime: { fontSize: 12.5, color: colors.textLight, marginTop: 3 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.greenDeep, alignItems: "center", justifyContent: "center" },
  nowBadge: { backgroundColor: colors.forest, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  nowBadgeText: { color: "white", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
});
