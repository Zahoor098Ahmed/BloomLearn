import { useEffect, useState } from "react";
import { View, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { setHapticsEnabled } from "./src/modules/haptics";
import { t } from "./src/modules/i18n";
import type { AppScreen, ChildProfile, TabScreen } from "./src/types";
import { colors } from "./src/theme";
import PinGate from "./src/components/PinGate";

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

const TAB_SCREENS: TabScreen[] = ["home", "speak", "schedule", "games", "progress"];

function isTabScreen(s: AppScreen): s is TabScreen {
  return (TAB_SCREENS as string[]).includes(s);
}

const ADMIN_SCREENS: AppScreen[] = ["accessibility", "my-categories", "category-builder", "doctor-panel", "parent-hub"];

function AppInner() {
  const { ready, settings } = useSettings();
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);

  const lang = settings.language;
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
  // a child is on the board. Exiting kiosk is done from Settings (passcode-gated).
  useEffect(() => {
    const childFacing = currentChild != null && !ADMIN_SCREENS.includes(screen) && screen !== "landing" && screen !== "face-scan";
    const locked = settings.kioskMode && childFacing;
    if (locked) {
      activateKeepAwakeAsync().catch(() => {});
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => {
        sub.remove();
        deactivateKeepAwake().catch(() => {});
      };
    }
  }, [settings.kioskMode, currentChild, screen]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  function go(s: AppScreen) {
    setScreen(s);
  }

  function handleMatch(child: ChildProfile) {
    setCurrentChild(child);
    go("home");
  }

  if (screen === "landing") {
    return <LandingScreen onGetStarted={() => go("face-scan")} />;
  }

  if (screen === "face-scan") {
    return <FaceScanScreen onMatch={handleMatch} onNoMatch={() => go("parent-setup")} onParentArea={() => go("parent-setup")} />;
  }

  if (isTabScreen(screen) && currentChild) {
    const onTabChange = (tab: TabScreen) => go(tab);
    if (screen === "home")
      return (
        <HomeScreen
          child={currentChild}
          tab={screen}
          onTabChange={onTabChange}
          onOpenMore={() => go("more")}
          onOpenPictureTalk={() => go("sentence-picture")}
          labels={TAB_LABELS}
        />
      );
    if (screen === "speak") return <AACBoardScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    if (screen === "schedule") return <VisualScheduleScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    if (screen === "games") return <GamesScreen child={currentChild} tab={screen} onTabChange={onTabChange} labels={TAB_LABELS} />;
    if (screen === "progress")
      return (
        <ParentDashboardScreen child={currentChild} tab={screen} onTabChange={onTabChange} onUpdateChild={setCurrentChild} labels={TAB_LABELS} />
      );
  }

  if (screen === "more" && currentChild) {
    return (
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
  }

  if (screen === "parent-setup") {
    return <ParentSetupScreen onNavigate={go} onBack={() => go("face-scan")} />;
  }

  if (screen === "enroll-child") {
    return (
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
  }

  const adminBack = () => go(currentChild ? "more" : "parent-setup");

  if (screen === "parent-hub") {
    return (
      <PinGate title="Parent Hub" onCancel={adminBack}>
        <ParentHubScreen onBack={adminBack} onAddChild={() => go("enroll-child")} />
      </PinGate>
    );
  }

  if (screen === "doctor-panel") {
    return (
      <PinGate title="Doctor Panel" onCancel={adminBack}>
        <DoctorPanelScreen onBack={adminBack} />
      </PinGate>
    );
  }

  if (screen === "rewards" && currentChild) {
    return <RewardsScreen child={currentChild} onBack={() => go("more")} onUpdate={setCurrentChild} />;
  }

  if (screen === "calm-down") {
    return <CalmDownScreen onBack={() => go(currentChild ? "more" : "parent-setup")} />;
  }

  if (screen === "accessibility") {
    return (
      <PinGate title="Settings" onCancel={adminBack}>
        <AccessibilityScreen onBack={adminBack} />
      </PinGate>
    );
  }

  if (screen === "my-categories") {
    return (
      <PinGate title="Board editor" onCancel={adminBack}>
        <MyCategoriesScreen onBack={adminBack} onCreate={() => go("category-builder")} />
      </PinGate>
    );
  }

  if (screen === "category-builder") {
    return (
      <PinGate title="Board editor" onCancel={() => go("my-categories")}>
        <CategoryBuilderScreen onBack={() => go("my-categories")} onSaved={() => go("my-categories")} />
      </PinGate>
    );
  }

  if (screen === "sentence-picture") {
    return <SentencePictureScreen onBack={() => go(currentChild ? "home" : "parent-setup")} />;
  }

  return <FaceScanScreen onMatch={handleMatch} onNoMatch={() => go("parent-setup")} onParentArea={() => go("parent-setup")} />;
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
