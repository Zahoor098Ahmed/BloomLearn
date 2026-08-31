import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { getUsage } from "../modules/storage";
import { t } from "../modules/i18n";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius, radiusLg } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  onOpenMore: () => void;
  labels: Record<TabScreen, string>;
}

const QUICK_ACCESS: { key: TabScreen; label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; iconColor: string }[] = [
  { key: "speak", label: "Communicate Now", icon: "chatbubble-ellipses", bg: colors.blue, iconColor: colors.blueDeep },
  { key: "schedule", label: "Today's Schedule", icon: "calendar", bg: colors.yellow, iconColor: colors.yellowDeep },
  { key: "games", label: "Play a Game", icon: "locate", bg: colors.green, iconColor: colors.greenDeep },
  { key: "progress", label: "Progress", icon: "stats-chart", bg: colors.pink, iconColor: colors.pinkDeep },
];

const TODAY_PREVIEW = [
  { icon: "🍳", label: "Breakfast", time: "08:00", state: "done" as const, color: colors.yellow },
  { icon: "🎮", label: "Play Time", time: "09:00", state: "done" as const, color: colors.green },
  { icon: "💬", label: "AAC Session", time: "10:30", state: "now" as const, color: colors.blue },
  { icon: "🍽️", label: "Lunch", time: "12:00", state: "upcoming" as const, color: colors.orange },
];

export default function HomeScreen({ child, tab, onTabChange, onOpenMore, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("morning", lang) : hour < 17 ? t("afternoon", lang) : t("evening", lang);

  const usage = getUsage(child.id);
  const stars = child.stars ?? 0;
  const streak = usage.gameStreak ?? 0;
  const doneToday = TODAY_PREVIEW.filter((i) => i.state === "done").length;
  const nextUp = TODAY_PREVIEW.find((i) => i.state === "now") ?? TODAY_PREVIEW.find((i) => i.state === "upcoming");
  // Level progress: 5 stars per level, shown as a bar toward the next one.
  const levelProgress = Math.min(1, (stars % 5) / 5);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 22 }}>{child.age <= 6 ? "👦" : "👧"}</Text>
              </View>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.name}>{child.name} 👋</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <LangBadge dark />
              <Pressable onPress={onOpenMore} style={styles.settingsBtn}>
                <Ionicons name="settings-sharp" size={18} color="white" />
              </Pressable>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level: Developing</Text>
          </View>

          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${levelProgress * 100}%` }]} />
          </View>
          <Text style={styles.levelHint}>{5 - (stars % 5)} more stars to level up</Text>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>⭐ {stars}</Text>
              <Text style={styles.headerStatLabel}>Stars</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>🔥 {streak}</Text>
              <Text style={styles.headerStatLabel}>Day streak</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>✅ {doneToday}/{TODAY_PREVIEW.length}</Text>
              <Text style={styles.headerStatLabel}>Today</Text>
            </View>
          </View>

          {nextUp && (
            <Pressable onPress={() => onTabChange("schedule")} style={styles.nextUpRow}>
              <Text style={styles.nextUpIcon}>{nextUp.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextUpLabel}>Next up · {nextUp.time}</Text>
                <Text style={styles.nextUpTitle}>{nextUp.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS.map((q) => (
              <Pressable key={q.key} onPress={() => onTabChange(q.key)} style={[styles.quickTile, { backgroundColor: q.bg }]}>
                <View style={styles.quickIconBadge}>
                  <Ionicons name={q.icon} size={22} color={q.iconColor} />
                </View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
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
                    {item.label}
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
                    <Text style={styles.nowBadgeText}>NOW</Text>
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
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: colors.forestDark,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  greeting: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  name: { color: "white", fontSize: 19, fontWeight: "800" },
  settingsBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  levelBadge: { marginTop: 18, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14 },
  levelText: { color: "white", fontSize: 12, fontWeight: "600" },
  levelTrack: { marginTop: 12, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  levelFill: { height: "100%", borderRadius: 3, backgroundColor: "white" },
  levelHint: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 6 },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  headerStat: { flex: 1, alignItems: "center", gap: 2 },
  headerStatValue: { color: "white", fontSize: 15, fontWeight: "800" },
  headerStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10.5 },
  headerStatDivider: { width: 1, alignSelf: "stretch", backgroundColor: "rgba(255,255,255,0.15)" },
  nextUpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  nextUpIcon: { fontSize: 22 },
  nextUpLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  nextUpTitle: { color: "white", fontSize: 15, fontWeight: "800", marginTop: 2 },
  body: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 32, gap: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1, marginTop: 10, marginBottom: 6 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  quickTile: {
    width: "47%",
    borderRadius: radiusLg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.55)",
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
  scheduleRowNow: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderWidth: 2,
    shadowColor: colors.forest,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  scheduleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  scheduleLabel: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  scheduleTime: { fontSize: 12.5, color: colors.textLight, marginTop: 3 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.greenDeep, alignItems: "center", justifyContent: "center" },
  nowBadge: { backgroundColor: colors.forest, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  nowBadgeText: { color: "white", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
});
