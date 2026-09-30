import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import TopBar from "../components/TopBar";
import Group, { Row } from "../components/Group";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
  onOpenTalk: (text?: string) => void;
}

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: TKey; body: TKey; tint: string; bg: string }[] = [
  { icon: "mic-outline", title: "hpStep1Title", body: "hpStep1Body", tint: colors.greenDeep, bg: colors.green },
  { icon: "chatbubble-outline", title: "hpStep2Title", body: "hpStep2Body", tint: colors.blueDeep, bg: colors.blue },
  { icon: "add-circle-outline", title: "hpStep3Title", body: "hpStep3Body", tint: colors.yellowDeep, bg: colors.yellow },
  { icon: "image-outline", title: "hpStep4Title", body: "hpStep4Body", tint: colors.pinkDeep, bg: colors.pink },
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
          <TopBar title={tt("hpTitle")} onBack={onBack} />
        </View>
        <ScrollView contentContainerStyle={[styles.pad, styles.body]} showsVerticalScrollIndicator={false}>
          <Group title={tt("hpSub")}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.step}>
                <View style={[styles.stepIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={20} color={s.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>
                    {i + 1}. {tt(s.title)}
                  </Text>
                  <Text style={styles.stepBody}>{tt(s.body)}</Text>
                </View>
              </View>
            ))}
          </Group>

          <Group title={tt("hpWorksWith")}>
            <Text style={styles.text}>{tt("hpWorksWithBody")}</Text>
          </Group>

          <Group title={tt("hpNeedsTitle")}>
            <Text style={styles.text}>{tt("hpNeedsBody")}</Text>
          </Group>

          <Group title={tt("spTrySentence")}>
            {EXAMPLE_KEYS.map((k) => (
              <Row key={k} icon="chatbubble-ellipses-outline" label={tt(k)} chevron onPress={() => onOpenTalk(tt(k))} />
            ))}
          </Group>

          <Pressable onPress={() => onOpenTalk()} style={({ pressed }) => [styles.start, pressed && { opacity: 0.9 }]}>
            <Ionicons name="mic" size={20} color="white" />
            <Text style={styles.startText}>{tt("hmHeroBtn")}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  body: { paddingBottom: 40 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 },
  stepIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 15.5, fontWeight: "800", color: colors.textDark },
  stepBody: { fontSize: 13.5, color: colors.textMid, lineHeight: 20, marginTop: 3 },
  text: { fontSize: 14, color: colors.textMid, lineHeight: 21, padding: 16 },
  start: {
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
    borderRadius: 18,
    paddingVertical: 16,
  },
  startText: { color: "white", fontSize: 16, fontWeight: "800" },
});
