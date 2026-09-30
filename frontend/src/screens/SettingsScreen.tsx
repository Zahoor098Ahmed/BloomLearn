import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, TextInput, Modal, Linking, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import appJson from "../../app.json";
import { useSettings } from "../context/SettingsContext";
import { LANGUAGES, t, type TKey, applyLanguageDirection } from "../modules/i18n";
import type { LanguageCode } from "../types";
import { speak } from "../modules/tts";
import { getKey, getSavedKey, isFromBuild, setKey, clearApiKeys, maskKey, type ApiKeyName } from "../modules/apiKeys";
import { isAiConfigured, clearAiCache } from "../modules/aiImage";
import { agentEnabled } from "../modules/sceneAgent";
import { aiSceneEnabled } from "../modules/aiScene";
import { libraryCount, prewarmLibrary, clearLibrary } from "../modules/imageLibrary";
import { clearHistory } from "../modules/history";
import { clearProgress } from "../modules/progress";
import { loadPasscode, hasPasscode, setPasscode, clearPasscode } from "../modules/passcode";
import Logo from "../components/Logo";
import TopBar from "../components/TopBar";
import Group, { Row } from "../components/Group";
import Segmented from "../components/Segmented";
import Toggle from "../components/Toggle";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
}

const RATES: { key: TKey; value: number }[] = [
  { key: "stSlow", value: 0.65 },
  { key: "stNormal", value: 0.88 },
  { key: "stFast", value: 1.05 },
];

interface EngineDef {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  bg: string;
  title: TKey;
  sub: TKey;
  link?: string;
  fields: { name: ApiKeyName; label: TKey; placeholder: string; secret: boolean }[];
}

const ENGINES: EngineDef[] = [
  {
    id: "openai",
    icon: "mic-outline",
    tint: colors.greenDeep,
    bg: colors.green,
    title: "stOpenai",
    sub: "stOpenaiSub",
    link: "https://platform.openai.com/api-keys",
    fields: [{ name: "openai", label: "stOpenai", placeholder: "sk-…", secret: true }],
  },
  {
    id: "groq",
    icon: "chatbubbles-outline",
    tint: colors.blueDeep,
    bg: colors.blue,
    title: "stGroq",
    sub: "stGroqSub",
    link: "https://console.groq.com/keys",
    fields: [{ name: "groq", label: "stGroq", placeholder: "gsk_…", secret: true }],
  },
  {
    id: "pollinations",
    icon: "brush-outline",
    tint: colors.pinkDeep,
    bg: colors.pink,
    title: "stPollinations",
    sub: "stPollinationsSub",
    link: "https://auth.pollinations.ai",
    fields: [{ name: "pollinations", label: "stPollinations", placeholder: "token", secret: true }],
  },
  {
    id: "server",
    icon: "server-outline",
    tint: colors.yellowDeep,
    bg: colors.yellow,
    title: "stServer",
    sub: "stServerSub",
    fields: [
      { name: "proxyUrl", label: "stServerUrl", placeholder: "http://192.168.1.10:8787", secret: false },
      { name: "proxyToken", label: "stServerToken", placeholder: "APP_TOKEN", secret: true },
    ],
  },
];

