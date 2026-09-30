import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { speak } from "../modules/tts";
import { t, TKey } from "../modules/i18n";
import { parseSceneGraph, conceptByKey, CONCEPTS, SUBJECTS, REFERENCES, findWordEmoji } from "../modules/sentenceScene";
import { getPictogramUrl } from "../modules/aacPictograms";
import { isAiConfigured, generateSentenceImage, transcribeAudio } from "../modules/aiImage";
import { sceneImageUrl, composeSceneUrl, aiSceneEnabled } from "../modules/aiScene";
import { lookupImage, saveImage, libraryCount, prewarmLibrary, dictionaryWords } from "../modules/imageLibrary";
import { bookVocabSize } from "../modules/bookVocab";
import {
  type SceneSession,
  newSession,
  applyUtterance,
  applyOps,
  isReset,
  isFreshScene,
  sessionPrompt,
  sessionChips,
  sessionChipEntries,
  searchPhrase,
} from "../modules/sceneSession";
import { agentEnabled, agentName, parseUtteranceLLM, describeScene } from "../modules/sceneAgent";
import { startRecording, stopRecordingTemp } from "../modules/audio";
import { voiceAvailable, startListening, stopListening } from "../modules/voice";
import { addHistory } from "../modules/history";
import { recordSentence, recordAiPicture } from "../modules/progress";
import SceneComposer from "../components/SceneComposer";
import SceneStage from "../components/SceneStage";
import { colors, radius } from "../theme";

