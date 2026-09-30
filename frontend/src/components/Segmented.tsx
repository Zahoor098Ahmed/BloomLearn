import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";

/** A row of options where exactly one is selected. */
export default function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} style={[styles.item, on && styles.itemOn]} accessibilityState={{ selected: on }}>
            <Text style={[styles.text, on && styles.textOn]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", backgroundColor: colors.cardMuted, borderRadius: 14, padding: 4, gap: 4 },
  item: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
  itemOn: { backgroundColor: colors.forest },
  text: { fontSize: 14, fontWeight: "700", color: colors.textMid },
  textOn: { color: "white" },
});
