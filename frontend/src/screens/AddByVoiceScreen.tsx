import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image, Modal, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { CustomCategory } from "../types";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { startRecording, stopRecordingTemp } from "../modules/audio";
import { transcribeAudio, isAiConfigured, generateWordImage } from "../modules/aiImage";
import {
  searchImages,
  downloadTileImage,
  saveLocalTileImage,
  saveGeneratedImage,
  hasPixabayKey,
  type ImageHit,
  type ImageSource,
} from "../modules/imageSearch";
import { topLevelCategories, createBlankCategory, addWord } from "../modules/customCategories";
import { resolveEmoji } from "../modules/wordImage";
import { colors, radius } from "../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** When set, the new word is added straight to this folder (skips the folder picker). */
  presetCategoryId?: string | null;
  /** Child-facing wording (launched from the Speak board, not the parent editor). */
  childMode?: boolean;
}

type Step = "speak" | "confirm" | "image" | "category" | "done";
const CAT_ICONS = ["📁", "💬", "🍎", "🙂", "👪", "🏃", "🎨", "🧩", "🚗", "🐾", "🏫", "🛏️"];

export default function AddByVoiceScreen({ visible, onClose, onSaved, presetCategoryId, childMode }: Props) {
  const { settings } = useSettings();
  const langHint = (settings.language || "en-US").split("-")[0];

  const [step, setStep] = useState<Step>("speak");
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState<string | null>(null);
  const [word, setWord] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [hits, setHits] = useState<ImageHit[]>([]);
  const [imgSource, setImgSource] = useState<ImageSource>("arasaac");
  const [imgError, setImgError] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [cats, setCats] = useState<CustomCategory[]>([]);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  function reset() {
    setStep("speak");
    setRecording(false);
    setThinking(null);
    setWord("");
    setImageUri(undefined);
    setHits([]);
    setImgError(null);
    setImgSource("arasaac");
    setAiPreview(null);
    setCats(topLevelCategories());
  }

  /** After a picture is chosen: save straight away if a folder is preset, else pick one. */
  function finishImage(uri: string | undefined) {
    setImageUri(uri);
    if (presetCategoryId) {
      addWord(presetCategoryId, { label: word.trim(), emoji: resolveEmoji(word.trim()), imageUri: uri, useTextToSpeech: true, size: "md" });
      speak(word.trim(), settings.language, settings.soundEnabled);
      onSaved();
      setStep("done");
    } else {
      setStep("category");
    }
  }

  async function makeAiImage(force = false) {
    setImgError(null);
    setThinking("Creating a picture…");
    const res = await generateWordImage(word.trim(), force);
    setThinking(null);
    if (res.dataUri) setAiPreview(res.dataUri);
    else setImgError(res.error ?? "Could not create a picture.");
  }

  async function useAiImage() {
    if (!aiPreview) return;
    setThinking("Saving picture…");
    const saved = await saveGeneratedImage(aiPreview, `voice_${Date.now()}`);
    setThinking(null);
    if (saved) finishImage(saved);
    else Alert.alert("Could not save that picture.");
  }

  // --- step 1: speak ---
  async function toggleMic() {
    if (recording) {
      setRecording(false);
      const uri = await stopRecordingTemp();
      // No speech service yet (demo) — go to the confirm step so the presenter
      // can dictate/type the word with the keyboard mic.
      if (!isAiConfigured() || !uri) {
        setStep("confirm");
        return;
      }
      setThinking("Listening…");
      const res = await transcribeAudio(uri, langHint);
      setThinking(null);
      if (res.text) {
        setWord(res.text);
        setStep("confirm");
      } else {
        setWord("");
        setStep("confirm");
      }
      return;
    }
    const ok = await startRecording();
    if (!ok) return Alert.alert("Microphone permission is needed to speak a word.");
    setRecording(true);
  }

  // --- step 3: image ---
  async function runSearch(src: ImageSource, term: string) {
    setImgSource(src);
    setImgError(null);
    setThinking("Finding pictures…");
    const res = await searchImages(term, src);
    setThinking(null);
    setHits(res.hits.slice(0, 8));
    setImgError(res.error ?? null);
  }

  async function chooseHit(h: ImageHit) {
    setThinking("Saving picture…");
    const saved = await downloadTileImage(h.full, `voice_${Date.now()}`);
    setThinking(null);
    if (saved) finishImage(saved);
    else Alert.alert("Could not download that picture. Try another.");
  }

  async function useCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission is needed.");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled || !res.assets[0]) return;
    setThinking("Saving photo…");
    const saved = await saveLocalTileImage(res.assets[0].uri, `voice_${Date.now()}`);
    setThinking(null);
    if (saved) finishImage(saved);
  }

  async function useGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Photo library permission is needed.");
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled || !res.assets[0]) return;
    setThinking("Saving picture…");
    const saved = await saveLocalTileImage(res.assets[0].uri, `voice_${Date.now()}`);
    setThinking(null);
    if (saved) finishImage(saved);
  }

  // --- step 4: category + save ---
  function saveToCategory(catId: string) {
    addWord(catId, { label: word.trim(), emoji: resolveEmoji(word.trim()), imageUri, useTextToSpeech: true, size: "md" });
    speak(word.trim(), settings.language, settings.soundEnabled);
    onSaved();
    setStep("done");
  }

  function createAndSave() {
    const c = createBlankCategory({ name: newCatName.trim() || "New Category", icon: newCatIcon });
    setNewCatOpen(false);
    saveToCategory(c.id);
  }

  const totalSteps = presetCategoryId ? 3 : 4;
  const stepNum = { speak: 1, confirm: 2, image: 3, category: 4, done: totalSteps }[step];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.hbtn}>
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.htitle}>{childMode ? "Make a Word" : "Add by Voice"}</Text>
              <Text style={styles.hsub}>Step {stepNum} of {totalSteps} · {step === "speak" ? "Speak" : step === "confirm" ? "Check the word" : step === "image" ? "Pick a picture" : "Pick a folder"}</Text>
            </View>
            {step !== "speak" && step !== "done" && (
              <Pressable onPress={() => setStep(step === "confirm" ? "speak" : step === "image" ? "confirm" : "image")} style={styles.hbtn}>
                <Ionicons name="arrow-back" size={18} color="white" />
              </Pressable>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {/* STEP 1 — SPEAK */}
            {step === "speak" && (
              <View style={styles.centerStep}>
                <Text style={styles.stepTitle}>Say the word out loud</Text>
                <Text style={styles.stepHint}>
                  Tap the microphone, say one word (like "juice"), then tap it again to stop.
                </Text>
                <Pressable onPress={toggleMic} disabled={!!thinking} style={[styles.micBig, recording && styles.micBigOn]}>
                  <Ionicons name={recording ? "stop" : "mic"} size={44} color="white" />
                </Pressable>
                <Text style={styles.micState}>{recording ? "Listening… tap to stop" : thinking || "Tap to start"}</Text>
                {!isAiConfigured() && (
                  <Text style={styles.warn}>
                    Speech typing needs an OpenAI key (Settings). Without it, tap the mic then choose "Type it".
                  </Text>
                )}
                <Pressable onPress={() => setStep("confirm")} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Skip — type the word instead</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2 — CONFIRM TEXT */}
            {step === "confirm" && (
              <View style={{ gap: 12 }}>
                <Text style={styles.stepTitle}>Is this the right word?</Text>
                <Text style={styles.stepHint}>Speech recognition can mishear. Fix it here before continuing.</Text>
                <TextInput
                  value={word}
                  onChangeText={setWord}
                  placeholder="type the word…"
                  placeholderTextColor={colors.textLight}
                  style={styles.bigInput}
                  autoFocus
                />
                <Pressable onPress={() => speak(word || "", settings.language, settings.soundEnabled)} style={styles.previewBtn}>
                  <Ionicons name="volume-medium" size={16} color={colors.forestDark} />
                  <Text style={styles.previewText}>Hear it</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!word.trim()) return Alert.alert("Type a word first.");
                    setStep("image");
                    runSearch("arasaac", word.trim());
                  }}
                  style={styles.nextBtn}
                >
                  <Text style={styles.nextText}>Next — find a picture</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </Pressable>
              </View>
            )}

            {/* STEP 3 — PICK IMAGE */}
            {step === "image" && (
              <View style={{ gap: 12 }}>
                <Text style={styles.stepTitle}>Pick a picture for "{word}"</Text>
                <Text style={styles.stepHint}>These are searched pictures, not AI-made. Choose the clearest one, or take your own photo.</Text>

                <View style={styles.tabRow}>
                  <Pressable onPress={() => { setAiPreview(null); runSearch("arasaac", word); }} style={[styles.tab, imgSource === "arasaac" && !aiPreview && styles.tabOn]}>
                    <Text style={[styles.tabText, imgSource === "arasaac" && !aiPreview && { color: "white" }]}>Symbols</Text>
                  </Pressable>
                  <Pressable onPress={() => { setAiPreview(null); runSearch("pixabay", word); }} style={[styles.tab, imgSource === "pixabay" && !aiPreview && styles.tabOn]}>
                    <Text style={[styles.tabText, imgSource === "pixabay" && !aiPreview && { color: "white" }]}>Photos{hasPixabayKey() ? "" : " ·key"}</Text>
                  </Pressable>
                  <Pressable onPress={() => { setHits([]); setImgError(null); if (!aiPreview) makeAiImage(false); }} style={[styles.tab, !!aiPreview && styles.tabOn]}>
                    <Text style={[styles.tabText, !!aiPreview && { color: "white" }]}>✨ AI made</Text>
                  </Pressable>
                </View>

                {imgError && <Text style={styles.warn}>{imgError}</Text>}

                {aiPreview ? (
                  <View style={{ gap: 10, alignItems: "center" }}>
                    <Image source={{ uri: aiPreview }} style={styles.aiPreviewImg} resizeMode="contain" />
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Pressable onPress={() => makeAiImage(true)} style={styles.fallbackBtn}>
                        <Ionicons name="refresh" size={16} color={colors.forestDark} />
                        <Text style={styles.fallbackText}>Try again</Text>
                      </Pressable>
                      <Pressable onPress={useAiImage} style={[styles.nextBtn, { flex: 1, marginTop: 0 }]}>
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.nextText}>Use this picture</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.stepHint}>AI-made pictures use OpenAI. Add a key in Settings — the button is ready for it.</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.hitGrid}>
                      {hits.map((h) => (
                        <Pressable key={h.id} onPress={() => chooseHit(h)} style={styles.hit}>
                          <Image source={{ uri: h.thumb }} style={styles.hitImg} resizeMode="contain" />
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.fallbackRow}>
                      <Pressable onPress={useCamera} style={styles.fallbackBtn}>
                        <Ionicons name="camera" size={16} color={colors.forestDark} />
                        <Text style={styles.fallbackText}>Camera</Text>
                      </Pressable>
                      <Pressable onPress={useGallery} style={styles.fallbackBtn}>
                        <Ionicons name="images" size={16} color={colors.forestDark} />
                        <Text style={styles.fallbackText}>Gallery</Text>
                      </Pressable>
                      <Pressable onPress={() => finishImage(undefined)} style={styles.fallbackBtn}>
                        <Text style={{ fontSize: 15 }}>{resolveEmoji(word.trim())}</Text>
                        <Text style={styles.fallbackText}>Use symbol</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* STEP 4 — PICK CATEGORY */}
            {step === "category" && (
              <View style={{ gap: 12 }}>
                <Text style={styles.stepTitle}>Which folder does "{word}" go in?</Text>
                {imageUri && <Image source={{ uri: imageUri }} style={styles.chosenImg} />}
                <View style={styles.catGrid}>
                  {cats.map((c) => (
                    <Pressable key={c.id} onPress={() => saveToCategory(c.id)} style={[styles.catCard, { borderColor: (c.color ?? colors.forest) + "66" }]}>
                      <Text style={{ fontSize: 26 }}>{c.icon ?? "📁"}</Text>
                      <Text style={styles.catCardText} numberOfLines={1}>{c.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setNewCatOpen(true)} style={[styles.catCard, styles.catCardNew]}>
                    <Ionicons name="add" size={24} color={colors.forest} />
                    <Text style={styles.catCardText}>New folder</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* DONE */}
            {step === "done" && (
              <View style={styles.centerStep}>
                <Ionicons name="checkmark-circle" size={56} color={colors.greenDeep} />
                <Text style={styles.stepTitle}>"{word}" added</Text>
                <Text style={styles.stepHint}>The child hears it spoken by the app when they tap the tile.</Text>
                <Pressable onPress={() => reset()} style={styles.nextBtn}>
                  <Ionicons name="mic" size={16} color="white" />
                  <Text style={styles.nextText}>Add another by voice</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Done</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {thinking && step !== "speak" && (
            <View style={styles.overlay}>
              <ActivityIndicator color="white" />
              <Text style={styles.overlayText}>{thinking}</Text>
            </View>
          )}
        </SafeAreaView>

        <Modal visible={newCatOpen} transparent animationType="fade" onRequestClose={() => setNewCatOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New folder</Text>
              <TextInput value={newCatName} onChangeText={setNewCatName} placeholder="Folder name" placeholderTextColor={colors.textLight} style={styles.bigInput} />
              <View style={styles.iconWrap}>
                {CAT_ICONS.map((ic) => (
                  <Pressable key={ic} onPress={() => setNewCatIcon(ic)} style={[styles.iconBtn, newCatIcon === ic && styles.iconBtnOn]}>
                    <Text style={{ fontSize: 20 }}>{ic}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalRow}>
                <Pressable onPress={() => setNewCatOpen(false)} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
                  <Text style={{ color: colors.textMid, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={createAndSave} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
                  <Text style={{ color: "white", fontWeight: "700" }}>Create &amp; save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hbtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  htitle: { color: "white", fontSize: 17, fontWeight: "800" },
  hsub: { color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 },
  body: { padding: 20, paddingBottom: 50 },
  centerStep: { alignItems: "center", gap: 12, paddingTop: 20 },
  stepTitle: { fontSize: 19, fontWeight: "800", color: colors.textDark, textAlign: "center" },
  stepHint: { fontSize: 13, color: colors.textMid, textAlign: "center", lineHeight: 19, maxWidth: 320 },
  micBig: { width: 128, height: 128, borderRadius: 64, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", marginTop: 14 },
  micBigOn: { backgroundColor: colors.pinkDeep },
  micState: { fontSize: 13, color: colors.textMid, fontWeight: "600", marginTop: 6 },
  warn: { fontSize: 12, color: colors.pinkDeep, textAlign: "center", marginTop: 10, lineHeight: 17, maxWidth: 320 },
  linkBtn: { paddingVertical: 12, marginTop: 8 },
  linkText: { color: colors.blueDeep, fontWeight: "700", fontSize: 13 },
  bigInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
  },
  previewBtn: { flexDirection: "row", gap: 6, alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.forestLight, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 14 },
  previewText: { color: colors.forestDark, fontWeight: "700", fontSize: 13 },
  nextBtn: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.forest, borderRadius: radius, paddingVertical: 15, marginTop: 8 },
  nextText: { color: "white", fontWeight: "800", fontSize: 15 },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, backgroundColor: colors.cardMuted, borderRadius: 12, paddingVertical: 9, alignItems: "center" },
  tabOn: { backgroundColor: colors.forest },
  tabText: { fontWeight: "700", fontSize: 12.5, color: colors.textMid },
  hitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hit: { width: "48%", aspectRatio: 1.3, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  hitImg: { width: "100%", height: "100%" },
  aiPreviewImg: { width: "100%", height: 220, borderRadius: radius, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  fallbackRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  fallbackBtn: { flex: 1, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", backgroundColor: colors.forestLight, borderRadius: 12, paddingVertical: 11 },
  fallbackText: { color: colors.forestDark, fontWeight: "700", fontSize: 12 },
  chosenImg: { width: 96, height: 96, borderRadius: radius, alignSelf: "center", backgroundColor: colors.cardMuted },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: { width: "47%", backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius, paddingVertical: 18, alignItems: "center", gap: 6 },
  catCardNew: { borderStyle: "dashed", borderColor: colors.forest },
  catCardText: { fontSize: 13, fontWeight: "700", color: colors.textDark, maxWidth: "90%" },
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", gap: 10 },
  overlayText: { color: "white", fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: colors.bg, borderRadius: radius, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark, marginBottom: 12 },
  iconWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  iconBtnOn: { borderColor: colors.forest, backgroundColor: colors.forestLight },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: radius, paddingVertical: 12, alignItems: "center" },
});
