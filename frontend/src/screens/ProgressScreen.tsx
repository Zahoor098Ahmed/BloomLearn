import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import { colorHex } from "../modules/sentenceScene";
import { getProgress, streak, lastWeek, level, badges, dayKey, POSITIONS, LEARN_COLORS, type ProgressData } from "../modules/progress";
import IconSquare from "../components/IconSquare";
import SectionHeading from "../components/SectionHeading";
import { colors, radiusLg, type } from "../theme";

interface Props {
  onOpenTalk: (text?: string) => void;
}

const BADGE: Record<string, { label: TKey; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  first: { label: "bdFirst", icon: "leaf-outline", bg: colors.green },
  ten: { label: "bdTen", icon: "chatbubbles-outline", bg: colors.blue },
  fifty: { label: "bdFifty", icon: "library-outline", bg: colors.yellow },
  voice: { label: "bdVoice", icon: "mic-outline", bg: colors.pink },
  artist: { label: "bdArtist", icon: "image-outline", bg: colors.purple },
  streak3: { label: "bdStreak3", icon: "flame-outline", bg: colors.orange },
  positions: { label: "bdPositions", icon: "navigate-outline", bg: colors.blue },
  colors: { label: "bdColors", icon: "color-palette-outline", bg: colors.green },
};

export default function ProgressScreen({ onOpenTalk }: Props) {
  const { settings } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  const [p, setP] = useState<ProgressData | null>(null);
  useEffect(() => {
    getProgress().then((d) => setP({ ...d }));
  }, []);

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const lv = level(p);
  const days = lastWeek(p);
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const today = dayKey();
  const positionsDone = POSITIONS.filter((x) => p.positions[x]).length;
  const colorsDone = LEARN_COLORS.filter((c) => p.colors[c]).length;
  const words = Object.entries(p.words).sort((a, b) => b[1] - a[1]);
  const voicePct = p.sentences ? Math.round((p.voiceSentences / p.sentences) * 100) : 0;
  const pct = (a: number, b: number) => Math.round((a / b) * 100);

  async function share() {
    const text = [
      `BloomLearn — ${tt("prTitle")}`,
      `${tt("prLevel").replace("{n}", String(lv.level))}`,
      `${tt("prSentences")}: ${p!.sentences}`,
      `${tt("prStreak")}: ${streak(p!)}`,
      `${tt("prPositions")}: ${positionsDone} / ${POSITIONS.length}`,
      `${tt("prColours")}: ${colorsDone} / ${LEARN_COLORS.length}`,
      `${tt("prWords")}: ${words.length}`,
    ].join("\n");
    try {
      await Share.share({ message: text });
    } catch {
      /* dismissed */
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          <Text style={[type.eyebrow, { marginTop: 12 }]}>{tt("prEyebrow")}</Text>
          <Text style={[type.display, { fontSize: 42, lineHeight: 48, marginTop: 10 }]}>{tt("prTitle")}</Text>
          <Text style={[type.lead, { marginTop: 8 }]}>{tt("prSub")}</Text>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryTop}>
              <IconSquare icon="ribbon-outline" bg={colors.lime} color={colors.deep} size={60} />
              <Text style={styles.summaryEyebrow}>{tt("prLevel").replace("{n}", String(lv.level))}</Text>
            </View>
            <Text style={styles.summaryNum}>{p.sentences}</Text>
            <Text style={styles.summaryLabel}>{tt("prSentencesSpoken")}</Text>
            <View style={styles.summaryDivider} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryStat, { color: colors.lime }]}>{streak(p)}</Text>
                <Text style={styles.summaryStatLabel}>{tt("prStreakShort")}</Text>
              </View>
              <View style={styles.summaryVDivider} />
              <View style={{ flex: 1, paddingStart: 30 }}>
                <Text style={[styles.summaryStat, { color: colors.pink }]}>{p.aiPictures}</Text>
                <Text style={styles.summaryStatLabel}>{tt("prPicturesShort")}</Text>
              </View>
            </View>
          </View>

          {/* Week */}
          <SectionHeading title={tt("prThisWeek")} />
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{tt("prRhythm")}</Text>
                <Text style={styles.cardSub}>{tt("prRhythmSub")}</Text>
              </View>
              <IconSquare icon="leaf-outline" bg={colors.green} color={colors.forest} size={56} />
            </View>
            <View style={styles.chart}>
              {days.map((d) => {
                const isToday = d.key === today;
                return (
                  <View key={d.key} style={styles.barCol}>
                    <Text style={styles.barNum}>{d.count || ""}</Text>
                    <View style={styles.barArea}>
                      <View
                        style={[
                          styles.bar,
                          d.count
                            ? { height: `${Math.max(18, (d.count / maxDay) * 100)}%`, backgroundColor: isToday ? colors.forest : colors.leaf }
                            : styles.barEmpty,
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDay, isToday && { color: colors.textDark, fontWeight: "800" }]}>{weekday(d.date, lang)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Closer look */}
          <SectionHeading title={tt("prCloser")} />
          <View style={{ gap: 14 }}>
            <MeterCard
              tint={colors.pink}
              title={tt("prLevel").replace("{n}", String(lv.level))}
              sub={tt("prToNext")
                .replace("{n}", String(lv.need - lv.into))
                .replace("{m}", String(lv.level + 1))}
              value={pct(lv.into, lv.need)}
            />
            <MeterCard tint={colors.blue} title={tt("prPositions")} sub={`${positionsDone} / ${POSITIONS.length}`} value={pct(positionsDone, POSITIONS.length)}>
              <View style={styles.chips}>
                {POSITIONS.map((pos) => {
                  const done = !!p.positions[pos];
                  return (
                    <Pressable key={pos} onPress={() => onOpenTalk(`The cat is ${pos} the box`)} style={[styles.chip, done && styles.chipOn]}>
                      {done && <Ionicons name="checkmark" size={14} color={colors.forestDark} />}
                      <Text style={[styles.chipText, done && { color: colors.forestDark }]}>{pos}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </MeterCard>
            <MeterCard tint={colors.yellow} title={tt("prColours")} sub={`${colorsDone} / ${LEARN_COLORS.length}`} value={pct(colorsDone, LEARN_COLORS.length)}>
              <View style={styles.dots}>
                {LEARN_COLORS.map((c) => {
                  const done = !!p.colors[c];
                  const hex = colorHex(c) ?? "#ccc";
                  return (
                    <Pressable key={c} onPress={() => onOpenTalk(`A ${c} ball`)} hitSlop={4}>
                      <View style={[styles.dot, { borderColor: hex }, done && { backgroundColor: hex }, c === "white" && { borderColor: colors.border }]} />
                    </Pressable>
                  );
                })}
              </View>
            </MeterCard>
            <MeterCard
              tint={colors.green}
              title={tt("prSpoken")}
              sub={tt("prVoiceSub").replace("{v}", String(p.voiceSentences)).replace("{n}", String(p.sentences))}
              value={voicePct}
            />
            <View style={styles.card}>
              <View style={styles.meterHead}>
                <View style={[styles.meterSwatch, { backgroundColor: colors.purple }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.meterTitle}>{tt("prWords")}</Text>
                  <Text style={styles.cardSub}>{words.length ? String(words.length) : tt("prNoWords")}</Text>
                </View>
              </View>
              {words.length > 0 && (
                <View style={[styles.chips, { marginTop: 14 }]}>
                  {words.slice(0, 20).map(([w, n]) => (
                    <View key={w} style={styles.chip}>
                      <Text style={styles.chipText}>{w}</Text>
                      <Text style={styles.chipCount}>{n}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Badges */}
          <SectionHeading title={tt("prBadges")} />
          <View style={styles.badgeGrid}>
            {badges(p).map((b) => {
              const def = BADGE[b.id];
              return (
                <View key={b.id} style={styles.badge}>
                  <IconSquare icon={b.earned ? def.icon : "lock-closed-outline"} bg={b.earned ? def.bg : colors.cardMuted} color={b.earned ? colors.textDark : colors.textLight} size={52} round />
                  <Text style={[styles.badgeLabel, !b.earned && { color: colors.textLight }]} numberOfLines={2}>
                    {tt(def.label)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Care note */}
          <View style={[styles.card, styles.careCard]}>
            <IconSquare icon="information-outline" bg={colors.yellow} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{tt("prCareTitle")}</Text>
              <Text style={[styles.cardSub, { lineHeight: 21 }]}>{tt("prCareBody")}</Text>
            </View>
          </View>

          <Pressable onPress={share} style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="share-outline" size={22} color={colors.forestDark} />
            <Text style={styles.shareText}>{tt("prShare")}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MeterCard({ tint, title, sub, value, children }: { tint: string; title: string; sub: string; value: number; children?: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.meterHead}>
        <View style={[styles.meterSwatch, { backgroundColor: tint }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.meterTitle}>{title}</Text>
          <Text style={styles.cardSub}>{sub}</Text>
        </View>
        <Text style={styles.meterPct}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, value)}%` }]} />
      </View>
      {children}
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
  body: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 36 },
  bodyTablet: { maxWidth: 760, alignSelf: "center", width: "100%" },
  summary: { marginTop: 24, backgroundColor: colors.deep, borderRadius: 34, padding: 24 },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 18 },
  summaryEyebrow: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  summaryNum: { color: "white", fontSize: 64, fontWeight: "800", marginTop: 16, letterSpacing: -1 },
  summaryLabel: { color: "rgba(255,255,255,0.85)", fontSize: 16, marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 22 },
  summaryVDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  summaryStat: { fontSize: 30, fontWeight: "800" },
  summaryStatLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: "700", letterSpacing: 1.5, marginTop: 8, textTransform: "uppercase" },
  card: { backgroundColor: colors.card, borderRadius: radiusLg, borderWidth: 1, borderColor: colors.border, padding: 22 },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardTitle: { fontSize: 19, fontWeight: "700", color: colors.textDark },
  cardSub: { fontSize: 14.5, color: colors.textMid, marginTop: 4 },
  chart: { flexDirection: "row", height: 190, marginTop: 20 },
  barCol: { flex: 1, alignItems: "center", gap: 8 },
  barNum: { fontSize: 13, color: colors.textMid, height: 16 },
  barArea: { flex: 1, width: 34, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 17 },
  barEmpty: { height: 10, backgroundColor: "#dfe8d6" },
  barDay: { fontSize: 13, color: colors.textMid },
  meterHead: { flexDirection: "row", alignItems: "center", gap: 16 },
  meterSwatch: { width: 56, height: 56, borderRadius: 18 },
  meterTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  meterPct: { fontSize: 22, fontWeight: "800", color: colors.forest },
  track: { height: 8, borderRadius: 4, backgroundColor: "#eceee6", marginTop: 20, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.leaf },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.cardMuted },
  chipOn: { backgroundColor: colors.lime },
  chipText: { fontSize: 13.5, fontWeight: "600", color: colors.textMid },
  chipCount: { fontSize: 12, fontWeight: "700", color: colors.textLight },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, backgroundColor: "white" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 },
  badge: {
    width: "22.5%",
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  badgeLabel: { fontSize: 12, fontWeight: "600", color: colors.textDark, textAlign: "center" },
  careCard: { flexDirection: "row", gap: 18, marginTop: 24 },
  shareBtn: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6ebe1",
    borderRadius: 26,
    paddingVertical: 20,
  },
  shareText: { fontSize: 17, fontWeight: "700", color: colors.forestDark },
});
