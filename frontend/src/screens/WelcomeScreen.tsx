import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, LANGUAGES, applyLanguageDirection, isRTL } from "../modules/i18n";
import { useResponsive } from "../modules/responsive";
import Logo from "../components/Logo";
import IconSquare from "../components/IconSquare";
import { colors, radiusLg, type } from "../theme";

interface Props {
  onGetStarted: () => void;
}

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; tint: string; title: TKey; sub: TKey }[] = [
  { icon: "mic-outline", tint: colors.green, title: "lnSlide2Title", sub: "lnSlide2Sub" },
  { icon: "image-outline", tint: colors.pink, title: "lnSlide3Title", sub: "lnSlide3Sub" },
  { icon: "volume-high-outline", tint: colors.yellow, title: "lnSlide4Title", sub: "lnSlide4Sub" },
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
          <View style={styles.logoWrap}>
            <Logo size={96} />
            <View style={styles.logoDot} />
          </View>

          <Text style={[type.eyebrow, { marginTop: 26 }]}>{tt("lnTrust")}</Text>
          <Text style={[type.display, { marginTop: 10 }]}>{tt("wlHeadline")}</Text>
          <Text style={[type.lead, { marginTop: 10 }]}>{tt("wlTagline")}</Text>

          <View style={{ gap: 12, marginTop: 26 }}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.card}>
                <IconSquare icon={f.icon} bg={f.tint} size={52} round />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{tt(f.title)}</Text>
                  <Text style={styles.cardSub}>{tt(f.sub)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.label}>{tt("stLanguage")}</Text>
          <View style={{ gap: 10 }}>
            {LANGUAGES.map((l) => {
              const on = l.code === lang;
              return (
                <Pressable key={l.code} onPress={() => update({ language: l.code })} style={[styles.radio, on && styles.radioOn]}>
                  {on ? <Ionicons name="checkmark-circle" size={26} color={colors.forest} /> : <View style={styles.radioEmpty} />}
                  <Text style={styles.radioText}>{l.nativeName}</Text>
                  <Text style={styles.radioSub}>{l.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={getStarted} style={({ pressed }) => [styles.start, pressed && { opacity: 0.9 }]}>
            <Text style={styles.startText}>{tt("wlStart")}</Text>
            <Ionicons name={isRTL(lang) ? "arrow-back" : "arrow-forward"} size={22} color="white" />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
  bodyTablet: { maxWidth: 620, alignSelf: "center", width: "100%" },
  logoWrap: { alignSelf: "flex-start" },
  logoDot: { position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.pink, borderWidth: 3, borderColor: colors.bg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.textDark },
  cardSub: { fontSize: 14, color: colors.textMid, marginTop: 3, lineHeight: 20 },
  label: { fontSize: 17, fontWeight: "700", color: colors.textDark, marginTop: 28, marginBottom: 12 },
  radio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  radioOn: { backgroundColor: colors.forestLight, borderColor: colors.forest },
  radioEmpty: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textLight },
  radioText: { flex: 1, fontSize: 17, fontWeight: "600", color: colors.textDark },
  radioSub: { fontSize: 13.5, color: colors.textMid },
  start: {
    marginTop: 30,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
    borderRadius: 26,
    paddingVertical: 20,
  },
  startText: { color: "white", fontSize: 17, fontWeight: "700" },
});
