import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Image, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";
import {
  parseSentence,
  colorHex,
  canonicalPreposition,
  conceptByKey,
  SUBJECTS,
  REFERENCES,
  CONCEPTS,
} from "../modules/sentenceScene";
import { loadStoredKey, setStoredKey, isAiConfigured, generateSentenceImage, cachedImageFor, transcribeAudio } from "../modules/aiImage";
import { startRecording, stopRecordingTemp } from "../modules/audio";
import SceneDrawing from "../components/SceneDrawing";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

const EXAMPLES = [
  "The black cat is under the table",
  "The brown dog is beside the box",
  "The blue ball is on the chair",
  "The white rabbit is behind the tree",
];

export default function SentencePictureScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [text, setText] = useState("The black cat is under the table");

  const [aiUri, setAiUri] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReady, setAiReady] = useState(false);
  const [keyModal, setKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);

  const scene = useMemo(() => parseSentence(text), [text]);
  const concept = conceptByKey(scene.conceptKey);

  useEffect(() => {
    loadStoredKey().then(() => setAiReady(isAiConfigured()));
  }, []);

  // Show a cached AI picture instantly when the sentence already has one.
  useEffect(() => {
    let active = true;
    setAiError(null);
    cachedImageFor(text).then((uri) => {
      if (active) setAiUri(uri ?? null);
    });
    return () => {
      active = false;
    };
  }, [text]);

  async function makeAiPicture(force = false) {
    setAiLoading(true);
    setAiError(null);
    const res = await generateSentenceImage(text, force);
    setAiLoading(false);
    if (res.dataUri) setAiUri(res.dataUri);
    else setAiError(res.error ?? "Could not make the picture.");
  }

  async function toggleMic() {
    if (recording) {
      setRecording(false);
      const uri = await stopRecordingTemp();
      if (!isAiConfigured() || !uri) {
        // demo: no speech service — let the presenter use the keyboard mic
        Alert.alert("Speak with the keyboard", "Tap the text box and use the microphone on your keyboard. Real voice typing turns on with an OpenAI key.");
        return;
      }
      setSttBusy(true);
      const res = await transcribeAudio(uri, (lang || "en-US").split("-")[0]);
      setSttBusy(false);
      if (res.text) {
        setAiUri(null);
        setText(res.text);
      } else {
        Alert.alert("Didn't catch that", res.error ?? "Try again or type it.");
      }
      return;
    }
    const ok = await startRecording();
    if (!ok) return Alert.alert("Microphone permission is needed to speak.");
    setRecording(true);
  }

  async function saveKey() {
    await setStoredKey(keyInput);
    setAiReady(isAiConfigured());
    setKeyModal(false);
    setKeyInput("");
  }

  const sceneSpec = {
    subject: scene.subject,
    subjectColor: colorHex(scene.color),
    preposition: canonicalPreposition(scene.preposition),
    reference: scene.reference,
  };
  const prep = canonicalPreposition(scene.preposition);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Picture Talk</Text>
            <Text style={styles.headerSub}>Say or type a sentence — the picture matches</Text>
          </View>
          <Pressable onPress={() => setKeyModal(true)} style={styles.backBtn}>
            <Ionicons name={aiReady ? "sparkles" : "sparkles-outline"} size={18} color="white" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.stage}>
            {aiLoading ? (
              <View style={styles.stageCenter}>
                <ActivityIndicator size="large" color={colors.forest} />
                <Text style={styles.stageMsg}>Drawing the picture…</Text>
              </View>
            ) : aiUri ? (
              <Image source={{ uri: aiUri }} style={styles.stageImg} resizeMode="contain" />
            ) : concept ? (
              <ConceptView concept={concept} />
            ) : (
              <SceneDrawing spec={sceneSpec} />
            )}
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          <View style={styles.aiRow}>
            <Pressable onPress={() => makeAiPicture(false)} disabled={aiLoading} style={[styles.aiBtn, aiLoading && { opacity: 0.5 }]}>
              <Ionicons name="sparkles" size={16} color="white" />
              <Text style={styles.aiBtnText}>{aiUri ? "Real picture ✓" : "Make real picture"}</Text>
            </Pressable>
            {aiUri && (
              <Pressable onPress={() => makeAiPicture(true)} disabled={aiLoading} style={styles.aiRegenBtn}>
                <Ionicons name="refresh" size={16} color={colors.forestDark} />
              </Pressable>
            )}
            {aiUri && (
              <Pressable onPress={() => setAiUri(null)} style={styles.aiRegenBtn}>
                <Ionicons name="brush" size={16} color={colors.forestDark} />
              </Pressable>
            )}
          </View>

          <View style={styles.chips}>
            <Chip on={!!scene.color} text={scene.color ?? "colour"} />
            <Chip on={!!scene.subject} text={scene.subject ?? "thing"} />
            <Chip on={!!scene.preposition} text={prep ?? "where"} />
            <Chip on={!!scene.reference} text={scene.reference ?? "object"} />
          </View>

          {concept && !aiUri && (
            <View style={styles.captionCard}>
              <Text style={styles.captionTitle}>{concept.title}</Text>
              <Text style={styles.captionBody}>{concept.caption}</Text>
            </View>
          )}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a sentence, or tap the mic on your keyboard to speak…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />
          <Pressable onPress={toggleMic} disabled={sttBusy} style={[styles.micRow, recording && styles.micRowOn]}>
            {sttBusy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name={recording ? "stop" : "mic"} size={20} color="white" />
            )}
            <Text style={styles.micRowText}>{recording ? "Listening… tap to stop" : sttBusy ? "Turning speech into a picture…" : "Speak a sentence"}</Text>
          </Pressable>
          <Text style={styles.micHint}>Or tap the text box and use your keyboard's microphone — the picture updates as you talk.</Text>

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
            The drawing works offline. "Make real picture" uses AI for a full illustration
            {aiReady ? " (connected)." : " — tap ✨ to connect an OpenAI key."} Understood words: colours, things
            ({Object.keys(SUBJECTS).slice(0, 5).join(", ")}…), positions (under, on, above, beside, behind…), objects
            ({Object.keys(REFERENCES).slice(0, 5).join(", ")}…).
          </Text>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={keyModal} transparent animationType="fade" onRequestClose={() => setKeyModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Connect AI pictures</Text>
            <Text style={styles.modalBody}>
              Paste an OpenAI API key to turn on full AI illustrations. It is stored only on this device. Set a spending
              limit on the key. Leave blank and save to disconnect.
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
  stage: { height: 240, backgroundColor: "#ffffff", borderRadius: radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  stageImg: { width: "100%", height: "100%" },
  stageCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  stageMsg: { color: colors.textMid, fontSize: 13, fontWeight: "600" },
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
  aiRegenBtn: {
    width: 48,
    backgroundColor: colors.forestLight,
    borderRadius: radius,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipOn: { backgroundColor: colors.forest },
  chipOff: { backgroundColor: colors.cardMuted },
  chipText: { fontSize: 12, fontWeight: "700" },
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
