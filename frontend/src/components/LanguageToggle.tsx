import { Pressable, Text, StyleSheet, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { applyLanguageDirection, setPageDirection, t } from "../modules/i18n";
import type { LanguageCode } from "../types";
import { colors } from "../theme";

/**
 * One header button that switches the whole app between English and Arabic.
 * It shows the language you would switch to: "العربية" while the app is in
 * English, "English" while it is in Arabic.
 */
export default function LanguageToggle() {
  const { settings, update } = useSettings();
  const next: LanguageCode = settings.language === "ar-SA" ? "en-US" : "ar-SA";

  function toggle() {
    update({ language: next });
    setPageDirection(next);
    if (Platform.OS !== "web" && applyLanguageDirection(next)) {
      Alert.alert(t("stRestartTitle", next), t("stRtlNote", next));
    }
  }

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={next === "ar-SA" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Ionicons name="language" size={16} color={colors.forestDark} />
      <Text style={styles.text}>{next === "ar-SA" ? "العربية" : "English"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { fontSize: 14, fontWeight: "800", color: colors.forestDark },
});
