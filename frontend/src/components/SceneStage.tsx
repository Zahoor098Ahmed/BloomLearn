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
const STAGE_H = 250;
const SIZE_SCALE: Record<SceneItem["size"], number> = { tiny: 0.74, small: 0.87, normal: 1, big: 1.2, huge: 1.45 };
const BASE = 116;
const SLOT = 260;

function Item({ item, uri, crowd = 1 }: { item: SceneItem; uri?: string; crowd?: number }) {
  const size = BASE * SIZE_SCALE[item.size] * crowd;
  const n = Math.max(1, Math.min(5, item.count));
  const pic = Math.min(size * 2.2, STAGE_W * 0.86, STAGE_H * 0.92);
  const rowW = pic * (1 + (n - 1) * 0.86); // total width of the (possibly repeated) picture
  // keep the whole picture inside the stage — clamp the centre by its half-size
  const hw = Math.min(0.5, rowW / 2 / STAGE_W);
  const hh = Math.min(0.5, pic / 2 / STAGE_H);
  const cx = Math.min(1 - hw, Math.max(hw, item.x));
  const cy = Math.min(1 - hh, Math.max(hh, item.y));
  const col = item.colorHex ?? undefined;
  return (
    <View
      style={{
        position: "absolute",
        left: cx * STAGE_W - SLOT / 2,
        top: cy * STAGE_H - SLOT / 2,
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

// One clean body outline; each named part is a labelled marker on the figure
// (dot on the body + a connector line out to a name in the side margin).
// The body image sits in the centre ~40% of the box; x is where the dot goes.
const ORGAN: Record<string, { label: string; x: number; y: number; color: string; side: "L" | "R" }> = {
  // internal organs
  brain: { label: "brain", x: 0.5, y: 0.07, color: "#e79bc4", side: "R" },
  heart: { label: "heart", x: 0.46, y: 0.34, color: "#d64545", side: "L" },
  lungs: { label: "lungs", x: 0.55, y: 0.31, color: "#cf7f96", side: "R" },
  lung: { label: "lungs", x: 0.55, y: 0.31, color: "#cf7f96", side: "R" },
  liver: { label: "liver", x: 0.45, y: 0.44, color: "#a8632b", side: "L" },
  stomach: { label: "stomach", x: 0.55, y: 0.44, color: "#d99a2b", side: "R" },
  belly: { label: "stomach", x: 0.55, y: 0.44, color: "#d99a2b", side: "R" },
  kidney: { label: "kidneys", x: 0.46, y: 0.53, color: "#8a5a2b", side: "L" },
  kidneys: { label: "kidneys", x: 0.46, y: 0.53, color: "#8a5a2b", side: "L" },
  intestine: { label: "intestines", x: 0.54, y: 0.58, color: "#c98a5a", side: "R" },
  intestines: { label: "intestines", x: 0.54, y: 0.58, color: "#c98a5a", side: "R" },
  bladder: { label: "bladder", x: 0.5, y: 0.66, color: "#c9a83c", side: "L" },
  // outside body parts
  head: { label: "head", x: 0.5, y: 0.06, color: "#6c8cc9", side: "R" },
  hair: { label: "hair", x: 0.5, y: 0.03, color: "#8a5a2b", side: "L" },
  eye: { label: "eyes", x: 0.5, y: 0.06, color: "#4f9d5d", side: "L" },
  eyes: { label: "eyes", x: 0.5, y: 0.06, color: "#4f9d5d", side: "L" },
  ear: { label: "ears", x: 0.53, y: 0.07, color: "#c98a5a", side: "R" },
  nose: { label: "nose", x: 0.5, y: 0.08, color: "#d64545", side: "L" },
  mouth: { label: "mouth", x: 0.5, y: 0.1, color: "#d64545", side: "R" },
  neck: { label: "neck", x: 0.5, y: 0.15, color: "#6c8cc9", side: "L" },
  shoulder: { label: "shoulders", x: 0.42, y: 0.2, color: "#6c8cc9", side: "L" },
  chest: { label: "chest", x: 0.5, y: 0.27, color: "#6c8cc9", side: "R" },
  arm: { label: "arms", x: 0.38, y: 0.36, color: "#4f9d5d", side: "L" },
  elbow: { label: "elbows", x: 0.36, y: 0.44, color: "#4f9d5d", side: "R" },
  hand: { label: "hands", x: 0.34, y: 0.53, color: "#e08a3c", side: "L" },
  finger: { label: "fingers", x: 0.33, y: 0.59, color: "#e08a3c", side: "R" },
  tummy: { label: "tummy", x: 0.5, y: 0.42, color: "#d99a2b", side: "R" },
  torso: { label: "torso", x: 0.5, y: 0.35, color: "#6c8cc9", side: "R" },
  body: { label: "body", x: 0.5, y: 0.4, color: "#6c8cc9", side: "R" },
  hip: { label: "hips", x: 0.5, y: 0.6, color: "#6c8cc9", side: "L" },
  leg: { label: "legs", x: 0.47, y: 0.78, color: "#4f9d5d", side: "L" },
  knee: { label: "knees", x: 0.47, y: 0.85, color: "#4f9d5d", side: "R" },
  foot: { label: "feet", x: 0.47, y: 0.96, color: "#e08a3c", side: "L" },
  toe: { label: "toes", x: 0.46, y: 0.99, color: "#e08a3c", side: "R" },
  back: { label: "back", x: 0.5, y: 0.32, color: "#6c8cc9", side: "R" },
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
          {marks.flatMap((o) => [
            <View
              key={`${o.label}-line`}
              style={[
                styles.organLine,
                { top: `${o.y * 100}%` },
                o.side === "L"
                  ? { right: `${(1 - o.x) * 100}%`, left: "6%" }
                  : { left: `${o.x * 100}%`, right: "6%" },
              ]}
            />,
            <View
              key={`${o.label}-dot`}
              style={[styles.organDot, { backgroundColor: o.color, left: `${o.x * 100}%`, top: `${o.y * 100}%` }]}
            />,
            <Text
              key={`${o.label}-lbl`}
              style={[
                styles.organLabel,
                { top: `${o.y * 100}%` },
                o.side === "L" ? { left: 0, textAlign: "left" } : { right: 0, textAlign: "right" },
              ]}
              numberOfLines={1}
            >
              {o.label}
            </Text>,
          ])}
        </View>
        {!marks.length && <Text style={styles.anatomyHint}>Say “heart”, “add lungs”, “add stomach”… to label the body.</Text>}
      </View>
    );
  }

  const ordered = [...session.items].sort((a, b) => Number(b.behind) - Number(a.behind));
  const crowd =
    session.items.length >= 4 ? 0.5 : session.items.length === 3 ? 0.64 : session.items.length === 2 ? 0.78 : 1;

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
  bodyTitle: { position: "absolute", top: 6, fontSize: 12, fontWeight: "800", color: colors.textMid },
  bodyBox: { position: "absolute", top: 24, bottom: 8, left: 8, right: 8 },
  bodyBase: { position: "absolute", width: "100%", height: "100%", opacity: 0.9 },
  organDot: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
    marginLeft: -5.5,
    marginTop: -5.5,
    zIndex: 2,
  },
  organLine: { position: "absolute", height: 1.5, backgroundColor: "rgba(0,0,0,0.25)" },
  organLabel: {
    position: "absolute",
    width: 62,
    marginTop: -8,
    fontSize: 11,
    fontWeight: "800",
    color: colors.textDark,
    textTransform: "capitalize",
  },
});
