import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { recordScheduleAdherence } from "../modules/storage";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

type ItemState = "done" | "now" | "upcoming";

interface ScheduleItem {
  time: string;
  label: string;
  emoji: string;
  state: ItemState;
}

const INITIAL: ScheduleItem[] = [
  { time: "08:00", label: "Breakfast", emoji: "🍳", state: "done" },
  { time: "09:00", label: "Play Time", emoji: "🎮", state: "done" },
  { time: "10:30", label: "AAC Session", emoji: "💬", state: "now" },
  { time: "12:00", label: "Lunch", emoji: "🍽️", state: "upcoming" },
  { time: "13:00", label: "Rest Time", emoji: "😴", state: "upcoming" },
  { time: "15:00", label: "Skill Activity", emoji: "⭐", state: "upcoming" },
];

const STATE_LABEL: Record<ItemState, string> = { done: "Done", now: "Now", upcoming: "Upcoming" };
const STATE_COLOR: Record<ItemState, string> = { done: colors.textLight, now: colors.blueDeep, upcoming: colors.orangeDeep };

export default function VisualScheduleScreen({ child, tab, onTabChange, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [items, setItems] = useState(INITIAL);

  function toggle(idx: number) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== idx) return item;
        const nextState: ItemState = item.state === "done" ? "upcoming" : "done";
        speak(item.label + (nextState === "done" ? ". Done!" : ""), lang, settings.soundEnabled);
        return { ...item, state: nextState };
      });
      const percent = (next.filter((i) => i.state === "done").length / next.length) * 100;
      recordScheduleAdherence(child.id, percent);
      return next;
    });
  }

  useEffect(() => {
    const percent = (items.filter((i) => i.state === "done").length / items.length) * 100;
    recordScheduleAdherence(child.id, percent);
  }, []);

  const doneCount = items.filter((i) => i.state === "done").length;
  const percent = Math.round((doneCount / items.length) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Schedule</Text>
          <LangBadge />
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {doneCount}/{items.length} tasks
          </Text>
          <Text style={[styles.progressText, { color: colors.greenDeep, fontWeight: "800" }]}>{percent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.timeline}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View
                  style={[
                    styles.railDot,
                    item.state === "done" && { backgroundColor: colors.greenDeep },
                    item.state === "now" && { backgroundColor: colors.blueDeep },
                  ]}
                >
                  {item.state === "done" && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                {idx < items.length - 1 && <View style={styles.railLine} />}
              </View>

              <Pressable
                onPress={() => toggle(idx)}
                style={[styles.card, item.state === "now" && styles.cardNow]}
              >
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, item.state === "done" && { textDecorationLine: "line-through", color: colors.textLight }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.cardState, { color: STATE_COLOR[item.state] }]}>{STATE_LABEL[item.state]}</Text>
                </View>
                <Text style={styles.cardTime}>{item.time}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 19, fontWeight: "800", color: colors.textDark },
  progressRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 16 },
  progressText: { fontSize: 13, color: colors.textMid, fontWeight: "600" },
  progressTrack: { marginHorizontal: 20, marginTop: 6, height: 8, borderRadius: 4, backgroundColor: colors.cardMuted, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.greenDeep, borderRadius: 4 },
  timeline: { padding: 20, paddingTop: 16 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineRail: { alignItems: "center", width: 20 },
  railDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" },
  railLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  cardNow: { borderColor: colors.forest, borderWidth: 2 },
  cardLabel: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  cardState: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  cardTime: { fontSize: 12, color: colors.textLight },
});
