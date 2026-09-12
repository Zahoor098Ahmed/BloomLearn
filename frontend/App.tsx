import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { View, Text, Pressable, ActivityIndicator, BackHandler, Modal, StyleSheet, TextInput, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { setHapticsEnabled } from "./src/modules/haptics";
import { t } from "./src/modules/i18n";
import type { AppScreen, ChildProfile, TabScreen } from "./src/types";
import { colors } from "./src/theme";
import PinGate from "./src/components/PinGate";
import { verifyPasscode, hasPasscode } from "./src/modules/passcode";

import LandingScreen from "./src/screens/LandingScreen";
import FaceScanScreen from "./src/screens/FaceScanScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AACBoardScreen from "./src/screens/AACBoardScreen";
import VisualScheduleScreen from "./src/screens/VisualScheduleScreen";
import GamesScreen from "./src/screens/GamesScreen";
import ParentDashboardScreen from "./src/screens/ParentDashboardScreen";
import MoreScreen from "./src/screens/MoreScreen";
import ParentSetupScreen from "./src/screens/ParentSetupScreen";
import EnrollChildScreen from "./src/screens/EnrollChildScreen";
import ParentHubScreen from "./src/screens/ParentHubScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import CalmDownScreen from "./src/screens/CalmDownScreen";
import AccessibilityScreen from "./src/screens/AccessibilityScreen";
import DoctorPanelScreen from "./src/screens/DoctorPanelScreen";
import CategoryBuilderScreen from "./src/screens/CategoryBuilderScreen";
import MyCategoriesScreen from "./src/screens/MyCategoriesScreen";
import SentencePictureScreen from "./src/screens/SentencePictureScreen";
import PhraseMatchLibraryScreen from "./src/screens/PhraseMatchLibraryScreen";
import ContentReviewQueueScreen from "./src/screens/ContentReviewQueueScreen";
import VoiceCommandMatchScreen from "./src/screens/VoiceCommandMatchScreen";
import AdminPanelScreen from "./src/screens/AdminPanelScreen";

const TAB_SCREENS: TabScreen[] = ["home", "speak", "schedule", "games", "progress"];

function isTabScreen(s: AppScreen): s is TabScreen {
  return (TAB_SCREENS as string[]).includes(s);
}

const ADMIN_SCREENS: AppScreen[] = ["accessibility", "my-categories", "category-builder", "doctor-panel", "parent-hub", "phrase-library", "review-queue", "admin-panel"];

function AppInner() {
  const { ready, settings } = useSettings();
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);

  // ---- Kiosk exit overlay (Section 4.5 Option 2: passcode-gated 5-tap corner) ----
  const [exitTaps, setExitTaps] = useState(0);
  const lastExitTapRef = useRef(0);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [exitPinValue, setExitPinValue] = useState("");
  const kioskBypassUntilRef = useRef(0);
  const [, setKioskTick] = useState(0);

  function onCornerTap() {
    if (!currentChild || !settings.kioskMode) return;
    const now = Date.now();
    const within = now - lastExitTapRef.current < 2500;
    const next = within ? exitTaps + 1 : 1;
    lastExitTapRef.current = now;
    if (next >= 5) {
      setExitTaps(0);
      if (!hasPasscode()) {
        // No passcode set — just drop to Settings directly.
        bypassKiosk();
        go("accessibility");
        return;
      }
      setExitPinValue("");
      setExitModalVisible(true);
    } else {
      setExitTaps(next);
    }
  }

  function bypassKiosk(minutes = 5) {
    kioskBypassUntilRef.current = Date.now() + minutes * 60 * 1000;
    setKioskTick((t) => t + 1);
  }

  const lang = settings.language;

  async function tryExitPasscode() {
    if (exitPinValue.length !== 4) return Alert.alert(t("appExitPasscodePrompt", lang));
    const ok = await verifyPasscode(exitPinValue);
    if (!ok) {
      setExitPinValue("");
      return Alert.alert(t("appIncorrectPasscode", lang));
    }
    setExitModalVisible(false);
    setExitPinValue("");
    bypassKiosk();
    go("accessibility");
  }

  const TAB_LABELS: Record<TabScreen, string> = {
    home: t("home", lang),
    speak: t("talk", lang),
    schedule: t("myDay", lang),
    games: t("games", lang),
    progress: t("progress", lang),
  };

  // keep the haptics module in sync with the setting
  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled);
  }, [settings.hapticsEnabled]);

  // kiosk mode: block the Android back button and keep the screen awake while
  // a child is on the board. After a successful passcode-gated exit the bypass
  // window temporarily disables the lock so the parent can navigate freely.
  useEffect(() => {
    const childFacing = currentChild != null && !ADMIN_SCREENS.includes(screen) && screen !== "landing" && screen !== "face-scan";
    const bypassed = Date.now() < kioskBypassUntilRef.current;
    const locked = settings.kioskMode && childFacing && !bypassed;
    if (locked) {
      activateKeepAwakeAsync().catch(() => {});
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => {
        sub.remove();
        deactivateKeepAwake().catch(() => {});
      };
    }
  }, [settings.kioskMode, currentChild, screen, kioskBypassUntilRef.current]);

  function go(s: AppScreen) {
    setScreen(s);
  }

  function handleMatch(child: ChildProfile) {
    setCurrentChild(child);
    go("home");
  }

  // --- Router: compute the current screen body, then wrap once with overlay UI ---
  let body: ReactNode;
  const adminBack = () => go(currentChild ? "more" : "parent-setup");

  if (!ready) {
    body = (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  } else if (screen === "landing") {
    body = <LandingScreen onGetStarted={() => go("face-scan")} />;
  } else if (screen === "face-scan") {
    body = (
      <FaceScanScreen
        onMatch={handleMatch}
        onNoMatch={() => go("parent-setup")}
        onParentArea={() => go("parent-setup")}
        onAdminPortal={() => go("admin-panel")}
      />
    );
  } else if (isTabScreen(screen) && currentChild) {
    const onTabChange = (tab: TabScreen) => go(tab);
    if (screen === "home")
      body = (
        <HomeScreen
          child={currentChild}
          tab={screen}
          onTabChange={onTabChange}
          onOpenMore={() => go("more")}
          onOpenPictureTalk={() => go("sentence-picture")}
          labels={TAB_LABELS}
        />
      );
    else if (screen === "speak") body = <AACBoardScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    else if (screen === "schedule") body = <VisualScheduleScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    else if (screen === "games") body = <GamesScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    else
      body = (
        <ParentDashboardScreen
          child={currentChild}
          tab={screen}
          onTabChange={onTabChange}
          onUpdateChild={setCurrentChild}
          onNavigateAdmin={() => go("admin-panel")}
          labels={TAB_LABELS}
        />
      );
  } else if (screen === "more" && currentChild) {
    body = (
      <MoreScreen
        child={currentChild}
        onNavigate={go}
        onBack={() => go("home")}
        onSwitchChild={() => {
          setCurrentChild(null);
          go("face-scan");
        }}
      />
    );
  } else if (screen === "parent-setup") {
    body = <ParentSetupScreen onNavigate={go} onBack={() => go("face-scan")} />;
  } else if (screen === "enroll-child") {
    body = (
      <EnrollChildScreen
        onDone={(child) => {
          if (child) {
            setCurrentChild(child);
            go("home");
          } else {
            go("parent-hub");
          }
        }}
        onBack={() => go("parent-setup")}
      />
    );
  } else if (screen === "parent-hub") {
    body = (
      <PinGate title={t("parentHub", lang)} onCancel={adminBack}>
        <ParentHubScreen
          onBack={adminBack}
          onAddChild={() => go("enroll-child")}
          onSelectChild={(child) => {
            setCurrentChild(child);
            go("home");
          }}
        />
      </PinGate>
    );
  } else if (screen === "doctor-panel") {
    body = (
      <PinGate title={t("doctorPanel", lang)} onCancel={adminBack}>
        <DoctorPanelScreen onBack={adminBack} />
      </PinGate>
    );
  } else if (screen === "rewards" && currentChild) {
    body = <RewardsScreen child={currentChild} onBack={() => go("more")} onUpdate={setCurrentChild} />;
  } else if (screen === "calm-down") {
    body = <CalmDownScreen onBack={() => go(currentChild ? "more" : "parent-setup")} />;
  } else if (screen === "accessibility") {
    body = (
      <PinGate title={t("settings", lang)} onCancel={adminBack}>
        <AccessibilityScreen onBack={adminBack} />
      </PinGate>
    );
  } else if (screen === "my-categories") {
    body = (
      <PinGate title={t("pgBoardEditorTitle", lang)} onCancel={adminBack}>
        <MyCategoriesScreen onBack={adminBack} onCreate={() => go("category-builder")} />
      </PinGate>
    );
  } else if (screen === "category-builder") {
    body = (
      <PinGate title={t("pgBoardEditorTitle", lang)} onCancel={() => go("my-categories")}>
        <CategoryBuilderScreen onBack={() => go("my-categories")} onSaved={() => go("my-categories")} />
      </PinGate>
    );
  } else if (screen === "sentence-picture") {
    body = <SentencePictureScreen onBack={() => go(currentChild ? "home" : "parent-setup")} />;
  } else if (screen === "voice-command" && currentChild) {
    body = <VoiceCommandMatchScreen onBack={() => go("more")} />;
  } else if (screen === "phrase-library") {
    body = (
      <PinGate title={t("rowPhraseLibrary", lang)} onCancel={adminBack}>
        <PhraseMatchLibraryScreen onBack={adminBack} />
      </PinGate>
    );
  } else if (screen === "review-queue") {
    body = (
      <PinGate title={t("rowContentReviewQueue", lang)} onCancel={adminBack}>
        <ContentReviewQueueScreen onBack={adminBack} />
      </PinGate>
    );
  } else if (screen === "admin-panel") {
    body = (
      <PinGate title={t("adminControlCenterTitle", lang)} onCancel={adminBack}>
        <AdminPanelScreen
          onBack={adminBack}
          onSelectChild={(c) => {
            setCurrentChild(c);
            go("home");
          }}
          onNavigateAddChild={() => go("enroll-child")}
          onNavigateReviewQueue={() => go("review-queue")}
        />
      </PinGate>
    );
  } else {
    body = (
      <FaceScanScreen
        onMatch={handleMatch}
        onNoMatch={() => go("parent-setup")}
        onParentArea={() => go("parent-setup")}
        onAdminPortal={() => go("admin-panel")}
      />
    );
  }

  const showExitTrigger = !!(currentChild && settings.kioskMode);

  return (
    <View style={{ flex: 1 }}>
      {body}
      {showExitTrigger && (
        <Pressable onPress={onCornerTap} hitSlop={8} style={styles.exitCorner} accessibilityLabel={t("appKioskExitA11y", lang)}>
          {exitTaps > 0 && (
            <View style={styles.exitDotRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.exitDot, i <= exitTaps && styles.exitDotOn]} />
              ))}
            </View>
          )}
        </Pressable>
      )}

      <Modal visible={exitModalVisible} transparent animationType="fade" onRequestClose={() => setExitModalVisible(false)}>
        <View style={styles.exitModalBackdrop}>
          <View style={styles.exitModalCard}>
            <Text style={styles.exitModalTitle}>{t("appKioskExitTitle", lang)}</Text>
            <Text style={styles.exitModalBody}>{t("appKioskExitBody", lang)}</Text>
            <TextInput
              value={exitPinValue}
              onChangeText={(v) => setExitPinValue(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={colors.textLight}
              style={styles.exitModalInput}
            />
            <View style={styles.exitModalRow}>
              <Pressable onPress={() => setExitModalVisible(false)} style={[styles.exitModalBtn, { backgroundColor: colors.cardMuted }]}>
                <Text style={{ color: colors.textMid, fontWeight: "700" }}>{t("cancel", lang)}</Text>
              </Pressable>
              <Pressable onPress={tryExitPasscode} style={[styles.exitModalBtn, { backgroundColor: colors.forest }]}>
                <Text style={{ color: "white", fontWeight: "700" }}>{t("appEnterBtn", lang)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

const styles = StyleSheet.create({
  exitCorner: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  exitDotRow: {
    position: "absolute",
    top: 20,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  exitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(45,95,79,0.2)",
  },
  exitDotOn: {
    backgroundColor: colors.forest,
  },
  exitModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  exitModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.bg,
    borderRadius: 20,
    padding: 20,
  },
  exitModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 6,
  },
  exitModalBody: {
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 19,
    marginBottom: 14,
  },
  exitModalInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: "center",
    color: colors.textDark,
  },
  exitModalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  exitModalBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
});