export default function SettingsScreen({ onBack, onOpenHelp, onOpenPrivacy }: Props) {
  const { settings, update, reset } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  const [, setKeysVersion] = useState(0);
  const [editing, setEditing] = useState<EngineDef | null>(null);
  const [draft, setDraft] = useState<Partial<Record<ApiKeyName, string>>>({});
  const [libN, setLibN] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [pinValue, setPinValue] = useState("");

  useEffect(() => {
    libraryCount().then(setLibN);
    loadPasscode().then(() => setPinSet(hasPasscode()));
  }, []);

  const refreshKeys = () => setKeysVersion((v) => v + 1);

  function confirm(title: string, message: string, action: () => Promise<void> | void) {
    Alert.alert(title, message, [
      { text: tt("cancel"), style: "cancel" },
      { text: tt("stConfirm"), style: "destructive", onPress: () => void action() },
    ]);
  }

  async function savePin() {
    const ok = await setPasscode(pinValue);
    if (!ok) return Alert.alert(tt("stPinInvalid"));
    setPinSet(true);
    setPinModal(false);
    setPinValue("");
  }

  function toggleLock(v: boolean) {
    if (v) {
      setPinValue("");
      setPinModal(true);
    } else {
      confirm(tt("stLock"), tt("stUnlockMsg"), async () => {
        await clearPasscode();
        setPinSet(false);
      });
    }
  }

  function chooseLanguage(code: LanguageCode) {
    if (code === lang) return;
    update({ language: code });
    if (applyLanguageDirection(code)) Alert.alert(t("stRestartTitle", code), t("stRtlNote", code));
  }

  function openEditor(engine: EngineDef) {
    const d: Partial<Record<ApiKeyName, string>> = {};
    for (const f of engine.fields) d[f.name] = getSavedKey(f.name);
    setDraft(d);
    setEditing(engine);
  }

  async function saveEditor() {
    if (!editing) return;
    for (const f of editing.fields) await setKey(f.name, draft[f.name] ?? "");
    setEditing(null);
    refreshKeys();
  }

  async function removeEngine() {
    if (!editing) return;
    for (const f of editing.fields) await setKey(f.name, "");
    setEditing(null);
    refreshKeys();
  }

  function engineState(engine: EngineDef): { on: boolean; text: string } {
    const main = engine.fields[0];
    const value = getKey(main.name);
    if (!value) return { on: false, text: tt("stNotSet") };
    if (isFromBuild(main.name)) return { on: true, text: tt("stFromBuild") };
    return { on: true, text: main.secret ? maskKey(value) : value.replace(/^https?:\/\//, "") };
  }

  async function downloadPictures() {
    setDownloading(true);
    const poll = setInterval(() => libraryCount().then(setLibN), 1500);
    await prewarmLibrary(400);
    clearInterval(poll);
    setLibN(await libraryCount());
    setDownloading(false);
    Alert.alert(tt("stDownloaded"));
  }

  // Voice-to-text: browsers have it built in; phones need OpenAI or the server.
  const voiceOn = Platform.OS === "web" || isAiConfigured();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.pad}>
          <TopBar title={tt("stTitle")} onBack={onBack} />
        </View>

        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          {/* Language */}
          <Group title={tt("stLanguage")}>
            <View style={styles.inner}>
              <Segmented options={LANGUAGES.map((l) => ({ value: l.code, label: l.nativeName }))} value={lang} onChange={chooseLanguage} />
            </View>
          </Group>

          {/* Voice */}
          <Group title={tt("stVoice")}>
            <Row icon="volume-high-outline" label={tt("stReadAloud")} trailing={<Toggle value={settings.soundEnabled} onChange={(v) => update({ soundEnabled: v })} />} />
            <Row
              icon="repeat-outline"
              tint={colors.blueDeep}
              bg={colors.blue}
              label={tt("stAutoSpeak")}
              trailing={<Toggle value={settings.autoSpeak} disabled={!settings.soundEnabled} onChange={(v) => update({ autoSpeak: v })} />}
            />
            <View style={styles.inner}>
              <Text style={styles.innerLabel}>{tt("stSpeed")}</Text>
              <Segmented options={RATES.map((r) => ({ value: r.value, label: tt(r.key) }))} value={nearestRate(settings.speechRate)} onChange={(v) => update({ speechRate: v })} />
            </View>
            <Row icon="play-outline" tint={colors.yellowDeep} bg={colors.yellow} label={tt("stTestVoice")} onPress={() => speak(tt("stTestPhrase"), lang, true, settings.speechRate)} />
          </Group>

          {/* Engines */}
          <Group title={tt("stAi")} note={tt("stAiSub")}>
            <View style={[styles.inner, styles.statusRow]}>
              <Status on={voiceOn} label={tt("stStatusVoice")} />
              <Status on={agentEnabled()} label={tt("stStatusAgent")} />
              <Status on={isAiConfigured() || aiSceneEnabled()} label={tt("stStatusDrawing")} />
            </View>
            {ENGINES.map((e) => {
              const st = engineState(e);
              return (
                <Row
                  key={e.id}
                  icon={e.icon}
                  tint={e.tint}
                  bg={e.bg}
                  label={tt(e.title)}
                  detail={tt(e.sub)}
                  onPress={() => openEditor(e)}
                  trailing={
                    <Text style={[styles.state, st.on && { color: colors.forest }]} numberOfLines={1}>
                      {st.text}
                    </Text>
                  }
                />
              );
            })}
          </Group>

          {/* Parent */}
          <Group title={tt("stParent")} note={tt("stLockInfo")}>
            <Row icon="lock-closed-outline" tint={colors.yellowDeep} bg={colors.yellow} label={tt("stLock")} trailing={<Toggle value={pinSet} onChange={toggleLock} />} />
            {pinSet && (
              <Row
                icon="keypad-outline"
                label={tt("stChangePin")}
                chevron
                onPress={() => {
                  setPinValue("");
                  setPinModal(true);
                }}
              />
            )}
          </Group>

          {/* Privacy */}
          <Group title={tt("stPrivacyTitle")} note={tt("stPrivacy")}>
            <Row
              icon="document-text-outline"
              tint={colors.purpleDeep}
              bg={colors.purple}
              label={tt("stSaveHistory")}
              trailing={<Toggle value={settings.saveHistory} onChange={(v) => update({ saveHistory: v })} />}
            />
            <Row icon="shield-checkmark-outline" label={tt("stPrivacyPolicy")} chevron onPress={onOpenPrivacy} />
          </Group>

          {/* Library */}
          <Group title={tt("stLibrary")}>
            <Row
              icon="cloud-download-outline"
              tint={colors.blueDeep}
              bg={colors.blue}
              label={downloading ? tt("stDownloading") : tt("stDownload")}
              detail={tt("stLibrarySub").replace("{n}", libN.toLocaleString())}
              onPress={downloading ? undefined : downloadPictures}
              trailing={downloading ? <ActivityIndicator color={colors.forest} /> : undefined}
            />
          </Group>

          {/* Data */}
          <Group title={tt("stData")}>
            <Row icon="time-outline" danger label={tt("stClearHistory")} onPress={() => confirm(tt("stClearHistory"), tt("stClearHistoryMsg"), clearHistory)} />
            <Row icon="trending-up-outline" danger label={tt("stResetProgress")} onPress={() => confirm(tt("stResetProgress"), tt("stResetProgressMsg"), clearProgress)} />
            <Row
              icon="images-outline"
              danger
              label={tt("stClearLibrary")}
              onPress={() =>
                confirm(tt("stClearLibrary"), tt("stClearLibraryMsg"), async () => {
                  await clearLibrary();
                  await clearAiCache();
                  setLibN(0);
                })
              }
            />
            <Row
              icon="refresh-outline"
              danger
              label={tt("stResetSettings")}
              onPress={() =>
                confirm(tt("stResetSettings"), tt("stResetSettingsMsg"), async () => {
                  await clearApiKeys();
                  reset();
                  refreshKeys();
                })
              }
            />
          </Group>

          {/* About */}
          <Group title={tt("stAbout")}>
            <Row icon="book-outline" tint={colors.yellowDeep} bg={colors.yellow} label={tt("stHelp")} chevron onPress={onOpenHelp} />
            <View style={[styles.inner, styles.about]}>
              <Logo size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutName}>BloomLearn</Text>
                <Text style={styles.aboutMeta}>{tt("stVersion").replace("{v}", appJson.expo.version)}</Text>
                <Text style={styles.aboutBody}>{tt("stAboutBody")}</Text>
                <Text style={styles.credits}>{tt("stCredits")}</Text>
              </View>
            </View>
          </Group>
        </ScrollView>
      </SafeAreaView>

      {/* Parent passcode */}
      <Modal visible={pinModal} transparent animationType="fade" onRequestClose={() => setPinModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{tt("stPinTitle")}</Text>
            <Text style={styles.sheetBody}>{tt("stPinBody")}</Text>
            <TextInput
              value={pinValue}
              onChangeText={(v) => setPinValue(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={colors.textLight}
              style={[styles.input, { letterSpacing: 10, textAlign: "center", fontSize: 24 }]}
            />
            <SheetButtons cancel={tt("cancel")} save={tt("save")} onCancel={() => setPinModal(false)} onSave={savePin} />
          </View>
        </View>
      </Modal>

      {/* Keys */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.backdrop}>
          {editing && (
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{tt(editing.title)}</Text>
              <Text style={styles.sheetBody}>
                {tt(editing.sub)}. {tt("stAiSub")}
              </Text>
              {editing.fields.map((f) => (
                <View key={f.name} style={{ gap: 6 }}>
                  {editing.fields.length > 1 && <Text style={styles.fieldLabel}>{tt(f.label)}</Text>}
                  <TextInput
                    value={draft[f.name] ?? ""}
                    onChangeText={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
                    placeholder={isFromBuild(f.name) ? tt("stFromBuild") : f.placeholder}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={f.secret}
                    keyboardType={f.secret ? "default" : "url"}
                    style={styles.input}
                  />
                </View>
              ))}
              <View style={styles.sheetLinks}>
                {editing.link ? (
                  <Pressable onPress={() => Linking.openURL(editing.link!)} hitSlop={8}>
                    <Text style={styles.link}>{tt("stGetKey")}</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                {editing.fields.some((f) => !!getSavedKey(f.name)) && (
                  <Pressable onPress={removeEngine} hitSlop={8}>
                    <Text style={[styles.link, { color: colors.danger }]}>{tt("stRemove")}</Text>
                  </Pressable>
                )}
              </View>
              <SheetButtons cancel={tt("cancel")} save={tt("save")} onCancel={() => setEditing(null)} onSave={saveEditor} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function nearestRate(rate: number): number {
  return RATES.reduce((best, r) => (Math.abs(r.value - rate) < Math.abs(best - rate) ? r.value : best), RATES[1].value);
}

function Status({ on, label }: { on: boolean; label: string }) {
  return (
    <View style={[styles.status, on && { backgroundColor: colors.forestLight }]}>
      <Ionicons name={on ? "checkmark-circle" : "ellipse-outline"} size={14} color={on ? colors.forest : colors.textLight} />
      <Text style={[styles.statusText, on && { color: colors.forest }]}>{label}</Text>
    </View>
  );
}

function SheetButtons({ cancel, save, onCancel, onSave }: { cancel: string; save: string; onCancel: () => void; onSave: () => void }) {
  return (
    <View style={styles.sheetRow}>
      <Pressable onPress={onCancel} style={[styles.sheetBtn, { backgroundColor: colors.cardMuted }]}>
        <Text style={[styles.sheetBtnText, { color: colors.textMid }]}>{cancel}</Text>
      </Pressable>
      <Pressable onPress={onSave} style={[styles.sheetBtn, { backgroundColor: colors.forest }]}>
        <Text style={[styles.sheetBtnText, { color: "white" }]}>{save}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  body: { paddingBottom: 40 },
  inner: { paddingVertical: 14, paddingHorizontal: 16 },
  innerLabel: { fontSize: 13, fontWeight: "700", color: colors.textMid, marginBottom: 10 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.cardMuted },
  statusText: { fontSize: 12, fontWeight: "700", color: colors.textMid },
  state: { maxWidth: 96, fontSize: 12, fontWeight: "700", color: colors.textLight },
  about: { flexDirection: "row", gap: 14 },
  aboutName: { fontSize: 16, fontWeight: "800", color: colors.textDark },
  aboutMeta: { fontSize: 12.5, color: colors.textMid, marginTop: 2 },
  aboutBody: { fontSize: 13, color: colors.textMid, marginTop: 8, lineHeight: 19 },
  credits: { fontSize: 11.5, color: colors.textLight, marginTop: 8, lineHeight: 16 },
  backdrop: { flex: 1, backgroundColor: "rgba(31,40,35,0.45)", alignItems: "center", justifyContent: "center", padding: 22 },
  sheet: { width: "100%", maxWidth: 480, backgroundColor: colors.bg, borderRadius: 24, padding: 22, gap: 12 },
  sheetTitle: { fontSize: 19, fontWeight: "800", color: colors.textDark },
  sheetBody: { fontSize: 13.5, color: colors.textMid, lineHeight: 19 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.textMid },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.textDark,
  },
  sheetLinks: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { fontSize: 14, fontWeight: "700", color: colors.forest },
  sheetRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  sheetBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  sheetBtnText: { fontSize: 15, fontWeight: "700" },
});
