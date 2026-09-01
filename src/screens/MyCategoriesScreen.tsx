import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Share, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { CustomCategory } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import {
  ensureCategoriesLoaded,
  listCategories,
  getCategory,
  deleteCategory,
  sortAlphabetical,
  setGrouping,
  moveWord,
  removeWord,
  groupIntoAlphaRanges,
  buildBackup,
  restoreBackup,
  type MoveKind,
} from "../modules/customCategories";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
  onCreate: () => void;
}

export default function MyCategoriesScreen({ onBack, onCreate }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [ready, setReady] = useState(false);
  const [cats, setCats] = useState<CustomCategory[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const refresh = () => setCats(listCategories());

  useEffect(() => {
    ensureCategoriesLoaded().then(() => {
      refresh();
      setReady(true);
    });
  }, []);

  const open = openId ? getCategory(openId) ?? null : null;

  function confirmDelete(cat: CustomCategory) {
    Alert.alert(`Delete "${cat.name}"?`, `${cat.words.length} words will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCategory(cat.id);
          setOpenId(null);
          refresh();
        },
      },
    ]);
  }

  async function exportAll() {
    const backup = buildBackup();
    if (backup.categoryCount === 0) {
      Alert.alert("Nothing to export yet.");
      return;
    }
    try {
      await Share.share({ title: "KiddoCare categories backup", message: JSON.stringify(backup, null, 2) });
    } catch {
      /* dismissed */
    }
  }

  function runImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      Alert.alert("That doesn't look like valid backup JSON.");
      return;
    }
    const report = restoreBackup(parsed, "merge");
    setImportOpen(false);
    setImportText("");
    refresh();
    Alert.alert(
      report.ok ? "Restore complete" : "Restored with warnings",
      `${report.restoredCategories} categories · ${report.restoredWords} words · ${report.restoredImages} images` +
        (report.issues.length ? `\n\n${report.issues.join("\n")}` : ""),
    );
  }

  function doMove(wordId: string, kind: MoveKind) {
    if (!open) return;
    moveWord(open.id, wordId, kind);
    refresh();
  }

  function doRemoveWord(wordId: string) {
    if (!open) return;
    removeWord(open.id, wordId);
    refresh();
  }

  if (open) {
    const grouped = open.grouping === "alpha-range";
    const buckets = grouped
      ? groupIntoAlphaRanges(open.words)
      : [{ label: "", words: [...open.words].sort((a, b) => a.order - b.order) }];

    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.header}>
            <Pressable onPress={() => setOpenId(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="white" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{open.name}</Text>
              <Text style={styles.headerSub}>{open.words.length} words</Text>
            </View>
            <Pressable onPress={() => confirmDelete(open)} style={styles.backBtn}>
              <Ionicons name="trash-outline" size={18} color="white" />
            </Pressable>
          </View>

          <View style={styles.toolbar}>
            <Pressable
              onPress={() => {
                sortAlphabetical(open.id);
                refresh();
                speak("Sorted A to Z", lang, settings.soundEnabled);
              }}
              style={styles.toolBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.forestDark} />
              <Text style={styles.toolBtnText}>Sort A–Z now</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setGrouping(open.id, grouped ? "none" : "alpha-range");
                refresh();
              }}
              style={[styles.toolBtn, grouped && styles.toolBtnActive]}
            >
              <Ionicons name="albums-outline" size={14} color={grouped ? "white" : colors.forestDark} />
              <Text style={[styles.toolBtnText, grouped && { color: "white" }]}>A–E · F–J groups</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {buckets.map((bucket) => (
              <View key={bucket.label || "all"} style={{ gap: 8 }}>
                {bucket.label ? <Text style={styles.bucketLabel}>{bucket.label}</Text> : null}
                {bucket.words.map((w) => (
                  <View key={w.id} style={styles.wordRow}>
                    <Text style={{ fontSize: 24 }}>{w.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordLabel}>{w.label}</Text>
                      {w.phrase !== w.label ? <Text style={styles.wordPhrase}>{w.phrase}</Text> : null}
                    </View>
                    <Pressable onPress={() => speak(w.phrase, lang, settings.soundEnabled)} hitSlop={6}>
                      <Ionicons name="volume-medium" size={18} color={colors.forest} />
                    </Pressable>
                    {!grouped && (
                      <>
                        <Pressable onPress={() => doMove(w.id, "up")} hitSlop={6}>
                          <Ionicons name="chevron-up" size={18} color={colors.textMid} />
                        </Pressable>
                        <Pressable onPress={() => doMove(w.id, "down")} hitSlop={6}>
                          <Ionicons name="chevron-down" size={18} color={colors.textMid} />
                        </Pressable>
                      </>
                    )}
                    <Pressable onPress={() => doRemoveWord(w.id)} hitSlop={6}>
                      <Ionicons name="close" size={18} color={colors.pinkDeep} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}
            {!grouped && <Text style={styles.moveHint}>Tip: use the arrows to reorder. Turn on grouping for A–E / F–J sections.</Text>}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Categories</Text>
            <Text style={styles.headerSub}>{cats.length} caregiver-made</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Pressable onPress={onCreate} style={styles.primaryBtn}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.primaryBtnText}>New category</Text>
          </Pressable>

          <View style={styles.ioRow}>
            <Pressable onPress={exportAll} style={styles.ioBtn}>
              <Ionicons name="share-outline" size={15} color={colors.forestDark} />
              <Text style={styles.ioBtnText}>Export / backup</Text>
            </Pressable>
            <Pressable onPress={() => setImportOpen(true)} style={styles.ioBtn}>
              <Ionicons name="download-outline" size={15} color={colors.forestDark} />
              <Text style={styles.ioBtnText}>Import</Text>
            </Pressable>
          </View>

          {ready && cats.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 44 }}>🗂️</Text>
              <Text style={styles.emptyText}>
                No custom categories yet. Tap "New category" to build one from a voice command or a pasted list.
              </Text>
            </View>
          )}

          {cats.map((c) => (
            <Pressable key={c.id} onPress={() => setOpenId(c.id)} style={styles.catRow}>
              <View style={styles.catIcon}>
                <Text style={{ fontSize: 22 }}>{c.words[0]?.emoji ?? "🗂️"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{c.name}</Text>
                <Text style={styles.catMeta}>
                  {c.words.length} words · {c.grouping === "alpha-range" ? "A–Z groups" : "custom order"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={() => setImportOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paste backup JSON</Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              placeholder="{ ... }"
              placeholderTextColor={colors.textLight}
              multiline
              style={styles.importInput}
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setImportOpen(false)} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
                <Text style={{ color: colors.textMid, fontWeight: "700" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={runImport} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
                <Text style={{ color: "white", fontWeight: "700" }}>Restore</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.forest,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  primaryBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: radius,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 15 },
  ioRow: { flexDirection: "row", gap: 10 },
  ioBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forestLight,
    borderRadius: radius,
    paddingVertical: 12,
  },
  ioBtnText: { color: colors.forestDark, fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyText: { color: colors.textMid, textAlign: "center", fontSize: 13, lineHeight: 20, paddingHorizontal: 20 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
  },
  catIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.cardMuted, alignItems: "center", justifyContent: "center" },
  catName: { fontSize: 16, fontWeight: "800", color: colors.textDark },
  catMeta: { fontSize: 12, color: colors.textMid, marginTop: 2 },
  toolbar: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 14 },
  toolBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: colors.forestLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolBtnActive: { backgroundColor: colors.forest },
  toolBtnText: { color: colors.forestDark, fontWeight: "700", fontSize: 12 },
  bucketLabel: { fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1, marginTop: 10 },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  wordLabel: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  wordPhrase: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  moveHint: { fontSize: 11, color: colors.textLight, marginTop: 12, lineHeight: 16 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: colors.bg, borderRadius: radius, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark, marginBottom: 10 },
  importInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 12,
    minHeight: 140,
    fontSize: 12,
    color: colors.textDark,
    textAlignVertical: "top",
  },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: radius, paddingVertical: 12, alignItems: "center" },
});
