import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppScreen } from "../types";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import { colors } from "../theme";

interface Props {
  onNavigate: (screen: AppScreen) => void;
  onBack: () => void;
}

export default function ParentSetupScreen({ onNavigate, onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;

  const options: { label: string; icon: string; screen: AppScreen; variant: "primary" | "mint" | "lavender" | "sky" }[] = [
    { label: t("addChild", lang), icon: "👶", screen: "enroll-child", variant: "primary" },
    { label: t("parentHub", lang), icon: "👨‍👩‍👧", screen: "parent-hub", variant: "mint" },
    { label: t("doctorPanel", lang), icon: "👨‍⚕️", screen: "doctor-panel", variant: "lavender" },
    { label: t("settings", lang), icon: "⚙️", screen: "accessibility", variant: "sky" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Mascot mood="thinking" size={90} />

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>🔒 {t("parentSetup", lang)}</Text>
          <Text style={styles.subtitle}>No face match found — Parent area</Text>
        </View>

        <View style={styles.optionList}>
          {options.map((o) => (
            <BigButton key={o.screen} variant={o.variant} onPress={() => onNavigate(o.screen)} style={styles.optionBtn}>
              <View style={styles.optionContent}>
                <Text style={{ fontSize: 28 }}>{o.icon}</Text>
                <Text style={[styles.optionLabel, { color: "white" }]}>{o.label}</Text>
              </View>
            </BigButton>
          ))}
        </View>

        <View style={styles.footer}>
          <BigButton variant="ghost" onPress={onBack} style={{ paddingHorizontal: 32 }}>
            ← {t("back", lang)}
          </BigButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 24, paddingTop: 36, gap: 24 },
  title: { fontSize: 26, fontWeight: "800", color: colors.textDark },
  subtitle: { color: colors.textMid, marginTop: 8, fontSize: 15 },
  optionList: { width: "100%", maxWidth: 380, gap: 14 },
  optionBtn: { width: "100%", justifyContent: "flex-start", paddingVertical: 18, paddingHorizontal: 24 },
  optionContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  optionLabel: { fontSize: 17, fontWeight: "700" },
  footer: { marginTop: "auto", paddingBottom: 16 },
});
