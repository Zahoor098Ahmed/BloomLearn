import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChildProfile } from "../types";
import { updateChild } from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import { speak } from "../modules/tts";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import { colors, radius } from "../theme";

interface Props {
  child: ChildProfile;
  onBack: () => void;
  onUpdate: (c: ChildProfile) => void;
}

const BADGES = [
  { id: "first-star", label: "First Star!", emoji: "⭐", req: 1 },
  { id: "five-stars", label: "Star Collector", emoji: "🌟", req: 5 },
  { id: "ten-stars", label: "Star Champion", emoji: "🏆", req: 10 },
  { id: "twenty-stars", label: "Superstar!", emoji: "🦸", req: 20 },
  { id: "fifty-stars", label: "Legend!", emoji: "👑", req: 50 },
  { id: "explorer", label: "Explorer", emoji: "🗺️", req: 3 },
  { id: "reader", label: "Bookworm", emoji: "📚", req: 7 },
  { id: "helper", label: "Helpful Friend", emoji: "🤝", req: 15 },
];

export default function RewardsScreen({ child, onBack, onUpdate }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [stars, setStars] = useState(child.stars);
  const [badges, setBadges] = useState(child.badges);

  function addStar() {
    const newStars = stars + 1;
    setStars(newStars);
    speak(t("wellDone", lang), lang, settings.soundEnabled);
    const newBadges = [...badges];
    BADGES.forEach((b) => {
      if (!newBadges.includes(b.id) && newStars >= b.req) {
        newBadges.push(b.id);
        setTimeout(() => speak(b.label, lang, settings.soundEnabled), 1200);
      }
    });
    setBadges(newBadges);
    const updated = { ...child, stars: newStars, badges: newBadges };
    updateChild(updated);
    onUpdate(updated);
  }

  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));
  const lockedBadges = BADGES.filter((b) => !badges.includes(b.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← {t("back", lang)}</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Mascot mood="excited" size={56} animate={false} />
            <View>
              <Text style={styles.headerTitle}>⭐ {t("rewards", lang)}</Text>
              <Text style={styles.headerSub}>{child.name}'s achievements</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.starCard}>
            <Text style={{ fontSize: 56, lineHeight: 60 }}>⭐</Text>
            <Text style={styles.starCount}>{stars}</Text>
            <Text style={styles.starLabel}>{t("stars", lang)}</Text>
            <BigButton variant="primary" onPress={addStar} style={{ width: "100%", paddingVertical: 18 }}>
              🎉 {t("wellDone", lang)} +1 Star
            </BigButton>
          </View>

          <View style={styles.starRow}>
            {Array.from({ length: Math.min(stars, 30) }).map((_, i) => (
              <Text key={i} style={{ fontSize: 22 }}>
                ⭐
              </Text>
            ))}
            {stars > 30 && <Text style={styles.moreStars}>+{stars - 30} more</Text>}
          </View>

          {earnedBadges.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>🏅 {t("badges", lang)} Earned</Text>
              <View style={styles.badgeGrid}>
                {earnedBadges.map((b) => (
                  <View key={b.id} style={styles.badgeCardEarned}>
                    <Text style={{ fontSize: 32 }}>{b.emoji}</Text>
                    <Text style={styles.badgeLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {lockedBadges.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>🔒 Coming Soon</Text>
              <View style={styles.badgeGrid}>
                {lockedBadges.map((b) => (
                  <View key={b.id} style={styles.badgeCardLocked}>
                    <Text style={{ fontSize: 32, opacity: 0.4 }}>{b.emoji}</Text>
                    <Text style={styles.badgeReq}>{b.req} ⭐ needed</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 12, alignSelf: "flex-start" },
  backText: { fontWeight: "700", color: "white" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  body: { padding: 20, gap: 24 },
  starCard: { backgroundColor: colors.card, borderRadius: radius, paddingVertical: 32, paddingHorizontal: 24, alignItems: "center", borderWidth: 1, borderColor: colors.border, gap: 4 },
  starCount: { fontSize: 56, fontWeight: "800", color: colors.textDark },
  starLabel: { color: colors.textMid, marginBottom: 20 },
  starRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  moreStars: { color: colors.textMid, fontSize: 14, padding: 4 },
  sectionTitle: { fontSize: 16, color: colors.textMid, fontWeight: "700", marginBottom: 12 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCardEarned: { width: "30%", backgroundColor: colors.card, borderRadius: radius, paddingVertical: 16, paddingHorizontal: 8, alignItems: "center", borderWidth: 1, borderColor: colors.yellowDeep },
  badgeCardLocked: { width: "30%", backgroundColor: colors.cardMuted, borderRadius: radius, paddingVertical: 16, paddingHorizontal: 8, alignItems: "center", opacity: 0.7 },
  badgeLabel: { marginTop: 6, fontSize: 11, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  badgeReq: { marginTop: 6, fontSize: 11, color: colors.textLight, textAlign: "center" },
});
