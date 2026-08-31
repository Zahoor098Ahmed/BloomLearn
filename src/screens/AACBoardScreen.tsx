import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { recordWordUsage } from "../modules/storage";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

type Category = "pronouns" | "verbs" | "nouns" | "describe";
type FilterKey = "all" | Category;

interface Word {
  word: string;
  emoji: string;
  cat: Category;
}

const CAT_COLOR: Record<Category, { bg: string; dot: string }> = {
  pronouns: { bg: colors.yellow, dot: colors.yellowDeep },
  verbs: { bg: colors.green, dot: colors.greenDeep },
  nouns: { bg: colors.blue, dot: colors.blueDeep },
  describe: { bg: colors.purple, dot: colors.purpleDeep },
};

const WORDS: Word[] = [
  { word: "I", emoji: "☝️", cat: "pronouns" },
  { word: "You", emoji: "👆", cat: "pronouns" },
  { word: "He", emoji: "🧑", cat: "pronouns" },
  { word: "We", emoji: "👥", cat: "pronouns" },
  { word: "Want", emoji: "🙏", cat: "verbs" },
  { word: "Like", emoji: "❤️", cat: "verbs" },
  { word: "Eat", emoji: "🍽️", cat: "verbs" },
  { word: "Play", emoji: "🎯", cat: "verbs" },
  { word: "Go", emoji: "🚶", cat: "verbs" },
  { word: "Drink", emoji: "🥤", cat: "nouns" },
  { word: "Water", emoji: "💧", cat: "nouns" },
  { word: "Food", emoji: "🍎", cat: "nouns" },
  { word: "Happy", emoji: "😊", cat: "describe" },
  { word: "Big", emoji: "🐘", cat: "describe" },
  { word: "Small", emoji: "🐭", cat: "describe" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pronouns", label: "Pronouns" },
  { key: "verbs", label: "Verbs" },
  { key: "nouns", label: "Nouns" },
  { key: "describe", label: "Describe" },
];

export default function AACBoardScreen({ child, tab, onTabChange, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sentence, setSentence] = useState<string[]>([]);

  const visible = useMemo(() => (filter === "all" ? WORDS : WORDS.filter((w) => w.cat === filter)), [filter]);

  function tap(word: string) {
    speak(word, lang, settings.soundEnabled);
    setSentence((prev) => [...prev, word]);
    recordWordUsage(child.id, word);
  }

  function speakSentence() {
    if (sentence.length === 0) return;
    speak(sentence.join(", "), lang, settings.soundEnabled);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>What do you want to say?</Text>
          <LangBadge />
        </View>

        <View style={styles.inputBar}>
          <Text style={sentence.length === 0 ? styles.placeholder : styles.sentenceText}>
            {sentence.length === 0 ? "Tap words to build your sentence" : sentence.join(" ")}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={speakSentence} disabled={sentence.length === 0} style={[styles.speakBtn, sentence.length === 0 && { opacity: 0.5 }]}>
            <Text style={styles.speakBtnText}>🔊 Speak</Text>
          </Pressable>
          <Pressable onPress={() => setSentence([])} disabled={sentence.length === 0} style={[styles.clearBtn, sentence.length === 0 && { opacity: 0.5 }]}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && { color: "white" }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {visible.map((item) => {
            const c = CAT_COLOR[item.cat];
            return (
              <Pressable key={item.word} onPress={() => tap(item.word)} style={[styles.tile, { backgroundColor: c.bg }]}>
                <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
                <Text style={styles.tileLabel}>{item.word}</Text>
                <View style={[styles.dot, { backgroundColor: c.dot }]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 19, fontWeight: "800", color: colors.textDark, flex: 1, marginRight: 12 },
  inputBar: { marginHorizontal: 20, marginTop: 14, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 16, minHeight: 54 },
  placeholder: { color: colors.textLight, fontSize: 14, fontStyle: "italic" },
  sentenceText: { color: colors.textDark, fontSize: 15, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 12 },
  speakBtn: { flex: 1, backgroundColor: colors.forest, borderRadius: radius, paddingVertical: 14, alignItems: "center" },
  speakBtnText: { color: "white", fontWeight: "700" },
  clearBtn: { flex: 1, backgroundColor: colors.cardMuted, borderRadius: radius, paddingVertical: 14, alignItems: "center" },
  clearBtnText: { color: colors.textMid, fontWeight: "700" },
  filters: { marginTop: 16 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.cardMuted },
  pillActive: { backgroundColor: colors.forest },
  pillText: { fontSize: 13, fontWeight: "700", color: colors.textMid },
  grid: { padding: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "30%", borderRadius: radius, paddingVertical: 18, alignItems: "center", gap: 8 },
  tileLabel: { fontSize: 13, fontWeight: "700", color: colors.textDark },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
