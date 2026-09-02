import { Pressable, Text, StyleSheet } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { colors } from "../theme";

interface LangBadgeProps {
  dark?: boolean;
}

export default function LangBadge({ dark }: LangBadgeProps) {
  const { settings, update } = useSettings();
  const isEnglish = settings.language === "en-US";

  function toggle() {
    update({ language: isEnglish ? "ar-SA" : "en-US" });
  }

  return (
    <Pressable onPress={toggle} style={[styles.badge, { backgroundColor: dark ? "rgba(255,255,255,0.2)" : colors.forest }]}>
      <Text style={styles.text}>{isEnglish ? "EN" : "عربي"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  text: { color: "white", fontWeight: "700", fontSize: 12 },
});
