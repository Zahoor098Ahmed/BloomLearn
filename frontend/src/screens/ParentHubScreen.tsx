import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChildProfile } from "../types";
import { DIAGNOSIS_LABELS } from "../types";
import { loadChildren, deleteChild, getUsage } from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { t, diagnosisLabel } from "../modules/i18n";
import Mascot from "../components/Mascot";
import Card from "../components/Card";
import BigButton from "../components/BigButton";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
  onAddChild: () => void;
}

export default function ParentHubScreen({ onBack, onAddChild }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [children, setChildren] = useState<ChildProfile[]>(loadChildren);

  const totalStars = children.reduce((s, c) => s + (c.stars ?? 0), 0);

  function remove(id: string, name: string) {
    Alert.alert(`Remove ${name}?`, undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteChild(id);
          setChildren(loadChildren());
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← {t("back", lang)}</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Mascot mood="happy" size={60} animate={false} />
            <View>
              <Text style={styles.headerTitle}>{t("parentHub", lang)}</Text>
              <Text style={styles.headerSub}>
                {children.length} child{children.length !== 1 ? "ren" : ""} enrolled · {totalStars} ⭐ earned
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <BigButton variant="primary" onPress={onAddChild} style={{ width: "100%" }}>
            + {t("addChild", lang)}
          </BigButton>

          {children.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 56 }}>👶</Text>
              <Text style={styles.emptyText}>{t("noChildren", lang)}</Text>
            </Card>
          ) : (
            children.map((child) => {
              const usage = getUsage(child.id);
              const wordsThisWeek = usage.wordsByDay.reduce((s, v) => s + v, 0);
              const recorded = usage.scheduleByDay.filter((v) => v > 0);
              const adherence = recorded.length ? Math.round(recorded.reduce((s, v) => s + v, 0) / recorded.length) : 0;
              const since = new Date(child.enrolledAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });
              const faceOn = child.faceConsent !== false && child.embedding.length > 0;
              return (
                <Card key={child.id} style={styles.childCard}>
                  <View style={styles.childTop}>
                    <View style={styles.avatar}>
                      <Text style={{ fontSize: 22 }}>{child.name[0]?.toUpperCase() ?? "?"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childMeta}>
                        Age {child.age} · enrolled {since}
                      </Text>
                    </View>
                    <Pressable onPress={() => remove(child.id, child.name)} style={styles.removeBtn}>
                      <Text style={styles.removeText}>{t("deleteChild", lang)}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.tagWrap}>
                    {child.diagnoses.slice(0, 3).map((d) => (
                      <View key={d} style={styles.tag}>
                        <Text style={styles.tagText}>{diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}</Text>
                      </View>
                    ))}
                    {child.diagnoses.length > 3 && <Text style={styles.moreText}>+{child.diagnoses.length - 3} more</Text>}
                  </View>

                  <View style={styles.miniStats}>
                    <MiniStat value={`${child.stars ?? 0} ⭐`} label="Stars" />
                    <MiniStat value={`${child.badges?.length ?? 0} 🏅`} label="Badges" />
                    <MiniStat value={String(wordsThisWeek)} label="Words / wk" />
                    <MiniStat value={`${usage.gameStreak} 🔥`} label="Streak" />
                  </View>

                  <View style={styles.childFooter}>
                    <Text style={styles.footerItem}>📅 {adherence}% routine</Text>
                    <Text style={[styles.footerItem, { color: faceOn ? colors.greenDeep : colors.textLight }]}>
                      {faceOn ? "🔓 Face unlock on" : "🔒 Face unlock off"}
                    </Text>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 12, alignSelf: "flex-start" },
  backText: { color: "white", fontWeight: "700" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  body: { padding: 20, gap: 16 },
  emptyText: { color: colors.textMid, marginTop: 16, fontSize: 16 },
  childCard: { gap: 12 },
  childTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  childName: { fontSize: 17, fontWeight: "700", color: colors.textDark },
  childMeta: { color: colors.textLight, fontSize: 13, marginTop: 2 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4, alignItems: "center" },
  tag: { backgroundColor: colors.forestLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { color: colors.forestDark, fontSize: 11, fontWeight: "600" },
  moreText: { color: colors.textLight, fontSize: 11 },
  removeBtn: { backgroundColor: colors.pink, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  removeText: { color: colors.danger, fontSize: 13, fontWeight: "700" },
  miniStats: { flexDirection: "row", gap: 8, backgroundColor: colors.cardMuted, borderRadius: 14, paddingVertical: 10 },
  miniStat: { flex: 1, alignItems: "center", gap: 2 },
  miniStatValue: { fontSize: 14, fontWeight: "800", color: colors.textDark },
  miniStatLabel: { fontSize: 9.5, color: colors.textMid },
  childFooter: { flexDirection: "row", justifyContent: "space-between" },
  footerItem: { fontSize: 12, color: colors.textMid, fontWeight: "600" },
});
