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

type Screen = Tab | "settings" | "help" | "privacy";

const TABS: Screen[] = ["home", "talk", "progress"];

function AppInner() {
  const { ready, settings } = useSettings();
  const [screen, setScreen] = useState<Screen>("home");
  const historyRef = useRef<Screen[]>([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  // Parent lock stays open while the parent moves around Settings / Help / Privacy.
  const [parentUnlocked, setParentUnlocked] = useState(false);

  // Picture Talk stays mounted once opened, so switching tabs keeps the scene.
  // A new `key` (opening it with a sentence) starts a fresh scene.
  const [talk, setTalk] = useState<{ key: number; text: string } | null>(null);

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

  function onTab(tab: Tab) {
    if (tab === "talk") return openTalk();
    historyRef.current = [];
    setParentUnlocked(false);
    setScreen(tab);
  }

  // Android back: step back through screens, and leave the app from Home.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home") return false;
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
    return <WelcomeScreen onGetStarted={() => setScreen("home")} />;
  }

  const isTab = TABS.includes(screen);
  const settingsBody = <SettingsScreen onBack={back} onOpenHelp={() => go("help")} onOpenPrivacy={() => go("privacy")} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        {talk && (
          <View style={{ flex: 1, display: screen === "talk" ? "flex" : "none" }}>
            <SentencePictureScreen
              key={talk.key}
              initialText={talk.text}
              onBack={back}
              onOpenSettings={() => go("settings")}
            />
          </View>
        )}
        {screen === "home" && (
          <HomeScreen
            onOpenTalk={openTalk}
            onOpenSettings={() => go("settings")}
            onOpenProgress={() => onTab("progress")}
            onOpenHelp={() => go("help")}
          />
        )}
        {screen === "progress" && <ProgressScreen onOpenTalk={openTalk} />}
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
      {isTab && !keyboardOpen && <TabBar active={screen as Tab} onChange={onTab} />}
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
