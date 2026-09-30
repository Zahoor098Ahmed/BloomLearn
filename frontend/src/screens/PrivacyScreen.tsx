import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import TopBar from "../components/TopBar";
import IconSquare from "../components/IconSquare";
import { colors, radiusLg, type } from "../theme";

interface Props {
  onBack: () => void;
}

const SECTIONS: { icon: keyof typeof Ionicons.glyphMap; tint: string; title: TKey; body: TKey }[] = [
  { icon: "phone-portrait-outline", tint: colors.green, title: "pvKeepTitle", body: "pvKeepBody" },
  { icon: "globe-outline", tint: colors.blue, title: "pvSendTitle", body: "pvSendBody" },
  { icon: "ban-outline", tint: colors.pink, title: "pvNeverTitle", body: "pvNeverBody" },
  { icon: "people-outline", tint: colors.yellow, title: "pvChildTitle", body: "pvChildBody" },
  { icon: "options-outline", tint: colors.purple, title: "pvControlTitle", body: "pvControlBody" },
];

export default function PrivacyScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.pad}>
          <TopBar label={tt("stPrivacyPolicy")} onBack={onBack} />
        </View>
        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          <Text style={type.eyebrow}>{tt("pvEyebrow")}</Text>
          <Text style={[type.display, { marginTop: 10 }]}>{tt("pvHeadline")}</Text>
          <Text style={[type.lead, { marginTop: 8 }]}>{tt("pvIntro")}</Text>

          <View style={{ gap: 12, marginTop: 22 }}>
            {SECTIONS.map((s) => (
              <View key={s.title} style={styles.card}>
                <IconSquare icon={s.icon} bg={s.tint} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{tt(s.title)}</Text>
                  <Text style={styles.cardBody}>{tt(s.body)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pill}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.forest} />
            <Text style={styles.pillText}>{tt("hmLocal")}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 22 },
  body: { paddingBottom: 48 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  cardBody: { fontSize: 14.5, color: colors.textMid, lineHeight: 21, marginTop: 6 },
  pill: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#e6ebe1",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  pillText: { fontSize: 14, color: colors.forestDark, flex: 1 },
});
