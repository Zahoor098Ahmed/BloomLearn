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
// "Organs of the body" style diagram: a figure in the centre, each named organ
// in a circular badge around the edge with a connector line to its spot.
type OrganDef = { label: string; id: number; ax: number; ay: number };
const ORGAN: Record<string, OrganDef> = {
  brain: { label: "Brain", id: 2696, ax: 0.5, ay: 0.12 },
  lungs: { label: "Lungs", id: 2822, ax: 0.5, ay: 0.34 },
  lung: { label: "Lungs", id: 2822, ax: 0.5, ay: 0.34 },
  heart: { label: "Heart", id: 4613, ax: 0.47, ay: 0.37 },
  liver: { label: "Liver", id: 2980, ax: 0.45, ay: 0.46 },
  stomach: { label: "Stomach", id: 2786, ax: 0.55, ay: 0.45 },
  belly: { label: "Stomach", id: 2786, ax: 0.55, ay: 0.45 },
  pancreas: { label: "Pancreas", id: 28407, ax: 0.53, ay: 0.49 },
  kidney: { label: "Kidneys", id: 2812, ax: 0.53, ay: 0.51 },
  kidneys: { label: "Kidneys", id: 2812, ax: 0.53, ay: 0.51 },
  intestine: { label: "Intestines", id: 2967, ax: 0.5, ay: 0.56 },
  intestines: { label: "Intestines", id: 2967, ax: 0.5, ay: 0.56 },
  bladder: { label: "Bladder", id: 3407, ax: 0.5, ay: 0.62 },
};
// simple outside parts — a dot + label on the figure (no organ picture)
const PART: Record<string, { label: string; x: number; y: number; side: "L" | "R" }> = {
  head: { label: "Head", x: 0.5, y: 0.07, side: "R" },
  hair: { label: "Hair", x: 0.5, y: 0.04, side: "L" },
  eye: { label: "Eyes", x: 0.48, y: 0.07, side: "L" }, eyes: { label: "Eyes", x: 0.48, y: 0.07, side: "L" },
  ear: { label: "Ears", x: 0.54, y: 0.08, side: "R" }, ears: { label: "Ears", x: 0.54, y: 0.08, side: "R" },
  nose: { label: "Nose", x: 0.5, y: 0.09, side: "L" },
  mouth: { label: "Mouth", x: 0.5, y: 0.11, side: "R" },
  neck: { label: "Neck", x: 0.5, y: 0.16, side: "L" },
  shoulder: { label: "Shoulders", x: 0.4, y: 0.21, side: "L" }, shoulders: { label: "Shoulders", x: 0.4, y: 0.21, side: "L" },
  chest: { label: "Chest", x: 0.5, y: 0.28, side: "R" },
  arm: { label: "Arms", x: 0.34, y: 0.34, side: "L" }, arms: { label: "Arms", x: 0.34, y: 0.34, side: "L" },
  elbow: { label: "Elbows", x: 0.3, y: 0.42, side: "R" },
  hand: { label: "Hands", x: 0.27, y: 0.5, side: "L" }, hands: { label: "Hands", x: 0.27, y: 0.5, side: "L" },
  finger: { label: "Fingers", x: 0.25, y: 0.56, side: "R" },
  tummy: { label: "Tummy", x: 0.5, y: 0.43, side: "R" },
  hip: { label: "Hips", x: 0.5, y: 0.6, side: "L" }, hips: { label: "Hips", x: 0.5, y: 0.6, side: "L" },
  leg: { label: "Legs", x: 0.46, y: 0.78, side: "L" }, legs: { label: "Legs", x: 0.46, y: 0.78, side: "L" },
  knee: { label: "Knees", x: 0.46, y: 0.86, side: "R" },
  foot: { label: "Feet", x: 0.46, y: 0.96, side: "L" }, feet: { label: "Feet", x: 0.46, y: 0.96, side: "L" },
  toe: { label: "Toes", x: 0.45, y: 0.99, side: "R" },
  back: { label: "Back", x: 0.5, y: 0.32, side: "R" },
  torso: { label: "Torso", x: 0.5, y: 0.36, side: "R" },
  body: { label: "Body", x: 0.5, y: 0.4, side: "R" },
};
const asrc = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

