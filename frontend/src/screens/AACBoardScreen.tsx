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

  const crumbs = useMemo(() => {
    const out: { id: string | null; name: string }[] = [{ id: null, name: "Home" }];
    let acc: string[] = [];
    for (const id of path) {
      acc = [...acc, id];
      out.push({ id, name: getCategory(id)?.name ?? "…" });
    }
    return out;
  }, [path, tick]);

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

  const tileSize = { flexBasis: `${100 / cols}%` as const };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* message / sentence bar */}
        <View style={styles.msgBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.msgScroll}>
            {sentence.length === 0 ? (
              <Text style={styles.msgPlaceholder}>Tap words to build a sentence</Text>
            ) : (
              sentence.map((c) => (
                <View key={c.id} style={styles.msgChip}>
                  {c.imageUri ? (
                    <Image source={{ uri: c.imageUri }} style={styles.msgChipImg} />
                  ) : (
                    <Text style={styles.msgChipEmoji}>{c.emoji}</Text>
                  )}
                  <Text style={styles.msgChipText} numberOfLines={1}>
                    {c.label}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.msgActions}>
            <Pressable
              onPress={() => setSentence((p) => p.slice(0, -1))}
              disabled={sentence.length === 0}
              style={[styles.msgBtn, sentence.length === 0 && styles.msgBtnOff]}
              accessibilityLabel="Remove last word"
            >
              <Ionicons name="backspace-outline" size={20} color={colors.textMid} />
            </Pressable>
            <Pressable
              onPress={() => setSentence([])}
              disabled={sentence.length === 0}
              style={[styles.msgBtn, sentence.length === 0 && styles.msgBtnOff]}
              accessibilityLabel="Clear sentence"
            >
              <Ionicons name="close" size={20} color={colors.textMid} />
            </Pressable>
            <Pressable
              onPress={speakSentence}
              disabled={sentence.length === 0}
              style={[styles.speakBtn, sentence.length === 0 && styles.msgBtnOff]}
              accessibilityLabel="Speak sentence"
            >
              <Ionicons name="volume-high" size={22} color="white" />
            </Pressable>
          </View>
        </View>

        {/* breadcrumb */}
        <View style={styles.crumbRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 4 }}>
            {crumbs.map((cr, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                {i > 0 && <Ionicons name="chevron-forward" size={13} color={colors.textLight} />}
                <Pressable onPress={() => goCrumb(i)} disabled={i === crumbs.length - 1} style={styles.crumbBtn}>
                  <Text style={[styles.crumbText, i === crumbs.length - 1 && styles.crumbActive]}>{cr.name}</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
          <Pressable onPress={startVoiceAdd} style={styles.makeWordBtn} accessibilityLabel="Make a new word by speaking">
            <Ionicons name="mic" size={16} color="white" />
            <Text style={styles.makeWordText}>Make a word</Text>
          </Pressable>
          <LangBadge />
        </View>

        {/* grid */}
        <ScrollView contentContainerStyle={styles.grid}>
          {!ready ? null : (
            <>
              {folders.map((f) => (
                <View key={f.id} style={[styles.cellWrap, tileSize]}>
                  <Pressable onPress={() => openFolder(f.id)} style={[styles.tile, { borderColor: f.color ?? colors.forest }]}>
                    <View style={[styles.tileLabelBar, { backgroundColor: f.color ?? colors.forest }]}>
                      <Text style={styles.tileLabelText} numberOfLines={1}>{f.name}</Text>
                    </View>
                    <View style={styles.tileBody}>
                      <Text style={styles.folderIcon}>{f.icon ?? "📁"}</Text>
                      <View style={styles.folderCorner}><Ionicons name="folder-open" size={12} color={f.color ?? colors.forest} /></View>
                    </View>
                  </Pressable>
                </View>
              ))}
              {words.map((w) => (
                <View key={w.id} style={[styles.cellWrap, tileSize]}>
                  <Pressable onPress={() => tapWord(w)} style={[styles.tile, { borderColor: colors.forest }]}>
                    <View style={[styles.tileLabelBar, { backgroundColor: colors.forest }]}>
                      <Text style={styles.tileLabelText} numberOfLines={1}>{w.label}</Text>
                    </View>
                    <View style={styles.tileBody}>
                      {w.imageUri ? (
                        <Image source={{ uri: w.imageUri }} style={styles.wordImg} resizeMode="contain" />
                      ) : (
                        <Text style={styles.wordEmoji}>{w.emoji}</Text>
                      )}
                    </View>
                  </Pressable>
                </View>
              ))}
              {folders.length === 0 && words.length === 0 && (
                <Text style={styles.emptyBoard}>This folder is empty. A parent can add words in the Board editor.</Text>
              )}
            </>
          )}
          <View style={{ height: 12 }} />
        </ScrollView>
      </SafeAreaView>
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
  msgBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  msgScroll: { alignItems: "center", gap: 8, paddingRight: 8, minHeight: 44 },
  msgPlaceholder: { color: colors.textLight, fontSize: 13, fontStyle: "italic", paddingVertical: 12 },
  msgChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forestLight,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: 130,
  },
  msgChipImg: { width: 22, height: 22, borderRadius: 5 },
  msgChipEmoji: { fontSize: 18 },
  msgChipText: { fontSize: 13, fontWeight: "700", color: colors.forestDark },
  msgActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  msgBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.cardMuted, alignItems: "center", justifyContent: "center" },
  msgBtnOff: { opacity: 0.4 },
  speakBtn: { width: 46, height: 38, borderRadius: 10, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  crumbRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  makeWordBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.forest, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  makeWordText: { color: "white", fontWeight: "800", fontSize: 12 },
  crumbBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  crumbText: { fontSize: 13, color: colors.blueDeep, fontWeight: "600" },
  crumbActive: { color: colors.textMid },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 8 },
  cellWrap: { padding: 4 },
  tile: {
    borderRadius: 10,
    borderWidth: 3,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    minHeight: 116,
  },
  tileLabelBar: { paddingVertical: 5, paddingHorizontal: 4, alignItems: "center" },
  tileLabelText: { color: "white", fontWeight: "800", fontSize: 12.5 },
  tileBody: { flex: 1, alignItems: "center", justifyContent: "center", padding: 6, backgroundColor: "#ffffff" },
  folderIcon: { fontSize: 34 },
  folderCorner: { position: "absolute", bottom: 4, right: 4 },
  wordEmoji: { fontSize: 40 },
  wordImg: { width: "100%", height: 66 },
  emptyBoard: { color: colors.textLight, fontSize: 13, textAlign: "center", padding: 30, width: "100%" },
});
