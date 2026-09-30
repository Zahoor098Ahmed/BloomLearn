import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import { colors } from "../theme";
import { useResponsive } from "../modules/responsive";

export type Tab = "home" | "talk" | "progress";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { key: Tab; icon: keyof typeof Ionicons.glyphMap; label: TKey }[] = [
  { key: "home", icon: "sunny-outline", label: "tabHome" },
  { key: "talk", icon: "mic-outline", label: "tabTalk" },
  { key: "progress", icon: "bar-chart-outline", label: "tabProgress" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.inner, isTablet && styles.innerTablet]}>
        {TABS.map((tab) => {
          const on = active === tab.key;
          const tint = on ? colors.forestDark : colors.textLight;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Ionicons name={tab.icon} size={26} color={tint} />
              <Text style={[styles.label, { color: tint, fontWeight: on ? "700" : "500" }]} numberOfLines={1}>
                {t(tab.label, settings.language)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    width: "100%",
  },
  inner: { flexDirection: "row", width: "100%" },
  innerTablet: { maxWidth: 640, alignSelf: "center" },
  item: { flex: 1, alignItems: "center", gap: 5 },
  label: { fontSize: 13 },
});
