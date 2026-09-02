import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

interface SkillBarProps {
  label: string;
  percent: number;
  color: string;
}

export default function SkillBar({ label, percent, color }: SkillBarProps) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.percent, { color }]}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 14, fontWeight: "600", color: colors.textDark },
  percent: { fontSize: 13, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.cardMuted, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
});
