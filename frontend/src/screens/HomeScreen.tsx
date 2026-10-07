import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, isRTL } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import { isAiConfigured } from "../modules/aiImage";
import { nativeSpeechAvailable } from "../modules/voice";
import { getProgress, lessonsDone, type ProgressData } from "../modules/progress";
import { SUBJECT_LIST, GRADES, chaptersFor, chapterCount, lessonCount, label, type SubjectId } from "../modules/curriculum";
import Logo from "../components/Logo";
import { SUBJECT_LOOK } from "../components/subjectLook";
import { colors, type } from "../theme";
import { getActiveProfile, subscribeActiveChild, type ChildProfile } from "../modules/childProfiles";

interface Props {
  onOpenTalk: (text?: string) => void;
  onOpenSubject: (id: SubjectId) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSwitchChild?: () => void;
}

export default function HomeScreen({ onOpenTalk, onOpenSubject, onOpenSettings, onOpenHelp, onSwitchChild }: Props) {
  const { settings } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  const [child, setChild] = useState<ChildProfile | null>(getActiveProfile);
  const [p, setP] = useState<ProgressData | null>(null);

  useEffect(() => {
    const unsub = subscribeActiveChild((active) => {
      setChild(active);
      getProgress().then((d) => setP({ ...d }));
    });
    getProgress().then((d) => setP({ ...d }));
    return unsub;
  }, []);

  const hour = new Date().getHours();
  const baseGreeting = hour < 12 ? tt("hmGoodMorning") : hour < 17 ? tt("hmGoodAfternoon") : tt("hmGoodEvening");
  const greeting = child ? `${baseGreeting}, ${child.name.split(" ")[0]}!` : baseGreeting;

  // Phones need an OpenAI key or the BloomLearn server for voice-to-text.
  const needsVoiceSetup = Platform.OS !== "web" && !isAiConfigured() && !nativeSpeechAvailable();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Top row */}
          <View style={styles.top}>
            <Logo size={46} />
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.brand}>BloomLearn</Text>
            </View>
            <Pressable onPress={onOpenSettings} style={styles.roundBtn} accessibilityLabel={tt("stTitle")}>
              <Ionicons name="settings-outline" size={21} color={colors.textDark} />
            </Pressable>
          </View>

          {/* Active Child & Switcher Bar */}
          {child && (
            <View style={styles.childBar}>
              <View style={styles.childBarLeft}>
                <View style={styles.childAvatarBadge}>
                  <Text style={{ fontSize: 24 }}>{child.avatarIcon}</Text>
                </View>
                <View>
                  <Text style={styles.childBarName}>{child.name}</Text>
                  <Text style={styles.childBarGrade}>
                    Grade {child.prescription.assignedGrade} • Doctor Prescription Active
                  </Text>
                </View>
              </View>
              {onSwitchChild && (
                <Pressable
                  onPress={onSwitchChild}
                  style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.85 }]}
                  accessibilityLabel="Switch Child / Face Scan"
                >
                  <Ionicons name="scan-outline" size={17} color={colors.forest} />
                  <Text style={styles.switchBtnText}>Switch</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Doctor Prescription Plan Card */}
          {child?.prescription && (
            <View style={styles.rxCard}>
              <View style={styles.rxHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <Ionicons name="medkit" size={18} color={colors.forest} />
                  <Text style={styles.rxTitle}>
                    {child.prescription.prescribedBy || "Doctor's Prescribed Plan"}
                  </Text>
                </View>
                <View style={styles.rxGoalBadge}>
                  <Text style={styles.rxGoalBadgeText}>Target: {child.prescription.dailySentenceGoal}/day</Text>
                </View>
              </View>
              <Text style={styles.rxNotes}>{child.prescription.notes}</Text>
            </View>
          )}

          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.blob, { backgroundColor: colors.yellow, width: 110, height: 110, top: -42, right: -32 }]} />
            <View style={[styles.blob, { backgroundColor: colors.pink, width: 46, height: 46, top: 56, right: 22 }]} />
            <View style={[styles.blob, { backgroundColor: colors.blue, width: 26, height: 26, top: 22, right: 92 }]} />

            <Text style={styles.heroKicker}>{tt("hrKicker")}</Text>
            <Text style={styles.heroTitle}>{tt("hrTitle")}</Text>
            <Text style={styles.heroBody}>{tt("hrBody")}</Text>

            <View style={styles.heroActions}>
              <Pressable onPress={() => onOpenTalk()} style={({ pressed }) => [styles.heroMain, pressed && { opacity: 0.9 }]}>
                <Ionicons name="mic" size={20} color={colors.forest} />
                <Text style={styles.heroMainText}>{tt("hmHeroBtn")}</Text>
              </Pressable>
              <Pressable onPress={onOpenHelp} style={({ pressed }) => [styles.heroGhost, pressed && { opacity: 0.8 }]}>
                <Text style={styles.heroGhostText}>{tt("hrHow")}</Text>
              </Pressable>
            </View>
          </View>

          {needsVoiceSetup && (
            <Pressable onPress={onOpenSettings} style={styles.notice}>
              <View style={[styles.noticeIcon, { backgroundColor: colors.yellow }]}>
                <Ionicons name="key-outline" size={20} color={colors.yellowDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>{tt("hmSetupTitle")}</Text>
                <Text style={styles.noticeBody}>{tt("hmSetupBody")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </Pressable>
          )}

          {/* Subjects: Filtered only to subjects prescribed by doctor for this child */}
          <Text style={[type.eyebrow, styles.label]}>
            {tt("hmSubjects")} (Assigned: {child?.prescription.assignedSubjects.join(", ").toUpperCase()})
          </Text>
          <View style={{ gap: 12 }}>
            {SUBJECT_LIST.filter((s) => !child?.prescription?.assignedSubjects || child.prescription.assignedSubjects.includes(s.id)).map((s) => {
              const look = SUBJECT_LOOK[s.id];
              const total = lessonCount(s);
              const done = p ? GRADES.reduce((n, g) => n + chaptersFor(s, g).reduce((m, c) => m + lessonsDone(p, c.id), 0), 0) : 0;
              const chapters = chapterCount(s);
              return (
                <Pressable key={s.id} onPress={() => onOpenSubject(s.id)} style={({ pressed }) => [styles.subject, { backgroundColor: look.bg }, pressed && { opacity: 0.9 }]}>
                  <View style={styles.subjectIcon}>
                    <Ionicons name={look.icon} size={28} color={look.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectTitle}>{label(s.title, lang)}</Text>
                    <Text style={styles.subjectSub}>{tt("hmSubjectMeta").replace("{n}", String(chapters))}</Text>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: look.tint }]} />
                    </View>
                    <Text style={styles.subjectCount}>{tt("sbLessonsDone").replace("{n}", String(done)).replace("{m}", String(total))}</Text>
                  </View>
                  <Ionicons name={isRTL(lang) ? "chevron-back" : "chevron-forward"} size={22} color={look.tint} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.localRow}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.textLight} />
            <Text style={styles.localText}>{tt("hmLocal")}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 },
  bodyTablet: { maxWidth: 720, alignSelf: "center", width: "100%" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: { fontSize: 13.5, color: colors.textMid },
  brand: { fontSize: 21, fontWeight: "800", color: colors.textDark, letterSpacing: -0.3 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { marginTop: 20, backgroundColor: colors.forest, borderRadius: 28, padding: 22, overflow: "hidden" },
  blob: { position: "absolute", borderRadius: 999, opacity: 0.85 },
  heroKicker: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { marginTop: 10, color: "white", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36, maxWidth: 210 },
  heroBody: { marginTop: 12, color: "rgba(255,255,255,0.85)", fontSize: 14.5, lineHeight: 21, maxWidth: 420 },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  heroMainText: { color: colors.forest, fontSize: 15, fontWeight: "800" },
  heroGhost: { borderRadius: 999, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)", paddingVertical: 12, paddingHorizontal: 18, justifyContent: "center" },
  heroGhostText: { color: "white", fontSize: 14.5, fontWeight: "700" },
  notice: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  noticeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  noticeTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  noticeBody: { fontSize: 13, color: colors.textMid, marginTop: 2, lineHeight: 18 },
  label: { marginTop: 26, marginBottom: 10, marginHorizontal: 4 },
  subject: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 24, padding: 18 },
  subjectIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center" },
  subjectTitle: { fontSize: 19, fontWeight: "800", color: colors.textDark },
  subjectSub: { fontSize: 13, color: colors.textMid, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.7)", marginTop: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  subjectCount: { fontSize: 11.5, color: colors.textMid, marginTop: 5, fontWeight: "600" },
  localRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 22 },
  localText: { fontSize: 12.5, color: colors.textLight },
  childBar: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  childAvatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  childBarName: {
    fontSize: 15.5,
    fontWeight: "800",
    color: colors.textDark,
  },
  childBarGrade: {
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.forest,
  },
  rxCard: {
    marginTop: 10,
    backgroundColor: "#fbfefc",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#c3e6cb",
    gap: 6,
  },
  rxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rxTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: colors.forest,
  },
  rxGoalBadge: {
    backgroundColor: colors.forest,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rxGoalBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "white",
  },
  rxNotes: {
    fontSize: 12.5,
    color: colors.textDark,
    lineHeight: 17,
  },
});
