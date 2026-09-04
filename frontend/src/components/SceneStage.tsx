import { View, Text, Image, StyleSheet } from "react-native";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { searchPhrase } from "../modules/sceneSession";
import { colors } from "../theme";

/**
 * The built scene, positioned: "cat above the table" draws the cat above the
 * table. Items keep their own place and state (eyes, expression, count, colour).
 * "behind" items draw first for depth. Clear ARASAAC symbols, offline, no keys.
 */

const STAGE_W = 320;
const STAGE_H = 246;
const SIZE_SCALE: Record<SceneItem["size"], number> = { tiny: 0.74, small: 0.87, normal: 1, big: 1.22, huge: 1.5 };
const BASE = 92;
const SLOT = 250;

function Item({ item, uri, crowd = 1 }: { item: SceneItem; uri?: string; crowd?: number }) {
  const size = BASE * SIZE_SCALE[item.size] * crowd;
  const n = Math.max(1, Math.min(5, item.count));
  const pic = size * 2.3;
  // Colour "glaze": the plain pictogram underneath (full detail) with a
  // semi-transparent tinted copy on top. The body picks up the colour while the
  // black outline, eyes and whiskers still read through. No background box.
  const col = item.colorHex ?? undefined;
  return (
    <View
      style={{
        position: "absolute",
        left: item.x * STAGE_W - SLOT / 2,
        top: item.y * STAGE_H - SLOT / 2,
        width: SLOT,
        height: SLOT,
        alignItems: "center",
        justifyContent: "center",
        opacity: item.behind ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={{ alignItems: "center", marginLeft: i === 0 ? 0 : -size * 0.14, width: pic, height: pic }}>
            {uri ? (
              <>
                <Image source={{ uri }} style={{ width: pic, height: pic }} resizeMode="contain" />
                {col && (
                  <Image
                    source={{ uri }}
                    style={{ position: "absolute", width: pic, height: pic, tintColor: col, opacity: 0.5 }}
                    resizeMode="contain"
                  />
                )}
              </>
            ) : (
              <View style={[styles.loading, { width: pic * 0.72, height: pic * 0.72, borderRadius: pic * 0.1 }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// One clean body outline; each named organ is a labelled marker at its spot on
// the body (a coloured dot + a name on its own side). No overlapping pictograms.
const ORGAN: Record<string, { label: string; x: number; y: number; color: string; side: "L" | "R" }> = {
  brain: { label: "brain", x: 0.5, y: 0.07, color: "#e79bc4", side: "R" },
  heart: { label: "heart", x: 0.44, y: 0.36, color: "#d64545", side: "L" },
  lungs: { label: "lungs", x: 0.58, y: 0.34, color: "#e0a3b4", side: "R" },
  lung: { label: "lungs", x: 0.58, y: 0.34, color: "#e0a3b4", side: "R" },
  liver: { label: "liver", x: 0.42, y: 0.5, color: "#a8632b", side: "L" },
  stomach: { label: "stomach", x: 0.57, y: 0.5, color: "#e0b25a", side: "R" },
  belly: { label: "stomach", x: 0.57, y: 0.5, color: "#e0b25a", side: "R" },
  kidney: { label: "kidneys", x: 0.5, y: 0.6, color: "#8a5a2b", side: "L" },
  kidneys: { label: "kidneys", x: 0.5, y: 0.6, color: "#8a5a2b", side: "L" },
  intestine: { label: "intestines", x: 0.5, y: 0.68, color: "#c98a5a", side: "R" },
  intestines: { label: "intestines", x: 0.5, y: 0.68, color: "#c98a5a", side: "R" },
  bladder: { label: "bladder", x: 0.5, y: 0.78, color: "#e9c33c", side: "L" },
};
const asrc = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  if (session.anatomy) {
    const seen = new Set<string>();
    const marks = session.anatomyParts
      .map((p) => ORGAN[p])
      .filter((o): o is (typeof ORGAN)[string] => !!o && !seen.has(o.label) && !!seen.add(o.label));
    return (
      <View style={styles.stage}>
        <Text style={styles.bodyTitle}>The human body</Text>
        <View style={styles.bodyBox}>
          <Image source={{ uri: asrc(6473) }} style={styles.bodyBase} resizeMode="contain" />
          {marks.map((o) => (
            <View key={o.label}>
              <View
                style={[
                  styles.organDot,
                  { backgroundColor: o.color, left: `${o.x * 100}%`, top: `${o.y * 100}%` },
                ]}
              />
              <Text
                style={[
                  styles.organLabel,
                  o.side === "L"
                    ? { right: `${(1 - o.x) * 100 + 6}%`, textAlign: "right" }
                    : { left: `${o.x * 100 + 6}%` },
                  { top: `${o.y * 100 - 4}%` },
                ]}
              >
                {o.label}
              </Text>
            </View>
          ))}
        </View>
        {!marks.length && <Text style={styles.anatomyHint}>Say “heart”, “add lungs”, “add stomach”… to label the body.</Text>}
      </View>
    );
  }

  const ordered = [...session.items].sort((a, b) => Number(b.behind) - Number(a.behind));
  const crowd =
    session.items.length >= 4 ? 0.62 : session.items.length === 3 ? 0.76 : session.items.length === 2 ? 0.9 : 1;

  return (
    <View style={styles.stage}>
      <View style={styles.groundShadow} />
      {ordered.map((it) => (
        <Item key={it.id} item={it} uri={uris[searchPhrase(it)]} crowd={crowd} />
      ))}
      {!session.items.length && (
        <Text style={styles.empty}>Say an object — “table”, then “cat above the table”, then “open the cat’s eyes”.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: STAGE_W / STAGE_H,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  groundShadow: {
    position: "absolute",
    left: "12%",
    right: "12%",
    bottom: "12%",
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  loading: { backgroundColor: "#eef0ee", borderWidth: 1, borderColor: colors.border },
  empty: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "42%",
    textAlign: "center",
    color: colors.textLight,
    fontSize: 12.5,
  },
  anatomyHint: { position: "absolute", left: 20, right: 20, top: "44%", fontSize: 12, color: colors.textLight, textAlign: "center" },
  bodyTitle: { position: "absolute", top: 8, fontSize: 12, fontWeight: "800", color: colors.textMid },
  bodyBox: { height: "88%", aspectRatio: 0.55, position: "relative", marginTop: 10 },
  bodyBase: { position: "absolute", width: "100%", height: "100%", opacity: 0.85 },
  organDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
    marginLeft: -6,
    marginTop: -6,
  },
  organLabel: {
    position: "absolute",
    fontSize: 11,
    fontWeight: "800",
    color: colors.textDark,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 3,
    borderRadius: 3,
  },
});
