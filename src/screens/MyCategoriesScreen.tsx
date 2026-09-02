import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Share, TextInput, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { CustomCategory, CustomWord } from "../types";
import { useSettings } from "../context/SettingsContext";
import { playWord } from "../modules/audio";
import {
  ensureCategoriesLoaded,
  listCategories,
  topLevelCategories,
  getCategory,
  deleteCategoryDeep,
  sortAlphabetical,
  setGrouping,
  moveWord,
  reorderCategory,
  createBlankCategory,
  updateCategoryMeta,
  groupIntoAlphaRanges,
  buildBackup,
  restoreBackup,
  type MoveKind,
} from "../modules/customCategories";
import WordEditor from "../components/WordEditor";
import { colors, radius } from "../theme";

const CAT_ICONS = ["📁", "💬", "🍎", "🙂", "👪", "🏃", "🎨", "🧩", "🚗", "🐾", "🏫", "🛏️"];

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
  const [editorWord, setEditorWord] = useState<CustomWord | "new" | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaName, setMetaName] = useState("");
  const [metaIcon, setMetaIcon] = useState("📁");
  const [tick, setTick] = useState(0);

  const refresh = () => {
    setCats(listCategories());
    setTick((t) => t + 1);
  };

  useEffect(() => {
    ensureCategoriesLoaded().then(() => {
      refresh();
      setReady(true);
    });
  }, []);

  const open = openId ? getCategory(openId) ?? null : null;

  function confirmDelete(cat: CustomCategory) {
    Alert.alert(`Delete "${cat.name}"?`, `${cat.words.length} words (and any sub-folders) will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCategoryDeep(cat.id);
          setOpenId(null);
          refresh();
        },
      },
    ]);
  }

  function openMeta(cat: CustomCategory) {
    setMetaName(cat.name);
    setMetaIcon(cat.icon ?? "📁");
    setMetaOpen(true);
  }
  function saveMeta() {
    if (openId) updateCategoryMeta(openId, { name: metaName.trim() || undefined, icon: metaIcon });
    setMetaOpen(false);
    refresh();
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
              <Text style={styles.headerTitle}>{open.icon} {open.name}</Text>
              <Text style={styles.headerSub}>{open.words.length} words</Text>
            </View>
            <Pressable onPress={() => openMeta(open)} style={styles.backBtn}>
              <Ionicons name="create-outline" size={18} color="white" />
            </Pressable>
            <Pressable onPress={() => confirmDelete(open)} style={styles.backBtn}>
              <Ionicons name="trash-outline" size={18} color="white" />
            </Pressable>
          </View>

          <View style={styles.toolbar}>
            <Pressable onPress={() => setEditorWord("new")} style={[styles.toolBtn, styles.toolBtnActive]}>
              <Ionicons name="add" size={14} color="white" />
              <Text style={[styles.toolBtnText, { color: "white" }]}>Add word</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                sortAlphabetical(open.id);
                refresh();
              }}
              style={styles.toolBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.forestDark} />
              <Text style={styles.toolBtnText}>Sort A–Z</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setGrouping(open.id, grouped ? "none" : "alpha-range");
                refresh();
              }}
              style={[styles.toolBtn, grouped && styles.toolBtnActive]}
            >
              <Ionicons name="albums-outline" size={14} color={grouped ? "white" : colors.forestDark} />
              <Text style={[styles.toolBtnText, grouped && { color: "white" }]}>Groups</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {buckets.map((bucket) => (
              <View key={bucket.label || "all"} style={{ gap: 8 }}>
                {bucket.label ? <Text style={styles.bucketLabel}>{bucket.label}</Text> : null}
                {bucket.words.map((w) => (
                  <Pressable key={w.id} onPress={() => setEditorWord(w)} style={styles.wordRow}>
                    {w.imageUri ? (
                      <Image source={{ uri: w.imageUri }} style={styles.wordThumb} />
                    ) : (
                      <Text style={{ fontSize: 24 }}>{w.emoji}</Text>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordLabel}>{w.label}</Text>
                      <Text style={styles.wordPhrase}>{w.audioUri && !w.useTextToSpeech ? "🎙️ recorded voice" : "🔊 text-to-speech"}</Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        playWord({ label: w.phrase || w.label, audioUri: w.audioUri, useTextToSpeech: w.useTextToSpeech }, lang, settings.speechRate)
                      }
                      hitSlop={6}
                    >
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
                  </Pressable>
                ))}
              </View>
            ))}
            {!grouped && <Text style={styles.moveHint}>Tap a word to edit its picture and voice. Use the arrows to reorder.</Text>}
          </ScrollView>
        </SafeAreaView>

        <WordEditor
          visible={editorWord !== null}
          catId={open.id}
          word={editorWord === "new" ? null : editorWord}
          onClose={() => setEditorWord(null)}
          onSaved={refresh}
        />

        <Modal visible={metaOpen} transparent animationType="fade" onRequestClose={() => setMetaOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Folder</Text>
              <TextInput value={metaName} onChangeText={setMetaName} placeholder="Folder name" placeholderTextColor={colors.textLight} style={styles.importInput2} />
              <View style={styles.iconWrap}>
                {CAT_ICONS.map((ic) => (
                  <Pressable key={ic} onPress={() => setMetaIcon(ic)} style={[styles.iconBtn, metaIcon === ic && styles.iconBtnOn]}>
                    <Text style={{ fontSize: 20 }}>{ic}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalRow}>
                <Pressable onPress={() => setMetaOpen(false)} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
                  <Text style={{ color: colors.textMid, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveMeta} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
                  <Text style={{ color: "white", fontWeight: "700" }}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
          <View style={styles.ioRow}>
            <Pressable
              onPress={() => {
                const c = createBlankCategory({ name: "New Folder" });
                refresh();
                setOpenId(c.id);
              }}
              style={styles.primaryBtn}
            >
              <Ionicons name="folder-open" size={16} color="white" />
              <Text style={styles.primaryBtnText}>New folder</Text>
            </Pressable>
            <Pressable onPress={onCreate} style={[styles.primaryBtn, { backgroundColor: colors.blueDeep }]}>
              <Ionicons name="sparkles" size={16} color="white" />
              <Text style={styles.primaryBtnText}>Bulk build</Text>
            </Pressable>
          </View>

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
              <Text style={styles.emptyText}>No folders yet. Tap "New folder" to start, or "Bulk build" to generate one.</Text>
            </View>
          )}

          {topLevelCategories().map((c, i, arr) => (
            <View key={c.id} style={styles.catRow}>
              <Pressable onPress={() => setOpenId(c.id)} style={styles.catRowMain}>
                <View style={[styles.catIcon, { backgroundColor: (c.color ?? colors.forest) + "22" }]}>
                  <Text style={{ fontSize: 22 }}>{c.icon ?? "📁"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{c.name}</Text>
                  <Text style={styles.catMeta}>{c.words.length} words</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => { reorderCategory(c.id, "up"); refresh(); }} disabled={i === 0} hitSlop={6} style={i === 0 && { opacity: 0.3 }}>
                <Ionicons name="chevron-up" size={18} color={colors.textMid} />
              </Pressable>
              <Pressable onPress={() => { reorderCategory(c.id, "down"); refresh(); }} disabled={i === arr.length - 1} hitSlop={6} style={i === arr.length - 1 && { opacity: 0.3 }}>
                <Ionicons name="chevron-down" size={18} color={colors.textMid} />
              </Pressable>
            </View>
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
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingRight: 12,
  },
  catRowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  catIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.cardMuted, alignItems: "center", justifyContent: "center" },
  wordThumb: { width: 34, height: 34, borderRadius: 7, backgroundColor: colors.cardMuted },
  importInput2: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, borderRadius: radius, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textDark },
  iconWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  iconBtnOn: { borderColor: colors.forest, backgroundColor: colors.forestLight },
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
