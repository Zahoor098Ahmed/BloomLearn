import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, LANGUAGES, applyLanguageDirection, isRTL } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import Logo from "../components/Logo";
import Segmented from "../components/Segmented";
import { colors, type } from "../theme";

interface Props {
  onGetStarted: () => void;
}

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; title: TKey; sub: TKey }[] = [
  { icon: "mic-outline", tint: colors.greenDeep, bg: colors.green, title: "lnSlide2Title", sub: "lnSlide2Sub" },
  { icon: "image-outline", tint: colors.pinkDeep, bg: colors.pink, title: "lnSlide3Title", sub: "lnSlide3Sub" },
  { icon: "volume-high-outline", tint: colors.yellowDeep, bg: colors.yellow, title: "lnSlide4Title", sub: "lnSlide4Sub" },
];

export default function WelcomeScreen({ onGetStarted }: Props) {
  const { settings, update } = useSettings();
  const { isTablet } = useResponsive();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  function getStarted() {
    update({ onboarded: true });
    if (applyLanguageDirection(lang)) Alert.alert(tt("stRestartTitle"), tt("stRtlNote"));
    onGetStarted();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Logo size={88} />
            <Text style={[type.display, styles.center, { marginTop: 18 }]}>BloomLearn</Text>
            <Text style={[type.lead, styles.center, { marginTop: 6 }]}>{tt("wlTagline")}</Text>
          </View>

          <View style={styles.card}>
            {FEATURES.map((f, i) => (
              <View key={f.title} style={[styles.row, i > 0 && styles.divider]}>
                <View style={[styles.icon, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon} size={20} color={f.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{tt(f.title)}</Text>
                  <Text style={styles.rowSub}>{tt(f.sub)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[type.eyebrow, styles.label]}>{tt("stLanguage")}</Text>
          <Segmented options={LANGUAGES.map((l) => ({ value: l.code, label: l.nativeName }))} value={lang} onChange={(code) => update({ language: code })} />

          <Pressable onPress={getStarted} style={({ pressed }) => [styles.start, pressed && { opacity: 0.9 }]}>
            <Text style={styles.startText}>{tt("wlStart")}</Text>
            <Ionicons name={isRTL(lang) ? "arrow-back" : "arrow-forward"} size={20} color="white" />
          </Pressable>
          <Text style={styles.trust}>{tt("lnTrust")}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 32 },
  bodyTablet: { maxWidth: 560, alignSelf: "center", width: "100%" },
  hero: { alignItems: "center" },
  center: { textAlign: "center" },
  card: { marginTop: 28, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: "#f1ece2" },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15.5, fontWeight: "800", color: colors.textDark },
  rowSub: { fontSize: 13, color: colors.textMid, marginTop: 2, lineHeight: 18 },
  label: { marginTop: 26, marginBottom: 10, marginHorizontal: 4 },
  start: {
    marginTop: 26,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
    borderRadius: 18,
    paddingVertical: 17,
  },
  startText: { color: "white", fontSize: 16.5, fontWeight: "800" },
  trust: { textAlign: "center", fontSize: 12.5, color: colors.textLight, marginTop: 14 },
});
