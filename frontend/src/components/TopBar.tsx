import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { isRTL } from "../modules/i18n";
import { colors, type } from "../theme";

/** Back arrow on the left, a small spaced label in the middle. */
export default function TopBar({ label, onBack, right }: { label: string; onBack?: () => void; right?: ReactNode }) {
  const { settings } = useSettings();
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
            <Ionicons name={isRTL(settings.language) ? "arrow-forward" : "arrow-back"} size={24} color={colors.textDark} />
          </Pressable>
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.side, { alignItems: "flex-end" }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  side: { width: 48 },
  back: { width: 40, height: 40, justifyContent: "center" },
  label: { ...type.eyebrow, flex: 1, textAlign: "center" },
});
