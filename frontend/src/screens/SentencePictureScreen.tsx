import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Image, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { speak } from "../modules/tts";
import { t, TKey } from "../modules/i18n";
import { parseSceneGraph, conceptByKey, CONCEPTS, SUBJECTS, REFERENCES, findWordEmoji } from "../modules/sentenceScene";
import { getPictogramUrl } from "../modules/aacPictograms";
import { loadStoredKey, setStoredKey, getOpenAiKey, generateSentenceImage, transcribeAudio } from "../modules/aiImage";
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
import SceneComposer from "../components/SceneComposer";
import SceneStage from "../components/SceneStage";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

const EXAMPLE_KEYS: TKey[] = ["spExample1", "spExample2", "spExample3", "spExample4", "spExample5"];

type ImgSource = "library" | "library-new" | "ai-saved";

export default function SentencePictureScreen({ onBack }: Props) {
  const { isTablet } = useResponsive();
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const [text, setText] = useState("");

  const [img, setImg] = useState<{ uri: string; source: ImgSource } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [openaiReady, setOpenaiReady] = useState(false);
  const [keyModal, setKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
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
    loadStoredKey().then(() => setOpenaiReady(!!getOpenAiKey()));
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
      if (agentEnabled) {
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
    if (!aiSceneEnabled) {
      setAiError(tt("spNoPollinationsToken"));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    const prompt = (await describeScene(scene)) ?? sessionPrompt(scene);
    const url = composeSceneUrl(prompt, scene.seed);
    setImg({ uri: url, source: "ai-saved" });
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
    if (openaiReady) {
      const res = await generateSentenceImage(text, false);
      if (res.error) {
        setAiLoading(false);
        setAiError(res.error);
        return;
      }
      generated = res.dataUri;
    } else if (aiSceneEnabled) {
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
      if (res.text) setText(res.text);
      else if (res.unavailable) keyboardMicHint();
      else Alert.alert(tt("spDidntCatchTitle"), res.error ?? tt("spTryAgainType"));
      return;
    }

    // Free live voice — updates the sentence (and picture) word by word.
    if (voiceAvailable()) {
      const started = await startListening({
        lang: lang || "en-US",
        onPartial: (t) => t && setText(t),
        onFinal: (t) => t && setText(t),
        onEnd: () => setRecording(false),
        onError: () => setRecording(false),
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

  async function saveKey() {
    await setStoredKey(keyInput);
    setOpenaiReady(!!getOpenAiKey());
    setKeyModal(false);
    setKeyInput("");
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
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="white" />
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
            <Pressable onPress={() => setKeyModal(true)} style={styles.backBtn}>
              <Ionicons name={openaiReady ? "sparkles" : "sparkles-outline"} size={18} color="white" />
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
              <Ionicons name={img ? "images" : "flash"} size={11} color="white" />
              <Text style={styles.sourceBadgeText}>{badgeLabel}</Text>
            </View>
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          <View style={styles.buildRow}>
            <View style={[styles.buildToggle, styles.buildToggleOn]}>
              <Ionicons name="color-wand" size={15} color="white" />
              <Text style={[styles.buildToggleText, { color: "white" }]}>
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
              <Ionicons name="refresh" size={15} color={colors.forestDark} />
              <Text style={styles.buildToggleText}>{tt("spStartOver")}</Text>
            </Pressable>
            {buildMode && !!session.items.length && (
              <Pressable onPress={() => drawSceneWithAi()} disabled={aiLoading} style={styles.buildReset}>
                <Ionicons name="sparkles" size={15} color={colors.forestDark} />
                <Text style={styles.buildToggleText}>{aiSceneEnabled ? tt("spRedraw") : tt("spRealPicture")}</Text>
              </Pressable>
            )}
          </View>
          {buildMode && (
            <Text style={styles.micHint}>
              {agentEnabled
                ? tt("spMicHintAgent").replace("{agent}", agentName)
                : tt("spMicHintNoAgent")}
            </Text>
          )}

          {!concept && !buildMode && (
            <View style={styles.aiRow}>
              {img ? (
                <>
                  <Pressable onPress={() => setImg(null)} style={[styles.aiBtn, { backgroundColor: colors.cardMuted }]}>
                    <Ionicons name="flash" size={15} color={colors.textMid} />
                    <Text style={[styles.aiBtnText, { color: colors.textMid }]}>{tt("spInstantScene")}</Text>
                  </Pressable>
                  <Pressable onPress={makeAiPicture} disabled={aiLoading} style={styles.aiRegenBtn}>
                    <Ionicons name="refresh" size={16} color={colors.forestDark} />
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={makeAiPicture} disabled={aiLoading} style={[styles.aiBtn, aiLoading && { opacity: 0.5 }]}>
                  <Ionicons name="sparkles" size={16} color="white" />
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
            onChangeText={setText}
            placeholder={tt("spTypeSentencePlaceholder")}
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
          />
          <Pressable onPress={toggleMic} disabled={sttBusy} style={[styles.micRow, recording && styles.micRowOn]}>
            {sttBusy ? <ActivityIndicator color="white" /> : <Ionicons name={recording ? "stop" : "mic"} size={20} color="white" />}
            <Text style={styles.micRowText}>{recording ? tt("spListeningTapStop") : sttBusy ? tt("spTurningSpeechToText") : tt("spSpeakSentence")}</Text>
          </Pressable>
          <Text style={styles.micHint}>{tt("spKeyboardMicHint2")}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => speak(text, lang, settings.soundEnabled)} style={styles.speakBtn}>
              <Ionicons name="volume-medium" size={16} color="white" />
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
                <Pressable key={ek} onPress={() => setText(e)} style={styles.example}>
                  <Text style={styles.exampleText}>{e}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>{tt("spScienceConcepts")}</Text>
          <View style={styles.exampleWrap}>
            {CONCEPTS.map((c) => (
              <Pressable key={c.key} onPress={() => setText(c.title)} style={[styles.example, { backgroundColor: colors.forestLight }]}>
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

      <Modal visible={keyModal} transparent animationType="fade" onRequestClose={() => setKeyModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
            <Text style={styles.modalTitle}>{tt("spModalTitle")}</Text>
            <Text style={styles.modalBody}>
              {tt("spModalBody")}
            </Text>
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder={tt("spKeyPlaceholder")}
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              secureTextEntry
              style={styles.keyInput}
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setKeyModal(false)} style={[styles.modalBtn, { backgroundColor: colors.cardMuted }]}>
                <Text style={{ color: colors.textMid, fontWeight: "700" }}>{t("cancel", lang)}</Text>
              </Pressable>
              <Pressable onPress={saveKey} style={[styles.modalBtn, { backgroundColor: colors.forest }]}>
                <Text style={{ color: "white", fontWeight: "700" }}>{t("save", lang)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.forest,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
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
  buildRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  buildToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.forest,
    backgroundColor: colors.card,
  },
  buildToggleOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  buildToggleText: { fontSize: 12.5, fontWeight: "700", color: colors.forestDark },
  buildReset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.cardMuted,
  },
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipEmoji: { fontSize: 13 },
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
  modalCardTablet: {
    maxWidth: 540,
    padding: 24,
  },
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
