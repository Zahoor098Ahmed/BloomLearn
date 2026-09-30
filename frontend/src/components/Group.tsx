import { Children, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type } from "../theme";

/** A titled white group of rows, divided by hairlines (like phone settings). */
export default function Group({ title, note, children }: { title?: string; note?: string; children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.wrap}>
      {!!title && <Text style={[type.eyebrow, styles.title]}>{title}</Text>}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <View key={i} style={i > 0 && styles.divider}>
            {row}
          </View>
        ))}
      </View>
      {!!note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

/** One row: tinted icon, label (+ optional detail), and a trailing control. */
export function Row({
  icon,
  tint = colors.forest,
  bg = colors.forestLight,
  label,
  detail,
  trailing,
  chevron,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint?: string;
  bg?: string;
  label: string;
  detail?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  const body = (
    <>
      <View style={[styles.icon, { backgroundColor: danger ? colors.pink : bg }]}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, danger && { color: colors.danger }]}>{label}</Text>
        {!!detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
      {trailing}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.cardMuted }]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  title: { marginBottom: 8, marginHorizontal: 6 },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  divider: { borderTopWidth: 1, borderTopColor: "#f1ece2" },
  note: { fontSize: 12.5, color: colors.textMid, lineHeight: 18, marginTop: 8, marginHorizontal: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  detail: { fontSize: 12.5, color: colors.textMid, marginTop: 2, lineHeight: 17 },
});
