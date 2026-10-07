import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Platform, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { speak } from "../modules/tts";
import { t, TKey } from "../modules/i18n";
import { parseSceneGraph, conceptByKey, CONCEPTS, SUBJECTS, REFERENCES, findWordEmoji } from "../modules/sentenceScene";
import { getPictogramUrl } from "../modules/aacPictograms";
import { isAiConfigured, generateSentenceImage, transcribeAudio, STORY_STYLE_GUIDE } from "../modules/aiImage";
import { sceneImageUrl, composeSceneUrl, composeStoryUrl, aiSceneEnabled } from "../modules/aiScene";
import { lookupImage, libraryCount, prewarmLibrary, dictionaryWords, findLessonPicture, saveLessonPicture } from "../modules/imageLibrary";
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
import { voiceAvailable, startListening, stopListening, nativeSpeechAvailable } from "../modules/voice";
import { addHistory } from "../modules/history";
import { recordSentence, recordAiPicture, recordLesson } from "../modules/progress";
import {
  chapterById,
  label,
  validateChapterSentence,
  getChapterImagePrompt,
  isPrepositionChapter,
  SUBJECT_LIST,
  chaptersFor,
  type SubjectId,
  type Grade,
  GRADES,
} from "../modules/curriculum";
import SceneComposer from "../components/SceneComposer";
import SceneStage from "../components/SceneStage";
import MathStage from "../components/MathStage";
import { parseMath, parseWordProblem, storyWithoutQuestion, sumStory } from "../modules/mathScene";
import { getActiveProfile } from "../modules/childProfiles";
import { snapToLesson } from "../modules/voiceMatch";
import { colors, radius, type } from "../theme";

interface Props {
  /** Sentence to start with (from Home). */
  initialText?: string;
  /** Open a school chapter: its lessons drive the sentence, and pictures follow the subject. */
  lesson?: { chapterId: string; index: number };
  onBack: () => void;
  onOpenSettings: () => void;
}

const EXAMPLE_KEYS: TKey[] = ["spExample1", "spExample2", "spExample3", "spExample4", "spExample5"];

type ImgSource = "library" | "library-new" | "ai-saved";

