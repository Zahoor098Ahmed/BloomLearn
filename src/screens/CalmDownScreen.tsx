import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import { speak } from "../modules/tts";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
}

type Phase = "idle" | "in" | "hold" | "out" | "done";

const CYCLE = [
  { phase: "in" as Phase, label: "breatheIn" as const, dur: 4000, scale: 1 },
  { phase: "hold" as Phase, label: "hold" as const, dur: 2000, scale: 1 },
  { phase: "out" as Phase, label: "breatheOut" as const, dur: 4000, scale: 0.55 },
];

const TOTAL_CYCLES = 5;

export default function CalmDownScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("");
  const scale = useRef(new Animated.Value(0.55)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  async function runBreathing() {
    runningRef.current = true;
    for (let cycle = 0; cycle < TOTAL_CYCLES; cycle++) {
      if (!runningRef.current) break;
      setCycleCount(cycle + 1);
      for (const step of CYCLE) {
        if (!runningRef.current) break;
        setPhase(step.phase);
        setPhaseLabel(t(step.label, lang));
        speak(t(step.label, lang), lang, settings.soundEnabled);
        Animated.timing(scale, {
          toValue: step.scale,
          duration: settings.reduceMotion ? 50 : step.dur,
          useNativeDriver: true,
        }).start();
        await new Promise<void>((r) => {
          timerRef.current = setTimeout(r, step.dur);
        });
      }
    }
    if (runningRef.current) {
      setPhase("done");
      speak(t("feelingCalm", lang), lang, settings.soundEnabled);
    }
  }

  function start() {
    setPhase("in");
    setCycleCount(0);
    runBreathing();
  }

  function stop() {
    runningRef.current = false;
    clear();
    setPhase("idle");
    scale.setValue(0.55);
  }

  useEffect(
    () => () => {
      runningRef.current = false;
      clear();
    },
    []
  );

  const circleSize = 220;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ width: "100%", maxWidth: 440 }}>
          <Pressable
            onPress={() => {
              stop();
              onBack();
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← {t("back", lang)}</Text>
          </Pressable>
        </View>

        <Mascot mood="calm" size={80} animate={false} />

        <Text style={styles.title}>🌿 {t("calmDown", lang)}</Text>

        <View style={[styles.circleWrap, { width: circleSize, height: circleSize }]}>
          <Animated.View
            style={[
              styles.circle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                transform: [{ scale }],
              },
            ]}
          >
            <Text style={{ fontSize: 40 }}>🌿</Text>
          </Animated.View>
        </View>

        <View style={styles.labelBox}>
          {phase === "idle" && <Text style={styles.idleText}>{t("breatheStart", lang)}</Text>}
          {phase !== "idle" && phase !== "done" && <Text style={styles.phaseText}>{phaseLabel}</Text>}
          {phase === "done" && <Text style={styles.doneText}>{t("feelingCalm", lang)}</Text>}
        </View>

        {phase !== "idle" && phase !== "done" && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i < cycleCount ? colors.greenDeep : colors.border }]} />
            ))}
          </View>
        )}

        {phase === "idle" || phase === "done" ? (
          <BigButton variant="mint" onPress={start} style={{ width: "100%", maxWidth: 320, paddingVertical: 18 }}>
            {phase === "done" ? "🔄 Again" : "▶ Begin"}
          </BigButton>
        ) : (
          <BigButton variant="ghost" onPress={stop} style={{ width: "100%", maxWidth: 320 }}>
            ■ Stop
          </BigButton>
        )}

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 Breathe in through your nose… hold gently… breathe out slowly through your mouth</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, paddingTop: 24, gap: 20 },
  backBtn: { backgroundColor: "rgba(110,213,168,0.2)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" },
  backText: { fontWeight: "700", color: colors.textMid },
  title: { fontSize: 26, fontWeight: "800", color: colors.textDark, textAlign: "center" },
  circleWrap: { alignItems: "center", justifyContent: "center" },
  circle: { alignItems: "center", justifyContent: "center", backgroundColor: colors.greenDeep },
  labelBox: { height: 48, alignItems: "center", justifyContent: "center" },
  idleText: { color: colors.textLight, fontSize: 16, textAlign: "center" },
  phaseText: { fontSize: 24, color: colors.textDark, fontWeight: "700", textAlign: "center" },
  doneText: { fontSize: 21, color: colors.greenDeep, fontWeight: "700", textAlign: "center" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tipBox: { maxWidth: 340, backgroundColor: "rgba(110,213,168,0.12)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, marginTop: "auto", marginBottom: 16 },
  tipText: { color: colors.textMid, fontSize: 14, lineHeight: 22, textAlign: "center" },
});
