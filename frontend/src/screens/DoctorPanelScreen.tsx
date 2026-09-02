import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChildProfile, ContentTag } from "../types";
import { CONTENT_TAG_LABELS, DIAGNOSIS_LABELS } from "../types";
import { loadChildren, updateChild, getUsage } from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { t, diagnosisLabel } from "../modules/i18n";
import Mascot from "../components/Mascot";
import Card from "../components/Card";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

const ALL_TAGS = Object.keys(CONTENT_TAG_LABELS) as ContentTag[];
const DOCTOR_GREEN = colors.forest;

export default function DoctorPanelScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [children, setChildren] = useState<ChildProfile[]>(loadChildren);
  const [selected, setSelected] = useState<ChildProfile | null>(null);

  function applyTags(next: ContentTag[]) {
    if (!selected) return;
    const updated: ChildProfile = { ...selected, allowedTags: next };
    setSelected(updated);
    updateChild(updated);
    setChildren((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function toggleTag(tag: ContentTag) {
    if (!selected) return;
    const hasTag = selected.allowedTags.includes(tag);
    applyTags(hasTag ? selected.allowedTags.filter((tg) => tg !== tag) : [...selected.allowedTags, tag]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => (selected ? setSelected(null) : onBack())} style={styles.backBtn}>
            <Text style={styles.backText}>← {selected ? "All Children" : t("back", lang)}</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 36 }}>👨‍⚕️</Text>
            <View>
              <Text style={styles.headerTitle}>{t("doctorPanel", lang)}</Text>
              <Text style={styles.headerSub}>{selected ? `Managing: ${selected.name}` : "Select a child to manage"}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {!selected &&
            (children.length === 0 ? (
              <Card style={{ alignItems: "center", paddingVertical: 48 }}>
                <Mascot mood="thinking" size={80} />
                <Text style={styles.emptyText}>No children enrolled yet.</Text>
              </Card>
            ) : (
              children.map((child) => (
                <Pressable key={child.id} onPress={() => setSelected(child)} style={styles.childRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{child.name[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>
                      Age {child.age} · {child.allowedTags.length}/{ALL_TAGS.length} content approved
                    </Text>
                    <View style={styles.chipRow}>
                      {child.diagnoses.slice(0, 2).map((d) => (
                        <View key={d} style={styles.chip}>
                          <Text style={styles.chipText}>{diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}</Text>
                        </View>
                      ))}
                      {child.diagnoses.length > 2 && <Text style={styles.chipMore}>+{child.diagnoses.length - 2}</Text>}
                    </View>
                  </View>
                  <Text style={{ color: DOCTOR_GREEN, fontSize: 18 }}>→</Text>
                </Pressable>
              ))
            ))}

          {selected && (
            <>
              {(() => {
                const usage = getUsage(selected.id);
                const wordsWeek = usage.wordsByDay.reduce((s, v) => s + v, 0);
                const totalWords = Object.values(usage.wordTotals).reduce((s, v) => s + v, 0);
                const recorded = usage.scheduleByDay.filter((v) => v > 0);
                const adherence = recorded.length ? Math.round(recorded.reduce((s, v) => s + v, 0) / recorded.length) : 0;
                const enrolled = new Date(selected.enrolledAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
                return (
                  <View style={styles.clinicalCard}>
                    <Text style={styles.clinicalTitle}>Clinical summary</Text>
                    <Text style={styles.clinicalLine}>Age {selected.age} · enrolled {enrolled}</Text>
                    <View style={styles.chipRow}>
                      {selected.diagnoses.map((d) => (
                        <View key={d} style={styles.chip}>
                          <Text style={styles.chipText}>{diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.usageRow}>
                      <UsageStat value={String(wordsWeek)} label="Words this week" />
                      <UsageStat value={String(totalWords)} label="Words all-time" />
                      <UsageStat value={`${adherence}%`} label="Routine adherence" />
                      <UsageStat value={`${usage.gameStreak} 🔥`} label="Game streak" />
                    </View>
                  </View>
                );
              })()}

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>✅ Toggle content categories on/off. Only enabled categories will be shown to {selected.name}.</Text>
              </View>

              <View style={styles.bulkRow}>
                <Pressable onPress={() => applyTags([...ALL_TAGS])} style={styles.bulkBtn}>
                  <Text style={styles.bulkText}>Enable all</Text>
                </Pressable>
                <Pressable onPress={() => applyTags([])} style={[styles.bulkBtn, styles.bulkBtnMuted]}>
                  <Text style={[styles.bulkText, { color: colors.textMid }]}>Disable all</Text>
                </Pressable>
              </View>

              <Text style={styles.tagCount}>
                {t("allowedContent", lang)} ({selected.allowedTags.length}/{ALL_TAGS.length})
              </Text>

              <View style={{ gap: 10 }}>
                {ALL_TAGS.map((tag) => {
                  const allowed = selected.allowedTags.includes(tag);
                  const [emoji, ...rest] = CONTENT_TAG_LABELS[tag].split(" ");
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      style={[styles.tagRow, allowed ? styles.tagRowActive : styles.tagRowInactive]}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                      <Text style={styles.tagLabel}>{rest.join(" ")}</Text>
                      <View style={[styles.tagCheck, { backgroundColor: allowed ? DOCTOR_GREEN : colors.border }]}>
                        {allowed && <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>✓</Text>}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function UsageStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.usageStat}>
      <Text style={styles.usageValue}>{value}</Text>
      <Text style={styles.usageLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 12, alignSelf: "flex-start" },
  backText: { color: "white", fontWeight: "700" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  body: { padding: 20, gap: 16 },
  emptyText: { color: colors.textMid, marginTop: 16 },
  childRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, paddingVertical: 16, paddingHorizontal: 18 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 20, fontWeight: "800" },
  childName: { fontSize: 17, fontWeight: "700", color: colors.textDark },
  childMeta: { color: colors.textLight, fontSize: 13, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 6 },
  chip: { backgroundColor: colors.forestLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  chipText: { color: colors.forestDark, fontSize: 11, fontWeight: "700" },
  chipMore: { color: colors.textLight, fontSize: 11, fontWeight: "600" },
  clinicalCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, padding: 16, gap: 8 },
  clinicalTitle: { fontSize: 14, fontWeight: "800", color: colors.textDark },
  clinicalLine: { fontSize: 13, color: colors.textMid },
  usageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  usageStat: { width: "47%", backgroundColor: colors.cardMuted, borderRadius: 12, paddingVertical: 10, alignItems: "center", gap: 2 },
  usageValue: { fontSize: 16, fontWeight: "800", color: colors.forestDark },
  usageLabel: { fontSize: 10.5, color: colors.textMid, textAlign: "center" },
  bulkRow: { flexDirection: "row", gap: 10 },
  bulkBtn: { flex: 1, backgroundColor: colors.forest, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  bulkBtnMuted: { backgroundColor: colors.cardMuted },
  bulkText: { color: "white", fontWeight: "800", fontSize: 13 },
  infoBox: { backgroundColor: colors.forestLight, borderRadius: radius, paddingVertical: 14, paddingHorizontal: 18 },
  infoText: { color: colors.forestDark, fontSize: 14, lineHeight: 22, fontWeight: "600" },
  tagCount: { fontSize: 16, color: colors.textMid, fontWeight: "700" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1 },
  tagRowActive: { backgroundColor: colors.forestLight, borderColor: colors.forest },
  tagRowInactive: { backgroundColor: colors.card, borderColor: colors.border },
  tagLabel: { flex: 1, fontWeight: "600", fontSize: 15, color: colors.textDark },
  tagCheck: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
