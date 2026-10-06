import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import { subjectById, chaptersFor, label, GRADES, type Grade, type SubjectId } from "../modules/curriculum";
import { getProgress, lessonsDone, type ProgressData } from "../modules/progress";
import TopBar from "../components/TopBar";
import { SUBJECT_LOOK } from "../components/subjectLook";
import { colors, type } from "../theme";
import { getActiveProfile } from "../modules/childProfiles";

interface Props {
  subjectId: SubjectId;
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
}

export default function SubjectScreen({ subjectId, onBack, onOpenChapter }: Props) {
  const { settings } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const subject = subjectById(subjectId);
  const look = SUBJECT_LOOK[subjectId];
  const activeChild = getActiveProfile();

  const [grade, setGrade] = useState<Grade>(activeChild?.prescription?.assignedGrade ?? 1);
  const [p, setP] = useState<ProgressData | null>(null);
  useEffect(() => {
    getProgress().then((d) => setP({ ...d }));
  }, []);

  const chapters = chaptersFor(subject, grade);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.pad}>
          <TopBar title={label(subject.title, lang)} onBack={onBack} />
        </View>

        <ScrollView contentContainerStyle={[styles.pad, styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Subject banner */}
          <View style={[styles.banner, { backgroundColor: look.bg }]}>
            <View style={styles.bannerIcon}>
              <Ionicons name={look.icon} size={30} color={look.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{label(subject.title, lang)}</Text>
              <Text style={styles.bannerSub}>{tt(look.blurb)}</Text>
            </View>
          </View>

          {/* Grade picker */}
          <Text style={[type.eyebrow, styles.label]}>{tt("sbChooseGrade")}</Text>
          <View style={styles.grades}>
            {GRADES.map((g) => {
              const on = g === grade;
              const has = chaptersFor(subject, g).length > 0;
              return (
                <Pressable key={g} onPress={() => setGrade(g)} style={[styles.gradeChip, on && { backgroundColor: colors.forest, borderColor: colors.forest }]}>
                  <Text style={[styles.gradeText, on && { color: "white" }, !has && !on && { color: colors.textLight }]}>
                    {tt("sbGrade").replace("{n}", String(g))}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Chapters */}
          <Text style={[type.eyebrow, styles.label]}>{tt("sbChapters")}</Text>
          {chapters.length ? (
            <View style={{ gap: 10 }}>
              {chapters.map((c, i) => {
                const done = p ? lessonsDone(p, c.id) : 0;
                const total = c.lessons.length;
                const isDrFocus = activeChild?.prescription?.focusChapterIds?.includes(c.id);
                return (
                  <Pressable key={c.id} onPress={() => onOpenChapter(c.id)} style={({ pressed }) => [styles.chapter, isDrFocus && styles.chapterDrFocus, pressed && { opacity: 0.9 }]}>
                    <View style={[styles.num, { backgroundColor: look.bg }]}>
                      <Text style={[styles.numText, { color: look.tint }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Text style={styles.chapterTitle}>{label(c.title, lang)}</Text>
                        {isDrFocus && (
                          <View style={styles.drBadge}>
                            <Ionicons name="medkit" size={12} color={colors.forest} />
                            <Text style={styles.drBadgeText}>Doctor Prescribed</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.chapterSub} numberOfLines={1}>
                        {label(c.summary, lang)}
                      </Text>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${(done / total) * 100}%`, backgroundColor: look.tint }]} />
                      </View>
                      <Text style={styles.count}>{tt("sbLessonsDone").replace("{n}", String(done)).replace("{m}", String(total))}</Text>
                    </View>
                    <Ionicons name={done >= total ? "checkmark-circle" : "chevron-forward"} size={22} color={done >= total ? colors.greenDeep : colors.textLight} />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="hourglass-outline" size={26} color={colors.textLight} />
              <Text style={styles.emptyText}>{tt("sbComingSoon").replace("{n}", String(grade))}</Text>
            </View>
          )}

          <View style={styles.source}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textLight} />
            <Text style={styles.sourceText}>{tt("sbSource")}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  body: { paddingBottom: 40 },
  bodyTablet: { maxWidth: 720, alignSelf: "center", width: "100%" },
  banner: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 24, padding: 18, marginTop: 6 },
  bannerIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: 22, fontWeight: "800", color: colors.textDark },
  bannerSub: { fontSize: 13.5, color: colors.textMid, marginTop: 3, lineHeight: 19 },
  label: { marginTop: 24, marginBottom: 10, marginHorizontal: 4 },
  grades: { flexDirection: "row", gap: 6 },
  gradeChip: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 9,
  },
  gradeText: { fontSize: 12.5, fontWeight: "700", color: colors.textDark },
  chapter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  num: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 17, fontWeight: "800" },
  chapterTitle: { fontSize: 16, fontWeight: "800", color: colors.textDark },
  chapterSub: { fontSize: 13, color: colors.textMid, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.cardMuted, marginTop: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  count: { fontSize: 11.5, color: colors.textLight, marginTop: 5, fontWeight: "600" },
  empty: {
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  source: { flexDirection: "row", gap: 8, marginTop: 20, marginHorizontal: 4 },
  sourceText: { flex: 1, fontSize: 12, color: colors.textLight, lineHeight: 17 },
  emptyText: { fontSize: 14, color: colors.textMid, textAlign: "center", lineHeight: 20 },
  chapterDrFocus: {
    borderColor: "#a7f3d0",
    backgroundColor: "#f0fdf4",
  },
  drBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  drBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.forest,
  },
});
