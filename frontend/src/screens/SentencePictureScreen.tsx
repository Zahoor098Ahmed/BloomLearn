import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Image, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import { parseSceneGraph, conceptByKey, CONCEPTS, SUBJECTS, REFERENCES } from "../modules/sentenceScene";
import { loadStoredKey, setStoredKey, getOpenAiKey, generateSentenceImage, transcribeAudio } from "../modules/aiImage";
import { resolveSceneImage, saveSceneImage } from "../modules/aiScene";
import { startRecording, stopRecordingTemp } from "../modules/audio";
import SceneComposer from "../components/SceneComposer";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

const EXAMPLES = [
  "The black cat is under the table",
  "A small brown dog is behind the big tree",
  "Three red apples are in the basket",
  "The blue bird is above the house",
  "The girl is sitting on the chair",
];

type Source = "instant" | "ai";

export default function SentencePictureScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [text, setText] = useState("A small black cat is behind the big tree");

  const [source, setSource] = useState<Source>("instant");
  const [aiUri, setAiUri] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [openaiReady, setOpenaiReady] = useState(false);
  const [keyModal, setKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  const graph = useMemo(() => parseSceneGraph(text), [text]);
  const concept = conceptByKey(graph.conceptKey);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    loadStoredKey().then(() => setOpenaiReady(!!getOpenAiKey()));
  }, []);

  // As the sentence changes, drop back to the instant scene; load a cached AI
  // picture if we have saved one for this exact sentence.
  useEffect(() => {
    let active = true;
    setSource("instant");
    setAiError(null);
    setSavedOffline(false);
    resolveSceneImage(text).then((r) => {
      if (active && r.cached) {
        setAiUri(r.url);
        setSavedOffline(true);
      } else if (active) {
        setAiUri(null);
      }
    });
    return () => {
      active = false;
    };
  }, [text]);

  async function makeAiPicture() {
    setAiLoading(true);
    setAiError(null);
    // Prefer the OpenAI key when connected (sharper); otherwise use the free
    // Pollinations engine — no key, no sign-up.
    if (openaiReady) {
      const res = await generateSentenceImage(text, false);
      setAiLoading(false);
      if (res.dataUri) {
        setAiUri(res.dataUri);
        setSource("ai");
      } else {
        setAiError(res.error ?? "Could not make the picture.");
      }
      return;
    }
    const r = await resolveSceneImage(text);
    setAiUri(r.url);
    setSource("ai");
    // Image component reports load; give it a beat, then clear the spinner.
    setTimeout(() => setAiLoading(false), 400);
  }

  async function saveForOffline() {
    const uri = await saveSceneImage(text);
    if (uri) {
      setAiUri(uri);
      setSavedOffline(true);
    } else {
      Alert.alert("Could not save", "Check the internet connection and try again.");
    }
  }

  function keyboardMicHint() {
    Alert.alert("Speak with the keyboard", "Tap the text box and use the microphone on your keyboard — the picture updates as you talk.");
  }

  async function toggleMic() {
    if (recording) {
      setRecording(false);
      const uri = await stopRecordingTemp();
      if (!uri) return keyboardMicHint();
      setSttBusy(true);
      const res = await transcribeAudio(uri, (lang || "en-US").split("-")[0]);
      setSttBusy(false);
      if (res.text) setText(res.text);
      else if (res.unavailable) keyboardMicHint(); // 503 / not set up — not an error
      else Alert.alert("Didn't catch that", res.error ?? "Try again or type it.");
      return;
    }
    const ok = await startRecording();
    if (!ok) return Alert.alert("Microphone permission is needed to speak.");
    setRecording(true);
  }

  async function saveKey() {
    await setStoredKey(keyInput);
    setOpenaiReady(!!getOpenAiKey());
    setKeyModal(false);
    setKeyInput("");
  }

  const showingAi = source === "ai" && !!aiUri;
  const pct = Math.round(graph.confidence * 100);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Picture Talk</Text>
            <Text style={styles.headerSub}>Say or type a sentence — the picture builds as you talk</Text>
          </View>
          <Pressable onPress={() => setKeyModal(true)} style={styles.backBtn}>
            <Ionicons name={openaiReady ? "sparkles" : "sparkles-outline"} size={18} color="white" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.stageWrap}>
            {showingAi ? (
              <Image source={{ uri: aiUri! }} style={styles.stageImg} resizeMode="contain" onLoadEnd={() => setAiLoading(false)} />
            ) : concept ? (
              <View style={styles.stageWhite}><ConceptView concept={concept} /></View>
            ) : (
              <SceneComposer graph={graph} />
            )}
            {aiLoading && (
              <View style={styles.stageOverlay}>
                <ActivityIndicator color="white" />
                <Text style={styles.stageOverlayText}>Making the picture…</Text>
              </View>
            )}
            <View style={[styles.sourceBadge, showingAi ? styles.sourceAi : styles.sourceInstant]}>
              <Ionicons name={showingAi ? "sparkles" : "flash"} size={11} color="white" />
              <Text style={styles.sourceBadgeText}>
                {showingAi ? (savedOffline ? "AI · saved" : "AI") : "Instant"}
              </Text>
            </View>
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          {!concept && (
            <View style={styles.aiRow}>
              {showingAi ? (
                <>
                  <Pressable onPress={() => setSource("instant")} style={[styles.aiBtn, { backgroundColor: colors.cardMuted }]}>
                    <Ionicons name="flash" size={15} color={colors.textMid} />
                    <Text style={[styles.aiBtnText, { color: colors.textMid }]}>Instant scene</Text>
                  </Pressable>
                  {!savedOffline && (
                    <Pressable onPress={saveForOffline} style={styles.aiRegenBtn}>
                      <Ionicons name="download-outline" size={16} color={colors.forestDark} />
                    </Pressable>
                  )}
                  <Pressable onPress={makeAiPicture} disabled={aiLoading} style={styles.aiRegenBtn}>
                    <Ionicons name="refresh" size={16} color={colors.forestDark} />
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={makeAiPicture} disabled={aiLoading} style={[styles.aiBtn, aiLoading && { opacity: 0.5 }]}>
                  <Ionicons name="sparkles" size={16} color="white" />
                  <Text style={styles.aiBtnText}>Make full picture with AI</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* what the engine understood */}
          {!concept && (
            <View style={styles.chips}>
              {graph.subject?.size && graph.subject.size !== "normal" && <Chip on text={graph.subject.size} />}
              {graph.subject && graph.subject.count > 1 && <Chip on text={`${graph.subject.count}`} />}
              <Chip on={!!graph.subject?.color} text={graph.subject?.color ?? "colour"} />
              <Chip on={!!graph.subject} text={graph.subject?.type ?? "thing"} />
              {graph.subject?.action && <Chip on text={graph.subject.action} />}
              <Chip on={!!graph.relation} text={graph.relation ?? "where"} />
              <Chip on={!!graph.reference} text={graph.reference?.type ?? "object"} />
            </View>
          )}
          {!concept && graph.subject && (
            <Text style={styles.understood}>
              {pct >= 60 ? "Understood well" : "Partly understood"} · {pct}% — tap "AI" for anything the instant scene can't draw.
            </Text>
          )}

          {concept && !showingAi && (
            <View style={styles.captionCard}>
              <Text style={styles.captionTitle}>{concept.title}</Text>
              <Text style={styles.captionBody}>{concept.caption}</Text>
            </View>
          )}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a sentence, or tap the mic on your keyboard…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />
          <Pressable onPress={toggleMic} disabled={sttBusy} style={[styles.micRow, recording && styles.micRowOn]}>
            {sttBusy ? <ActivityIndicator color="white" /> : <Ionicons name={recording ? "stop" : "mic"} size={20} color="white" />}
            <Text style={styles.micRowText}>{recording ? "Listening… tap to stop" : sttBusy ? "Turning speech into text…" : "Speak a sentence"}</Text>
          </Pressable>
          <Text style={styles.micHint}>Or tap the text box and use your keyboard's microphone — the picture updates word by word.</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => speak(text, lang, settings.soundEnabled)} style={styles.speakBtn}>
              <Ionicons name="volume-medium" size={16} color="white" />
              <Text style={styles.speakBtnText}>Read aloud</Text>
            </Pressable>
            <Pressable onPress={() => setText("")} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Try a sentence</Text>
          <View style={styles.exampleWrap}>
            {EXAMPLES.map((e) => (
              <Pressable key={e} onPress={() => setText(e)} style={styles.example}>
                <Text style={styles.exampleText}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Science concepts</Text>
          <View style={styles.exampleWrap}>
            {CONCEPTS.map((c) => (
              <Pressable key={c.key} onPress={() => setText(c.title)} style={[styles.example, { backgroundColor: colors.forestLight }]}>
                <Text style={[styles.exampleText, { color: colors.forestDark }]}>{c.title}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            The instant scene works offline and is always the base. "AI" uses a free image engine (no key needed); a sharper
            engine turns on if you connect an OpenAI key with ✨. Understood: colours, sizes (small / big), counts, things
            ({Object.keys(SUBJECTS).slice(0, 5).join(", ")}…), actions (running, sitting…), positions (under, on, above, behind,
            in front of, beside, inside), objects ({Object.keys(REFERENCES).slice(0, 5).join(", ")}…).
          </Text>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={keyModal} transparent animationType="fade" onRequestClose={() => setKeyModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sharper AI pictures (optional)</Text>
            <Text style={styles.modalBody}>
              The free AI engine already works with no key. Paste an OpenAI API key here for higher-quality illustrations. It is
              stored only on this device. Leave blank and save to disconnect.
            </Text>
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-…"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              secureTextEntry
              style={styles.keyInput}
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setKeyModal(false)} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
                <Text style={{ color: colors.textMid, fontWeight: "700" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveKey} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
                <Text style={{ color: "white", fontWeight: "700" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Chip({ on, text }: { on: boolean; text: string }) {
  return (
    <View style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
      <Text style={[styles.chipText, on ? { color: "white" } : { color: colors.textLight }]}>{text}</Text>
    </View>
  );
}

function ConceptView({ concept }: { concept: (typeof CONCEPTS)[number] }) {
  const r = concept.render;
  if (r.kind === "plant") {
    return (
      <View style={styles.concept}>
        <Text style={{ fontSize: 64 }}>{r.flowers ? "🌷" : "🌿"}</Text>
        <View style={styles.conceptRow}>
          <Feature label="Flower" present={!!r.flowers} glyph="🌸" />
          <Feature label="Seeds" present={!!r.seeds} glyph="🌰" />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.concept}>
      <View style={styles.conceptRow}>
        {(r.examples ?? []).map((ex, i) => (
          <View key={i} style={styles.animalWrap}>
            <Text style={{ fontSize: 40 }}>{ex}</Text>
            {r.backbone ? <View style={styles.backbone} /> : <Text style={styles.noBackbone}>—</Text>}
          </View>
        ))}
      </View>
      <Text style={styles.conceptNote}>{r.backbone ? "Backbone highlighted" : "No backbone"}</Text>
    </View>
  );
}

function Feature({ label, present, glyph }: { label: string; present: boolean; glyph: string }) {
  return (
    <View style={styles.feature}>
      <Text style={{ fontSize: 26, opacity: present ? 1 : 0.2 }}>{glyph}</Text>
      <Text style={[styles.featureLabel, { color: present ? colors.forestDark : colors.textLight }]}>
        {present ? label : `no ${label.toLowerCase()}`}
      </Text>
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
    gap: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  stageWrap: { position: "relative" },
  stageWhite: {
    width: "100%",
    aspectRatio: 320 / 236,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  stageImg: {
    width: "100%",
    aspectRatio: 320 / 236,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stageOverlayText: { color: "white", fontWeight: "600", fontSize: 12.5 },
  sourceBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourceInstant: { backgroundColor: colors.blueDeep },
  sourceAi: { backgroundColor: colors.purpleDeep },
  sourceBadgeText: { color: "white", fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  aiError: { color: colors.pinkDeep, fontSize: 12, marginTop: -6 },
  aiRow: { flexDirection: "row", gap: 10 },
  aiBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: radius,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBtnText: { color: "white", fontWeight: "800", fontSize: 14 },
  aiRegenBtn: { width: 48, backgroundColor: colors.forestLight, borderRadius: radius, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipOn: { backgroundColor: colors.forest },
  chipOff: { backgroundColor: colors.cardMuted },
  chipText: { fontSize: 12, fontWeight: "700" },
  understood: { fontSize: 11.5, color: colors.textMid, marginTop: -4 },
  captionCard: { backgroundColor: colors.forestLight, borderRadius: radius, padding: 14 },
  captionTitle: { fontSize: 14, fontWeight: "800", color: colors.forestDark },
  captionBody: { fontSize: 12.5, color: colors.textDark, marginTop: 4, lineHeight: 18 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 14,
    fontSize: 15,
    color: colors.textDark,
    minHeight: 60,
    textAlignVertical: "top",
  },
  micRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.forest,
    borderRadius: radius,
    paddingVertical: 15,
    marginTop: 4,
  },
  micRowOn: { backgroundColor: colors.pinkDeep },
  micRowText: { color: "white", fontWeight: "800", fontSize: 15 },
  micHint: { fontSize: 11.5, color: colors.textMid, marginTop: 4, lineHeight: 16 },
  actionRow: { flexDirection: "row", gap: 10 },
  speakBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.blueDeep,
    borderRadius: radius,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtnText: { color: "white", fontWeight: "800" },
  clearBtn: { flex: 1, backgroundColor: colors.cardMuted, borderRadius: radius, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  clearBtnText: { color: colors.textMid, fontWeight: "700" },
  sectionLabel: { fontSize: 12, fontWeight: "800", color: colors.textLight, letterSpacing: 1, marginTop: 6 },
  exampleWrap: { gap: 8 },
  example: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, paddingVertical: 12, paddingHorizontal: 14 },
  exampleText: { fontSize: 13, color: colors.textDark, fontWeight: "600" },
  hint: { fontSize: 11, color: colors.textLight, lineHeight: 17, marginTop: 6 },
  concept: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  conceptRow: { flexDirection: "row", gap: 18, alignItems: "flex-end", flexWrap: "wrap", justifyContent: "center" },
  feature: { alignItems: "center", gap: 4 },
  featureLabel: { fontSize: 12, fontWeight: "700" },
  animalWrap: { alignItems: "center", gap: 4 },
  backbone: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.pinkDeep },
  noBackbone: { color: colors.textLight, fontSize: 14 },
  conceptNote: { fontSize: 12, color: colors.textMid, fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: colors.bg, borderRadius: radius, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark, marginBottom: 8 },
  modalBody: { fontSize: 12.5, color: colors.textMid, lineHeight: 18, marginBottom: 12 },
  keyInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 12,
    fontSize: 14,
    color: colors.textDark,
  },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: radius, paddingVertical: 12, alignItems: "center" },
});
