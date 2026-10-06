import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, BackHandler, Keyboard, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { loadPasscode, hasPasscode } from "./src/modules/passcode";
import { t } from "./src/modules/i18n";
import { colors } from "./src/theme";
import TabBar, { type Tab } from "./src/components/TabBar";
import PinGate from "./src/components/PinGate";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SentencePictureScreen from "./src/screens/SentencePictureScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import HelpScreen from "./src/screens/HelpScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import SubjectScreen from "./src/screens/SubjectScreen";
import FaceAuthScreen from "./src/screens/FaceAuthScreen";
import type { SubjectId } from "./src/modules/curriculum";

type Screen = Tab | "subject" | "settings" | "help" | "privacy" | "face-auth";

const TABS: Screen[] = ["home", "talk", "progress"];

function AppInner() {
  const { ready, settings } = useSettings();
  const [screen, setScreen] = useState<Screen>("face-auth");
  const historyRef = useRef<Screen[]>([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  // Parent lock stays open while the parent moves around Settings / Help / Privacy.
  const [parentUnlocked, setParentUnlocked] = useState(false);

  // Picture Talk stays mounted once opened, so switching tabs keeps the scene.
  // A new `key` (opening it with a sentence) starts a fresh scene.
  const [talk, setTalk] = useState<{ key: number; text: string; chapterId?: string; index?: number } | null>(null);
  const [subjectId, setSubjectId] = useState<SubjectId>("english");

  useEffect(() => {
    loadPasscode();
  }, []);

  function go(next: Screen) {
    if (next === screen) return;
    historyRef.current.push(screen);
    setScreen(next);
  }

  function back() {
    const prev = historyRef.current.pop() ?? "home";
    if (TABS.includes(prev)) setParentUnlocked(false);
    setScreen(prev);
  }

  function openTalk(text?: string) {
    if (text !== undefined || !talk) setTalk((cur) => ({ key: (cur?.key ?? 0) + 1, text: text ?? "" }));
    go("talk");
  }

  function openChapter(chapterId: string, index = 0) {
    setTalk((cur) => ({ key: (cur?.key ?? 0) + 1, text: "", chapterId, index }));
    go("talk");
  }

  function openSubject(id: SubjectId) {
    setSubjectId(id);
    go("subject");
  }

  function onTab(tab: Tab) {
    if (tab === "talk") return openTalk();
    historyRef.current = [];
    setParentUnlocked(false);
    setScreen(tab);
  }

  // Android back: step back through screens, and leave the app from Home or Face Auth.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home" || screen === "face-auth") return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  // Hide the tab bar while typing so it doesn't sit on top of the keyboard.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  if (!settings.onboarded) {
    return <WelcomeScreen onGetStarted={() => setScreen("face-auth")} />;
  }

  // The tab bar also shows on a subject page (it belongs to Home).
  const activeTab: Tab | null = TABS.includes(screen) ? (screen as Tab) : screen === "subject" ? "home" : null;
  const settingsBody = (
    <SettingsScreen
      onBack={back}
      onOpenHelp={() => go("help")}
      onOpenPrivacy={() => go("privacy")}
      onOpenFaceAuth={() => go("face-auth")}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        {screen === "face-auth" && (
          <FaceAuthScreen
            onSuccess={() => {
              historyRef.current = [];
              setScreen("home");
            }}
            onOpenParentSettings={() => go("settings")}
          />
        )}
        {talk && (
          <View style={{ flex: 1, display: screen === "talk" ? "flex" : "none" }}>
            <SentencePictureScreen
              key={talk.key}
              initialText={talk.text}
              lesson={talk.chapterId ? { chapterId: talk.chapterId, index: talk.index ?? 0 } : undefined}
              onBack={back}
              onOpenSettings={() => go("settings")}
            />
          </View>
        )}
        {screen === "home" && (
          <HomeScreen
            onOpenTalk={openTalk}
            onOpenSubject={openSubject}
            onOpenSettings={() => go("settings")}
            onOpenHelp={() => go("help")}
            onSwitchChild={() => go("face-auth")}
          />
        )}
        {screen === "subject" && <SubjectScreen subjectId={subjectId} onBack={back} onOpenChapter={openChapter} />}
        {screen === "progress" && <ProgressScreen onOpenSubject={openSubject} onOpenChapter={openChapter} />}
        {/* Parent lock: Settings asks for the passcode when one is set. */}
        {screen === "settings" &&
          (hasPasscode() && !parentUnlocked ? (
            <PinGate title={t("stTitle", settings.language)} onCancel={back} onUnlock={() => setParentUnlocked(true)}>
              {settingsBody}
            </PinGate>
          ) : (
            settingsBody
          ))}
        {screen === "help" && <HelpScreen onBack={back} onOpenTalk={openTalk} />}
        {screen === "privacy" && <PrivacyScreen onBack={back} />}
      </View>
      {activeTab && !keyboardOpen && <TabBar active={activeTab} onChange={onTab} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <StatusBar style="dark" />
        <AppInner />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
