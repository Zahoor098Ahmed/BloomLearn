import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, isRTL } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import { isAiConfigured } from "../modules/aiImage";
import { getProgress, todayCount, streak, lastWeek, POSITIONS, LEARN_COLORS, type ProgressData } from "../modules/progress";
import Logo from "../components/Logo";
import IconSquare from "../components/IconSquare";
import SectionHeading from "../components/SectionHeading";
import { colors, radiusLg, type } from "../theme";

interface Props {
  onOpenTalk: (text?: string) => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onOpenHelp: () => void;
}

const EXAMPLE_KEYS: TKey[] = ["spExample1", "spExample2", "spExample3", "spExample4", "spExample5"];

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

export default function HomeScreen({ onOpenTalk, onOpenSettings, onOpenProgress, onOpenHelp }: Props) {
  const { settings } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const rtl = isRTL(lang);

  const [p, setP] = useState<ProgressData | null>(null);
  useEffect(() => {
    getProgress().then((d) => setP({ ...d }));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? tt("hmGoodMorning") : hour < 17 ? tt("hmGoodAfternoon") : tt("hmGoodEvening");
  const date = safeDate(lang);

  // Phones need an OpenAI key or the BloomLearn server for voice-to-text.
  const needsVoiceSetup = Platform.OS !== "web" && !isAiConfigured();

  const positionsDone = p ? POSITIONS.filter((x) => p.positions[x]).length : 0;
  const colorsDone = p ? LEARN_COLORS.filter((c) => p.colors[c]).length : 0;
  const weekTotal = p ? lastWeek(p).reduce((s, d) => s + d.count, 0) : 0;

  const ACTIVITIES: {
    icon: keyof typeof Ionicons.glyphMap;
    tint: string;
    play: string;
    title: TKey;
    sub: TKey;
    metric: TKey;
    value: string;
    go: () => void;
  }[] = [
    {
      icon: "navigate-outline",
      tint: colors.pink,
      play: colors.lime,
      title: "acPositions",
      sub: "acPositionsSub",
      metric: "prPositions",
      value: `${positionsDone} / ${POSITIONS.length}`,
      go: () => onOpenTalk(`The cat is ${pick(POSITIONS)} the box`),
    },
    {
      icon: "color-palette-outline",
      tint: colors.blue,
      play: colors.pink,
      title: "acColours",
      sub: "acColoursSub",
      metric: "prColours",
      value: `${colorsDone} / ${LEARN_COLORS.length}`,
      go: () => onOpenTalk(`A ${pick(LEARN_COLORS)} ball`),
    },
    {
      icon: "paw-outline",
      tint: colors.yellow,
      play: colors.lime,
      title: "acThings",
      sub: "acThingsSub",
      metric: "prWords",
      value: String(p ? Object.keys(p.words).length : 0),
      go: () => onOpenTalk(tt(pick(EXAMPLE_KEYS))),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Brand row */}
          <View style={styles.brandRow}>
            <Logo size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>BloomLearn</Text>
              <Text style={[type.eyebrow, { fontSize: 11 }]}>{tt("hmBrandSub")}</Text>
            </View>
            <Pressable onPress={onOpenSettings} style={styles.squareBtn} accessibilityLabel={tt("stTitle")}>
              <Ionicons name="options-outline" size={24} color={colors.forest} />
            </Pressable>
          </View>

          {/* Greeting */}
          <Text style={[type.eyebrow, { marginTop: 26 }]}>{date}</Text>
          <Text style={[type.display, { marginTop: 8 }]}>{greeting}.</Text>
          <Text style={[type.lead, { marginTop: 8 }]}>{tt("hmGreetingSub")}</Text>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.ringBig} />
            <View style={styles.ringSmall} />
            <View style={styles.heroTop}>
              <View style={styles.pill}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>{tt("hmHeroPill")}</Text>
              </View>
              <Ionicons name="flower-outline" size={32} color={colors.lime} />
            </View>
            <Text style={styles.heroTitle}>{tt("hmHeroTitle")}</Text>
            <Text style={styles.heroBody}>{tt("hmHeroBody")}</Text>
            <Pressable onPress={() => onOpenTalk()} style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.9 }]}>
              <Ionicons name={rtl ? "arrow-back" : "arrow-forward"} size={22} color={colors.forestDark} />
              <Text style={styles.heroBtnText}>{tt("hmHeroBtn")}</Text>
            </Pressable>
            <Text style={styles.heroFoot}>
              {tt("hmHeroFooter")
                .replace("{n}", String(p?.sentences ?? 0))
                .replace("{m}", String(p ? todayCount(p) : 0))}
            </Text>
          </View>

          {needsVoiceSetup && (
            <Pressable onPress={onOpenSettings} style={styles.notice}>
              <IconSquare icon="key-outline" bg={colors.yellow} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>{tt("hmSetupTitle")}</Text>
                <Text style={styles.noticeBody}>{tt("hmSetupBody")}</Text>
              </View>
            </Pressable>
          )}

          {/* Practice */}
          <SectionHeading title={tt("hmPractice")} subtitle={tt("hmPracticeSub")} action={tt("hmSeeProgress")} onAction={onOpenProgress} />
          <View style={{ gap: 14 }}>
            {ACTIVITIES.map((a) => (
              <Pressable key={a.title} onPress={a.go} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
                <View style={styles.cardTop}>
                  <IconSquare icon={a.icon} bg={a.tint} size={60} round />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{tt(a.title)}</Text>
                    <Text style={styles.cardSub}>{tt(a.sub)}</Text>
                  </View>
                  <View style={[styles.playBtn, { backgroundColor: a.play }]}>
                    <Ionicons name="play" size={22} color={colors.textDark} style={rtl ? { transform: [{ scaleX: -1 }] } : undefined} />
                  </View>
                </View>
                <View style={styles.cardFoot}>
                  <Text style={styles.cardMetric}>{tt(a.metric)}</Text>
                  <Text style={styles.cardValue}>{a.value}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Week */}
          <SectionHeading title={tt("hmWeek")} />
          <View style={styles.stats}>
            <Stat icon="chatbubble-outline" value={weekTotal} label={tt("prSentences")} bg={colors.green} />
            <Stat icon="flame-outline" value={p ? streak(p) : 0} label={tt("prStreakShort")} bg={colors.pink} />
            <Stat icon="image-outline" value={p?.aiPictures ?? 0} label={tt("prPicturesShort")} bg={colors.yellow} />
          </View>

          <Pressable onPress={onOpenHelp} style={styles.helpRow}>
            <IconSquare icon="book-outline" bg={colors.green} size={40} />
            <Text style={styles.helpText}>{tt("hmHowTo")}</Text>
            <Ionicons name={rtl ? "chevron-back" : "chevron-forward"} size={20} color={colors.textLight} />
          </Pressable>

          <View style={styles.localPill}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.forest} />
            <Text style={styles.localText}>{tt("hmLocal")}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ icon, value, label, bg }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string; bg: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={24} color={colors.textDark} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function safeDate(lang: string): string {
  try {
    return new Date().toLocaleDateString(lang, { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return new Date().toDateString();
  }
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 36, gap: 0 },
  bodyTablet: { maxWidth: 760, alignSelf: "center", width: "100%" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  brand: { fontSize: 22, fontWeight: "800", color: colors.textDark, letterSpacing: -0.4, marginBottom: 3 },
  squareBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { marginTop: 24, backgroundColor: colors.deep, borderRadius: 34, padding: 24, overflow: "hidden" },
  ringBig: {
    position: "absolute",
    right: -90,
    top: 60,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  ringSmall: {
    position: "absolute",
    right: -40,
    top: 110,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pill: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.lime, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  pillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.deep },
  pillText: { fontSize: 11.5, fontWeight: "800", letterSpacing: 1.5, color: colors.deep },
  heroTitle: { marginTop: 22, color: "white", fontSize: 34, fontWeight: "800", letterSpacing: -1, lineHeight: 40 },
  heroBody: { marginTop: 12, color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 23, maxWidth: 440 },
  heroBtn: {
    marginTop: 22,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6ece2",
    borderRadius: 26,
    paddingVertical: 18,
  },
  heroBtnText: { color: colors.forestDark, fontSize: 17, fontWeight: "700" },
  heroFoot: { marginTop: 18, color: "rgba(255,255,255,0.75)", fontSize: 13 },
  notice: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  noticeTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  noticeBody: { fontSize: 13, color: colors.textMid, marginTop: 3, lineHeight: 19 },
  card: { backgroundColor: colors.card, borderRadius: radiusLg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 22, paddingTop: 22 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 18 },
  cardTitle: { fontSize: 19, fontWeight: "700", color: colors.textDark },
  cardSub: { fontSize: 14.5, color: colors.textMid, marginTop: 4 },
  playBtn: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#efede5",
    marginTop: 20,
    paddingVertical: 16,
  },
  cardMetric: { fontSize: 14.5, color: colors.textMid },
  cardValue: { fontSize: 15, fontWeight: "700", color: colors.forest },
  stats: { flexDirection: "row", gap: 12, marginTop: 6 },
  stat: { flex: 1, borderRadius: 26, padding: 18, gap: 10, minHeight: 150, justifyContent: "space-between" },
  statValue: { fontSize: 30, fontWeight: "800", color: colors.textDark, letterSpacing: -0.5 },
  helpRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  helpText: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.textDark },
  localPill: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#e6ebe1",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  localText: { fontSize: 14, color: colors.forestDark, flex: 1 },
});