const AW = 320;
const AH = 410;
// badge slots around the edge, filled in this order
const SLOTS = [
  { x: 0.135, y: 0.16 }, { x: 0.865, y: 0.16 },
  { x: 0.135, y: 0.37 }, { x: 0.865, y: 0.37 },
  { x: 0.135, y: 0.58 }, { x: 0.865, y: 0.58 },
  { x: 0.135, y: 0.79 }, { x: 0.865, y: 0.79 },
  { x: 0.34, y: 0.93 }, { x: 0.66, y: 0.93 },
];

function Connector({ from, to, color = "#3f8f86" }: { from: { x: number; y: number }; to: { x: number; y: number }; color?: string }) {
  const dx = (to.x - from.x) * AW;
  const dy = (to.y - from.y) * AH;
  const len = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={{
        position: "absolute",
        left: `${from.x * 100}%`,
        top: `${from.y * 100}%`,
        width: len,
        height: 1.5,
        backgroundColor: color,
        transformOrigin: "left center",
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  if (session.anatomy) {
    const seen = new Set<string>();
    const uniq = session.anatomyParts.filter((p) => {
      const k = ORGAN[p]?.label ?? PART[p]?.label ?? p;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const organs = uniq.map((p) => ORGAN[p]).filter((o): o is OrganDef => !!o).slice(0, SLOTS.length);
    const parts = uniq.map((p) => PART[p]).filter((o): o is (typeof PART)[string] => !!o);

    return (
      <View style={styles.bodyStage}>
        <Text style={styles.bodyTitle}>Parts of the body</Text>
        <Image source={{ uri: asrc(6473) }} style={styles.bodyFigure} resizeMode="contain" />

        {organs.map((o, i) => {
          const slot = SLOTS[i];
          return (
            <View key={o.label}>
              <Connector from={slot} to={{ x: o.ax, y: o.ay }} />
              <View style={[styles.badge, { left: `${slot.x * 100}%`, top: `${slot.y * 100}%` }]}>
                <Image source={{ uri: asrc(o.id) }} style={styles.badgeImg} resizeMode="contain" />
              </View>
              <Text style={[styles.badgeLabel, { left: `${slot.x * 100}%`, top: `${slot.y * 100}%` }]} numberOfLines={1}>
                {o.label}
              </Text>
            </View>
          );
        })}

        {parts.map((p) => (
          <View key={p.label}>
            <View
              style={[
                styles.organLine,
                { top: `${p.y * 100}%` },
                p.side === "L" ? { right: `${(1 - p.x) * 100}%`, left: "4%" } : { left: `${p.x * 100}%`, right: "4%" },
              ]}
            />
            <View style={[styles.organDot, { left: `${p.x * 100}%`, top: `${p.y * 100}%` }]} />
            <Text
              style={[styles.organLabel, { top: `${p.y * 100}%` }, p.side === "L" ? { left: 0 } : { right: 0, textAlign: "right" }]}
              numberOfLines={1}
            >
              {p.label}
            </Text>
          </View>
        ))}

        {!organs.length && !parts.length && (
          <Text style={styles.anatomyHint}>Say “heart”, “add lungs”, “add stomach”… to build the diagram.</Text>
        )}
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
  bodyStage: {
    width: "100%",
    aspectRatio: AW / AH,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  bodyTitle: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    fontSize: 13,
    fontWeight: "800",
    color: "#3f8f86",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bodyFigure: { position: "absolute", left: "33%", right: "33%", top: "9%", bottom: "3%" },
  badge: {
    position: "absolute",
    width: 62,
    height: 62,
    marginLeft: -31,
    marginTop: -31,
    borderRadius: 31,
    backgroundColor: "#e8f4f2",
    borderWidth: 1.5,
    borderColor: "#bfe0da",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  badgeImg: { width: 46, height: 46 },
  badgeLabel: {
    position: "absolute",
    width: 90,
    marginLeft: -45,
    marginTop: 32,
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: "800",
    color: "#3f8f86",
    zIndex: 3,
  },
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
