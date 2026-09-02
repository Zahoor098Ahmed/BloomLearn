import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from "react-native";
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

  const scene = useMemo(() => parseSentence(text), [text]);
  const concept = conceptByKey(scene.conceptKey);

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
            <Text style={styles.headerSub}>Say or type a sentence — the picture draws itself</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.stage}>
            {concept ? <ConceptView concept={concept} /> : <SceneDrawing spec={sceneSpec} />}
          </View>

          <View style={styles.chips}>
            <Chip on={!!scene.color} text={scene.color ?? "colour"} />
            <Chip on={!!scene.subject} text={scene.subject ?? "thing"} />
            <Chip on={!!scene.preposition} text={prep ?? "where"} />
            <Chip on={!!scene.reference} text={scene.reference ?? "object"} />
          </View>

          {concept && (
            <View style={styles.captionCard}>
              <Text style={styles.captionTitle}>{concept.title}</Text>
              <Text style={styles.captionBody}>{concept.caption}</Text>
            </View>
          )}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type or paste a sentence…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />

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
            Understood: colours (black, brown, white, red, blue…), things ({Object.keys(SUBJECTS).slice(0, 6).join(", ")}…),
            positions (under, on, above, beside, behind, in front of, inside), objects ({Object.keys(REFERENCES).slice(0, 6).join(", ")}…).
          </Text>
        </ScrollView>
      </SafeAreaView>
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
    gap: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  stage: { height: 230, backgroundColor: "#ffffff", borderRadius: radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
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
});
