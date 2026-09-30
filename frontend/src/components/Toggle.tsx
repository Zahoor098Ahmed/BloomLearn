import { Pressable, View, StyleSheet } from "react-native";
import { colors } from "../theme";

/** Calm on/off switch in the app's green. */
export default function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.track, { backgroundColor: value ? colors.forest : colors.border }, disabled && { opacity: 0.45 }]}
    >
      <View style={[styles.knob, { left: value ? 25 : 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 30, borderRadius: 15 },
  knob: { position: "absolute", top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: "white" },
});
