import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { t, TKey } from "../modules/i18n";
import { parseCategoryCommand, resolveItems, seedKeys, SEED_LISTS } from "../modules/commandParser";
import { resolveEmoji, nextEmojiVariant, generateImageForWord, hasImageProvider } from "../modules/wordImage";
import { createCategory } from "../modules/customCategories";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
  onSaved: (categoryId: string) => void;
}

interface Draft {
  label: string;
  phrase: string;
  emoji: string;
  imageUri?: string;
}

export default function CategoryBuilderScreen({ onBack, onSaved }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  const [command, setCommand] = useState("");
  const [listBlock, setListBlock] = useState("");
  const [step, setStep] = useState<"input" | "review">("input");
  const [catName, setCatName] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const seeds = useMemo(() => seedKeys(), []);

  function generate() {
    const parsed = parseCategoryCommand(command, listBlock);
    const { items, note } = resolveItems(parsed);
    if (items.length === 0) {
      Alert.alert(tt("cbNothingToAddTitle"), note ?? tt("cbTryBuiltIn"));
      return;
    }
    const built: Draft[] = items.map((label, i) => ({ label, phrase: label, emoji: resolveEmoji(label, i) }));
    setCatName(parsed.categoryName);
    setDrafts(built);
    setStep("review");
    if (note) setTimeout(() => Alert.alert(tt("cbHeadsUpTitle"), note), 200);
    if (hasImageProvider()) void hydrateImages(built);
  }

  async function hydrateImages(built: Draft[]) {
    setBusy(true);
    const out = [...built];
    for (let i = 0; i < out.length; i++) {
      const uri = await generateImageForWord(out[i].label);
      if (uri) {
        out[i] = { ...out[i], imageUri: uri };
        setDrafts([...out]);
      }
    }
    setBusy(false);
  }

  function useSeed(key: string) {
    setCommand(`Make a category of ${SEED_LISTS[key].title}`);
    setListBlock("");
  }

  function regenEmoji(idx: number) {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, emoji: nextEmojiVariant(d.label, d.emoji) } : d)));
  }

  function removeDraft(idx: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyEdit(idx: number, label: string, phrase: string) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, label: label.trim() || d.label, phrase: phrase.trim() || label.trim() } : d)),
    );
    setEditIdx(null);
  }

  function save() {
    if (drafts.length === 0) {
      Alert.alert(tt("cbAddWordFirst"));
      return;
    }
    const cat = createCategory({
      name: catName,
      source: listBlock.trim() ? "list" : "generated",
      words: drafts.map((d) => ({ label: d.label, phrase: d.phrase, emoji: d.emoji, imageUri: d.imageUri })),
    });
    speak(
      tt("cbCategoryCreatedSpeech").replace("{name}", cat.name).replace("{count}", String(cat.words.length)),
      lang,
      settings.soundEnabled,
    );
    onSaved(cat.id);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => (step === "review" ? setStep("input") : onBack())} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{step === "input" ? tt("cbHeaderTitle") : tt("cbReviewTitle")}</Text>
            <Text style={styles.headerSub}>
              {step === "input"
                ? tt("cbHeaderSubInput")
                : tt("cbHeaderSubReview").replace("{name}", catName).replace("{count}", String(drafts.length))}
            </Text>
          </View>
        </View>

        {step === "input" ? (
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>{tt("cbCommandLabel")}</Text>
            <TextInput
              value={command}
              onChangeText={setCommand}
              placeholder={tt("cbCommandPlaceholder")}
              placeholderTextColor={colors.textLight}
              style={styles.input}
              multiline
            />

            <Text style={styles.label}>{tt("cbListLabel")}</Text>
            <TextInput
              value={listBlock}
              onChangeText={setListBlock}
              placeholder={tt("cbListPlaceholder")}
              placeholderTextColor={colors.textLight}
              style={[styles.input, { minHeight: 120 }]}
              multiline
            />

            <Text style={styles.label}>{tt("cbQuickStart")}</Text>
            <View style={styles.seedWrap}>
              {seeds.map((s) => (
                <Pressable key={s.key} onPress={() => useSeed(s.key)} style={styles.seedChip}>
                  <Text style={styles.seedChipText}>
                    {s.title} · {s.count}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={generate} style={styles.primaryBtn}>
              <Ionicons name="sparkles" size={18} color="white" />
              <Text style={styles.primaryBtnText}>{tt("cbGenerateBtn")}</Text>
            </Pressable>

            <Text style={styles.hint}>{tt("cbHint")}</Text>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>{tt("cbCategoryNameLabel")}</Text>
            <TextInput value={catName} onChangeText={setCatName} style={styles.input} />

            {busy && <Text style={styles.hint}>{tt("cbGeneratingImages")}</Text>}

            <View style={styles.grid}>
              {drafts.map((d, i) => (
                <View key={`${d.label}-${i}`} style={styles.cell}>
                  <Pressable onPress={() => regenEmoji(i)} style={styles.cellArt}>
                    <Text style={{ fontSize: 34 }}>{d.emoji}</Text>
                    <View style={styles.regenBadge}>
                      <Ionicons name="refresh" size={10} color={colors.textMid} />
                    </View>
                  </Pressable>
                  <Text numberOfLines={1} style={styles.cellLabel}>
                    {d.label}
                  </Text>
                  <View style={styles.cellActions}>
                    <Pressable onPress={() => setEditIdx(i)} hitSlop={8}>
                      <Ionicons name="create-outline" size={16} color={colors.blueDeep} />
                    </Pressable>
                    <Pressable onPress={() => removeDraft(i)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.pinkDeep} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <Pressable onPress={save} style={styles.primaryBtn}>
              <Ionicons name="checkmark" size={18} color="white" />
              <Text style={styles.primaryBtnText}>{tt("cbApproveSaveBtn").replace("{count}", String(drafts.length))}</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>

      <EditModal
        visible={editIdx !== null}
        draft={editIdx !== null ? drafts[editIdx] : null}
        onCancel={() => setEditIdx(null)}
        onSave={(label, phrase) => editIdx !== null && applyEdit(editIdx, label, phrase)}
        lang={lang}
      />
    </View>
  );
}

function EditModal({
  visible,
  draft,
  onCancel,
  onSave,
  lang,
}: {
  visible: boolean;
  draft: Draft | null;
  onCancel: () => void;
  onSave: (label: string, phrase: string) => void;
  lang: Parameters<typeof t>[1];
}) {
  const [label, setLabel] = useState("");
  const [phrase, setPhrase] = useState("");
  const tt = (k: TKey) => t(k, lang);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={() => {
        setLabel(draft?.label ?? "");
        setPhrase(draft?.phrase ?? "");
      }}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{tt("cbEditWordTitle")}</Text>
          <Text style={styles.label}>{tt("cbLabelField")}</Text>
          <TextInput value={label} onChangeText={setLabel} style={styles.input} />
          <Text style={styles.label}>{tt("cbSpokenPhraseField")}</Text>
          <TextInput value={phrase} onChangeText={setPhrase} style={styles.input} />
          <View style={styles.modalRow}>
            <Pressable onPress={onCancel} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
              <Text style={{ color: colors.textMid, fontWeight: "700" }}>{tt("cancel")}</Text>
            </Pressable>
            <Pressable onPress={() => onSave(label, phrase)} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
              <Text style={{ color: "white", fontWeight: "700" }}>{tt("save")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  label: { fontWeight: "700", fontSize: 13, color: colors.textMid, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
    textAlignVertical: "top",
  },
  seedWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seedChip: { backgroundColor: colors.forestLight, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  seedChipText: { color: colors.forestDark, fontSize: 12, fontWeight: "700" },
  primaryBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: radius,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 15 },
  hint: { fontSize: 12, color: colors.textLight, lineHeight: 18, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  cell: {
    width: "30.5%",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
  cellArt: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.cardMuted, alignItems: "center", justifyContent: "center" },
  regenBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cellLabel: { fontSize: 12, fontWeight: "700", color: colors.textDark, maxWidth: "100%" },
  cellActions: { flexDirection: "row", gap: 14 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: colors.bg, borderRadius: radius, padding: 20, gap: 4 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark, marginBottom: 6 },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: radius, paddingVertical: 12, alignItems: "center" },
});
