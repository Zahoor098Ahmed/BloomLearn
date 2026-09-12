import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen, TherapyGoal } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { tapFeedback } from "../modules/haptics";
import { t, wordLabel, type TKey } from "../modules/i18n";
import { getUsage, recordScheduleAdherence, updateChild } from "../modules/storage";
import { useResponsive } from "../modules/responsive";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius, radiusLg } from "../theme";

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
  const { child, tab, onTabChange, onOpenMore, onOpenPictureTalk, labels } = props;
  const { settings } = useSettings();
  const { isSmallPhone, isTablet, isLargeTablet } = useResponsive();
  const lang = settings.language;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("morning", lang) : hour < 17 ? t("afternoon", lang) : t("evening", lang);
  const nextUp = TODAY_PREVIEW.find((i) => i.state === "now") ?? TODAY_PREVIEW.find((i) => i.state === "upcoming");

  const usage = useMemo(() => getUsage(child.id), [child.id]);
  const weekWords = usage.wordsByDay.reduce((s, v) => s + v, 0);

  const [scheduleItems, setScheduleItems] = useState(TODAY_PREVIEW);

  function toggleScheduleItem(idx: number) {
    tapFeedback();
    setScheduleItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== idx) return item;
        const nextState: "done" | "now" | "upcoming" = item.state === "done" ? "upcoming" : "done";
        speak(
          t(item.labelKey, lang) + (nextState === "done" ? ". Finished! Great job!" : ""),
          lang,
          settings.soundEnabled
        );
        return { ...item, state: nextState };
      });
      const doneCount = next.filter((i) => i.state === "done").length;
      const percent = Math.round((doneCount / next.length) * 100);
      recordScheduleAdherence(child.id, percent);
      if (next[idx].state === "done") {
        updateChild({ ...child, stars: (child.stars ?? 0) + 1 });
      }
      return next;
    });
  }

  function handleOpenScheduleItem(item: (typeof TODAY_PREVIEW)[number]) {
    tapFeedback();
    speak(t(item.labelKey, lang), lang, settings.soundEnabled);
    if (item.labelKey === "sAacSession") {
      onTabChange("speak");
    } else {
      onTabChange("schedule");
    }
  }

  // Active Doctor Therapy Goal
  const activeTherapyGoal: TherapyGoal = useMemo(() => {
    if (child.therapyGoals && child.therapyGoals.length > 0) {
      const incomplete = child.therapyGoals.find((g) => !g.completed);
      if (incomplete) return incomplete;
      return child.therapyGoals[0];
    }
    return {
      id: "default_speech",
      title: t("defaultSpeechGoalTitle", lang),
      category: "speech",
      targetCount: 3,
      currentCount: Math.min(3, weekWords),
      unit: t("unitWords", lang),
      completed: weekWords >= 3,
      prescribedBy: t("doctorsDailyGoal", lang),
      assignedDate: new Date().toISOString(),
    };
  }, [child.therapyGoals, weekWords, lang]);

  const therapyProgressPct = Math.min(
    100,
    Math.round((activeTherapyGoal.currentCount / activeTherapyGoal.targetCount) * 100)
  );

  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  function handleSelectMood(moodLabel: string, emoji: string) {
    tapFeedback();
    setSelectedMood(moodLabel);
    speak(`${t("sayIAmFeeling", lang)} ${wordLabel(moodLabel, lang)}!`, lang, settings.soundEnabled);
  }

  function handleUrgentNeed(label: string, phraseKey: TKey) {
    tapFeedback();
    speak(t(phraseKey, lang), lang, settings.soundEnabled);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
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
                <View style={styles.starBadgeHeader}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={styles.starBadgeHeaderText}>{child.stars ?? 0}</Text>
                </View>
                <LangBadge dark />
                <Pressable onPress={onOpenMore} style={styles.settingsBtn} hitSlop={6}>
                  <Ionicons name="settings-outline" size={18} color="white" />
                </Pressable>
              </View>
            </View>

            {/* {nextUp && (
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
            )} */}
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Doctor's Daily Therapy Target Card */}
          <Pressable
            onPress={() => {
              if (activeTherapyGoal.category === "speech") onTabChange("speak");
              else if (activeTherapyGoal.category === "occupational") onTabChange("schedule");
              else if (activeTherapyGoal.category === "sensory") onOpenPictureTalk();
              else onTabChange("games");
            }}
            style={styles.therapyBanner}
          >
            <View style={styles.therapyBannerHeader}>
              <View style={styles.therapyBadgeWrap}>
                <Ionicons name="flag" size={14} color="white" />
                <Text style={styles.therapyBadgeText}>{t("therapyTargetBadge", lang)}</Text>
              </View>
              <View style={styles.therapyStarReward}>
                <Ionicons name="star" size={12} color="#b45309" />
                <Text style={styles.therapyStarText}>+5 {t("stars", lang)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
              <View style={styles.therapyIconCircle}>
                <Text style={{ fontSize: 22 }}>
                  {activeTherapyGoal.category === "speech" ? "🗣️" : activeTherapyGoal.category === "sensory" ? "🌿" : "📅"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.therapyTitle}>{activeTherapyGoal.title}</Text>
                <Text style={styles.therapySub}>
                  {activeTherapyGoal.prescribedBy || t("doctorsPlan", lang)} · {t("tapToPracticeNow", lang)}
                </Text>
              </View>
              {activeTherapyGoal.completed && (
                <View style={styles.therapyCheckCircle}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.therapyProgressTrack}>
              <View
                style={[
                  styles.therapyProgressFill,
                  {
                    width: `${therapyProgressPct}%`,
                    backgroundColor: activeTherapyGoal.completed ? colors.greenDeep : colors.forest,
                  },
                ]}
              />
            </View>
            <View style={styles.therapyProgressTextRow}>
              <Text style={styles.therapyProgressNum}>
                {activeTherapyGoal.currentCount} / {activeTherapyGoal.targetCount} {activeTherapyGoal.unit}
              </Text>
              <Text style={styles.therapyActionHint}>
                {activeTherapyGoal.completed ? t("completedToday", lang) : t("startExercise", lang)}
              </Text>
            </View>
          </Pressable>

          {/* Emotional Mood Check-In Widget */}
          <View style={styles.moodSection}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={styles.sectionHeadingSmall}>{t("moodQuestion", lang)}</Text>
              {selectedMood && (
                <View style={styles.selectedMoodTag}>
                  <Text style={styles.selectedMoodTagText}>
                    {t("feelingTag", lang)} {wordLabel(selectedMood, lang)} ✓
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.moodRow, isSmallPhone && { gap: 4 }, isTablet && { gap: 12 }]}>
              {[
                { label: "Happy", emoji: "😃", bg: "#dcfce7", color: "#166534" },
                { label: "Calm", emoji: "😌", bg: "#e0f2fe", color: "#0369a1" },
                { label: "Excited", emoji: "🤩", bg: "#fef3c7", color: "#b45309" },
                { label: "Sad", emoji: "😢", bg: "#ede9fe", color: "#6b21a8" },
                { label: "Tired", emoji: "😴", bg: "#f1f5f9", color: "#475569" },
              ].map((m) => {
                const isSel = selectedMood === m.label;
                return (
                  <Pressable
                    key={m.label}
                    onPress={() => handleSelectMood(m.label, m.emoji)}
                    style={[
                      styles.moodBtn,
                      { backgroundColor: m.bg },
                      isSmallPhone && { paddingVertical: 7, borderRadius: 10 },
                      isTablet && { paddingVertical: 14, borderRadius: 16 },
                      isSel && styles.moodBtnActive,
                    ]}
                  >
                    <Text style={{ fontSize: isSmallPhone ? 20 : isTablet ? 30 : 26 }}>{m.emoji}</Text>
                    <Text
                      style={[
                        styles.moodBtnText,
                        { color: m.color, fontSize: isSmallPhone ? 9.5 : isTablet ? 12.5 : 11 },
                        isSel && { fontWeight: "900" },
                      ]}
                      numberOfLines={1}
                    >
                      {wordLabel(m.label, lang)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Urgent Needs Quick Express Communication Bar */}
          <View style={styles.urgentSection}>
            <Text style={styles.sectionHeadingSmall}>{t("quickExpressHeading", lang)}</Text>
            <View style={[styles.urgentGrid, isSmallPhone && { gap: 6 }, isTablet && { gap: 12 }]}>
              {[
                { label: "Help", phraseKey: "needHelpPhrase" as TKey, emoji: "🆘", color: "#fee2e2", textColor: "#b91c1c" },
                { label: "Water", phraseKey: "needWaterPhrase" as TKey, emoji: "💧", color: "#e0f2fe", textColor: "#0369a1" },
                { label: "Bathroom", phraseKey: "needBathroomPhrase" as TKey, emoji: "🚻", color: "#fef3c7", textColor: "#b45309" },
                { label: "Stop", phraseKey: "pleaseStopPhrase" as TKey, emoji: "🛑", color: "#ffedd5", textColor: "#c2410c" },
              ].map((u) => (
                <Pressable
                  key={u.label}
                  onPress={() => handleUrgentNeed(u.label, u.phraseKey)}
                  style={[
                    styles.urgentTile,
                    { backgroundColor: u.color },
                    isSmallPhone && { paddingVertical: 9, borderRadius: 10 },
                    isTablet && { paddingVertical: 16, borderRadius: 16 },
                  ]}
                >
                  <Text style={{ fontSize: isSmallPhone ? 19 : isTablet ? 26 : 22 }}>{u.emoji}</Text>
                  <Text style={[styles.urgentTileLabel, { color: u.textColor, fontSize: isSmallPhone ? 10.5 : isTablet ? 13 : 11.5 }]}>
                    {u.label === "Bathroom" ? t("bathroom", lang) : wordLabel(u.label, lang)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t("quickAccess", lang)}</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS.map((q) => (
              <Pressable
                key={q.labelKey}
                onPress={() => q.go(props)}
                style={[
                  styles.quickTile,
                  isTablet && styles.quickTileTablet,
                  { backgroundColor: q.bg },
                ]}
              >
                <View style={styles.quickIconBadge}>
                  <Ionicons name={q.icon} size={isTablet ? 26 : 22} color={q.iconColor} />
                </View>
                <Text style={[styles.quickLabel, isTablet && { fontSize: 15 }]}>{t(q.labelKey, lang)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("todaySchedule", lang)}</Text>
            <Pressable
              onPress={() => {
                tapFeedback();
                onTabChange("schedule");
              }}
              style={styles.seeAllBtn}
              hitSlop={8}
            >
              <Text style={styles.seeAllText}>{t("viewFullSchedule", lang)}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.forest} />
            </Pressable>
          </View>

          <View style={[styles.scheduleContainer, isTablet && styles.scheduleContainerTablet]}>
            {scheduleItems.map((item, i) => (
              <Pressable
                key={i}
                onPress={() => handleOpenScheduleItem(item)}
                style={({ pressed }) => [
                  styles.scheduleRow,
                  isTablet && styles.scheduleRowTablet,
                  item.state === "now"
                    ? styles.scheduleRowNow
                    : { backgroundColor: item.state === "done" ? colors.cardMuted : colors.card },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
                ]}
              >
                <View style={[styles.scheduleIcon, { backgroundColor: item.color }]}>
                  <Text style={{ fontSize: isTablet ? 22 : 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.scheduleLabel,
                      isTablet && { fontSize: 16 },
                      item.state === "done" && { textDecorationLine: "line-through", color: colors.textLight },
                    ]}
                  >
                    {t(item.labelKey, lang)}
                  </Text>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                </View>

                {/* Status indicator / interactive checkmark */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleScheduleItem(i);
                  }}
                  hitSlop={8}
                >
                  {item.state === "done" ? (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  ) : item.state === "now" ? (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowBadgeText}>{t("happeningNow", lang).toUpperCase()}</Text>
                    </View>
                  ) : (
                    <View style={styles.upcomingBadge}>
                      <Ionicons name="ellipse-outline" size={22} color={colors.textLight} />
                    </View>
                  )}
                </Pressable>
              </Pressable>
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
    width: "100%",
  },
  headerInner: {
    width: "100%",
  },
  headerInnerTablet: {
    maxWidth: 860,
    alignSelf: "center",
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
  bodyTablet: { maxWidth: 860, alignSelf: "center", width: "100%", paddingHorizontal: 28 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 4,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.forest,
  },
  upcomingBadge: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
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
  quickTileTablet: {
    width: "23.2%",
    paddingVertical: 20,
    paddingHorizontal: 14,
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
  scheduleContainer: { gap: 12 },
  scheduleContainerTablet: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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
  scheduleRowTablet: {
    width: "48.8%",
  },
  scheduleRowNow: { backgroundColor: colors.card, borderColor: colors.forest, borderWidth: 2 },
  scheduleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  scheduleLabel: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  scheduleTime: { fontSize: 12.5, color: colors.textLight, marginTop: 3 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.greenDeep, alignItems: "center", justifyContent: "center" },
  nowBadge: { backgroundColor: colors.forest, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  nowBadgeText: { color: "white", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  /* Doctor Therapy Target Card */
  therapyBanner: {
    backgroundColor: "white",
    borderRadius: radiusLg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  therapyBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  therapyBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  therapyBadgeText: { color: "white", fontSize: 9.5, fontWeight: "900", letterSpacing: 0.5 },
  therapyStarReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  therapyStarText: { color: "#b45309", fontSize: 11, fontWeight: "800" },
  therapyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  therapyTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  therapySub: { fontSize: 11.5, color: "#64748b", marginTop: 2 },
  therapyCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  therapyProgressTrack: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  therapyProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  therapyProgressTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  therapyProgressNum: { fontSize: 11.5, color: "#64748b", fontWeight: "600" },
  therapyActionHint: { fontSize: 11.5, fontWeight: "800", color: colors.forest },

  /* Header Star Badge */
  starBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starBadgeHeaderText: { color: "white", fontSize: 12, fontWeight: "800" },

  /* Emotional Mood Check-In */
  moodSection: {
    backgroundColor: "#ffffff",
    borderRadius: radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  sectionHeadingSmall: { fontSize: 11, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.5 },
  selectedMoodTag: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedMoodTagText: { fontSize: 11, fontWeight: "700", color: "#166534" },
  moodRow: { flexDirection: "row", justifyContent: "space-between", gap: 6, marginTop: 4 },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 4,
  },
  moodBtnActive: { borderColor: colors.forest, backgroundColor: "#ffffff" },
  moodBtnText: { fontSize: 11, fontWeight: "700" },

  /* Urgent Needs Express Bar */
  urgentSection: {
    backgroundColor: "#ffffff",
    borderRadius: radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  urgentGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  urgentTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
  },
  urgentTileLabel: { fontSize: 11.5, fontWeight: "800" },
});
