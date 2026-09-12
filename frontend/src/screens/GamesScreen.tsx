import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { recordGamePlayed } from "../modules/storage";
import { t, gameAnswerLabel, type TKey } from "../modules/i18n";
import { tapFeedback } from "../modules/haptics";
import { useResponsive } from "../modules/responsive";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

type GameMode = "animals" | "letters" | "numbers" | "colors" | "shapes" | "emotions" | "food";

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

const ANSWER_EMOJI: Record<string, string> = {
  Frog: "🐸", Dog: "🐶", Bird: "🐦", Cat: "🐱", Rabbit: "🐰", Cow: "🐮", Pig: "🐷", Horse: "🐴",
  Red: "🟥", Orange: "🟧", Yellow: "🟨", Green: "🟩", Blue: "🟦", Purple: "🟪", Brown: "🟫", Black: "⬛",
  Circle: "🔴", Triangle: "🔺", Square: "🟦", Star: "⭐", Diamond: "🔷", Heart: "❤️",
  Happy: "😀", Sad: "😢", Angry: "😠", Scared: "😨", Sleepy: "😴", Surprised: "😲", Sick: "🤢", Loved: "🥰",
  Apple: "🍎", Banana: "🍌", Pizza: "🍕", Milk: "🥛", Cookie: "🍪", Bread: "🍞", Carrot: "🥕", Watermelon: "🍉",
};

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

const FOOD_ROUNDS = buildRounds([
  { prompt: "🍎", answer: "Apple" },
  { prompt: "🍌", answer: "Banana" },
  { prompt: "🍕", answer: "Pizza" },
  { prompt: "🥛", answer: "Milk" },
  { prompt: "🍪", answer: "Cookie" },
  { prompt: "🍞", answer: "Bread" },
  { prompt: "🥕", answer: "Carrot" },
  { prompt: "🍉", answer: "Watermelon" },
]);

const MODE_ROUNDS: Record<GameMode, Round[]> = {
  animals: ANIMALS,
  letters: LETTER_ROUNDS,
  numbers: NUMBER_ROUNDS,
  colors: COLORS_ROUNDS,
  shapes: SHAPES_ROUNDS,
  emotions: EMOTIONS_ROUNDS,
  food: FOOD_ROUNDS,
};

const MODES: {
  key: GameMode;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  accent: string;
}[] = [
  { key: "animals", title: "Animal Match", subtitle: "Match the animal to its name", icon: "🐸", color: "#dcfce7", accent: "#15803d" },
  { key: "food", title: "Food & Snacks", subtitle: "Name the food you see", icon: "🍎", color: "#fee2e2", accent: "#dc2626" },
  { key: "letters", title: "Learn Letters", subtitle: "Tap the letter you see", icon: "🔤", color: "#e0f2fe", accent: "#0284c7" },
  { key: "numbers", title: "Learn Numbers", subtitle: "Tap the number you see", icon: "🔢", color: "#fef3c7", accent: "#d97706" },
  { key: "colors", title: "Colors", subtitle: "Name the color you see", icon: "🎨", color: "#fce7f3", accent: "#be185d" },
  { key: "shapes", title: "Shapes", subtitle: "Name the shape you see", icon: "🔷", color: "#f3e8ff", accent: "#7e22ce" },
  { key: "emotions", title: "Emotions", subtitle: "How is this face feeling?", icon: "🙂", color: "#ffedd5", accent: "#c2410c" },
];

const MODE_TKEY: Record<GameMode, { title: TKey; sub: TKey }> = {
  animals: { title: "gAnimalMatch", sub: "gAnimalMatchSub" },
  food: { title: "gFood", sub: "gFoodSub" },
  letters: { title: "gLearnLetters", sub: "gLearnLettersSub" },
  numbers: { title: "gLearnNumbers", sub: "gLearnNumbersSub" },
  colors: { title: "gColors", sub: "gColorsSub" },
  shapes: { title: "gShapes", sub: "gShapesSub" },
  emotions: { title: "gEmotions", sub: "gEmotionsSub" },
};

