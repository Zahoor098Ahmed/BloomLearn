import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey, isRTL } from "../modules/i18n";
import TopBar from "../components/TopBar";
import IconSquare from "../components/IconSquare";
import SectionHeading from "../components/SectionHeading";
import { colors, radiusLg, type } from "../theme";

interface Props {
  onBack: () => void;
  onOpenTalk: (text?: string) => void;
}

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: TKey; body: TKey; tint: string }[] = [
  { icon: "mic-outline", title: "hpStep1Title", body: "hpStep1Body", tint: colors.green },
  { icon: "chatbubble-outline", title: "hpStep2Title", body: "hpStep2Body", tint: colors.blue },
  { icon: "add-circle-outline", title: "hpStep3Title", body: "hpStep3Body", tint: colors.yellow },
  { icon: "image-outline", title: "hpStep4Title", body: "hpStep4Body", tint: colors.pink },
];

const EXAMPLE_KEYS: TKey[] = ["spExample1", "spExample2", "spExample3", "spExample4", "spExample5"];

export default function HelpScreen({ onBack, onOpenTalk }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.pad}>
          <TopBar label={tt("hpTitle")} onBack={onBack} />
        </View>
        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          <Text style={type.eyebrow}>{tt("hpSub")}</Text>
          <Text style={[type.display, { marginTop: 10 }]}>{tt("hpHeadline")}</Text>

          <View style={{ gap: 12, marginTop: 18 }}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.card}>
                <IconSquare icon={s.icon} bg={s.tint} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={type.eyebrow}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={styles.cardTitle}>{tt(s.title)}</Text>
                  <Text style={styles.cardBody}>{tt(s.body)}</Text>
                </View>
              </View>
            ))}
          </View>

          <SectionHeading title={tt("hpWorksWith")} />
          <Text style={styles.plain}>{tt("hpWorksWithBody")}</Text>

          <SectionHeading title={tt("hpNeedsTitle")} />
          <Text style={styles.plain}>{tt("hpNeedsBody")}</Text>

          <SectionHeading title={tt("spTrySentence")} />
          <View style={{ gap: 10 }}>
            {EXAMPLE_KEYS.map((k) => (
              <Pressable key={k} onPress={() => onOpenTalk(tt(k))} style={({ pressed }) => [styles.example, pressed && { opacity: 0.9 }]}>
                <Text style={styles.exampleText}>{tt(k)}</Text>
                <Ionicons name={isRTL(lang) ? "arrow-back" : "arrow-forward"} size={20} color={colors.forest} />
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => onOpenTalk()} style={({ pressed }) => [styles.start, pressed && { opacity: 0.9 }]}>
            <Ionicons name="mic-outline" size={22} color="white" />
            <Text style={styles.startText}>{tt("hmHeroBtn")}</Text>
          </Pressable>
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
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark, marginTop: 4 },
  cardBody: { fontSize: 14.5, color: colors.textMid, lineHeight: 21, marginTop: 4 },
  plain: { fontSize: 15, color: colors.textMid, lineHeight: 23 },
  example: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  exampleText: { flex: 1, fontSize: 15.5, fontWeight: "600", color: colors.textDark },
  start: {
    marginTop: 26,
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
