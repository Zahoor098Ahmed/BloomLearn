import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, CustomCategory, CustomWord, TabScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import {
  ensureCategoriesLoaded,
  topLevelCategories,
  childCategories,
  getCategory,
  createBlankCategory,
} from "../modules/customCategories";
import { playWord, playSentence, type SpokenWord } from "../modules/audio";
import { recordWordUsage } from "../modules/storage";
import { tapFeedback, selectFeedback } from "../modules/haptics";
import LangBadge from "../components/LangBadge";
import TabBar from "../components/TabBar";
import AddByVoiceScreen from "./AddByVoiceScreen";
import { colors } from "../theme";

interface Props {
  child: ChildProfile;
  tab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  labels: Record<TabScreen, string>;
}

interface Chip extends SpokenWord {
  id: string;
  emoji: string;
  imageUri?: string;
}

export default function AACBoardScreen({ child, tab, onTabChange, labels }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const cols = Math.min(5, Math.max(2, settings.boardColumns || 3));

  const [ready, setReady] = useState(false);
  const [path, setPath] = useState<string[]>([]); // category id stack
  const [sentence, setSentence] = useState<Chip[]>([]);
  const [tick, setTick] = useState(0); // re-read after edits elsewhere
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<string | null>(null);

  useEffect(() => {
    ensureCategoriesLoaded().then(() => setReady(true));
  }, []);

  const currentId = path[path.length - 1] ?? null;
  const folders: CustomCategory[] = useMemo(
    () => (currentId ? childCategories(currentId) : topLevelCategories()),
    [currentId, ready, tick],
  );
  const current = currentId ? getCategory(currentId) : null;
  const words: CustomWord[] = useMemo(
    () => (current ? [...current.words].sort((a, b) => a.order - b.order) : []),
    [current, ready, tick],
  );

  function speakWords(): SpokenWord[] {
    return sentence.map((c) => ({ label: c.label, audioUri: c.audioUri, useTextToSpeech: c.useTextToSpeech }));
  }

  /** Child taps "Make a word": add straight into the open folder, or a "My Words" folder. */
  function startVoiceAdd() {
    selectFeedback();
    let target = currentId;
    if (!target) {
      const existing = topLevelCategories().find((c) => c.name.toLowerCase() === "my words");
      const folder = existing ?? createBlankCategory({ name: "My Words", icon: "🗣️" });
      target = folder.id;
      setPath([folder.id]);
    }
    setVoiceTarget(target);
    setVoiceOpen(true);
  }

  function tapWord(w: CustomWord) {
    tapFeedback();
    recordWordUsage(child.id, w.label);
    void playWord({ label: w.phrase || w.label, audioUri: w.audioUri, useTextToSpeech: w.useTextToSpeech }, lang, settings.speechRate);
    setSentence((prev) => [
      ...prev,
      { id: `${w.id}-${prev.length}`, label: w.phrase || w.label, emoji: w.emoji, imageUri: w.imageUri, audioUri: w.audioUri, useTextToSpeech: w.useTextToSpeech },
    ]);
  }

  function openFolder(id: string) {
    selectFeedback();
    setPath((p) => [...p, id]);
  }

  function goCrumb(idx: number) {
    setPath((p) => p.slice(0, idx)); // idx 0 = Home
  }

  function speakSentence() {
    if (sentence.length === 0) return;
    tapFeedback();
    void playSentence(speakWords(), lang, settings.speechRate);
  }

  const tileSize = { width: `${100 / cols}%` as const };
  const canBack = path.length > 0;
  const title = current?.name ?? "Talk";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => (canBack ? goCrumb(path.length - 1) : undefined)}
            disabled={!canBack}
            style={[styles.navBtn, !canBack && styles.navBtnGhost]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={canBack ? colors.forest : colors.textLight} />
          </Pressable>
          <Pressable onPress={() => goCrumb(0)} disabled={!canBack} style={[styles.navBtn, !canBack && styles.navBtnGhost]} accessibilityLabel="Home">
            <Ionicons name="home" size={18} color={canBack ? colors.forest : colors.textLight} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <LangBadge />
        </View>

        {/* message / sentence bar */}
        <View style={styles.msgBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.msgScroll}
            keyboardShouldPersistTaps="handled"
          >
            {sentence.length === 0 ? (
              <Text style={styles.msgPlaceholder}>Tap pictures to build a sentence…</Text>
            ) : (
              sentence.map((c) => (
                <View key={c.id} style={styles.msgChip}>
                  {c.imageUri ? (
                    <Image source={{ uri: c.imageUri }} style={styles.msgChipImg} />
                  ) : (
                    <Text style={styles.msgChipEmoji}>{c.emoji}</Text>
                  )}
                  <Text style={styles.msgChipText} numberOfLines={1}>{c.label}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            onPress={() => setSentence((p) => p.slice(0, -1))}
            disabled={sentence.length === 0}
            style={[styles.msgMiniBtn, sentence.length === 0 && styles.msgBtnOff]}
            accessibilityLabel="Remove last word"
          >
            <Ionicons name="backspace-outline" size={18} color={colors.textMid} />
          </Pressable>
          <Pressable
            onPress={() => setSentence([])}
            disabled={sentence.length === 0}
            style={[styles.msgMiniBtn, sentence.length === 0 && styles.msgBtnOff]}
            accessibilityLabel="Clear sentence"
          >
            <Ionicons name="trash-outline" size={17} color={colors.textMid} />
          </Pressable>
          <Pressable
            onPress={speakSentence}
            disabled={sentence.length === 0}
            style={[styles.playBtn, sentence.length === 0 && styles.msgBtnOff]}
            accessibilityLabel="Speak sentence"
          >
            <Ionicons name="play" size={22} color="white" />
          </Pressable>
        </View>

        {/* grid */}
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {!ready ? null : (
            <>
              {folders.map((f) => {
                const c = f.color ?? colors.forest;
                return (
                  <View key={f.id} style={[styles.cell, tileSize]}>
                    <Pressable onPress={() => openFolder(f.id)} style={[styles.tile, styles.folderTile, { borderColor: c }]}>
                      <View style={[styles.labelBar, { backgroundColor: c }]}>
                        <Text style={styles.labelText} numberOfLines={1}>{f.name}</Text>
                      </View>
                      <View style={[styles.body, { backgroundColor: c + "12" }]}>
                        <Text style={styles.folderIcon}>{f.icon ?? "📁"}</Text>
                      </View>
                      <View style={styles.folderTag}>
                        <Ionicons name="chevron-forward" size={12} color={c} />
                      </View>
                    </Pressable>
                  </View>
                );
              })}
              {words.map((w) => (
                <View key={w.id} style={[styles.cell, tileSize]}>
                  <Pressable onPress={() => tapWord(w)} style={[styles.tile, { borderColor: colors.forest }]}>
                    <View style={[styles.labelBar, { backgroundColor: colors.forest }]}>
                      <Text style={styles.labelText} numberOfLines={1}>{w.label}</Text>
                    </View>
                    <View style={styles.body}>
                      {w.imageUri ? (
                        <Image source={{ uri: w.imageUri }} style={styles.wordImg} resizeMode="cover" />
                      ) : (
                        <Text style={styles.wordEmoji}>{w.emoji}</Text>
                      )}
                    </View>
                  </Pressable>
                </View>
              ))}
              {folders.length === 0 && words.length === 0 && (
                <Text style={styles.emptyBoard}>This folder is empty. Add words with the mic button, or in the Board editor.</Text>
              )}
            </>
          )}
          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      {/* floating "make a word" */}
      <Pressable onPress={startVoiceAdd} style={styles.fab} accessibilityLabel="Make a new word by speaking">
        <Ionicons name="mic" size={20} color="white" />
        <Text style={styles.fabText}>Make a word</Text>
      </Pressable>

      <TabBar active={tab} onChange={onTabChange} labels={labels} />

      <AddByVoiceScreen
        visible={voiceOpen}
        presetCategoryId={voiceTarget}
        childMode
        onClose={() => setVoiceOpen(false)}
        onSaved={() => setTick((t) => t + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnGhost: { backgroundColor: "transparent", borderColor: "transparent" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: colors.textDark, marginLeft: 2 },

  msgBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  msgScroll: { alignItems: "center", gap: 8, paddingRight: 6, minHeight: 46 },
  msgPlaceholder: { color: colors.textLight, fontSize: 14, paddingVertical: 14, paddingLeft: 4 },
  msgChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forestLight,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    maxWidth: 132,
  },
  msgChipImg: { width: 26, height: 26, borderRadius: 6 },
  msgChipEmoji: { fontSize: 20 },
  msgChipText: { fontSize: 13, fontWeight: "700", color: colors.forestDark },
  msgBtnOff: { opacity: 0.35 },
  msgMiniBtn: { width: 36, height: 40, borderRadius: 10, backgroundColor: colors.cardMuted, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 52, height: 40, borderRadius: 10, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },

  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, paddingTop: 2 },
  cell: { padding: 5 },
  tile: {
    aspectRatio: 0.92,
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  folderTile: {},
  labelBar: { paddingVertical: 6, paddingHorizontal: 4, alignItems: "center" },
  labelText: { color: "white", fontWeight: "800", fontSize: 13 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  folderIcon: { fontSize: 40 },
  folderTag: { position: "absolute", top: 6, right: 6, backgroundColor: "#ffffff", borderRadius: 8, padding: 2 },
  wordEmoji: { fontSize: 46 },
  wordImg: { width: "100%", height: "100%" },
  emptyBoard: { color: colors.textLight, fontSize: 14, textAlign: "center", padding: 36, width: "100%", lineHeight: 21 },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.forest,
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 18,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabText: { color: "white", fontWeight: "800", fontSize: 13 },
});