interface Props {
  /** Sentence to start with (from Home or My Pictures). */
  initialText?: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const EXAMPLE_KEYS: TKey[] = ["spExample1", "spExample2", "spExample3", "spExample4", "spExample5"];

type ImgSource = "library" | "library-new" | "ai-saved";

export default function SentencePictureScreen({ initialText = "", onBack, onOpenSettings }: Props) {
  const { isTablet } = useResponsive();
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const [text, setText] = useState(initialText);

  const [img, setImg] = useState<{ uri: string; source: ImgSource } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
  // true when the current sentence came from the microphone (for Progress)
  const fromVoiceRef = useRef(false);
  const [libN, setLibN] = useState(0);
  const [wordsN, setWordsN] = useState(0);
  const [buildMode, setBuildMode] = useState(true);
  const [session, setSession] = useState<SceneSession>(() => newSession());
  const [itemUris, setItemUris] = useState<Record<string, string>>({});
  const itemUrisRef = useRef<Record<string, string>>({});
  itemUrisRef.current = itemUris;
  const mergedRef = useRef<string>("");
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [agentThinking, setAgentThinking] = useState(false);
  const [hiddenChipKeys, setHiddenChipKeys] = useState<Record<string, boolean>>({});

  function toggleKeyword(key: string) {
    setHiddenChipKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (img) setImg(null);
  }

  const displaySession = useMemo(() => {
    if (Object.keys(hiddenChipKeys).length === 0) return session;

    const visibleItems = session.items.filter((it) => {
      if (hiddenChipKeys[`${it.id}_main`]) return false;
      if (hiddenChipKeys[`${it.id}_action`]) return false;
      if (hiddenChipKeys[`${it.id}_adverb`]) return false;
      if (hiddenChipKeys[`${it.id}_eyes`]) return false;
      if (hiddenChipKeys[`${it.id}_rel`]) return false;
      return true;
    });

    const visibleAnatomyParts = session.anatomyParts.filter(
      (p, idx) => !hiddenChipKeys[`anatomy_${p}_${idx}`]
    );

    return {
      ...session,
      items: visibleItems,
      anatomyParts: visibleAnatomyParts,
    };
  }, [session, hiddenChipKeys]);

  const graph = useMemo(() => parseSceneGraph(text), [text]);
  const concept = conceptByKey(graph.conceptKey);
  const textRef = useRef(text);
  textRef.current = text;
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    libraryCount().then(setLibN);
    // Fill the library from the curated word list in the background, refreshing
    // the count as it grows.
    const poll = setInterval(() => {
      libraryCount().then(setLibN);
      dictionaryWords().then(setWordsN);
    }, 3000);
    prewarmLibrary().then(() => {
      clearInterval(poll);
      libraryCount().then(setLibN);
      dictionaryWords().then(setWordsN);
    });
    return () => clearInterval(poll);
  }, []);

  // Voice-controlled scene builder: the whole spoken sentence is merged into the
  // running scene (never word-by-word) and <SceneStage> redraws from it. Offline.
  useEffect(() => {
    if (!buildMode) return;
    const q = text.trim();
    if (!q || q === mergedRef.current) return;
    const t = setTimeout(async () => {
      mergedRef.current = q;
      setAiError(null);
      setImg(null);
      // "start over", or a full "the X on the Y" sentence that drops leftovers
      const fresh = isReset(q) || isFreshScene(q, sessionRef.current.items.map((i) => i.type));
      if (fresh) setItemUris({});
      if (isReset(q)) {
        setSession(newSession());
        return;
      }
      // Agent route: an LLM turns free speech into scene ops. Falls back to the
      // on-device rule parser when there's no key or the call fails.
      let ops = null;
      if (agentEnabled()) {
        setAgentThinking(true);
        ops = await parseUtteranceLLM(q, fresh ? newSession() : sessionRef.current);
        setAgentThinking(false);
      }
      if (mergedRef.current !== q) return;
      setSession((prev) => {
        const s = fresh ? newSession() : prev;
        return ops && ops.length ? applyOps(s, ops) : applyUtterance(s, q);
      });
    }, 600);
    return () => clearTimeout(t);
  }, [text, buildMode]);

  // Once the sentence has settled (not while still listening), count it in
  // Progress and — unless the parent turned history off — remember it.
  useEffect(() => {
    const q = text.trim();
    if (q.length < 3 || recording) return;
    const timer = setTimeout(() => {
      recordSentence(q, fromVoiceRef.current);
      if (settings.saveHistory) addHistory(q);
    }, 2500);
    return () => clearTimeout(timer);
  }, [text, recording]);

  function typeText(value: string) {
    fromVoiceRef.current = false;
    setText(value);
  }

  function voiceText(value: string) {
    fromVoiceRef.current = true;
    setText(value);
  }

  // Give every object in the built scene its own library picture, and — when a
  // Pollinations token is set — redraw the whole scene as one real picture.
  useEffect(() => {
    if (!buildMode) return;
    for (const it of session.items) {
      const key = searchPhrase(it);
      if (!(key in itemUrisRef.current)) {
        itemUrisRef.current = { ...itemUrisRef.current, [key]: "" }; // claim it so we don't fire twice
        // a stalled lookup must never leave the symbol stuck on its loading
        // placeholder forever — fall back to the emoji glyph after 7s
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));
        Promise.race([lookupImage(key), timeout]).then((h) => {
          setItemUris((m) => ({ ...m, [key]: h?.uri ?? "" }));
        });
      }
    }
  }, [session, buildMode]);

  // Turn the built scene into one real picture (needs a Pollinations token).
  async function drawSceneWithAi(scene = session) {
    if (!aiSceneEnabled()) {
      setAiError(tt("spNoPollinationsToken"));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    const prompt = (await describeScene(scene)) ?? sessionPrompt(scene);
    const url = composeSceneUrl(prompt, scene.seed);
    setImg({ uri: url, source: "ai-saved" });
    recordAiPicture();
    saveImage(prompt, url, { source: "ai", tags: scene.items.map((i) => i.type) }).catch(() => {});
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setTimeout(() => setAiLoading(false), 6000);
    aiTimer.current = setTimeout(() => {
      setAiLoading(false);
      setImg(null);
      setAiError(tt("spEngineSlow"));
    }, 18000);
  }

  // On sentence change: ask the library first. If it has (or can seed) a
  // matching picture, show it; otherwise fall back to the instant scene.
  useEffect(() => {
    if (buildMode) return;
    let active = true;
    setAiError(null);
    setImg(null);
    const q = text;
    const t = setTimeout(async () => {
      if (concept) return;
      // Two objects in a relation ("cat on the table") -> let SceneComposer draw
      // both with the right depth. A single library picture can only show one.
      if (graph.subject && graph.reference) return;
      const hit = await lookupImage(q, graph);
      if (!active || textRef.current !== q) return;
      if (hit) {
        setImg({ uri: hit.uri, source: hit.fromLibrary ? "library" : "library-new" });
        libraryCount().then(setLibN);
      }
      // No library hit -> the instant scene stays on screen; the child/teacher
      // taps "Make full picture with AI" for a drawn version.
    }, 450);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [text, concept, graph]);

  async function makeAiPicture() {
    setAiLoading(true);
    setAiError(null);

    let generated: string | undefined;
    if (isAiConfigured()) {
      const res = await generateSentenceImage(text, false);
      if (res.error) {
        setAiLoading(false);
        setAiError(res.error);
        return;
      }
      generated = res.dataUri;
    } else if (aiSceneEnabled()) {
      generated = sceneImageUrl(text, graph); // Pollinations with token
    } else {
      setAiLoading(false);
      setAiError(tt("spNoAiEngine"));
      return;
    }
    if (!generated) {
      setAiLoading(false);
      setAiError(tt("spCouldNotMake"));
      return;
    }

    // Save the AI picture into the library so it is served from there next time.
    const entry = await saveImage(text, generated, { source: "ai", tags: graph.subject ? [graph.subject.type] : [] });
    // keep the spinner until the <Image> actually loads (Pollinations can be slow)
    setImg({ uri: entry?.uri ?? generated, source: "ai-saved" });
    recordAiPicture();
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setTimeout(() => setAiLoading(false), 5000); // reveal even if onLoadEnd is quiet
    aiTimer.current = setTimeout(() => {
      setAiLoading(false);
      setImg(null);
      setAiError(tt("spEngineTooLong"));
    }, 20000);
    libraryCount().then(setLibN);
  }

  function keyboardMicHint() {
    Alert.alert(tt("spSpeakKeyboardTitle"), tt("spSpeakKeyboardMsg"));
  }

  // Phones turn speech into text with Whisper, which needs an OpenAI key or the
  // BloomLearn server — offer Settings or the keyboard microphone instead.
  function voiceSetupNeeded() {
    Alert.alert(tt("hmSetupTitle"), tt("hmSetupBody"), [
      { text: tt("spSpeakKeyboardTitle"), onPress: keyboardMicHint },
      { text: tt("hmSetupBtn"), onPress: onOpenSettings },
    ]);
  }

  function readBack(sentence: string) {
    if (settings.autoSpeak && sentence.trim()) speak(sentence, lang, settings.soundEnabled, settings.speechRate);
  }

  async function toggleMic() {
    if (recording) {
      setRecording(false);
      if (voiceAvailable()) {
        await stopListening();
        return;
      }
      const uri = await stopRecordingTemp();
      if (!uri) return keyboardMicHint();
      setSttBusy(true);
      const res = await transcribeAudio(uri, (lang || "en-US").split("-")[0]);
      setSttBusy(false);
      if (res.text) {
        voiceText(res.text);
        readBack(res.text);
      } else if (res.unavailable) keyboardMicHint();
      else Alert.alert(tt("spDidntCatchTitle"), res.error ?? tt("spTryAgainType"));
      return;
    }

    if (Platform.OS !== "web" && !isAiConfigured()) return voiceSetupNeeded();

    // Live voice — updates the sentence (and picture) as you talk.
    if (voiceAvailable()) {
      let heard = "";
      const started = await startListening({
        lang: lang || "en-US",
        onPartial: (t) => t && voiceText(t),
        onFinal: (t) => {
          if (!t) return;
          heard = t;
          voiceText(t);
        },
        onStatus: (st) => setSttBusy(st === "processing"),
        onEnd: () => {
          setRecording(false);
          setSttBusy(false);
          readBack(heard);
        },
        onError: (msg) => {
          setRecording(false);
          setSttBusy(false);
          if (Platform.OS !== "web") Alert.alert(tt("spDidntCatchTitle"), msg || tt("spTryAgainType"));
        },
      });
      if (started) {
        setRecording(true);
        return;
      }
    }

    // Fallback: record then transcribe with Whisper (needs a key) or keyboard.
    const ok = await startRecording();
    if (!ok) return keyboardMicHint();
    setRecording(true);
  }

  const pct = Math.round(graph.confidence * 100);
  const badgeLabel =
    img?.source === "library"
      ? tt("spBadgeLibrary")
      : img?.source === "library-new"
        ? tt("spBadgeLibraryNew")
        : img?.source === "ai-saved"
          ? tt("spBadgeLibraryAi")
          : tt("spBadgeInstant");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10} accessibilityLabel={tt("back")}>
              <Ionicons name="arrow-back" size={24} color={colors.textDark} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{tt("spHeaderTitle")}</Text>
              <Text style={styles.headerSub}>
                {wordsN > 0
                  ? tt("spHeaderSubWithLib")
                      .replace("{words}", wordsN.toLocaleString())
                      .replace("{books}", String(bookVocabSize()))
                      .replace("{saved}", libN > 0 ? tt("spHeaderSubSavedSuffix").replace("{n}", String(libN)) : "")
                  : tt("spHeaderSubDefault")}
              </Text>
            </View>
            <Pressable onPress={onOpenSettings} style={styles.squareBtn} accessibilityLabel={tt("stTitle")}>
              <Ionicons name="options-outline" size={22} color={colors.forest} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} keyboardShouldPersistTaps="handled">
          <View style={[styles.stageWrap, isTablet && styles.stageWrapTablet]}>
            {img ? (
              <Image
                source={{ uri: img.uri }}
                style={styles.stageImg}
                resizeMode="contain"
                onLoadEnd={() => {
                  if (aiTimer.current) clearTimeout(aiTimer.current);
                  setAiLoading(false);
                }}
                onError={() => {
                  if (aiTimer.current) clearTimeout(aiTimer.current);
                  setAiLoading(false);
                  setImg(null);
                  setAiError(tt("spEngineNoResponse"));
                }}
              />
            ) : buildMode ? (
              <SceneStage session={displaySession} uris={itemUris} />
            ) : concept ? (
              <View style={styles.stageWhite}><ConceptView concept={concept} lang={lang} /></View>
            ) : (
              <SceneComposer graph={graph} />
            )}
            {(aiLoading || agentThinking) && (
              <View style={styles.stageOverlay}>
                <ActivityIndicator color="white" />
                <Text style={styles.stageOverlayText}>{agentThinking ? tt("spUnderstanding") : tt("spMakingPicture")}</Text>
              </View>
            )}
            <View style={[styles.sourceBadge, img ? styles.sourceAi : styles.sourceInstant]}>
              <Ionicons name={img ? "image-outline" : "flash-outline"} size={12} color="white" />
              <Text style={styles.sourceBadgeText}>{badgeLabel}</Text>
            </View>
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          <View style={styles.buildRow}>
            <View style={[styles.buildToggle, styles.buildToggleOn]}>
              <Ionicons name="chatbubbles-outline" size={16} color={colors.forestDark} />
              <Text style={styles.buildToggleText}>
                {tt("spKeepTalkingOn")}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setSession(newSession());
                setItemUris({});
                setImg(null);
                mergedRef.current = "";
                setText("");
                setHiddenChipKeys({});
              }}
              style={styles.buildReset}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.forestDark} />
              <Text style={styles.buildToggleText}>{tt("spStartOver")}</Text>
            </Pressable>
            {buildMode && !!session.items.length && (
              <Pressable onPress={() => drawSceneWithAi()} disabled={aiLoading} style={styles.buildReset}>
                <Ionicons name="brush-outline" size={16} color={colors.forestDark} />
                <Text style={styles.buildToggleText}>{aiSceneEnabled() ? tt("spRedraw") : tt("spRealPicture")}</Text>
              </Pressable>
            )}
          </View>
          {buildMode && (
            <Text style={styles.micHint}>
              {agentEnabled()
                ? tt("spMicHintAgent").replace("{agent}", agentName())
                : tt("spMicHintNoAgent")}
            </Text>
          )}

          {!concept && !buildMode && (
            <View style={styles.aiRow}>
              {img ? (
                <>
                  <Pressable onPress={() => setImg(null)} style={[styles.aiBtn, { backgroundColor: colors.cardMuted }]}>
                    <Ionicons name="flash-outline" size={16} color={colors.textMid} />
                    <Text style={[styles.aiBtnText, { color: colors.textMid }]}>{tt("spInstantScene")}</Text>
                  </Pressable>
                  <Pressable onPress={makeAiPicture} disabled={aiLoading} style={styles.aiRegenBtn}>
                    <Ionicons name="refresh-outline" size={18} color={colors.forestDark} />
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={makeAiPicture} disabled={aiLoading} style={[styles.aiBtn, aiLoading && { opacity: 0.5 }]}>
                  <Ionicons name="brush-outline" size={18} color="white" />
                  <Text style={styles.aiBtnText}>{tt("spMakeFullPicture")}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* what the engine understood */}
          {buildMode ? (
            <View style={styles.chips}>
              {sessionChipEntries(session).map((chip) => {
                const isHidden = !!hiddenChipKeys[chip.key];
                return (
                  <Chip
                    key={chip.key}
                    on={!isHidden}
                    text={chip.text}
                    onPress={() => toggleKeyword(chip.key)}
                  />
                );
              })}
            </View>
          ) : !concept ? (
            <View style={styles.chips}>
              {graph.subject?.size && graph.subject.size !== "normal" && <Chip on text={graph.subject.size} />}
              {graph.subject && graph.subject.count > 1 && <Chip on text={`${graph.subject.count}`} />}
              <Chip on={!!graph.subject?.color} text={graph.subject?.color ?? "colour"} />
              <Chip on={!!graph.subject} text={graph.subject?.type ?? "thing"} />
              {graph.subject?.action && <Chip on text={graph.subject.action} />}
              <Chip on={!!graph.relation} text={graph.relation ?? "where"} />
              <Chip on={!!graph.reference} text={graph.reference?.type ?? "object"} />
            </View>
          ) : null}
          {!concept && !buildMode && graph.subject && (
            <Text style={styles.understood}>
              {pct >= 60 ? tt("spUnderstoodWell") : tt("spPartlyUnderstood")} {tt("spUnderstoodSuffix").replace("{pct}", String(pct))}
            </Text>
          )}

          {concept && !img && (
            <View style={styles.captionCard}>
              <Text style={styles.captionTitle}>{concept.title}</Text>
              <Text style={styles.captionBody}>{concept.caption}</Text>
            </View>
          )}

          <TextInput
            value={text}
            onChangeText={typeText}
            placeholder={tt("spTypeSentencePlaceholder")}
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />
          <Pressable onPress={toggleMic} disabled={sttBusy} style={[styles.micRow, recording && styles.micRowOn]}>
            {sttBusy ? <ActivityIndicator color="white" /> : <Ionicons name={recording ? "stop" : "mic-outline"} size={22} color="white" />}
            <Text style={styles.micRowText}>{recording ? tt("spListeningTapStop") : sttBusy ? tt("spTurningSpeechToText") : tt("spSpeakSentence")}</Text>
          </Pressable>
          <Text style={styles.micHint}>{tt("spKeyboardMicHint2")}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => speak(text, lang, settings.soundEnabled, settings.speechRate)} style={styles.speakBtn}>
              <Ionicons name="volume-medium-outline" size={18} color={colors.forestDark} />
              <Text style={styles.speakBtnText}>{tt("spReadAloud")}</Text>
            </Pressable>
            <Pressable onPress={() => setText("")} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>{tt("spClear")}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>{tt("spTrySentence")}</Text>
          <View style={styles.exampleWrap}>
            {EXAMPLE_KEYS.map((ek) => {
              const e = tt(ek);
              return (
                <Pressable key={ek} onPress={() => typeText(e)} style={styles.example}>
                  <Text style={styles.exampleText}>{e}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>{tt("spScienceConcepts")}</Text>
          <View style={styles.exampleWrap}>
            {CONCEPTS.map((c) => (
              <Pressable key={c.key} onPress={() => typeText(c.title)} style={[styles.example, { backgroundColor: colors.forestLight }]}>
                <Text style={[styles.exampleText, { color: colors.forestDark }]}>{c.title}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            {tt("spBigHint")
              .replace("{things}", Object.keys(SUBJECTS).slice(0, 5).join(", "))
              .replace("{objects}", Object.keys(REFERENCES).slice(0, 5).join(", "))}
          </Text>
        </ScrollView>
      </SafeAreaView>

    </View>
  );
}

function Chip({ on, text, onPress }: { on: boolean; text: string; onPress?: () => void }) {
  const pic = getPictogramUrl(text);
  const emoji = findWordEmoji(text);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        on ? styles.chipOn : styles.chipOff,
        pressed && { opacity: 0.7 },
      ]}
      hitSlop={6}
    >
      {pic ? (
        <Image
          source={{ uri: pic }}
          style={{ width: 16, height: 16, marginRight: 4, opacity: on ? 1 : 0.4 }}
          resizeMode="contain"
        />
      ) : emoji ? (
        <Text style={[styles.chipEmoji, !on && { opacity: 0.4 }]}>{emoji} </Text>
      ) : null}
      <Text
        style={[
          styles.chipText,
          on ? { color: "white" } : { color: colors.textLight, textDecorationLine: "line-through" },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

function ConceptView({ concept, lang }: { concept: (typeof CONCEPTS)[number]; lang: Parameters<typeof t>[1] }) {
  const r = concept.render;
  if (r.kind === "plant") {
    return (
      <View style={styles.concept}>
        <Text style={{ fontSize: 64 }}>{r.flowers ? "🌷" : "🌿"}</Text>
        <View style={styles.conceptRow}>
          <Feature label={t("spFlowerLabel", lang)} absentLabel={t("spFlowerAbsent", lang)} present={!!r.flowers} glyph="🌸" />
          <Feature label={t("spSeedsLabel", lang)} absentLabel={t("spSeedsAbsent", lang)} present={!!r.seeds} glyph="🌰" />
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
      <Text style={styles.conceptNote}>{r.backbone ? t("spBackboneHighlighted", lang) : t("spNoBackbone", lang)}</Text>
    </View>
  );
}

function Feature({ label, absentLabel, present, glyph }: { label: string; absentLabel: string; present: boolean; glyph: string }) {
  return (
    <View style={styles.feature}>
      <Text style={{ fontSize: 26, opacity: present ? 1 : 0.2 }}>{glyph}</Text>
      <Text style={[styles.featureLabel, { color: present ? colors.forestDark : colors.textLight }]}>
        {present ? label : absentLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerInnerTablet: {
    maxWidth: 820,
    alignSelf: "center",
  },
  backBtn: { width: 36, height: 40, justifyContent: "center" },
  squareBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.textDark, fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  headerSub: { color: colors.textMid, fontSize: 13, marginTop: 3 },
  body: { paddingHorizontal: 22, paddingTop: 12, gap: 14, paddingBottom: 40 },
  bodyTablet: {
    maxWidth: 820,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 28,
  },
  stageWrap: { position: "relative" },
  stageWrapTablet: {
    minHeight: 320,
  },
  stageWhite: {
    width: "100%",
    aspectRatio: 320 / 236,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  stageImg: {
    width: "100%",
    aspectRatio: 320 / 236,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(20,35,28,0.45)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stageOverlayText: { color: "white", fontWeight: "600", fontSize: 12.5 },
  sourceBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sourceInstant: { backgroundColor: colors.forest },
  sourceAi: { backgroundColor: colors.deep },
  sourceBadgeText: { color: "white", fontSize: 10.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  aiError: { color: colors.danger, fontSize: 13, marginTop: -4, lineHeight: 19 },
  aiRow: { flexDirection: "row", gap: 10 },
  buildRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  buildToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  buildToggleOn: { backgroundColor: colors.lime },
  buildToggleText: { fontSize: 13.5, fontWeight: "700", color: colors.forestDark },
  buildReset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#e3eadf",
  },
  aiBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.forest,
    borderRadius: 24,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBtnText: { color: "white", fontWeight: "700", fontSize: 15.5 },
  aiRegenBtn: { width: 56, backgroundColor: colors.lime, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipEmoji: { fontSize: 13 },
  chipOn: { backgroundColor: colors.forest },
  chipOff: { backgroundColor: colors.cardMuted },
  chipText: { fontSize: 13, fontWeight: "700" },
  understood: { fontSize: 11.5, color: colors.textMid, marginTop: -4 },
  captionCard: { backgroundColor: colors.forestLight, borderRadius: 24, padding: 18 },
  captionTitle: { fontSize: 14, fontWeight: "800", color: colors.forestDark },
  captionBody: { fontSize: 12.5, color: colors.textDark, marginTop: 4, lineHeight: 18 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textDark,
    minHeight: 70,
    textAlignVertical: "top",
  },
  micRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.forest,
    borderRadius: 26,
    paddingVertical: 20,
    marginTop: 2,
  },
  micRowOn: { backgroundColor: colors.pinkDeep },
  micRowText: { color: "white", fontWeight: "700", fontSize: 17 },
  micHint: { fontSize: 13, color: colors.textMid, marginTop: 2, lineHeight: 19 },
  actionRow: { flexDirection: "row", gap: 10 },
  speakBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.lime,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtnText: { color: colors.forestDark, fontWeight: "700", fontSize: 15.5 },
  clearBtn: { flex: 1, backgroundColor: "#e3eadf", borderRadius: 24, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  clearBtnText: { color: colors.forestDark, fontWeight: "700", fontSize: 15.5 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#7b8a80", letterSpacing: 2, marginTop: 14, textTransform: "uppercase" },
  exampleWrap: { gap: 10 },
  example: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18 },
  exampleText: { fontSize: 15, color: colors.textDark, fontWeight: "600" },
  hint: { fontSize: 12.5, color: colors.textMid, lineHeight: 19, marginTop: 10 },
  concept: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  conceptRow: { flexDirection: "row", gap: 18, alignItems: "flex-end", flexWrap: "wrap", justifyContent: "center" },
  feature: { alignItems: "center", gap: 4 },
  featureLabel: { fontSize: 12, fontWeight: "700" },
  animalWrap: { alignItems: "center", gap: 4 },
  backbone: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.pinkDeep },
  noBackbone: { color: colors.textLight, fontSize: 14 },
  conceptNote: { fontSize: 12, color: colors.textMid, fontWeight: "600" },
});