export default function GamesScreen({ child, tab, onTabChange, labels }: Props) {
  const { settings } = useSettings();
  const { isSmallPhone, isTablet, isLargeTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const gTitle = (m: GameMode) => tt(MODE_TKEY[m].title);
  const gSub = (m: GameMode) => tt(MODE_TKEY[m].sub);
  const [mode, setMode] = useState<GameMode>("animals");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [tries, setTries] = useState(0);
  const [choiceCount, setChoiceCount] = useState<2 | 3>(3);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);

  const rounds = MODE_ROUNDS[mode];
  const round = rounds[roundIdx];
  const activeMeta = useMemo(() => MODES.find((m) => m.key === mode)!, [mode]);
  const progress = (roundIdx + 1) / rounds.length;

  const displayOptions = useMemo(() => {
    if (!round) return [];
    if (choiceCount === 2) {
      const wrong = round.options.find((o) => o !== round.answer) || round.options[1];
      return [round.answer, wrong].sort(() => 0.5 - Math.random());
    }
    return round.options;
  }, [round, choiceCount]);

  // Speak prompt helper
  function speakPrompt() {
    tapFeedback();
    const toSay = round.say || round.answer;
    speak(toSay, lang, settings.soundEnabled);
  }

  function choose(option: string) {
    if (feedback || finished) return;
    tapFeedback();

    if (option === round.answer) {
      const nextStreak = streak + 1;
      setFeedback("correct");
      setScore((s) => s + 1);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setTries((tr) => tr + 1);
      speak(tt("gGreatJob"), lang, settings.soundEnabled);
      recordGamePlayed(child.id);

      setTimeout(() => {
        setFeedback(null);
        if (roundIdx + 1 >= rounds.length) {
          setFinished(true);
          speak(tt("gYouFinished"), lang, settings.soundEnabled);
        } else {
          setRoundIdx((i) => i + 1);
        }
      }, 800);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTries((tr) => tr + 1);
      speak(tt("gTryAgain"), lang, settings.soundEnabled);
      setTimeout(() => setFeedback(null), 800);
    }
  }

  function restart(next: GameMode = mode) {
    tapFeedback();
    setMode(next);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRoundIdx(0);
    setTries(0);
    setFeedback(null);
    setFinished(false);
  }

  const accuracy = tries > 0 ? Math.round((score / tries) * 100) : 100;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header with Child Profile and Language */}
        <View style={styles.header}>
          <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={[styles.modeHeaderIcon, { backgroundColor: activeMeta.color }]}>
                  <Text style={{ fontSize: 20 }}>{activeMeta.icon}</Text>
                </View>
                <View>
                  <Text style={styles.title}>{gTitle(mode)}</Text>
                  <Text style={styles.subtitle}>{tt(MODE_TKEY[mode].sub)}</Text>
                </View>
              </View>
            </View>
            <LangBadge />
          </View>
        </View>

        {/* Top Game Mode Quick Selector Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeCarousel}>
            {MODES.map((m) => {
              const isSel = m.key === mode;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => restart(m.key)}
                  style={[
                    styles.carouselChip,
                    { backgroundColor: isSel ? m.color : "#ffffff", borderColor: isSel ? m.accent : "#e2e8f0" },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                  <Text style={[styles.carouselChipText, isSel && { color: m.accent, fontWeight: "800" }]}>
                    {gTitle(m.key)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Enhanced Metrics Stat Cards */}
          <View style={styles.statRow}>
            <View style={[styles.statPill, { borderLeftColor: "#f59e0b", borderLeftWidth: 4 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 16 }}>⭐</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <Text style={styles.statLabel}>{tt("gScore")}</Text>
            </View>

            <View style={[styles.statPill, { borderLeftColor: "#ef4444", borderLeftWidth: 4 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={[styles.statValue, { color: streak > 1 ? "#dc2626" : colors.textDark }]}>
                  {streak}
                </Text>
              </View>
              <Text style={styles.statLabel}>{tt("gStreak")}</Text>
            </View>

            <View style={[styles.statPill, { borderLeftColor: colors.forest, borderLeftWidth: 4 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 16 }}>🎯</Text>
                <Text style={styles.statValue}>{accuracy}%</Text>
              </View>
              <Text style={styles.statLabel}>{tt("gAccuracy")}</Text>
            </View>
          </View>

          {!finished && (
            <>
              {/* Round Progress Bar */}
              <View style={[styles.progressSection, isTablet && styles.progressSectionTablet]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.roundCount}>
                    {tt("gRound")} {roundIdx + 1} {tt("of")} {rounds.length}
                  </Text>
                  <Text style={styles.roundPct}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: activeMeta.accent }]} />
                </View>
              </View>

              {/* Main Interactive Prompt Stage */}
              <View
                style={[
                  styles.promptCard,
                  isTablet && styles.promptCardTablet,
                  feedback === "correct" && { borderColor: colors.greenDeep, backgroundColor: "#dcfce7" },
                  feedback === "wrong" && { borderColor: "#ef4444", backgroundColor: "#fee2e2" },
                ]}
              >
                <Text style={[styles.promptGlyph, isTablet && { fontSize: 104 }, isSmallPhone && { fontSize: 58 }]}>
                  {round.prompt}
                </Text>

                {/* Hear Question Speaker Button */}
                <Pressable onPress={speakPrompt} style={styles.speakPromptBtn}>
                  <Ionicons name="volume-high" size={18} color="white" />
                  <Text style={styles.speakPromptText}>{tt("gListen")}</Text>
                </Pressable>

                {feedback === "correct" && (
                  <View style={styles.feedbackBadgeSuccess}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.feedbackTextSuccess}>{tt("gCorrect")}</Text>
                  </View>
                )}

                {feedback === "wrong" && (
                  <View style={styles.feedbackBadgeWrong}>
                    <Ionicons name="alert-circle" size={16} color="white" />
                    <Text style={styles.feedbackTextWrong}>{tt("gTryAgain")}</Text>
                  </View>
                )}
              </View>

              {/* Difficulty Level: 2 vs 3 choices */}
              <View style={[styles.difficultyRow, isTablet && styles.difficultyRowTablet]}>
                <Text style={styles.diffLabel}>{tt("gChoicesLabel")}</Text>
                <Pressable
                  onPress={() => {
                    tapFeedback();
                    setChoiceCount(2);
                  }}
                  style={[styles.diffChip, choiceCount === 2 && styles.diffChipActive]}
                >
                  <Text style={[styles.diffChipText, choiceCount === 2 && styles.diffChipTextActive]}>
                    {tt("gEasyChoice")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    tapFeedback();
                    setChoiceCount(3);
                  }}
                  style={[styles.diffChip, choiceCount === 3 && styles.diffChipActive]}
                >
                  <Text style={[styles.diffChipText, choiceCount === 3 && styles.diffChipTextActive]}>
                    {tt("gStandardChoice")}
                  </Text>
                </Pressable>
              </View>

              {/* Multiple Choice Options Cards */}
              <View style={[styles.optionsGrid, isTablet && styles.optionsGridTablet]}>
                {displayOptions.map((opt) => {
                  const optEmoji = ANSWER_EMOJI[opt];
                  const isCorrect = feedback && opt === round.answer;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => choose(opt)}
                      style={[
                        styles.optionCard,
                        isTablet && styles.optionCardTablet,
                        isCorrect && styles.optionCardCorrect,
                        feedback === "wrong" && opt === round.answer && styles.optionCardHint,
                      ]}
                    >
                      {optEmoji ? <Text style={[styles.optEmoji, isTablet && { fontSize: 28 }]}>{optEmoji}</Text> : null}
                      <Text style={[styles.optionText, isTablet && { fontSize: 18 }, isCorrect && { color: "#166534", fontWeight: "900" }]}>
                        {gameAnswerLabel(opt, lang)}
                      </Text>
                      <Pressable
                        onPress={() => {
                          tapFeedback();
                          speak(opt, lang, settings.soundEnabled);
                        }}
                        style={styles.optSpeakerBtn}
                        hitSlop={8}
                      >
                        <Ionicons name="volume-medium-outline" size={isTablet ? 20 : 16} color="#64748b" />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Game Completed Celebration Card */}
          {finished && (
            <View style={[styles.finishCard, isTablet && styles.finishCardTablet]}>
              <Text style={{ fontSize: isTablet ? 80 : 64 }}>🎉</Text>
              <Text style={[styles.finishTitle, isTablet && { fontSize: 26 }]}>
                {gTitle(mode)} {tt("gYouFinished")}
              </Text>
              <Text style={styles.finishSub}>
                {child.name} completed the {gTitle(mode)} challenge!
              </Text>

              <View style={styles.finishStatsRow}>
                <View style={styles.finishStatBox}>
                  <Text style={[styles.finishStatNum, { color: colors.forest }]}>{accuracy}%</Text>
                  <Text style={styles.finishStatLabel}>Accuracy</Text>
                </View>
                <View style={styles.finishStatBox}>
                  <Text style={[styles.finishStatNum, { color: "#f59e0b" }]}>+{score} ⭐</Text>
                  <Text style={styles.finishStatLabel}>{tt("starsEarnedLabel")}</Text>
                </View>
                <View style={styles.finishStatBox}>
                  <Text style={[styles.finishStatNum, { color: "#dc2626" }]}>{bestStreak} 🔥</Text>
                  <Text style={styles.finishStatLabel}>{tt("bestStreakLabel")}</Text>
                </View>
              </View>

              <Pressable onPress={() => restart()} style={styles.finishBtn}>
                <Ionicons name="play" size={18} color="white" />
                <Text style={styles.finishBtnText}>{tt("gPlayAgain")}</Text>
              </Pressable>
            </View>
          )}

          {/* All Games Explorer Section */}
          <View style={styles.sectionDivider}>
            <Text style={styles.pickTitle}>{tt("exploreMoreGames")}</Text>
          </View>

          <View style={styles.gameGrid}>
            {MODES.map((m) => {
              const active = m.key === mode;
              const cardResponsiveStyle = isLargeTablet
                ? styles.gameCardLargeTablet
                : isTablet
                ? styles.gameCardTablet
                : isSmallPhone
                ? styles.gameCardSmallPhone
                : styles.gameCard;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => restart(m.key)}
                  style={[
                    styles.gameCard,
                    cardResponsiveStyle,
                    { backgroundColor: m.color, borderColor: active ? m.accent : "#e2e8f0" },
                    active && styles.gameCardActive,
                  ]}
                >
                  <View style={styles.gameCardTop}>
                    <Text style={{ fontSize: 32 }}>{m.icon}</Text>
                    {active && (
                      <View style={[styles.activeTag, { backgroundColor: m.accent }]}>
                        <Text style={styles.activeTagText}>{tt("playingBadge")}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.gameTileLabel, { color: "#0f172a" }]}>{gTitle(m.key)}</Text>
                  <Text style={styles.gameTileSub}>{gSub(m.key)}</Text>
                  <View style={styles.gameTileFooter}>
                    <Text style={[styles.gameRoundsText, { color: m.accent }]}>
                      {MODE_ROUNDS[m.key].length} {tt("exercisesSuffix")}
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={m.accent} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      <TabBar active={tab} onChange={onTabChange} labels={labels} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    width: "100%",
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerInnerTablet: {
    maxWidth: 840,
    alignSelf: "center",
  },
  modeHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 1 },

  /* Top Carousel */
  carouselContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modeCarousel: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 16, gap: 8 },
  carouselChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  carouselChipText: { fontSize: 12, fontWeight: "700", color: "#475569" },

  body: { padding: 18, gap: 16, alignItems: "center", paddingBottom: 60, width: "100%" },
  bodyTablet: { maxWidth: 840, alignSelf: "center", width: "100%", paddingHorizontal: 24 },

  /* Stats Pill */
  statRow: { flexDirection: "row", gap: 10, width: "100%" },
  statPill: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 2 },

  /* Progress Section */
  progressSection: { width: "100%", maxWidth: 380, gap: 6 },
  progressSectionTablet: { maxWidth: 580 },
  roundCount: { fontSize: 12, color: "#475569", fontWeight: "700" },
  roundPct: { fontSize: 12, color: "#64748b", fontWeight: "700" },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 5 },

  /* Main Prompt Stage */
  promptCard: {
    width: "100%",
    maxWidth: 380,
    minHeight: 200,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    gap: 12,
  },
  promptCardTablet: {
    maxWidth: 580,
    minHeight: 240,
    paddingVertical: 32,
    borderRadius: 28,
  },
  promptGlyph: { fontSize: 80, textAlign: "center" },
  speakPromptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  speakPromptText: { color: "white", fontSize: 12, fontWeight: "700" },
  feedbackBadgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  feedbackTextSuccess: { color: "white", fontSize: 13, fontWeight: "800" },
  feedbackBadgeWrong: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  feedbackTextWrong: { color: "white", fontSize: 13, fontWeight: "800" },

  /* Options Grid */
  optionsGrid: { width: "100%", maxWidth: 380, gap: 10 },
  optionsGridTablet: { maxWidth: 580, gap: 12 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardTablet: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  optionCardCorrect: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
  },
  optionCardHint: {
    borderColor: "#16a34a",
    borderWidth: 2,
  },
  optEmoji: { fontSize: 24 },
  optionText: { flex: 1, fontWeight: "700", fontSize: 16, color: "#1e293b" },
  optSpeakerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },

  /* Finish Card */
  finishCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  finishCardTablet: {
    maxWidth: 580,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  finishTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  finishSub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  finishStatsRow: { flexDirection: "row", gap: 12, marginVertical: 16, width: "100%" },
  finishStatBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  finishStatNum: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  finishStatLabel: { fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: "600" },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  finishBtnText: { color: "white", fontWeight: "800", fontSize: 15 },

  /* Game Grid Explorer */
  sectionDivider: { width: "100%", marginTop: 10, marginBottom: 2 },
  pickTitle: { fontSize: 12, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.5 },
  gameGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%" },
  gameCard: {
    width: "48%",
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1.5,
  },
  gameCardSmallPhone: {
    width: "100%",
  },
  gameCardTablet: {
    width: "31.5%",
    padding: 18,
  },
  gameCardLargeTablet: {
    width: "23.5%",
    padding: 18,
  },
  gameCardActive: { borderWidth: 2.5 },
  gameCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTagText: { color: "white", fontSize: 9.5, fontWeight: "800" },
  gameTileLabel: { fontWeight: "800", fontSize: 14.5, marginTop: 2 },
  gameTileSub: { fontSize: 11, color: "#64748b", lineHeight: 15 },
  gameTileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  gameRoundsText: { fontSize: 11, fontWeight: "700" },

  /* Difficulty Selector */
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    maxWidth: 380,
    justifyContent: "flex-end",
    marginTop: -4,
  },
  difficultyRowTablet: {
    maxWidth: 580,
  },
  diffLabel: { fontSize: 11.5, color: "#64748b", fontWeight: "700" },
  diffChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  diffChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  diffChipText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  diffChipTextActive: { color: "white" },
});
