import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen } from "../types";
import { DIAGNOSIS_LABELS } from "../types";
import { getUsage, updateChild } from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { t, diagnosisLabel, type TKey } from "../modules/i18n";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  onUpdateChild: (child: ChildProfile) => void;
  labels: Record<TabScreen, string>;
}

type SubTab = "overview" | "vocabulary" | "schedule" | "privacy";

const SUB_TABS: { key: SubTab; labelKey: TKey }[] = [
  { key: "overview", labelKey: "pOverview" },
  { key: "vocabulary", labelKey: "pVocabulary" },
  { key: "schedule", labelKey: "pSchedule" },
  { key: "privacy", labelKey: "pPrivacy" },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun, matching getDay() where Sun=0

function adherenceColor(percent: number): string {
  if (percent >= 80) return colors.greenDeep;
  if (percent >= 60) return colors.yellowDeep;
  return colors.orangeDeep;
}

export default function ParentDashboardScreen({ child, tab, onTabChange, onUpdateChild, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const usage = useMemo(() => getUsage(child.id), [child.id]);

  const wordsThisWeek = usage.wordsByDay.reduce((s, v) => s + v, 0);
  const scheduleDays = DAY_ORDER.map((d) => usage.scheduleByDay[d]);
  const recordedDays = scheduleDays.filter((v) => v > 0);
  const avgAdherence = recordedDays.length ? Math.round(recordedDays.reduce((s, v) => s + v, 0) / recordedDays.length) : 0;
  const topWords = Object.entries(usage.wordTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxWordCount = topWords.length ? topWords[0][1] : 1;
  const wordsChart = DAY_ORDER.map((d) => usage.wordsByDay[d]);
  const maxDayWords = Math.max(1, ...wordsChart);
  const totalWords = Object.values(usage.wordTotals).reduce((s, v) => s + v, 0);
  const uniqueWords = Object.keys(usage.wordTotals).length;
  const daysActive = Math.max(1, Math.round((Date.now() - child.enrolledAt) / 86400000));
  const bestDayIdx = wordsChart.indexOf(Math.max(...wordsChart));
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const milestones = [
    { icon: "🗣️", label: tt("pM1"), done: totalWords > 0 },
    { icon: "📚", label: tt("pM2"), done: uniqueWords >= 10 },
    { icon: "🎯", label: tt("pM3"), done: avgAdherence >= 80 },
    { icon: "🔥", label: tt("pM4"), done: usage.gameStreak >= 3 },
    { icon: "⭐", label: tt("pM5"), done: (child.stars ?? 0) >= 25 },
  ];
  const milestonesHit = milestones.filter((m) => m.done).length;

  const tips: string[] = [];
  if (wordsThisWeek < 10) tips.push(tt("pTip1"));
  if (avgAdherence < 60) tips.push(tt("pTip2"));
  if (uniqueWords > 0 && uniqueWords < 8) tips.push(tt("pTip3"));
  if (usage.gameStreak === 0) tips.push(tt("pTip4"));
  if (tips.length === 0) tips.push(tt("pTip0"));

  function toggleFaceConsent(value: boolean) {
    if (!value) {
      Alert.alert("Turn off face recognition?", "This will erase the stored face data for this child.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Turn off",
          style: "destructive",
          onPress: () => {
            const updated = { ...child, faceConsent: false, embedding: [] };
            updateChild(updated);
            onUpdateChild(updated);
          },
        },
      ]);
    } else {
      const updated = { ...child, faceConsent: true };
      updateChild(updated);
      onUpdateChild(updated);
    }
  }

  function toggleGeneralConsent(value: boolean) {
    const updated = { ...child, generalConsent: value };
    updateChild(updated);
    onUpdateChild(updated);
  }

  function deleteFaceData() {
    Alert.alert("Delete face data?", "This cannot be undone. The child will need to be re-enrolled to use face recognition again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updated = { ...child, embedding: [], faceConsent: false };
          updateChild(updated);
          onUpdateChild(updated);
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => onTabChange("home")} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>{tt("progress")}</Text>
          <LangBadge />
        </View>

        <View style={styles.childRow}>
          <View style={styles.shield}>
            <Ionicons name="shield-checkmark" size={18} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childSub}>
              {child.age} · {daysActive} {tt("pDaysActive")}
            </Text>
          </View>
          <Text style={styles.activeText}>{tt("pActive")}</Text>
        </View>

        <View style={styles.diagRow}>
          {child.diagnoses.map((d) => (
            <View key={d} style={styles.diagChip}>
              <Text style={styles.diagChipText}>{diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.subTabs}>
          {SUB_TABS.map((s) => {
            const active = subTab === s.key;
            return (
              <Pressable key={s.key} onPress={() => setSubTab(s.key)} style={styles.subTabBtn}>
                <Text style={[styles.subTabText, active && { color: colors.indigo, fontWeight: "800" }]}>{tt(s.labelKey)}</Text>
                {active && <View style={styles.subTabUnderline} />}
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {subTab === "overview" && (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={{ fontSize: 18 }}>💬</Text>
                  <Text style={[styles.statValue, { color: colors.indigo }]}>{wordsThisWeek}</Text>
                  <Text style={styles.statLabel}>{tt("pWordsWeek")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={{ fontSize: 18 }}>🎯</Text>
                  <Text style={[styles.statValue, { color: colors.greenDeep }]}>{avgAdherence}%</Text>
                  <Text style={styles.statLabel}>{tt("pAdherence")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={{ fontSize: 18 }}>🔥</Text>
                  <Text style={[styles.statValue, { color: colors.orangeDeep }]}>{usage.gameStreak}</Text>
                  <Text style={styles.statLabel}>{tt("pGameStreak")}</Text>
                </View>
              </View>

              <View style={styles.vocabRow}>
                <View style={styles.vocabCell}>
                  <Text style={styles.vocabValue}>{totalWords}</Text>
                  <Text style={styles.vocabLabel}>{tt("pTotalWords")}</Text>
                </View>
                <View style={styles.vocabCell}>
                  <Text style={styles.vocabValue}>{uniqueWords}</Text>
                  <Text style={styles.vocabLabel}>{tt("pDiffWords")}</Text>
                </View>
                <View style={styles.vocabCell}>
                  <Text style={styles.vocabValue}>{wordsChart.some((v) => v > 0) ? DAY_NAMES[bestDayIdx] : "—"}</Text>
                  <Text style={styles.vocabLabel}>{tt("pMostActive")}</Text>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{tt("pWeekSummary")}</Text>
                <Text style={styles.summaryBody}>
                  {topWords.length === 0
                    ? `${child.name} ${tt("pSummaryNone")}`
                    : `${child.name} ${tt("pSummaryUsing")}${topWords[0] ? ` — ${tt("pSummaryOften")} '${topWords[0][0]}'` : ""}${
                        topWords[1] ? ` ${tt("pSummaryAnd")} '${topWords[1][0]}'` : ""
                      }. ${avgAdherence >= 80 ? tt("pRoutinesStrong") : avgAdherence >= 60 ? tt("pRoutinesTrack") : tt("pRoutinesMore")} ${tt("pSummaryTail")}`}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{tt("pDailyUsage")}</Text>
                <View style={styles.chartRow}>
                  {wordsChart.map((v, i) => {
                    const isMax = v === maxDayWords && v > 0;
                    return (
                      <View key={i} style={styles.chartCol}>
                        <View style={styles.chartTrack}>
                          <View
                            style={[
                              styles.chartBar,
                              { height: `${Math.max(6, (v / maxDayWords) * 100)}%`, backgroundColor: isMax ? colors.indigoDeep : colors.indigoLight },
                            ]}
                          />
                        </View>
                        <Text style={styles.chartDay}>{DAYS[i]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.cardTitle}>{tt("pMilestones")}</Text>
                  <Text style={styles.milestoneCount}>{milestonesHit}/{milestones.length}</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {milestones.map((m) => (
                    <View key={m.label} style={styles.milestoneRow}>
                      <Text style={{ fontSize: 18, opacity: m.done ? 1 : 0.35 }}>{m.icon}</Text>
                      <Text style={[styles.milestoneLabel, !m.done && { color: colors.textLight }]}>{m.label}</Text>
                      <Ionicons
                        name={m.done ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={m.done ? colors.greenDeep : colors.border}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{tt("pRecommendations")}</Text>
                {tips.map((tip, i) => (
                  <Text key={i} style={styles.tipLine}>
                    •  {tip}
                  </Text>
                ))}
              </View>
            </>
          )}

          {subTab === "vocabulary" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{tt("pMostUsed")}</Text>
              {topWords.length === 0 ? (
                <Text style={styles.emptyText}>{tt("pNoWordsYet")}</Text>
              ) : (
                <View style={{ gap: 16, marginTop: 8 }}>
                  {topWords.map(([word, count]) => (
                    <View key={word} style={{ gap: 6 }}>
                      <View style={styles.wordRow}>
                        <Text style={styles.wordLabel}>{word}</Text>
                        <Text style={styles.wordCount}>{count} {tt("pTimes")}</Text>
                      </View>
                      <View style={styles.wordTrack}>
                        <View style={[styles.wordFill, { width: `${(count / maxWordCount) * 100}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {subTab === "schedule" && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{tt("pWeeklyAdherence")}</Text>
                <View style={styles.chartRow}>
                  {scheduleDays.map((v, i) => (
                    <View key={i} style={styles.chartCol}>
                      <Text style={styles.percentLabel}>{v}%</Text>
                      <View style={styles.chartTrack}>
                        <View style={[styles.chartBar, { height: `${Math.max(6, v)}%`, backgroundColor: adherenceColor(v) }]} />
                      </View>
                      <Text style={styles.chartDay}>{DAYS[i]}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.legend}>
                  <LegendItem color={colors.greenDeep} label={tt("pLegendExcellent")} />
                  <LegendItem color={colors.yellowDeep} label={tt("pLegendGood")} />
                  <LegendItem color={colors.orangeDeep} label={tt("pLegendNeeds")} />
                </View>
              </View>

              <Pressable onPress={() => Alert.alert("IEP report exported")} style={styles.exportBtn}>
                <Ionicons name="document-text" size={16} color="white" />
                <Text style={styles.exportText}>{tt("pExportIep")}</Text>
              </Pressable>
            </>
          )}

          {subTab === "privacy" && (
            <>
              <View style={styles.privacyInfo}>
                <Text style={styles.privacyInfoTitle}>{tt("pDataOnDevice")}</Text>
                <Text style={styles.privacyInfoLine}>{tt("pMathOnly")}</Text>
                <Text style={styles.privacyInfoLine}>{tt("pOnDeviceOnly")}</Text>
              </View>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>{tt("pFaceRecognition")}</Text>
                  <Text style={[styles.toggleSub, { color: child.faceConsent !== false ? colors.greenDeep : colors.textLight }]}>
                    {child.faceConsent !== false ? tt("pConsented") : tt("pNotEnabled")}
                  </Text>
                </View>
                <Switch
                  value={child.faceConsent !== false}
                  onValueChange={toggleFaceConsent}
                  trackColor={{ true: colors.greenDeep, false: colors.border }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>{tt("pGeneralConsent")}</Text>
                  <Text style={[styles.toggleSub, { color: child.generalConsent !== false ? colors.greenDeep : colors.textLight }]}>
                    {child.generalConsent !== false ? tt("pConsented") : tt("pNotGiven")}
                  </Text>
                </View>
                <Switch
                  value={child.generalConsent !== false}
                  onValueChange={toggleGeneralConsent}
                  trackColor={{ true: colors.greenDeep, false: colors.border }}
                  thumbColor="white"
                />
              </View>

              <Pressable onPress={deleteFaceData} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>{tt("pDeleteFace")}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.textDark, textAlign: "center", marginRight: 36 },
  childRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  shield: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.indigo, alignItems: "center", justifyContent: "center" },
  childName: { fontSize: 16, fontWeight: "800", color: colors.textDark },
  childSub: { fontSize: 12, color: colors.textMid, marginTop: 1 },
  activeText: { color: colors.blueAccent, fontWeight: "700", fontSize: 13 },
  diagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 20, marginTop: 8 },
  diagChip: { backgroundColor: colors.forestLight, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  diagChipText: { color: colors.forestDark, fontSize: 11, fontWeight: "700" },
  vocabRow: { flexDirection: "row", gap: 10 },
  vocabCell: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, alignItems: "center", paddingVertical: 14, gap: 3 },
  vocabValue: { fontSize: 18, fontWeight: "800", color: colors.forestDark },
  vocabLabel: { fontSize: 10, color: colors.textMid, textAlign: "center" },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  milestoneCount: { fontSize: 13, fontWeight: "800", color: colors.greenDeep },
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  milestoneLabel: { flex: 1, fontSize: 13.5, color: colors.textDark, fontWeight: "600" },
  tipLine: { fontSize: 13, color: colors.textDark, lineHeight: 20, marginTop: 4 },
  subTabs: { flexDirection: "row", paddingHorizontal: 20, marginTop: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  subTabBtn: { marginRight: 22, paddingBottom: 10, alignItems: "center" },
  subTabText: { fontSize: 14, color: colors.textLight, fontWeight: "600" },
  subTabUnderline: { marginTop: 8, height: 2, width: "100%", backgroundColor: colors.indigo, borderRadius: 1 },
  body: { padding: 20, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingVertical: 14, gap: 4 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 10, color: colors.textMid, textAlign: "center" },
  summaryCard: { backgroundColor: colors.indigoLight, borderRadius: radius, padding: 16 },
  summaryTitle: { fontSize: 13, fontWeight: "800", color: colors.indigoDeep, marginBottom: 6 },
  summaryBody: { fontSize: 13, color: colors.textDark, lineHeight: 20 },
  card: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.textDark, marginBottom: 14 },
  chartRow: { flexDirection: "row", justifyContent: "space-between", height: 120, alignItems: "flex-end" },
  chartCol: { alignItems: "center", gap: 6, flex: 1 },
  chartTrack: { width: 18, height: 80, borderRadius: 9, backgroundColor: colors.cardMuted, justifyContent: "flex-end", overflow: "hidden" },
  chartBar: { width: "100%", borderRadius: 9 },
  chartDay: { fontSize: 11, color: colors.textLight },
  percentLabel: { fontSize: 10, color: colors.textMid, fontWeight: "700" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 14, justifyContent: "center" },
  legendText: { fontSize: 11, color: colors.textMid },
  exportBtn: { flexDirection: "row", gap: 8, backgroundColor: colors.blueAccent, borderRadius: radius, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  exportText: { color: "white", fontWeight: "700", fontSize: 14 },
  emptyText: { color: colors.textLight, fontSize: 13, lineHeight: 20 },
  wordRow: { flexDirection: "row", justifyContent: "space-between" },
  wordLabel: { fontWeight: "800", fontSize: 15, color: colors.textDark },
  wordCount: { fontSize: 12, color: colors.textLight },
  wordTrack: { height: 8, borderRadius: 4, backgroundColor: colors.cardMuted, overflow: "hidden" },
  wordFill: { height: "100%", borderRadius: 4, backgroundColor: colors.indigo },
  privacyInfo: { backgroundColor: colors.indigoLight, borderRadius: radius, padding: 16, gap: 4 },
  privacyInfoTitle: { fontSize: 13, fontWeight: "800", color: colors.indigoDeep, marginBottom: 4 },
  privacyInfoLine: { fontSize: 13, color: colors.textDark },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 16 },
  toggleLabel: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  toggleSub: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  deleteBtn: { borderWidth: 1.5, borderColor: colors.danger, borderRadius: radius, paddingVertical: 14, alignItems: "center" },
  deleteText: { color: colors.danger, fontWeight: "700" },
});
