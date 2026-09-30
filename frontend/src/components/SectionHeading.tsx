import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, type } from "../theme";

/** "Your little community" style heading, with an optional line and action. */
export default function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[type.heading, { flex: 1 }]}>{title}</Text>
        {action && (
          <Pressable onPress={onAction} hitSlop={10}>
            <Text style={styles.action}>{action}</Text>
          </Pressable>
        )}
      </View>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18, marginBottom: 4, gap: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  action: { fontSize: 15, fontWeight: "600", color: colors.forest },
  sub: { fontSize: 15, color: colors.textMid },
});
