import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, TextInput, Modal, Linking, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import appJson from "../../app.json";
import { useSettings } from "../context/SettingsContext";
import { LANGUAGES, t, type TKey, applyLanguageDirection, isRTL } from "../modules/i18n";
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
import IconSquare from "../components/IconSquare";
import Toggle from "../components/Toggle";
import { colors, radiusLg, type } from "../theme";

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
  title: TKey;
  sub: TKey;
  link?: string;
  fields: { name: ApiKeyName; label: TKey; placeholder: string; secret: boolean }[];
}

const ENGINES: EngineDef[] = [
  {
    id: "openai",
    icon: "mic-outline",
    tint: colors.green,
    title: "stOpenai",
    sub: "stOpenaiSub",
    link: "https://platform.openai.com/api-keys",
    fields: [{ name: "openai", label: "stOpenai", placeholder: "sk-…", secret: true }],
  },
  {
    id: "groq",
    icon: "chatbubbles-outline",
    tint: colors.blue,
    title: "stGroq",
    sub: "stGroqSub",
    link: "https://console.groq.com/keys",
    fields: [{ name: "groq", label: "stGroq", placeholder: "gsk_…", secret: true }],
  },
  {
    id: "pollinations",
    icon: "brush-outline",
    tint: colors.pink,
    title: "stPollinations",
    sub: "stPollinationsSub",
    link: "https://auth.pollinations.ai",
    fields: [{ name: "pollinations", label: "stPollinations", placeholder: "token", secret: true }],
  },
  {
    id: "server",
    icon: "server-outline",
    tint: colors.yellow,
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
  const chevron = isRTL(lang) ? "chevron-back" : "chevron-forward";

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
          <TopBar label={tt("stTitle")} onBack={onBack} />
        </View>

        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          <Text style={type.eyebrow}>{tt("stEyebrow")}</Text>
          <Text style={[type.display, { marginTop: 10 }]}>{tt("stHeadline")}</Text>
          <Text style={[type.lead, { marginTop: 8 }]}>{tt("stLead")}</Text>

          {/* Language */}
          <Label text={tt("stLanguage")} />
          {LANGUAGES.map((l) => (
            <Radio key={l.code} on={l.code === lang} title={l.nativeName} sub={l.name} onPress={() => chooseLanguage(l.code)} />
          ))}

          {/* Voice */}
          <Label text={tt("stVoice")} />
          <SwitchCard icon="volume-high-outline" tint={colors.green} title={tt("stReadAloud")} value={settings.soundEnabled} onChange={(v) => update({ soundEnabled: v })} />
          <SwitchCard
            icon="repeat-outline"
            tint={colors.blue}
            title={tt("stAutoSpeak")}
            value={settings.autoSpeak}
            disabled={!settings.soundEnabled}
            onChange={(v) => update({ autoSpeak: v })}
          />
          <Text style={styles.subLabel}>{tt("stSpeed")}</Text>
          <View style={styles.pills}>
            {RATES.map((r) => {
              const on = Math.abs(settings.speechRate - r.value) < 0.03;
              return (
                <Pressable key={r.key} onPress={() => update({ speechRate: r.value })} style={[styles.pillBtn, on && styles.pillBtnOn]}>
                  <Text style={[styles.pillText, on && { color: "white" }]}>{tt(r.key)}</Text>
                </Pressable>
              );
            })}
            <Pressable onPress={() => speak(tt("stTestPhrase"), lang, true, settings.speechRate)} style={[styles.pillBtn, styles.pillOutline]}>
              <Ionicons name="play" size={14} color={colors.forestDark} />
              <Text style={[styles.pillText, { color: colors.forestDark }]}>{tt("stTestVoice")}</Text>
            </Pressable>
          </View>

          {/* Engines */}
          <Label text={tt("stAi")} />
          <Text style={styles.note}>{tt("stAiSub")}</Text>
          <View style={styles.statusRow}>
            <Status on={voiceOn} label={tt("stStatusVoice")} />
            <Status on={agentEnabled()} label={tt("stStatusAgent")} />
            <Status on={isAiConfigured() || aiSceneEnabled()} label={tt("stStatusDrawing")} />
          </View>
          {ENGINES.map((e) => {
            const st = engineState(e);
            return (
              <Row key={e.id} onPress={() => openEditor(e)}>
                <IconSquare icon={e.icon} bg={e.tint} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{tt(e.title)}</Text>
                  <Text style={styles.rowSub}>{tt(e.sub)}</Text>
                </View>
                <View style={[styles.state, st.on && styles.stateOn]}>
                  <Text style={[styles.stateText, st.on && { color: colors.forestDark }]} numberOfLines={1}>
                    {st.text}
                  </Text>
                </View>
              </Row>
            );
          })}

          {/* Parent */}
          <Label text={tt("stParent")} />
          <SwitchCard icon="lock-closed-outline" tint={colors.yellow} title={tt("stLock")} value={pinSet} onChange={toggleLock} />
          {pinSet && (
            <Row
              onPress={() => {
                setPinValue("");
                setPinModal(true);
              }}
            >
              <IconSquare icon="keypad-outline" bg={colors.cardMuted} size={48} />
              <Text style={[styles.rowTitle, { flex: 1 }]}>{tt("stChangePin")}</Text>
              <Ionicons name={chevron} size={20} color={colors.textLight} />
            </Row>
          )}
          <Text style={styles.note}>{tt("stLockInfo")}</Text>

          {/* Privacy */}
          <Label text={tt("stPrivacyTitle")} />
          <SwitchCard
            icon="document-text-outline"
            tint={colors.purple}
            title={tt("stSaveHistory")}
            value={settings.saveHistory}
            onChange={(v) => update({ saveHistory: v })}
          />
          <Row onPress={onOpenPrivacy}>
            <IconSquare icon="shield-checkmark-outline" bg={colors.green} size={48} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>{tt("stPrivacyPolicy")}</Text>
            <Ionicons name={chevron} size={20} color={colors.textLight} />
          </Row>
          <Text style={styles.note}>{tt("stPrivacy")}</Text>

          {/* Picture library */}
          <Label text={tt("stLibrary")} />
          <Row onPress={downloading ? undefined : downloadPictures}>
            <IconSquare icon="cloud-download-outline" bg={colors.blue} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{downloading ? tt("stDownloading") : tt("stDownload")}</Text>
              <Text style={styles.rowSub}>{tt("stLibrarySub").replace("{n}", libN.toLocaleString())}</Text>
            </View>
            {downloading && <ActivityIndicator color={colors.forest} />}
          </Row>

          {/* Data */}
          <Label text={tt("stData")} />
          <View style={styles.dangerGroup}>
            <DangerRow icon="time-outline" label={tt("stClearHistory")} onPress={() => confirm(tt("stClearHistory"), tt("stClearHistoryMsg"), clearHistory)} />
            <DangerRow icon="bar-chart-outline" label={tt("stResetProgress")} onPress={() => confirm(tt("stResetProgress"), tt("stResetProgressMsg"), clearProgress)} />
            <DangerRow
              icon="images-outline"
              label={tt("stClearLibrary")}
              onPress={() =>
                confirm(tt("stClearLibrary"), tt("stClearLibraryMsg"), async () => {
                  await clearLibrary();
                  await clearAiCache();
                  setLibN(0);
                })
              }
            />
            <DangerRow
              icon="refresh-outline"
              label={tt("stResetSettings")}
              last
              onPress={() =>
                confirm(tt("stResetSettings"), tt("stResetSettingsMsg"), async () => {
                  await clearApiKeys();
                  reset();
                  refreshKeys();
                })
              }
            />
          </View>

          {/* About */}
          <Label text={tt("stAbout")} />
          <Row onPress={onOpenHelp}>
            <IconSquare icon="book-outline" bg={colors.yellow} size={48} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>{tt("stHelp")}</Text>
            <Ionicons name={chevron} size={20} color={colors.textLight} />
          </Row>
          <View style={styles.about}>
            <Logo size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>BloomLearn</Text>
              <Text style={styles.rowSub}>{tt("stVersion").replace("{v}", appJson.expo.version)}</Text>
              <Text style={[styles.rowSub, { marginTop: 8, lineHeight: 20 }]}>{tt("stAboutBody")}</Text>
              <Text style={[styles.rowSub, { marginTop: 8, fontSize: 12, color: colors.textLight }]}>{tt("stCredits")}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Parent passcode */}
      <Modal visible={pinModal} transparent animationType="fade" onRequestClose={() => setPinModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <IconSquare icon="lock-closed-outline" bg={colors.yellow} size={56} />
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
              <IconSquare icon={editing.icon} bg={editing.tint} size={56} />
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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Row({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}>
      {children}
    </Pressable>
  );
}

function Radio({ on, title, sub, onPress }: { on: boolean; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.radio, on && styles.radioOn]}>
      {on ? (
        <Ionicons name="checkmark-circle" size={26} color={colors.forest} />
      ) : (
        <View style={styles.radioEmpty} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.radioTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function SwitchCard({
  icon,
  tint,
  title,
  value,
  onChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.55 }]}>
      <IconSquare icon={icon} bg={tint} size={48} />
      <Text style={[styles.rowTitle, { flex: 1 }]}>{title}</Text>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

function Status({ on, label }: { on: boolean; label: string }) {
  return (
    <View style={[styles.status, on && { backgroundColor: colors.lime }]}>
      <Ionicons name={on ? "checkmark" : "remove"} size={14} color={on ? colors.forestDark : colors.textLight} />
      <Text style={[styles.statusText, on && { color: colors.forestDark }]}>{label}</Text>
    </View>
  );
}

function DangerRow({ icon, label, onPress, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dangerRow, !last && styles.dangerDivider, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon} size={22} color={colors.danger} />
      <Text style={styles.dangerText}>{label}</Text>
    </Pressable>
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
  pad: { paddingHorizontal: 22 },
  body: { paddingBottom: 48, gap: 12 },
  label: { fontSize: 17, fontWeight: "700", color: colors.textDark, marginTop: 22, marginBottom: 2 },
  subLabel: { fontSize: 15, fontWeight: "600", color: colors.textDark, marginTop: 6 },
  note: { fontSize: 13.5, color: colors.textMid, lineHeight: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowTitle: { fontSize: 16.5, fontWeight: "600", color: colors.textDark },
  rowSub: { fontSize: 13.5, color: colors.textMid, marginTop: 2 },
  radio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  radioOn: { backgroundColor: colors.forestLight, borderColor: colors.forest },
  radioEmpty: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textLight },
  radioTitle: { fontSize: 17, fontWeight: "600", color: colors.textDark },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 22, backgroundColor: "#e3eadf" },
  pillBtnOn: { backgroundColor: colors.forest },
  pillOutline: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 15, fontWeight: "600", color: colors.forestDark },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.cardMuted },
  statusText: { fontSize: 12.5, fontWeight: "700", color: colors.textMid },
  state: { maxWidth: 110, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.cardMuted },
  stateOn: { backgroundColor: colors.lime },
  stateText: { fontSize: 12, fontWeight: "700", color: colors.textMid },
  dangerGroup: { backgroundColor: colors.card, borderRadius: radiusLg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18 },
  dangerRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 17 },
  dangerDivider: { borderBottomWidth: 1, borderBottomColor: "#efede5" },
  dangerText: { fontSize: 16, fontWeight: "600", color: colors.danger },
  about: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#e6ebe1",
    borderRadius: radiusLg,
    padding: 18,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(20,35,28,0.45)", alignItems: "center", justifyContent: "center", padding: 22 },
  sheet: { width: "100%", maxWidth: 520, backgroundColor: colors.bg, borderRadius: 30, padding: 24, gap: 12 },
  sheetTitle: { fontSize: 22, fontWeight: "800", color: colors.textDark, letterSpacing: -0.3, marginTop: 4 },
  sheetBody: { fontSize: 14, color: colors.textMid, lineHeight: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.textDark },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textDark,
  },
  link: { fontSize: 14.5, fontWeight: "700", color: colors.forest },
  sheetRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  sheetBtn: { flex: 1, borderRadius: 22, paddingVertical: 16, alignItems: "center" },
  sheetBtnText: { fontSize: 16, fontWeight: "700" },
});
