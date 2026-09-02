import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

interface StatTileProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

export default function StatTile({ icon, value, label, color }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingVertical: 16, gap: 4 },
  value: { fontSize: 22, fontWeight: "800" },
  label: { fontSize: 11, color: colors.textMid, textAlign: "center" },
});
