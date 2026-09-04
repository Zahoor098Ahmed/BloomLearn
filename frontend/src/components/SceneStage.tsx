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

// ARASAAC organ pictograms + where each sits on the body (fractions of the
// torso box). Each organ pictogram already carries a faint body outline, so
// overlapping them builds up one coherent figure.
const ORGAN: Record<string, { id: number; x: number; y: number; s: number }> = {
  brain: { id: 2696, x: 0.5, y: 0.11, s: 0.3 },
  head: { id: 2696, x: 0.5, y: 0.11, s: 0.3 },
  heart: { id: 4613, x: 0.47, y: 0.4, s: 0.34 },
  lungs: { id: 2822, x: 0.5, y: 0.4, s: 0.62 },
  lung: { id: 2822, x: 0.5, y: 0.4, s: 0.62 },
  liver: { id: 2980, x: 0.5, y: 0.52, s: 0.5 },
  stomach: { id: 2786, x: 0.5, y: 0.52, s: 0.5 },
  belly: { id: 2786, x: 0.5, y: 0.52, s: 0.5 },
  kidney: { id: 2812, x: 0.5, y: 0.58, s: 0.5 },
  kidneys: { id: 2812, x: 0.5, y: 0.58, s: 0.5 },
  intestine: { id: 2967, x: 0.5, y: 0.68, s: 0.55 },
  intestines: { id: 2967, x: 0.5, y: 0.68, s: 0.55 },
  bladder: { id: 3407, x: 0.5, y: 0.78, s: 0.3 },
};
const ORGAN_ORDER = ["lungs", "lung", "liver", "stomach", "belly", "intestine", "intestines", "kidney", "kidneys", "bladder", "heart", "brain", "head"];
const asrc = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  if (session.anatomy) {
    const parts = session.anatomyParts.filter((p) => ORGAN[p]);
    const shown = ORGAN_ORDER.filter((k) => parts.includes(k));
    // de-dupe by pictogram id (kidney/kidneys etc.)
    const seen = new Set<number>();
    return (
      <View style={styles.stage}>
        <View style={styles.bodyBox}>
          <Image source={{ uri: asrc(6473) }} style={styles.bodyBase} resizeMode="contain" />
          {shown.map((k) => {
            const o = ORGAN[k];
            if (seen.has(o.id)) return null;
            seen.add(o.id);
            return (
              <Image
                key={k}
                source={{ uri: asrc(o.id) }}
                resizeMode="contain"
                style={{
                  position: "absolute",
                  width: `${o.s * 100}%`,
                  height: `${o.s * 100}%`,
                  left: `${(o.x - o.s / 2) * 100}%`,
                  top: `${(o.y - o.s / 2) * 100}%`,
                }}
              />
            );
          })}
        </View>
        {!parts.length && <Text style={styles.anatomyHint}>Say “heart”, “add lungs”, “add stomach”… to build the body.</Text>}
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
  bodyBox: { height: "94%", aspectRatio: 0.62, position: "relative" },
  bodyBase: { position: "absolute", width: "100%", height: "100%", opacity: 0.5 },
});
