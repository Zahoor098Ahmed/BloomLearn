import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import TopBar from "../components/TopBar";
import { colors, type } from "../theme";

interface Props {
  onBack: () => void;
}

const SECTIONS: { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; title: TKey; body: TKey }[] = [
  { icon: "phone-portrait-outline", tint: colors.greenDeep, bg: colors.green, title: "pvKeepTitle", body: "pvKeepBody" },
  { icon: "globe-outline", tint: colors.blueDeep, bg: colors.blue, title: "pvSendTitle", body: "pvSendBody" },
  { icon: "ban-outline", tint: colors.pinkDeep, bg: colors.pink, title: "pvNeverTitle", body: "pvNeverBody" },
  { icon: "people-outline", tint: colors.yellowDeep, bg: colors.yellow, title: "pvChildTitle", body: "pvChildBody" },
  { icon: "options-outline", tint: colors.purpleDeep, bg: colors.purple, title: "pvControlTitle", body: "pvControlBody" },
];

export default function PrivacyScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.pad}>
          <TopBar title={tt("stPrivacyPolicy")} onBack={onBack} />
        </View>
        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Ionicons name="shield-checkmark" size={26} color={colors.forest} />
            <Text style={[type.lead, { flex: 1, color: colors.forestDark }]}>{tt("pvIntro")}</Text>
          </View>

          <View style={styles.card}>
            {SECTIONS.map((s, i) => (
              <View key={s.title} style={[styles.row, i > 0 && styles.divider]}>
                <View style={[styles.icon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={20} color={s.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{tt(s.title)}</Text>
                  <Text style={styles.rowBody}>{tt(s.body)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  body: { paddingBottom: 40 },
  intro: { flexDirection: "row", gap: 12, backgroundColor: colors.forestLight, borderRadius: 20, padding: 16, marginTop: 8 },
  card: { marginTop: 16, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: "#f1ece2" },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15.5, fontWeight: "800", color: colors.textDark },
  rowBody: { fontSize: 13.5, color: colors.textMid, lineHeight: 20, marginTop: 4 },
});
