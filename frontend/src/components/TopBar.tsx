import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { isRTL } from "../modules/i18n";
import { colors } from "../theme";

/** Round back button with the screen title beside it. */
export default function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { settings } = useSettings();
  return (
    <View style={styles.row}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={8} style={styles.back} accessibilityRole="button">
          <Ionicons name={isRTL(settings.language) ? "chevron-forward" : "chevron-back"} size={22} color={colors.textDark} />
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: colors.textDark },
});
