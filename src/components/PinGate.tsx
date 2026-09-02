import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { loadPasscode, hasPasscode, checkPasscode } from "../modules/passcode";
import { colors, radius } from "../theme";

/**
 * Blocks its children until the 4-digit admin passcode is entered. If no
 * passcode has been set yet, it lets the parent straight through (and the
 * Settings screen nudges them to set one).
 */
export default function PinGate({
  children,
  onCancel,
  title = "Parent area",
}: {
  children: React.ReactNode;
  onCancel: () => void;
  title?: string;
}) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPasscode().then(() => {
      setReady(true);
      if (!hasPasscode()) setUnlocked(true);
    });
  }, []);

  function press(d: string) {
    setError(false);
    const next = (entry + d).slice(0, 4);
    setEntry(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (checkPasscode(next)) setUnlocked(true);
        else {
          setError(true);
          setEntry("");
        }
      }, 120);
    }
  }

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (unlocked) return <>{children}</>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={styles.wrap} edges={["top", "bottom"]}>
        <Pressable onPress={onCancel} style={styles.back} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={colors.textMid} />
        </Pressable>

        <View style={styles.center}>
          <Ionicons name="lock-closed" size={30} color={colors.forest} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>Enter the 4-digit passcode</Text>

          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, entry.length > i && styles.dotFull, error && styles.dotError]} />
            ))}
          </View>
          {error && <Text style={styles.errText}>Wrong passcode — try again</Text>}

          <View style={styles.pad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) => {
              if (k === "") return <View key={i} style={styles.key} />;
              if (k === "del")
                return (
                  <Pressable key={i} onPress={() => setEntry((e) => e.slice(0, -1))} style={styles.key}>
                    <Ionicons name="backspace-outline" size={22} color={colors.textMid} />
                  </Pressable>
                );
              return (
                <Pressable key={i} onPress={() => press(k)} style={[styles.key, styles.keyNum]}>
                  <Text style={styles.keyText}>{k}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800", color: colors.textDark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMid },
  dots: { flexDirection: "row", gap: 16, marginTop: 18, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.border },
  dotFull: { backgroundColor: colors.forest, borderColor: colors.forest },
  dotError: { borderColor: colors.pinkDeep },
  errText: { color: colors.pinkDeep, fontSize: 12, fontWeight: "600" },
  pad: { width: 260, flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 20, justifyContent: "center" },
  key: { width: 72, height: 60, alignItems: "center", justifyContent: "center", borderRadius: radius },
  keyNum: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  keyText: { fontSize: 24, fontWeight: "700", color: colors.textDark },
});
