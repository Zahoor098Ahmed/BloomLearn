import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { recordGamePlayed } from "../modules/storage";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

type GameMode = "animals" | "letters" | "numbers" | "colors" | "shapes" | "emotions";

interface Round {
  prompt: string;
  answer: string;
  options: string[];
  say?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Build rounds from a list of {prompt, answer} pairs, adding 2 decoy options each. */
function buildRounds(items: { prompt: string; answer: string }[]): Round[] {
  const allAnswers = items.map((i) => i.answer);
  return shuffle(items).map((item) => {
    const decoys = shuffle(allAnswers.filter((a) => a !== item.answer)).slice(0, 2);
    return {
      prompt: item.prompt,
      answer: item.answer,
      options: shuffle([item.answer, ...decoys]),
      say: item.answer,
    };
  });
}

const ANIMALS = buildRounds([
  { prompt: "🐸", answer: "Frog" },
  { prompt: "🐶", answer: "Dog" },
  { prompt: "🐦", answer: "Bird" },
  { prompt: "🐱", answer: "Cat" },
  { prompt: "🐰", answer: "Rabbit" },
  { prompt: "🐮", answer: "Cow" },
  { prompt: "🐷", answer: "Pig" },
  { prompt: "🐴", answer: "Horse" },
]);

const LETTERS_LIST = ["A", "B", "C", "D", "E", "F", "G", "H"];
const LETTER_ROUNDS: Round[] = shuffle(LETTERS_LIST).map((l) => ({
  prompt: l,
  answer: l,
  options: shuffle([l, ...shuffle(LETTERS_LIST.filter((x) => x !== l)).slice(0, 2)]),
  say: `The letter ${l}`,
}));

const NUMBER_ROUNDS: Round[] = shuffle(Array.from({ length: 10 }, (_, i) => i + 1)).map((n) => {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((v) => v !== n);
  const decoys = shuffle(pool).slice(0, 2);
  return {
    prompt: String(n),
    answer: String(n),
    options: shuffle([String(n), ...decoys.map(String)]),
    say: `The number ${n}`,
  };
});

const COLORS_ROUNDS = buildRounds([
  { prompt: "🟥", answer: "Red" },
  { prompt: "🟧", answer: "Orange" },
  { prompt: "🟨", answer: "Yellow" },
  { prompt: "🟩", answer: "Green" },
  { prompt: "🟦", answer: "Blue" },
  { prompt: "🟪", answer: "Purple" },
  { prompt: "🟫", answer: "Brown" },
  { prompt: "⬛", answer: "Black" },
]);

const SHAPES_ROUNDS = buildRounds([
  { prompt: "🔴", answer: "Circle" },
  { prompt: "🔺", answer: "Triangle" },
  { prompt: "🟦", answer: "Square" },
  { prompt: "⭐", answer: "Star" },
  { prompt: "🔷", answer: "Diamond" },
  { prompt: "❤️", answer: "Heart" },
]);

const EMOTIONS_ROUNDS = buildRounds([
  { prompt: "😀", answer: "Happy" },
  { prompt: "😢", answer: "Sad" },
  { prompt: "😠", answer: "Angry" },
  { prompt: "😨", answer: "Scared" },
  { prompt: "😴", answer: "Sleepy" },
  { prompt: "😲", answer: "Surprised" },
  { prompt: "🤢", answer: "Sick" },
  { prompt: "🥰", answer: "Loved" },
]);

const MODE_ROUNDS: Record<GameMode, Round[]> = {
  animals: ANIMALS,
  letters: LETTER_ROUNDS,
  numbers: NUMBER_ROUNDS,
  colors: COLORS_ROUNDS,
  shapes: SHAPES_ROUNDS,
  emotions: EMOTIONS_ROUNDS,
};

const MODES: {
  key: GameMode;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}[] = [
  { key: "animals", title: "Animal Match", subtitle: "Match the animal to its name", icon: "🐸", color: colors.green },
  { key: "letters", title: "Learn Letters", subtitle: "Tap the letter you see", icon: "🔤", color: colors.blue },
  { key: "numbers", title: "Learn Numbers", subtitle: "Tap the number you see", icon: "🔢", color: colors.yellow },
  { key: "colors", title: "Colors", subtitle: "Name the color you see", icon: "🎨", color: colors.pink },
  { key: "shapes", title: "Shapes", subtitle: "Name the shape you see", icon: "🔷", color: colors.purple },
  { key: "emotions", title: "Emotions", subtitle: "How is this face feeling?", icon: "🙂", color: colors.orange },
];

const PRAISE = ["Great job!", "Well done!", "Awesome!", "You got it!", "Brilliant!"];

export default function GamesScreen({ child, tab, onTabChange, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [mode, setMode] = useState<GameMode>("animals");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);

  const rounds = MODE_ROUNDS[mode];
  const round = rounds[roundIdx];
  const meta = useMemo(() => MODES.find((m) => m.key === mode)!, [mode]);
  const progress = roundIdx / rounds.length;

  function choose(option: string) {
    if (feedback || finished) return;
    if (option === round.answer) {
      const nextStreak = streak + 1;
      setFeedback("correct");
      setScore((s) => s + 1);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setTries((tr) => tr + 1);
      speak(PRAISE[Math.floor(Math.random() * PRAISE.length)], lang, settings.soundEnabled);
      recordGamePlayed(child.id);
      setTimeout(() => {
        setFeedback(null);
        if (roundIdx + 1 >= rounds.length) {
          setFinished(true);
          speak("You finished! Amazing work!", lang, settings.soundEnabled);
        } else {
          setRoundIdx((i) => i + 1);
        }
      }, 750);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTries((tr) => tr + 1);
      speak(`Try again. This is ${round.say ?? round.answer}`, lang, settings.soundEnabled);
      setTimeout(() => setFeedback(null), 750);
    }
  }

  function restart(next: GameMode = mode) {
    setMode(next);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRoundIdx(0);
    setTries(0);
    setFeedback(null);
    setFinished(false);
  }

  const accuracy = tries > 0 ? Math.round((score / tries) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{meta.title}</Text>
            <Text style={styles.subtitle}>{meta.subtitle}</Text>
          </View>
          <LangBadge />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>⭐ {score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>🔥 {streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>🎯 {accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>

          {!finished && (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.roundCount}>
                Round {roundIdx + 1} of {rounds.length}
              </Text>

              <View
                style={[
                  styles.promptCard,
                  feedback === "correct" && { borderColor: colors.greenDeep, backgroundColor: colors.green },
                  feedback === "wrong" && { borderColor: colors.pinkDeep, backgroundColor: colors.pink },
                ]}
              >
                <Text style={{ fontSize: 72 }}>{round.prompt}</Text>
                {feedback === "correct" && <Text style={styles.feedbackText}>✓ Correct!</Text>}
                {feedback === "wrong" && <Text style={styles.feedbackText}>Try again</Text>}
              </View>

              <View style={styles.optionsWrap}>
                {round.options.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => choose(opt)}
                    style={[
                      styles.optionBtn,
                      feedback === "correct" && opt === round.answer && styles.optionCorrect,
                      feedback === "wrong" && opt === round.answer && styles.optionCorrect,
                    ]}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {finished && (
            <View style={styles.finishCard}>
              <Text style={{ fontSize: 56 }}>🎉</Text>
              <Text style={styles.finishTitle}>{meta.title} complete!</Text>
              <Text style={styles.finishStats}>
                {score} / {tries} correct · best streak {bestStreak} 🔥
              </Text>
              <Pressable onPress={() => restart()} style={styles.finishBtn}>
                <Text style={styles.finishBtnText}>Play again</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.pickTitle}>Choose a game</Text>
          <View style={styles.gameGrid}>
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => restart(m.key)}
                style={[styles.gameTile, { backgroundColor: m.color }, m.key === mode && styles.gameTileActive]}
              >
                <Text style={{ fontSize: 26 }}>{m.icon}</Text>
                <Text style={styles.gameTileLabel}>{m.title}</Text>
                <Text style={styles.gameTileSub}>{MODE_ROUNDS[m.key].length} rounds</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 20, fontWeight: "800", color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMid, marginTop: 2 },
  body: { padding: 20, gap: 16, alignItems: "center", paddingBottom: 28 },
  statRow: { flexDirection: "row", gap: 10, width: "100%" },
  statPill: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, alignItems: "center", gap: 2 },
  statValue: { fontWeight: "800", color: colors.textDark, fontSize: 15 },
  statLabel: { fontSize: 10.5, color: colors.textMid },
  progressTrack: { width: "100%", height: 8, borderRadius: 4, backgroundColor: colors.cardMuted, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: colors.forest },
  roundCount: { fontSize: 12, color: colors.textMid, fontWeight: "600", marginTop: -6 },
  promptCard: {
    width: 200,
    height: 200,
    borderRadius: radius,
    backgroundColor: colors.cardMuted,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  feedbackText: { fontSize: 15, fontWeight: "800", color: colors.textDark },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%", justifyContent: "center" },
  optionBtn: {
    minWidth: "30%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  optionCorrect: { borderColor: colors.greenDeep, borderWidth: 2, backgroundColor: colors.green },
  optionText: { fontWeight: "700", fontSize: 16, color: colors.textDark },
  finishCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  finishTitle: { fontSize: 18, fontWeight: "800", color: colors.textDark },
  finishStats: { fontSize: 13, color: colors.textMid },
  finishBtn: { backgroundColor: colors.forest, borderRadius: radius, paddingVertical: 14, paddingHorizontal: 32, marginTop: 6 },
  finishBtnText: { color: "white", fontWeight: "800", fontSize: 15 },
  pickTitle: { alignSelf: "flex-start", fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1, marginTop: 6 },
  gameGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%" },
  gameTile: { width: "47%", borderRadius: radius, paddingVertical: 18, paddingHorizontal: 14, gap: 4 },
  gameTileActive: { borderWidth: 2, borderColor: colors.forest },
  gameTileLabel: { fontWeight: "800", fontSize: 14, color: colors.textDark },
  gameTileSub: { fontSize: 11, color: colors.textMid },
});