export default function SentencePictureScreen({ initialText = "", lesson, onBack, onOpenSettings }: Props) {
  const { isTablet } = useResponsive();
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  // School chapter mode (defaults to English Grade 1 Prepositions)
  const [activeChapterId, setActiveChapterId] = useState<string>(lesson?.chapterId ?? "en1-prepositions");
  const course = useMemo(() => chapterById(activeChapterId) ?? chapterById("en1-prepositions")!, [activeChapterId]);
  const [lessonIdx, setLessonIdx] = useState(lesson?.index ?? 0);
  const [showAnswer, setShowAnswer] = useState(false);
  const current = course.chapter.lessons[lessonIdx] ?? null;
  /** Extra prompt words so AI pictures match the subject (English / Math / Science). */
  const imageStyle = course.subject.imageStyle;

  // Chapter picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSubjectId, setPickerSubjectId] = useState<SubjectId>(course.subject.id);
  const [pickerGrade, setPickerGrade] = useState<Grade>(course.grade);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  useEffect(() => {
    if (!lesson) {
      AsyncStorage.getItem("bloomlearn_active_chapter").then((saved) => {
        if (saved && chapterById(saved)) setActiveChapterId(saved);
      });
    }
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("bloomlearn_active_chapter", activeChapterId).catch(() => {});
  }, [activeChapterId]);

  useEffect(() => {
    setPickerSubjectId(course.subject.id);
    setPickerGrade(course.grade);
  }, [course]);

  const [text, setText] = useState(current?.say ?? (initialText || course.chapter.lessons[0]?.say || ""));

  // `sentence` = the sentence the picture was made for, so it survives that sentence being re-read
  const [img, setImg] = useState<{ uri: string; source: ImgSource; sentence?: string } | null>(null);
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
  const isMathSubject = course.subject.id === "math";
  const math = useMemo(() => {
    if (!isMathSubject) return null;
    return parseMath(text) ?? parseWordProblem(text);
  }, [text, isMathSubject]);
  const story = useMemo(() => {
    if (!isMathSubject) return null;
    const sum = parseMath(text);
    if (sum) return sumStory(sum);
    return parseWordProblem(text) ? storyWithoutQuestion(text) : null;
  }, [text, isMathSubject]);
  const chapterValidation = useMemo(() => {
    if (!activeChapterId || !text.trim()) return { valid: true };
    return validateChapterSentence(activeChapterId, text);
  }, [activeChapterId, text]);
  const [storyPic, setStoryPic] = useState<string | null>(null);
  const [storyState, setStoryState] = useState<"idle" | "drawing" | "needsEngine" | "failed">("idle");
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
    if (!q || q === mergedRef.current || parseMath(q) || parseWordProblem(q)) return;
    if (!validateChapterSentence(activeChapterId, q).valid) return;
    const t = setTimeout(async () => {
      mergedRef.current = q;
      setAiError(null);
      setAgentThinking(false);
      setImg((prev) => (prev?.sentence === q ? prev : null));
      // "start over", or a full "the X on the Y" sentence that drops leftovers
      // In a school chapter every sentence is its own picture; in free talk it builds on the scene.
      const fresh = isReset(q) || !!course || isFreshScene(q, sessionRef.current.items.map((i) => i.type));
      if (fresh) setItemUris({});
      if (isReset(q)) {
        setSession(newSession());
        return;
      }
      // Draw the on-device understanding straight away, so the child never waits
      // on a blank stage. The LLM agent (when set up) then refines it in the
      // background — except for the chapter's own lessons, which are written
      // for the on-device parser and need no agent at all.
      const base = fresh ? newSession() : sessionRef.current;
      setSession(applyUtterance(base, q));
      const isLesson = course.chapter.lessons.some((l) => l.say.trim().toLowerCase() === q.toLowerCase());
      if (!agentEnabled() || isLesson) return;
      setAgentThinking(true);
      const ops = await parseUtteranceLLM(q, base);
      if (mergedRef.current !== q) return;
      setAgentThinking(false);
      if (ops && ops.length) setSession(applyOps(base, ops));
    }, 350);
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

  /**
   * On phones the clip goes through Whisper, which can mishear a word; snap a
   * near-miss onto this chapter's lesson sentence. The browser's own speech
   * recognition is already accurate, so the PC keeps exactly what it heard.
   */
  function fixHeard(said: string): string {
    if (Platform.OS === "web") return said;
    return snapToLesson(said, course.chapter.lessons.map((l) => l.say)) ?? said;
  }

  function voiceText(value: string) {
    fromVoiceRef.current = true;
    setText(value);
  }

  function resetScene() {
    setSession(newSession());
    setItemUris({});
    setImg(null);
    setAiError(null);
    mergedRef.current = "";
    setHiddenChipKeys({});
  }

  /** Move to another lesson of the open chapter, starting from a clean scene. */
  function goToLesson(i: number) {
    const next = course.chapter.lessons[i];
    if (!next) return;
    resetScene();
    setShowAnswer(false);
    setLessonIdx(i);
    typeText(next.say);
    // Show the AI picture already made for this lesson in this chapter, if any
    // (never a word picture, nor one drawn for another chapter's lesson)
    findLessonPicture(activeChapterId, next.say).then((uri) => {
      if (uri && textRef.current === next.say) setImg({ uri, source: "ai-saved", sentence: next.say.trim() });
    });
  }

  useEffect(() => {
    recordLesson(course.chapter.id, lessonIdx);
  }, [lessonIdx, activeChapterId]);

  // Auto-generation of story picture is disabled so images are only created when the user taps Generate Picture
  useEffect(() => {
    setStoryPic(null);
    setStoryState("idle");
  }, [text]);

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
      if (!validateChapterSentence(activeChapterId, q).valid) return;
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
    // 1. Strict validation: ensure the sentence aligns with the active chapter!
    const validation = validateChapterSentence(activeChapterId, text);
    if (!validation.valid) {
      setAiError(validation.reason || "This chapter only allows specific sentences.");
      Alert.alert(
        `${label(course.chapter.title, lang)} (${label(course.subject.title, lang)})`,
        (validation.reason ? validation.reason + "\n\n" : "") + (validation.hint || "")
      );
      return;
    }

    setAiLoading(true);
    setAiError(null);

    // 2. Build high-quality educational prompt for this subject & chapter
    const prompt = getChapterImagePrompt(activeChapterId, text, graph);
    let generated: string | undefined;

    if (isAiConfigured()) {
      const res = await generateSentenceImage(text, false, "story", prompt);
      if (res.error && !aiSceneEnabled()) {
        setAiLoading(false);
        setAiError(res.error);
        return;
      }
      generated = res.dataUri;
    }

    if (!generated && aiSceneEnabled()) {
      const seed = storySeed(text);
      generated = composeStoryUrl(prompt, seed);
    } else if (!isAiConfigured()) {
      setAiLoading(false);
      setAiError(tt("spNoAiEngine"));
      return;
    }

    if (!generated) {
      setAiLoading(false);
      setAiError(tt("spCouldNotMake"));
      return;
    }

    // Save it for this chapter + sentence only, so it is served from there next time.
    const entry = await saveLessonPicture(activeChapterId, text, generated);
    setImg({ uri: entry?.uri ?? generated, source: "ai-saved", sentence: text.trim() });
    recordAiPicture();
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setTimeout(() => setAiLoading(false), 5000);
    aiTimer.current = setTimeout(() => {
      setAiLoading(false);
      setImg(null);
      setAiError(tt("spEngineTooLong"));
    }, 20000);
    libraryCount().then(setLibN);
  }

  // Turn the built scene into one real picture (uses chapter-aligned AI generation)
  async function drawSceneWithAi() {
    return makeAiPicture();
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
        const said = fixHeard(res.text);
        voiceText(said);
        readBack(said);
      } else if (res.unavailable) keyboardMicHint();
      else Alert.alert(tt("spDidntCatchTitle"), res.error ?? tt("spTryAgainType"));
      return;
    }

    if (Platform.OS !== "web" && !isAiConfigured() && !nativeSpeechAvailable()) return voiceSetupNeeded();

    // Live voice — updates the sentence (and picture) as you talk.
    if (voiceAvailable()) {
      let heard = "";
      const started = await startListening({
        lang: lang || "en-US",
        onPartial: (t) => t && voiceText(t),
        onFinal: (t) => {
          if (!t) return;
          heard = fixHeard(t);
          voiceText(heard);
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
              <Ionicons name="chevron-back" size={22} color={colors.textDark} />
            </Pressable>
            <Pressable onPress={() => setPickerOpen(true)} style={styles.headerTitleWrap} hitSlop={8}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {label(course.chapter.title, lang)}
                </Text>
                <Ionicons name="chevron-down-circle" size={19} color={colors.forest} />
              </View>
              <Text style={styles.headerSub}>
                {`${label(course.subject.title, lang)} · ${tt("sbGrade").replace("{n}", String(course.grade))} · ${tt("lsLessonOf")
                  .replace("{i}", String(lessonIdx + 1))
                  .replace("{n}", String(course.chapter.lessons.length))}`}
              </Text>
            </Pressable>
            {getActiveProfile() && (
              <View style={styles.childHeaderPill}>
                <Text style={{ fontSize: 16 }}>{getActiveProfile()!.avatarIcon}</Text>
                <Text style={styles.childHeaderPillText} numberOfLines={1}>
                  {getActiveProfile()!.name.split(" ")[0]}
                </Text>
              </View>
            )}
            <Pressable onPress={onOpenSettings} style={styles.squareBtn} accessibilityLabel={tt("stTitle")}>
              <Ionicons name="settings-outline" size={21} color={colors.textDark} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} keyboardShouldPersistTaps="handled">
          <View style={[styles.stageWrap, isTablet && styles.stageWrapTablet]}>
            {img ? (
              <Pressable
                onPress={() => setZoomModalOpen(true)}
                style={styles.stageImgPressable}
                accessibilityLabel="Tap to zoom picture"
              >
                <Image
                  source={{ uri: img.uri }}
                  style={styles.stageImg}
                  resizeMode="cover"
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
                <View style={styles.zoomTapHint}>
                  <Ionicons name="scan-outline" size={13} color="white" />
                  <Text style={styles.zoomTapHintText}>Tap to Zoom</Text>
                </View>
              </Pressable>
            ) : math ? (
              // keep the answer hidden in a chapter until "Show answer" is tapped
              <MathStage
                scene={math}
                hideResult={!!current?.answer && !showAnswer}
                onReveal={() => setShowAnswer(true)}
                revealHint={tt("lsTapToSee")}
              />
            ) : concept ? (
              // science concepts ("vertebrates have a backbone") have their own clearer drawing
              <View style={styles.stageWhite}><ConceptView concept={concept} lang={lang} /></View>
            ) : !chapterValidation.valid && text.trim() ? (
              <View style={styles.invalidStage}>
                <Ionicons name="alert-circle-outline" size={44} color="#d97706" />
                <Text style={styles.invalidStageTitle}>{chapterValidation.reason}</Text>
                {chapterValidation.hint && (
                  <Text style={styles.invalidStageHint}>{chapterValidation.hint}</Text>
                )}
              </View>
            ) : buildMode ? (
              <SceneStage session={displaySession} uris={itemUris} />
            ) : (
              <SceneComposer graph={graph} />
            )}
            {aiLoading ? (
              <View style={styles.stageOverlay}>
                <ActivityIndicator color="white" />
                <Text style={styles.stageOverlayText}>{tt("spMakingPicture")}</Text>
              </View>
            ) : agentThinking ? (
              // the instant scene is already drawn; this only says it's being refined
              <View style={styles.thinkingPill} pointerEvents="none">
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.thinkingPillText}>{tt("spUnderstanding")}</Text>
              </View>
            ) : null}
            {/* only label real (library / AI) pictures; drawn scenes need no badge */}
            {img && (
              <View style={[styles.sourceBadge, img ? styles.sourceAi : styles.sourceInstant]}>
                <Ionicons name={img ? "image-outline" : "flash-outline"} size={12} color="white" />
                <Text style={styles.sourceBadgeText}>{badgeLabel}</Text>
              </View>
            )}
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          {/* AI Picture Action Bar */}
          <View style={styles.chapterActionRow}>
            {img ? (
              <>
                <Pressable
                  onPress={() => setImg(null)}
                  style={[styles.actionBtn, styles.actionBtnSecondary]}
                >
                  <Ionicons name="flash-outline" size={17} color={colors.forestDark} />
                  <Text style={styles.actionBtnTextSecondary}>{tt("spInstantScene")}</Text>
                </Pressable>
                <Pressable
                  onPress={makeAiPicture}
                  disabled={aiLoading}
                  style={[styles.actionBtn, styles.actionBtnPrimary, aiLoading && { opacity: 0.6 }]}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="sparkles" size={17} color="white" />
                  )}
                  <Text style={styles.actionBtnTextPrimary}>
                    {aiLoading ? "Generating..." : "Regenerate AI Picture"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={makeAiPicture}
                disabled={aiLoading}
                style={[styles.actionBtn, styles.actionBtnPrimary, styles.actionBtnFull, aiLoading && { opacity: 0.6 }]}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="sparkles" size={19} color="white" />
                )}
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.actionBtnTextPrimary}>
                    {aiLoading ? "Creating High Quality Picture..." : `Generate Picture (${label(course.chapter.title, lang)})`}
                  </Text>
                  <Text style={styles.actionBtnSubtext}>
                    {isPrepositionChapter(activeChapterId) ? "Only Preposition Sentences" : `${label(course.subject.title, lang)} Style`}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>



          {/* Lesson Navigation Bar */}
          <View style={styles.lessonNavRow}>
            <Pressable
              onPress={() => goToLesson(lessonIdx - 1)}
              disabled={lessonIdx === 0}
              style={[styles.navBtn, lessonIdx === 0 && { opacity: 0.35 }]}
              accessibilityLabel={tt("lsPrevious")}
            >
              <Ionicons name="chevron-back" size={18} color={colors.forestDark} />
              <Text style={styles.navBtnText}>{tt("lsPrevShort")}</Text>
            </Pressable>
            <Pressable onPress={() => setPickerOpen(true)} style={styles.lessonCounter}>
              <Text style={styles.lessonCounterText}>
                {`${tt("lsLessonOf").replace("{i}", String(lessonIdx + 1)).replace("{n}", String(course.chapter.lessons.length))}`}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.forest} />
            </Pressable>
            <Pressable
              onPress={() => goToLesson(lessonIdx + 1)}
              disabled={lessonIdx >= course.chapter.lessons.length - 1}
              style={[styles.navBtn, lessonIdx >= course.chapter.lessons.length - 1 && { opacity: 0.35 }]}
              accessibilityLabel={tt("lsNext")}
            >
              <Text style={styles.navBtnText}>{tt("lsNextShort")}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.forestDark} />
            </Pressable>
          </View>

          <View style={styles.buildRow}>
            <Pressable
              onPress={() => {
                resetScene();
                setText("");
              }}
              style={styles.buildReset}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.forestDark} />
              <Text style={styles.buildToggleText}>{tt("spStartOver")}</Text>
            </Pressable>
            <Pressable onPress={() => setPickerOpen(true)} style={styles.buildReset}>
              <Ionicons name="book-outline" size={16} color={colors.forestDark} />
              <Text style={styles.buildToggleText}>Switch Chapter</Text>
            </Pressable>
          </View>

          {/* what the engine understood */}
          {math ? null : buildMode ? (
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

          {course ? (
            <>
              <Text style={styles.sectionLabel}>{tt("lsAllLessons")}</Text>
              <View style={styles.exampleWrap}>
                {course.chapter.lessons.map((l, i) => {
                  const on = i === lessonIdx;
                  return (
                    <Pressable key={i} onPress={() => goToLesson(i)} style={[styles.example, styles.lessonRow, on && styles.lessonRowOn]}>
                      <Text style={[styles.lessonNum, on && { color: "white", backgroundColor: colors.forest }]}>{i + 1}</Text>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.exampleText}>{l.question ?? l.say}</Text>
                        {/* the current lesson's answer lives here, not above the picture */}
                        {on && l.answer && !math && (showAnswer ? (
                          <Text style={styles.answerText}>
                            {tt("lsAnswer")}: {l.answer}
                          </Text>
                        ) : (
                          <Pressable onPress={() => setShowAnswer(true)} hitSlop={8} style={styles.answerLink}>
                            <Ionicons name="eye-outline" size={15} color={colors.forest} />
                            <Text style={styles.answerLinkText}>{tt("lsShowAnswer")}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
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
            </>
          )}

          {!course && (
            <>
              <Text style={styles.sectionLabel}>{tt("spScienceConcepts")}</Text>
              <View style={styles.exampleWrap}>
                {CONCEPTS.map((c) => (
                  <Pressable key={c.key} onPress={() => typeText(c.title)} style={[styles.example, { backgroundColor: colors.forestLight }]}>
                    <Text style={[styles.exampleText, { color: colors.forestDark }]}>{c.title}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={styles.hint}>
            {tt("spBigHint")
              .replace("{things}", Object.keys(SUBJECTS).slice(0, 5).join(", "))
              .replace("{objects}", Object.keys(REFERENCES).slice(0, 5).join(", "))}
          </Text>
        </ScrollView>
      </SafeAreaView>

      {/* Chapter Picker Modal */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, isTablet && styles.modalSheetTablet]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Subject & Chapter</Text>
                <Text style={styles.modalSub}>Select any subject, grade, or topic to learn</Text>
              </View>
              <Pressable onPress={() => setPickerOpen(false)} style={styles.modalCloseBtn} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textDark} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Subject tabs */}
              <Text style={[type.eyebrow, { marginBottom: 8 }]}>Subject</Text>
              <View style={styles.modalSubjectRow}>
                {SUBJECT_LIST.map((s) => {
                  const on = s.id === pickerSubjectId;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setPickerSubjectId(s.id)}
                      style={[styles.modalSubjectTab, on && styles.modalSubjectTabOn]}
                    >
                      <Text style={[styles.modalSubjectTabText, on && styles.modalSubjectTabTextOn]}>
                        {label(s.title, lang)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Grade picker */}
              <Text style={[type.eyebrow, { marginTop: 14, marginBottom: 8 }]}>Grade</Text>
              <View style={styles.modalGradeRow}>
                {GRADES.map((g) => {
                  const on = g === pickerGrade;
                  const sub = SUBJECT_LIST.find((s) => s.id === pickerSubjectId) || course.subject;
                  const has = chaptersFor(sub, g).length > 0;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setPickerGrade(g)}
                      style={[styles.modalGradeChip, on && styles.modalGradeChipOn]}
                    >
                      <Text style={[styles.modalGradeChipText, on && { color: "white" }, !has && !on && { color: colors.textLight }]}>
                        Grade {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Chapters list */}
              <Text style={[type.eyebrow, { marginTop: 14, marginBottom: 8 }]}>Chapters</Text>
              {(() => {
                const sub = SUBJECT_LIST.find((s) => s.id === pickerSubjectId) || course.subject;
                const chs = chaptersFor(sub, pickerGrade);
                if (!chs.length) {
                  return (
                    <View style={styles.modalEmpty}>
                      <Text style={styles.modalEmptyText}>No chapters available for Grade {pickerGrade} in this subject.</Text>
                    </View>
                  );
                }
                return (
                  <View style={{ gap: 10 }}>
                    {chs.map((c, i) => {
                      const isCur = c.id === activeChapterId;
                      return (
                        <Pressable
                          key={c.id}
                          onPress={() => {
                            setActiveChapterId(c.id);
                            setLessonIdx(0);
                            setShowAnswer(false);
                            resetScene();
                            setImg(null);
                            const first = c.lessons[0]?.say ?? "";
                            setText(first);
                            setPickerOpen(false);
                            if (first) {
                              findLessonPicture(c.id, first).then((uri) => {
                                if (uri && textRef.current === first) setImg({ uri, source: "ai-saved", sentence: first.trim() });
                              });
                            }
                          }}
                          style={[styles.modalChapterItem, isCur && styles.modalChapterItemActive]}
                        >
                          <View style={[styles.modalChapterNum, isCur && { backgroundColor: colors.forest }]}>
                            <Text style={[styles.modalChapterNumText, isCur && { color: "white" }]}>{i + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.modalChapterTitle}>{label(c.title, lang)}</Text>
                            <Text style={styles.modalChapterSummary} numberOfLines={1}>{label(c.summary, lang)}</Text>
                            <Text style={styles.modalChapterLessonsCount}>{c.lessons.length} lessons</Text>
                          </View>
                          {isCur ? (
                            <Ionicons name="checkmark-circle" size={24} color={colors.forest} />
                          ) : (
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Picture Zoom Lightbox Modal */}
      <Modal
        visible={zoomModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomModalOpen(false)}
      >
        <View style={styles.zoomModalBackdrop}>
          <SafeAreaView style={styles.zoomModalSafe} edges={["top", "bottom", "left", "right"]}>
            <View style={styles.zoomModalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.zoomModalTitle} numberOfLines={1}>
                  {label(course.chapter.title, lang)}
                </Text>
                <Text style={styles.zoomModalSub} numberOfLines={1}>
                  {label(course.subject.title, lang)} · Grade {course.grade}
                </Text>
              </View>
              <Pressable
                onPress={() => setZoomModalOpen(false)}
                style={styles.zoomCloseBtn}
                hitSlop={15}
                accessibilityLabel="Close full screen view"
              >
                <Ionicons name="close" size={26} color="white" />
              </Pressable>
            </View>

            <View style={styles.zoomModalBody}>
              {img && (
                <Image
                  source={{ uri: img.uri }}
                  style={styles.zoomModalImg}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.zoomModalFooter}>
              <Text style={styles.zoomModalSentence} numberOfLines={3}>
                {text}
              </Text>
              <Pressable
                onPress={() => readBack(text)}
                style={styles.zoomModalSpeakBtn}
                accessibilityLabel="Listen"
              >
                <Ionicons name="volume-high" size={20} color="white" />
                <Text style={styles.zoomModalSpeakText}>Listen</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

    </View>
  );
}

/** Stable seed so the same story always gets the same picture. */
function storySeed(story: string): number {
  let h = 0;
  for (let i = 0; i < story.length; i++) h = (Math.imul(31, h) + story.charCodeAt(i)) | 0;
  return (h >>> 0) % 1_000_000;
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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  squareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.textDark, fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { color: colors.textMid, fontSize: 13, marginTop: 3 },
  body: { paddingHorizontal: 16, paddingTop: 12, gap: 14, paddingBottom: 40 },
  bodyTablet: {
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 28,
  },
  stageWrap: {
    position: "relative",
    width: "100%",
  },
  stageWrapTablet: {
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
  },
  stageWhite: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  stageImgPressable: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  stageImg: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
  },
  zoomTapHint: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(10, 20, 15, 0.72)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  zoomTapHintText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  thinkingPill: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(20,35,28,0.7)",
  },
  thinkingPillText: { color: "white", fontWeight: "600", fontSize: 11.5 },
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
  answerText: { fontSize: 14, fontWeight: "800", color: colors.forest },
  answerLink: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  answerLinkText: { fontSize: 14, fontWeight: "700", color: colors.forest },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  lessonRowOn: { borderColor: colors.forest, backgroundColor: colors.forestLight },
  lessonNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.textMid,
    backgroundColor: colors.cardMuted,
    overflow: "hidden",
  },
  storyCard: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  storyImg: { width: "100%", aspectRatio: 1 },
  storyOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  storyPlaceholder: { position: "relative", aspectRatio: 1, backgroundColor: colors.cardMuted },
  storyOverlayText: { fontSize: 14, fontWeight: "700", color: colors.forest },
  storyNotice: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, padding: 16, backgroundColor: colors.yellow },
  storyNoticeText: { flex: 1, minWidth: 200, fontSize: 13.5, color: colors.textDark, lineHeight: 19 },
  storyNoticeBtn: { backgroundColor: colors.card, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  storyNoticeBtnText: { fontSize: 13.5, fontWeight: "800", color: colors.forest },
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
  headerTitleWrap: {
    flex: 1,
  },
  chapterActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  actionBtnSecondary: {
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  actionBtnFull: {
    width: "100%",
    paddingVertical: 16,
  },
  actionBtnTextPrimary: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },
  actionBtnTextSecondary: {
    color: colors.forestDark,
    fontSize: 14,
    fontWeight: "700",
  },
  actionBtnSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  lessonNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  navBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.forestDark,
  },
  lessonCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.forestLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  lessonCounterText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.forest,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 34,
    maxHeight: "85%",
  },
  modalSheetTablet: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    borderRadius: 28,
    marginBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark,
  },
  modalSub: {
    fontSize: 12.5,
    color: colors.textMid,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalSubjectRow: {
    flexDirection: "row",
    gap: 8,
  },
  modalSubjectTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modalSubjectTabOn: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  modalSubjectTabText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.textDark,
  },
  modalSubjectTabTextOn: {
    color: "white",
  },
  modalGradeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modalGradeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modalGradeChipOn: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  modalGradeChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.textDark,
  },
  modalChapterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  modalChapterItemActive: {
    borderColor: colors.forest,
    backgroundColor: colors.forestLight,
  },
  modalChapterNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  modalChapterNumText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.forestDark,
  },
  modalChapterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textDark,
  },
  modalChapterSummary: {
    fontSize: 12.5,
    color: colors.textMid,
    marginTop: 2,
  },
  modalChapterLessonsCount: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.forest,
    marginTop: 3,
  },
  modalEmpty: {
    padding: 24,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 13.5,
    color: colors.textMid,
    textAlign: "center",
  },
  zoomModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 18, 14, 0.95)",
  },
  zoomModalSafe: {
    flex: 1,
    justifyContent: "space-between",
  },
  zoomModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  zoomModalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  zoomModalSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12.5,
    marginTop: 2,
  },
  zoomCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomModalBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  zoomModalImg: {
    width: "100%",
    height: "100%",
    maxWidth: 800,
    maxHeight: 800,
  },
  zoomModalFooter: {
    backgroundColor: "rgba(20, 35, 28, 0.92)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  zoomModalSentence: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
  },
  zoomModalSpeakBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  zoomModalSpeakText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  // sized like the picture stage (it sits in a ScrollView, so no height: "100%")
  invalidStage: {
    width: "100%",
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: "#fffbf5",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fde3c3",
  },
  invalidStageTitle: {
    color: "#b45309",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  invalidStageHint: {
    color: "#78716c",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
    maxWidth: 340,
  },
  childHeaderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8f5e9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  childHeaderPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.forest,
  },
});
