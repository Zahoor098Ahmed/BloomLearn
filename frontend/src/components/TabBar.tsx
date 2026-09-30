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

const TABS: { key: Tab; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap; label: TKey }[] = [
  { key: "home", icon: "home-outline", iconOn: "home", label: "tabHome" },
  { key: "talk", icon: "mic-outline", iconOn: "mic", label: "tabTalk" },
  { key: "progress", icon: "trending-up-outline", iconOn: "trending-up", label: "tabProgress" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.inner, isTablet && styles.innerTablet]}>
        {TABS.map((tab) => {
          const on = active === tab.key;
          const tint = on ? colors.forest : colors.textLight;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Ionicons name={on ? tab.iconOn : tab.icon} size={24} color={tint} />
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
  bar: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, width: "100%" },
  inner: { flexDirection: "row", width: "100%" },
  innerTablet: { maxWidth: 560, alignSelf: "center" },
  item: { flex: 1, alignItems: "center", gap: 4 },
  label: { fontSize: 12 },
});
