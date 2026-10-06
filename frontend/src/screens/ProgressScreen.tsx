import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, isRTL } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import { SUBJECT_LIST, chapterById, label, type SubjectId } from "../modules/curriculum";
import {
  getProgress,
  streak,
  lastWeek,
  lessonsToday,
  badges,
  dayKey,
  overallReport,
  subjectReport,
  type ProgressData,
} from "../modules/progress";
import { SUBJECT_LOOK } from "../components/subjectLook";
import { colors, type } from "../theme";
import { getActiveProfile, subscribeActiveChild, type ChildProfile } from "../modules/childProfiles";

interface Props {
  onOpenSubject: (id: SubjectId) => void;
  onOpenChapter: (chapterId: string, index?: number) => void;
}

const BADGE: Record<string, { label: TKey; icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string }> = {
  firstLesson: { label: "bdFirstLesson", icon: "leaf-outline", tint: colors.greenDeep, bg: colors.green },
  firstChapter: { label: "bdFirstChapter", icon: "bookmark-outline", tint: colors.blueDeep, bg: colors.blue },
  tenLessons: { label: "bdTenLessons", icon: "ribbon-outline", tint: colors.yellowDeep, bg: colors.yellow },
  fiftyLessons: { label: "bdFiftyLessons", icon: "trophy-outline", tint: colors.orangeDeep, bg: colors.orange },
  allSubjects: { label: "bdAllSubjects", icon: "apps-outline", tint: colors.purpleDeep, bg: colors.purple },
  gradeOne: { label: "bdGradeOne", icon: "school-outline", tint: colors.forest, bg: colors.forestLight },
  streak3: { label: "bdStreak3", icon: "flame-outline", tint: colors.pinkDeep, bg: colors.pink },
  streak7: { label: "bdStreak7", icon: "calendar-outline", tint: colors.blueDeep, bg: colors.blue },
};

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default function ProgressScreen({ onOpenSubject, onOpenChapter }: Props) {
  const { settings } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const chevron = isRTL(lang) ? "chevron-back" : "chevron-forward";

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

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const all = overallReport(p);
  const assigned = child?.prescription.assignedSubjects || ["english", "math", "science"];
  const reports = SUBJECT_LIST.filter((s) => assigned.includes(s.id)).map((s) => subjectReport(p, s));
  const days = lastWeek(p);
  const weekTotal = days.reduce((s, d) => s + d.count, 0);
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const today = dayKey();
  const earned = badges(p);
  const last = p.lastLesson ? chapterById(p.lastLesson.chapterId) : null;

  async function share() {
    const lines = [
      `BloomLearn — ${tt("prReportTitle")}`,
      `${tt("prLessonsDone")}: ${all.done} / ${all.total} (${pct(all.done, all.total)}%)`,
      `${tt("prChaptersDone")}: ${all.chaptersDone} / ${all.chaptersTotal}`,
      `${tt("prStreakShort")}: ${streak(p!)}`,
      "",
      ...reports.map((r) => `${label(r.subject.title, lang)}: ${r.done} / ${r.total} (${pct(r.done, r.total)}%)`),
    ];
    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      /* dismissed */
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          <Text style={[type.display, { marginTop: 10 }]}>{tt("prReportTitle")}</Text>
          <Text style={[type.lead, { marginTop: 4 }]}>{tt("prReportSub")}</Text>

          {/* Child & Doctor Plan Header */}
          {child && (
            <View style={styles.childHeader}>
              <View style={styles.childHeaderLeft}>
                <View style={styles.childAvatarBadge}>
                  <Text style={{ fontSize: 24 }}>{child.avatarIcon}</Text>
                </View>
                <View>
                  <Text style={styles.childHeaderName}>{child.name}'s Learning Report</Text>
                  <Text style={styles.childHeaderMeta}>
                    Grade {child.prescription.assignedGrade} • Daily Goal: {child.prescription.dailySentenceGoal} Sentences
                  </Text>
                </View>
              </View>
              <View style={styles.drBadge}>
                <Ionicons name="medkit" size={13} color={colors.forest} />
                <Text style={styles.drBadgeText}>Doctor Plan</Text>
              </View>
            </View>
          )}

          {/* Overall */}
          <View style={[styles.card, styles.overall]}>
            <Ring value={all.total ? all.done / all.total : 0} size={112}>
              <Text style={styles.ringNum}>{pct(all.done, all.total)}%</Text>
              <Text style={styles.ringLabel}>{tt("prComplete")}</Text>
            </Ring>
            <View style={{ flex: 1, gap: 10 }}>
              <OverallLine value={`${all.done} / ${all.total}`} label={tt("prLessonsDone")} />
              <OverallLine value={`${all.chaptersDone} / ${all.chaptersTotal}`} label={tt("prChaptersDone")} />
            </View>
          </View>

          <View style={styles.statRow}>
            <MiniStat icon="flame-outline" tint={colors.pinkDeep} bg={colors.pink} value={streak(p)} label={tt("prStreakShort")} />
            <MiniStat icon="today-outline" tint={colors.greenDeep} bg={colors.green} value={lessonsToday(p)} label={tt("prToday")} />
            <MiniStat icon="calendar-outline" tint={colors.blueDeep} bg={colors.blue} value={weekTotal} label={tt("prThisWeekShort")} />
          </View>

          {/* Continue */}
          {last && p.lastLesson && (
            <Pressable onPress={() => onOpenChapter(last.chapter.id, p.lastLesson!.index)} style={({ pressed }) => [styles.card, styles.continue, pressed && { opacity: 0.9 }]}>
              <View style={[styles.continueIcon, { backgroundColor: SUBJECT_LOOK[last.subject.id].bg }]}>
                <Ionicons name={SUBJECT_LOOK[last.subject.id].icon} size={22} color={SUBJECT_LOOK[last.subject.id].tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.eyebrow}>{tt("prContinue")}</Text>
                <Text style={styles.continueTitle}>{label(last.chapter.title, lang)}</Text>
                <Text style={styles.continueSub}>
                  {label(last.subject.title, lang)} · {tt("sbGrade").replace("{n}", String(last.grade))} ·{" "}
                  {tt("lsLessonOf")
                    .replace("{i}", String(p.lastLesson.index + 1))
                    .replace("{n}", String(last.chapter.lessons.length))}
                </Text>
              </View>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={18} color="white" />
              </View>
            </Pressable>
          )}

          {/* Subjects */}
          <SectionTitle title={tt("prBySubject")} />
          <View style={{ gap: 12 }}>
            {reports.map((r) => {
              const look = SUBJECT_LOOK[r.subject.id];
              return (
                <Pressable key={r.subject.id} onPress={() => onOpenSubject(r.subject.id)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
                  <View style={styles.subjectHead}>
                    <View style={[styles.subjectIcon, { backgroundColor: look.bg }]}>
                      <Ionicons name={look.icon} size={22} color={look.tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectTitle}>{label(r.subject.title, lang)}</Text>
                      <Text style={styles.subjectSub}>
                        {tt("prSubjectLine")
                          .replace("{n}", String(r.done))
                          .replace("{m}", String(r.total))
                          .replace("{c}", String(r.chaptersDone))
                          .replace("{ct}", String(r.chaptersTotal))}
                      </Text>
                    </View>
                    <Text style={[styles.subjectPct, { color: look.tint }]}>{pct(r.done, r.total)}%</Text>
                    <Ionicons name={chevron} size={18} color={colors.textLight} />
                  </View>
                  <View style={styles.gradeRows}>
                    {r.grades.map((g) => (
                      <View key={g.grade} style={styles.gradeRow}>
                        <Text style={styles.gradeLabel}>{tt("sbGrade").replace("{n}", String(g.grade))}</Text>
                        <View style={styles.gradeTrack}>
                          <View style={[styles.gradeFill, { width: `${pct(g.done, g.total)}%`, backgroundColor: look.tint }]} />
                        </View>
                        <Text style={styles.gradeCount}>
                          {g.done}/{g.total}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Week */}
          <SectionTitle title={tt("prLessonsWeek")} right={`${weekTotal}`} />
          <View style={styles.card}>
            <View style={styles.chart}>
              {days.map((d) => {
                const isToday = d.key === today;
                return (
                  <View key={d.key} style={styles.barCol}>
                    <Text style={styles.barNum}>{d.count || ""}</Text>
                    <View style={styles.barArea}>
                      {d.count ? (
                        <View style={[styles.bar, { height: `${Math.max(12, (d.count / maxDay) * 100)}%`, backgroundColor: isToday ? colors.forest : colors.leaf }]} />
                      ) : (
                        <View style={styles.barDot} />
                      )}
                    </View>
                    <Text style={[styles.barDay, isToday && styles.barDayToday]}>{weekday(d.date, lang)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Badges */}
          <SectionTitle title={tt("prBadges")} right={`${earned.filter((b) => b.earned).length}/${earned.length}`} />
          <View style={styles.badgeGrid}>
            {earned.map((b) => {
              const def = BADGE[b.id];
              return (
                <View key={b.id} style={styles.badge}>
                  <View style={[styles.badgeIcon, { backgroundColor: b.earned ? def.bg : colors.cardMuted }]}>
                    <Ionicons name={b.earned ? def.icon : "lock-closed-outline"} size={22} color={b.earned ? def.tint : colors.textLight} />
                  </View>
                  <Text style={[styles.badgeLabel, !b.earned && { color: colors.textLight }]} numberOfLines={2}>
                    {tt(def.label)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textLight} />
            <Text style={styles.noteText}>{tt("prReportNote")}</Text>
          </View>

          <Pressable onPress={share} style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="share-outline" size={20} color={colors.forest} />
            <Text style={styles.shareText}>{tt("prShareReport")}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Ring({ value, size, children }: { value: number; size: number; children: ReactNode }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.forestLight} strokeWidth={stroke} fill="none" />
        {value > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.forest}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - Math.min(1, Math.max(0.02, value)))}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

function OverallLine({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Text style={styles.overallValue}>{value}</Text>
      <Text style={styles.overallLabel}>{label}</Text>
    </View>
  );
}

function MiniStat({ icon, tint, bg, value, label }: { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; value: number; label: string }) {
  return (
    <View style={styles.mini}>
      <View style={[styles.miniIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={type.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ title, right }: { title: string; right?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[type.eyebrow, { flex: 1 }]}>{title}</Text>
      {!!right && <Text style={styles.sectionRight}>{right}</Text>}
    </View>
  );
}

function weekday(d: Date, lang: string): string {
  try {
    return d.toLocaleDateString(lang, { weekday: "narrow" });
  } catch {
    return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
  }
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 },
  bodyTablet: { maxWidth: 720, alignSelf: "center", width: "100%" },
  card: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18 },
  overall: { marginTop: 18, flexDirection: "row", alignItems: "center", gap: 20 },
  ringNum: { fontSize: 26, fontWeight: "800", color: colors.textDark },
  ringLabel: { fontSize: 11, fontWeight: "700", color: colors.textMid, textTransform: "uppercase", letterSpacing: 1 },
  overallValue: { fontSize: 24, fontWeight: "800", color: colors.forest },
  overallLabel: { fontSize: 13, color: colors.textMid },
  statRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  mini: { flex: 1, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 },
  miniIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  miniValue: { fontSize: 22, fontWeight: "800", color: colors.textDark },
  continue: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  continueIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  continueTitle: { fontSize: 16.5, fontWeight: "800", color: colors.textDark, marginTop: 2 },
  continueSub: { fontSize: 12.5, color: colors.textMid, marginTop: 2 },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", alignItems: "center", marginTop: 26, marginBottom: 10, marginHorizontal: 4 },
  sectionRight: { fontSize: 13, fontWeight: "800", color: colors.forest },
  subjectHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  subjectIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  subjectTitle: { fontSize: 16.5, fontWeight: "800", color: colors.textDark },
  subjectSub: { fontSize: 12.5, color: colors.textMid, marginTop: 2 },
  subjectPct: { fontSize: 18, fontWeight: "800" },
  gradeRows: { marginTop: 14, gap: 8 },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  gradeLabel: { width: 62, fontSize: 12.5, fontWeight: "600", color: colors.textMid },
  gradeTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.cardMuted, overflow: "hidden" },
  gradeFill: { height: "100%", borderRadius: 4 },
  gradeCount: { width: 42, textAlign: "right", fontSize: 12, fontWeight: "700", color: colors.textMid },
  chart: { flexDirection: "row", height: 150 },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barNum: { fontSize: 12, fontWeight: "700", color: colors.textMid, height: 15 },
  barArea: { flex: 1, width: 22, justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "100%", borderRadius: 8 },
  barDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  barDay: { fontSize: 12, color: colors.textLight, fontWeight: "600" },
  barDayToday: { color: colors.forest, fontWeight: "800" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "22.5%",
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  badgeIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  badgeLabel: { fontSize: 11.5, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  noteRow: { flexDirection: "row", gap: 8, marginTop: 22, marginHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12.5, color: colors.textMid, lineHeight: 18 },
  shareBtn: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.forest,
    paddingVertical: 15,
  },
  shareText: { fontSize: 15.5, fontWeight: "700", color: colors.forest },
  childHeader: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childHeaderLeft: {
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
  childHeaderName: {
    fontSize: 15.5,
    fontWeight: "800",
    color: colors.textDark,
  },
  childHeaderMeta: {
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  drBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  drBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.forest,
  },
});
