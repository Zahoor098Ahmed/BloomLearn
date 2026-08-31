import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { LANGUAGES, t } from "../modules/i18n";
import type { LanguageCode } from "../types";
import Mascot from "../components/Mascot";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

type FontSize = "small" | "medium" | "large" | "xlarge";
const FONT_SIZES: FontSize[] = ["small", "medium", "large", "xlarge"];

interface ToggleRowProps {
  label: string;
  emoji: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, emoji, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Pressable onPress={() => onChange(!value)} style={[styles.switch, { backgroundColor: value ? colors.greenDeep : colors.border }]}>
        <View style={[styles.knob, { left: value ? 29 : 3 }]} />
      </Pressable>
    </View>
  );
}

export default function AccessibilityScreen({ onBack }: Props) {
  const { settings, update } = useSettings();
  const lang = settings.language;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← {t("back", lang)}</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Mascot mood="thinking" size={56} animate={false} />
            <Text style={styles.headerTitle}>⚙️ {t("settings", lang)}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <View>
            <Text style={styles.sectionTitle}>🔤 {t("fontSize", lang)}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {FONT_SIZES.map((s, i) => {
                const active = settings.fontSize === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => update({ fontSize: s })}
                    style={[styles.fontBtn, active ? styles.fontBtnActive : styles.fontBtnInactive]}
                  >
                    <Text style={[styles.fontBtnText, { fontSize: 16 + i * 4, color: active ? colors.textDark : colors.textLight }]}>A</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ToggleRow label={t("highContrast", lang)} emoji="🌗" value={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
          <ToggleRow label={t("sound", lang)} emoji="🔊" value={settings.soundEnabled} onChange={(v) => update({ soundEnabled: v })} />
          <ToggleRow label={t("reduceMotion", lang)} emoji="🐢" value={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />

          <View>
            <Text style={styles.sectionTitle}>🌍 {t("language", lang)}</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((l) => {
                const active = settings.language === l.code;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => update({ language: l.code as LanguageCode })}
                    style={[styles.langBtn, active ? styles.langBtnActive : styles.langBtnInactive]}
                  >
                    <Text style={{ fontSize: 22 }}>{l.flag}</Text>
                    <View>
                      <Text style={styles.langNative}>{l.nativeName}</Text>
                      <Text style={styles.langName}>{l.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 All settings apply immediately and are saved for next time.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 12, alignSelf: "flex-start" },
  backText: { color: "white", fontWeight: "700" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  body: { padding: 20, gap: 20 },
  sectionTitle: { fontSize: 16, color: colors.textMid, marginBottom: 10, fontWeight: "700" },
  fontBtn: { flex: 1, paddingVertical: 12, borderRadius: radius, borderWidth: 1, alignItems: "center" },
  fontBtnActive: { borderColor: colors.forest, backgroundColor: colors.forestLight },
  fontBtnInactive: { borderColor: colors.border, backgroundColor: colors.card },
  fontBtnText: { fontWeight: "800" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: radius, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { flex: 1, fontWeight: "600", fontSize: 16, color: colors.textDark },
  switch: { width: 56, height: 30, borderRadius: 15 },
  knob: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: "white", top: 3 },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langBtn: { width: "47%", paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  langBtnActive: { borderColor: colors.forest, backgroundColor: colors.forestLight },
  langBtnInactive: { borderColor: colors.border, backgroundColor: colors.card },
  langNative: { fontSize: 13, color: colors.textDark, fontWeight: "700" },
  langName: { fontSize: 11, color: colors.textLight },
  infoBox: { backgroundColor: colors.blue, borderRadius: radius, paddingVertical: 14, paddingHorizontal: 18 },
  infoText: { color: colors.textDark, fontSize: 14, lineHeight: 22 },
});
