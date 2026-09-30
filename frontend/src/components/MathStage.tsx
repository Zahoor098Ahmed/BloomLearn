import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, type LayoutChangeEvent } from "react-native";
import { lookupImage } from "../modules/imageLibrary";
import { findWordEmoji } from "../modules/sentenceScene";
import { MAX_DRAWN, type MathScene } from "../modules/mathScene";
import { colors } from "../theme";

interface Props {
  scene: MathScene;
  /** Show "?" instead of the answer. */
  hideResult?: boolean;
  /** Tapping the "?" calls this (reveals the answer). */
  onReveal?: () => void;
  /** Hint under the picture while the answer is hidden. */
  revealHint?: string;
}

const GAP = 6; // space between pictures
const PAD = 10; // padding inside a group box
const MAX_SIZE = 72;
const MIN_SIZE = 22;

/**
 * Draws a sum as a counting picture:
 *   +  two groups side by side           −  one group with the taken-away ones crossed out
 *   ×  `a` equal groups of `b`           ÷  `a` things shared into `b` equal groups
 * Pictures are sized to fill the stage, so small sums get big pictures.
 */
export default function MathStage({ scene, hideResult = false, onReveal, revealHint }: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let active = true;
    setUri(null);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 7000));
    Promise.race([lookupImage(scene.object), timeout]).then((hit) => {
      if (active) setUri(hit?.uri ?? null);
    });
    return () => {
      active = false;
    };
  }, [scene.object]);

  const { a, b, op, result } = scene;
  const glyph = findWordEmoji(scene.object);
  const drawn = a <= MAX_DRAWN && b <= MAX_DRAWN && (op !== "×" || a * b <= MAX_DRAWN * 2);

  // How the pictures are split into boxes, and how much width each box gets.
  const boxes: { n: number; crossedFrom?: number }[] =
    !drawn
      ? [{ n: 1 }]
      : op === "+"
        ? [{ n: a }, { n: b }]
        : op === "-"
          ? [{ n: a, crossedFrom: a - b }]
          : op === "×"
            ? Array.from({ length: a }, () => ({ n: b }))
            : hideResult
              ? [{ n: a }]
              : Array.from({ length: b }, () => ({ n: result }));

  const inner = Math.max(0, width - 28); // stage padding
  const perRow = op === "+" ? 2 : boxes.length === 1 ? 1 : Math.min(boxes.length, inner > 560 ? 4 : inner > 360 ? 3 : 2);
  const plusWidth = op === "+" ? 34 : 0;
  const boxWidth = (inner - plusWidth - (perRow - 1) * 10) / perRow;
  const biggest = Math.max(...boxes.map((x) => x.n));
  const cols = Math.min(biggest, op === "+" ? 5 : boxes.length === 1 ? 5 : 3);
  const size = Math.round(Math.max(MIN_SIZE, Math.min(MAX_SIZE, (boxWidth - PAD * 2 - (cols - 1) * GAP) / cols)));
  const gridWidth = cols * size + (cols - 1) * GAP;

  const Thing = ({ crossed = false }: { crossed?: boolean }) => (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, opacity: crossed ? 0.3 : 1 }} resizeMode="contain" />
      ) : glyph ? (
        <Text style={{ fontSize: size * 0.8, lineHeight: size, opacity: crossed ? 0.3 : 1 }}>{glyph}</Text>
      ) : (
        <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size, backgroundColor: colors.forest, opacity: crossed ? 0.3 : 1 }} />
      )}
      {crossed && <View style={[styles.cross, { width: size * 1.05, height: Math.max(3, size / 16) }]} />}
    </View>
  );

  const Box = ({ n, crossedFrom = Infinity }: { n: number; crossedFrom?: number }) => (
    <View style={styles.group}>
      <View style={[styles.things, { width: gridWidth }]}>
        {Array.from({ length: n }, (_, i) => (
          <Thing key={i} crossed={i >= crossedFrom} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.stage} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {/* the sum in big numbers */}
      <View style={styles.sumRow}>
        <Text style={[styles.num, { color: colors.blueDeep }]}>{a}</Text>
        <Text style={styles.op}>{op === "-" ? "−" : op}</Text>
        <Text style={[styles.num, { color: colors.pinkDeep }]}>{b}</Text>
        <Text style={styles.op}>=</Text>
        {hideResult ? (
          <Pressable onPress={onReveal} disabled={!onReveal} style={styles.reveal} accessibilityRole="button">
            <Text style={[styles.num, { color: colors.forest }]}>?</Text>
          </Pressable>
        ) : (
          <Text style={[styles.num, { color: colors.forest }]}>{result}</Text>
        )}
      </View>

      {width > 0 && (
        <View style={styles.pictures}>
          {boxes.map((box, i) => (
            <View key={i} style={styles.boxWrap}>
              {i > 0 && op === "+" && <Text style={styles.opSmall}>+</Text>}
              <Box n={box.n} crossedFrom={box.crossedFrom} />
            </View>
          ))}
        </View>
      )}

      <Text style={styles.caption}>{caption(scene, hideResult)}</Text>
      {hideResult && !!revealHint && <Text style={styles.hint}>{revealHint}</Text>}
    </View>
  );
}

function plural(n: number, word: string): string {
  if (n === 1) return `${n} ${word}`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${n} ${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${n} ${word.slice(0, -1)}ies`;
  return `${n} ${word}s`;
}

function caption({ a, b, op, result, object }: MathScene, hide: boolean): string {
  const r = hide ? "?" : plural(result, object);
  switch (op) {
    case "+":
      return `${plural(a, object)} + ${plural(b, object)} = ${r}`;
    case "-":
      return `${plural(a, object)} − ${plural(b, object)} = ${r}`;
    case "×":
      return `${a} groups of ${plural(b, object)} = ${r}`;
    case "÷":
      return `${plural(a, object)} shared into ${b} groups = ${hide ? "?" : `${plural(result, object)} each`}`;
  }
}

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    minHeight: 236,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  sumRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  num: { fontSize: 44, fontWeight: "800" },
  op: { fontSize: 34, fontWeight: "700", color: colors.textMid },
  reveal: {
    minWidth: 60,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.forest,
    backgroundColor: colors.forestLight,
    alignItems: "center",
  },
  opSmall: { fontSize: 30, fontWeight: "700", color: colors.textMid, marginHorizontal: 4 },
  pictures: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10 },
  boxWrap: { flexDirection: "row", alignItems: "center" },
  group: { backgroundColor: colors.cardMuted, borderRadius: 18, padding: PAD },
  things: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: GAP },
  cross: { position: "absolute", borderRadius: 2, backgroundColor: colors.danger, transform: [{ rotate: "-35deg" }] },
  caption: { fontSize: 15, fontWeight: "600", color: colors.textMid, textAlign: "center" },
  hint: { fontSize: 13, color: colors.forest, fontWeight: "700", marginTop: -8 },
});
