import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Svg, { Line, Circle, G } from "react-native-svg";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { searchPhrase } from "../modules/sceneSession";
import { getPictogramUrl } from "../modules/aacPictograms";
import { dictUrl } from "../modules/imageLibrary";
import { colors } from "../theme";
import { useSettings } from "../context/SettingsContext";
import { t, wordLabel } from "../modules/i18n";

/**
 * The built scene, positioned: "cat above the table" draws the cat above the
 * table. A single layout pass sizes every object, then scales + centres the
 * whole group to fit the frame with a margin — nothing is cropped, the scene
 * is always centred, and it scales with the container (mobile → desktop).
 */

// the stage is a percentage-width box with this aspect ratio; all sizes and
// positions below are fractions of it, so it is fully responsive
const STAGE_W = 320;
const STAGE_H = 300;
const ASPECT = STAGE_W / STAGE_H;
const PAD = 0.06; // keep everything this far from the edge

const SIZE_SCALE: Record<SceneItem["size"], number> = { tiny: 0.6, small: 0.8, normal: 1, big: 1.3, huge: 1.7 };
// common-sense relative sizes so a laptop reads smaller than a table, etc.
const NATURAL: Record<string, number> = {
  table: 1.3, "dining table": 1.35, desk: 1.3, sofa: 1.5, couch: 1.5, bed: 1.5, "office chair": 1.3,
  chair: 1.3, stool: 0.8, house: 1.7, tree: 1.6, car: 1.5, bus: 1.7, mosque: 1.7,
  box: 0.95, "cardboard box": 0.95, "open box": 0.95, "opened cardboard box": 0.95, basket: 0.9, carton: 0.95,
  laptop: 0.68, computer: 0.75, book: 0.55, cup: 0.45, ball: 0.5, phone: 0.4, apple: 0.42,
  key: 0.35, flower: 0.55, hat: 0.5, shoe: 0.5, cat: 0.78, dog: 0.85, bird: 0.55, fish: 0.5,
  boy: 1.0, girl: 1.0, child: 1.0, kid: 1.0, man: 1.1, woman: 1.1, baby: 0.7, kidney: 0.5, heart: 0.5,
};
const BASE_W = 0.5; // a lone "normal" object is half the stage wide before fit-scaling

const AIRBORNE_TYPES = new Set([
  "bird", "birds", "butterfly", "butterflies", "airplane", "aeroplane", "plane",
  "cloud", "clouds", "sun", "moon", "star", "stars", "balloon", "balloons",
  "kite", "kites", "helicopter", "rocket", "fly", "bee", "bees", "bat", "bats",
]);

interface Placed {
  it: SceneItem;
  cx: number;
  cy: number;
  w: number; // fraction of stage width
  h: number; // fraction of stage height
  groundShadow: boolean;
}

// Visual bottom baseline offset for each pictogram (fraction of height from center).
// Wide/lying items (like cat 2406) have transparent space at the bottom in their 500x500 box;
// specifying their true drawn bottom makes them sit exactly on surfaces & floors without floating or sinking:
const BOTTOM_OFFSET: Record<string, number> = {
  cat: 0.216,
  kitten: 0.216,
  pussycat: 0.216,
  book: 0.24,
  snake: 0.22,
  turtle: 0.25,
  fish: 0.25,
  ball: 0.34,
  apple: 0.42,
  box: 0.40,
  "cardboard box": 0.40,
  table: 0.36,
  desk: 0.36,
  car: 0.19,
  bus: 0.15,
  boy: 0.48,
  girl: 0.48,
  child: 0.48,
  kid: 0.48,
  man: 0.48,
  woman: 0.48,
  person: 0.48,
};
const bottomOf = (type: string) => BOTTOM_OFFSET[type] ?? 0.44;

// The top surface level for furniture/stands where items sit (fraction of height from center):
const SURFACE_OFFSET: Record<string, number> = {
  table: 0.36,
  desk: 0.36,
  shelf: 0.36,
  chair: 0.02,
  "office chair": 0.02,
  bed: 0.18,
  sofa: 0.18,
  couch: 0.18,
  car: 0.19,
  bus: 0.15,
};
const surfaceTopOf = (type: string) => SURFACE_OFFSET[type] ?? 0.36;

function layoutScene(items: SceneItem[]): Placed[] {
  if (!items.length) return [];
  const nodes = items.map((it) => {
    const w = BASE_W * SIZE_SCALE[it.size] * (NATURAL[it.type] ?? 0.9);
    return { it, x: it.x, y: it.y, w, h: w / ASPECT };
  });

  // 1. Precise spatial relations for prepositions:
  for (const n of nodes) {
    if (n.it.reference) {
      const ref = nodes.find(
        (other) =>
          other !== n &&
          (other.it.type === n.it.reference ||
            other.it.type.includes(n.it.reference!) ||
            n.it.reference!.includes(other.it.type)),
      );
      if (ref) {
        const rel = n.it.relation as string | null;
        if (rel === "on") {
          // On surface (table, desk, shelf, chair, bed, car) - rests directly on the top surface:
          const surfaceY = ref.y - ref.h * surfaceTopOf(ref.it.type);
          n.y = surfaceY - n.h * bottomOf(n.it.type);
          if (ref.it.type.includes("chair")) {
            // The seat cushion of a side-view chair is horizontally offset to the right of the backrest:
            n.x = ref.x + ref.w * 0.05;
          } else if (ref.it.type.includes("car")) {
            // Car roof is positioned horizontally over the cabin:
            n.x = ref.x - ref.w * 0.14;
          } else {
            n.x = ref.x;
          }
          n.it.behind = false;
        } else if (rel === "above") {
          // Perched or hovering directly above reference object (e.g. bird above tree)
          n.y = ref.y - ref.h * 0.48 - n.h * 0.44;
          n.x = ref.x;
          n.it.behind = false;
        } else if (rel === "in front of") {
          // Standing on the ground baseline in front of the reference (e.g. girl in front of house):
          const groundY = ref.y + ref.h * bottomOf(ref.it.type);
          n.y = groundY - n.h * bottomOf(n.it.type);
          n.x = ref.x;
          n.it.behind = false;
        } else if (rel === "inside") {
          // Inside open container (box, basket, bag, cup) - nestled cleanly inside the 3D cavity opening:
          const maxInsideW = ref.w * 0.20;
          if (n.w > maxInsideW) {
            n.w = maxInsideW;
            n.h = n.w / ASPECT;
          }
          n.y = ref.y - ref.h * 0.20;
          n.x = ref.x + ref.w * 0.02;
          n.it.behind = false;
        } else if (rel === "below") {
          // On the ground beneath the reference (under table, bed, chair):
          const floorY = ref.y + ref.h * bottomOf(ref.it.type);
          n.y = floorY - n.h * bottomOf(n.it.type);
          n.x = ref.x;
          n.it.behind = false;
        } else if (rel === "behind") {
          // Ground-aligned behind reference, peeking out:
          const groundY = ref.y + ref.h * bottomOf(ref.it.type);
          n.y = groundY - n.h * bottomOf(n.it.type);
          n.x = ref.x + ref.w * 0.30;
          n.it.behind = true;
        } else if (rel === "left" || rel === "right" || rel === "beside" || rel === "next to" || rel === "near") {
          // Ground-aligned side by side, firmly touching the floor with natural spacing:
          const groundY = ref.y + ref.h * bottomOf(ref.it.type);
          n.y = groundY - n.h * bottomOf(n.it.type);
          if (rel === "right") {
            n.x = ref.x + ref.w * 0.48 + n.w * 0.48 + 0.05;
          } else {
            n.x = ref.x - ref.w * 0.48 - n.w * 0.48 - 0.05;
          }
          n.it.behind = false;
        }
      }
    }
  }

  // 2. Align base ground objects to the floor so NO object floats in mid-air:
  const baseGroundNodes = nodes.filter((n) => {
    if (AIRBORNE_TYPES.has(n.it.type)) return false;
    if (n.it.relation === "on" && n.it.reference) return false;
    if (n.it.relation === "inside" && n.it.reference) return false;
    if (n.it.relation === "above" && n.it.reference) return false;
    return true;
  });

  if (baseGroundNodes.length > 0) {
    const maxBaseBottom = Math.max(...baseGroundNodes.map((n) => n.y + n.h * bottomOf(n.it.type)));
    const targetGround = nodes.length === 1 ? 0.76 : 0.80;
    const dy = targetGround - maxBaseBottom;
    for (const n of nodes) {
      n.y += dy;
    }
  }

  // 3. Compute group bounding box and scaling:
  const minX = Math.min(...nodes.map((n) => n.x - n.w / 2));
  const maxX = Math.max(...nodes.map((n) => n.x + n.w / 2));
  const minY = Math.min(...nodes.map((n) => n.y - n.h / 2));
  const maxY = Math.max(...nodes.map((n) => n.y + n.h / 2));
  const gw = Math.max(0.01, maxX - minX);
  const gh = Math.max(0.01, maxY - minY);

  // Ground baseline anchor so scaling preserves ground contact:
  const groundBase = Math.max(...nodes.map((n) => n.y + n.h * bottomOf(n.it.type)));

  // Fit scale so entire scene (including high objects like birds above trees) fits comfortably:
  const topPad = 0.08;
  const availTop = Math.max(0.1, groundBase - topPad);
  const spanUp = Math.max(0.01, groundBase - minY);
  const scaleUp = spanUp > availTop ? availTop / spanUp : 1;

  const availW = 1 - 2 * PAD;
  const scaleW = gw > availW ? availW / gw : 1;
  const k = Math.min(scaleUp, scaleW, 1);
  const gcx = (minX + maxX) / 2;

  return nodes.map((n) => {
    const isAirborne = AIRBORNE_TYPES.has(n.it.type);
    const scaledW = n.w * k;
    const scaledH = n.h * k;
    const cx = 0.5 + (n.x - gcx) * k;
    const cy = groundBase - (groundBase - n.y) * k;
    return {
      it: n.it,
      cx,
      cy,
      w: scaledW,
      h: scaledH,
      groundShadow:
        !isAirborne &&
        n.it.relation !== "inside" &&
        n.it.relation !== "above" &&
        n.it.relation !== "on",
    };
  });
}

function Item({ p, uri }: { p: Placed; uri?: string }) {
  const { it } = p;
  const n = Math.max(1, Math.min(5, it.count));
  const ratio = 1 + (n - 1) * 0.68; // width : height of the row
  const rowW = p.w * 100 * ratio; // % of stage width
  const negLeft = rowW / -2;
  const negTop = (p.w * 100) / -2;
  const col = it.colorHex ?? undefined;
  return (
    <>
      {p.groundShadow && (
        <View
          style={{
            position: "absolute",
            left: `${p.cx * 100}%`,
            top: `${(p.cy + p.h * bottomOf(it.type) - 0.01) * 100}%`,
            width: `${rowW * 0.82}%`,
            height: Math.max(6, Math.min(13, p.h * 26)),
            marginLeft: `${(rowW * 0.82) / -2}%`,
            marginTop: -3,
            borderRadius: 999,
            backgroundColor: "rgba(25, 45, 35, 0.12)",
          }}
          pointerEvents="none"
        />
      )}
      <View
        style={{
          position: "absolute",
          left: `${p.cx * 100}%`,
          top: `${p.cy * 100}%`,
          width: `${rowW}%`,
          aspectRatio: ratio,
          marginLeft: `${negLeft}%`,
          marginTop: `${negTop}%`,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: it.behind ? 0.75 : 1,
        }}
      >
        {Array.from({ length: n }).map((_, i) => {
          const resolvedUri = getPictogramUrl(it.type) || uri || dictUrl(it.type);
          return (
            <View key={i} style={{ flex: 1, height: "100%", marginLeft: i === 0 ? 0 : "-10%" }}>
              {resolvedUri ? (
                <>
                  <Image source={{ uri: resolvedUri }} style={styles.pic} resizeMode="contain" />
                  {col && <Image source={{ uri: resolvedUri }} style={[styles.pic, styles.glaze, { tintColor: col }]} resizeMode="contain" />}
                </>
              ) : uri === "" ? (
                <Text style={styles.fallbackGlyph}>{it.glyph}</Text>
              ) : (
                <View style={styles.loading} />
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}

// One clean body outline; each named part is a labelled marker on the figure
// "Organs of the body" style diagram: a figure in the centre, each named organ
// in a circular badge around the edge with a connector line to its spot.
type OrganDef = { label: string; id: number; ax: number; ay: number; tip?: string; tint?: string };
const ORGAN: Record<string, OrganDef> = {
  brain: { label: "Brain", id: 2696, ax: 0.50, ay: 0.17, tip: "Helps us think", tint: "#f43f5e" },
  lungs: { label: "Lungs", id: 2822, ax: 0.50, ay: 0.35, tip: "Helps us breathe", tint: "#06b6d4" },
  lung: { label: "Lungs", id: 2822, ax: 0.50, ay: 0.35, tip: "Helps us breathe", tint: "#06b6d4" },
  heart: { label: "Heart", id: 2715, ax: 0.48, ay: 0.37, tip: "Pumps blood", tint: "#ef4444" },
  liver: { label: "Liver", id: 2980, ax: 0.46, ay: 0.44, tip: "Cleans our blood", tint: "#b45309" },
  stomach: { label: "Stomach", id: 3309, ax: 0.54, ay: 0.46, tip: "Digests food", tint: "#8b5cf6" },
  belly: { label: "Stomach", id: 3309, ax: 0.54, ay: 0.46, tip: "Digests food", tint: "#8b5cf6" },
  pancreas: { label: "Pancreas", id: 28407, ax: 0.51, ay: 0.49, tip: "Makes insulin", tint: "#f59e0b" },
  kidney: { label: "Kidneys", id: 2812, ax: 0.50, ay: 0.52, tip: "Filters water", tint: "#84cc16" },
  kidneys: { label: "Kidneys", id: 2812, ax: 0.50, ay: 0.52, tip: "Filters water", tint: "#84cc16" },
  intestine: { label: "Intestines", id: 2967, ax: 0.50, ay: 0.58, tip: "Absorbs nutrients", tint: "#10b981" },
  intestines: { label: "Intestines", id: 2967, ax: 0.50, ay: 0.58, tip: "Absorbs nutrients", tint: "#10b981" },
  bladder: { label: "Bladder", id: 3407, ax: 0.50, ay: 0.64, tip: "Stores liquid", tint: "#3b82f6" },
};
// simple outside parts — a dot + label on the figure (no organ picture)
const PART: Record<string, { label: string; x: number; y: number; side: "L" | "R" }> = {
  head: { label: "Head", x: 0.50, y: 0.14, side: "R" },
  hair: { label: "Hair", x: 0.50, y: 0.11, side: "L" },
  eye: { label: "Eyes", x: 0.48, y: 0.15, side: "L" }, eyes: { label: "Eyes", x: 0.48, y: 0.15, side: "L" },
  ear: { label: "Ears", x: 0.54, y: 0.16, side: "R" }, ears: { label: "Ears", x: 0.54, y: 0.16, side: "R" },
  nose: { label: "Nose", x: 0.50, y: 0.18, side: "L" },
  mouth: { label: "Mouth", x: 0.50, y: 0.20, side: "R" },
  neck: { label: "Neck", x: 0.50, y: 0.25, side: "L" },
  shoulder: { label: "Shoulders", x: 0.40, y: 0.29, side: "L" }, shoulders: { label: "Shoulders", x: 0.40, y: 0.29, side: "L" },
  chest: { label: "Chest", x: 0.50, y: 0.35, side: "R" },
  arm: { label: "Arms", x: 0.34, y: 0.40, side: "L" }, arms: { label: "Arms", x: 0.34, y: 0.40, side: "L" },
  elbow: { label: "Elbows", x: 0.30, y: 0.46, side: "R" },
  hand: { label: "Hands", x: 0.27, y: 0.52, side: "L" }, hands: { label: "Hands", x: 0.27, y: 0.52, side: "L" },
  finger: { label: "Fingers", x: 0.25, y: 0.56, side: "R" },
  tummy: { label: "Tummy", x: 0.50, y: 0.47, side: "R" },
  hip: { label: "Hips", x: 0.50, y: 0.60, side: "L" }, hips: { label: "Hips", x: 0.50, y: 0.60, side: "L" },
  leg: { label: "Legs", x: 0.45, y: 0.74, side: "L" }, legs: { label: "Legs", x: 0.45, y: 0.74, side: "L" },
  knee: { label: "Knees", x: 0.45, y: 0.82, side: "R" },
  foot: { label: "Feet", x: 0.45, y: 0.92, side: "L" }, feet: { label: "Feet", x: 0.45, y: 0.92, side: "L" },
  toe: { label: "Toes", x: 0.45, y: 0.96, side: "R" },
  back: { label: "Back", x: 0.50, y: 0.38, side: "R" },
  torso: { label: "Torso", x: 0.50, y: 0.42, side: "R" },
  body: { label: "Body", x: 0.50, y: 0.45, side: "R" },
};
const asrc = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

const AW = 360;
const AH = 420;
// badge slots around the edge, filled in this order
const SLOTS = [
  { x: 0.16, y: 0.30 }, { x: 0.84, y: 0.30 },
  { x: 0.16, y: 0.48 }, { x: 0.84, y: 0.48 },
  { x: 0.16, y: 0.16 }, { x: 0.84, y: 0.16 },
  { x: 0.16, y: 0.66 }, { x: 0.84, y: 0.66 },
  { x: 0.32, y: 0.88 }, { x: 0.68, y: 0.88 },
];

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  const { settings } = useSettings();
  const lang = settings.language;

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
        <Text style={styles.bodyTitle}>{t("ssBodyTitle", lang)}</Text>

        {/* Prominent human body silhouette with in-body organ rendering */}
        <View style={styles.bodyFigureContainer} pointerEvents="none">
          <Image source={{ uri: asrc(6473) }} style={styles.bodyFigure} resizeMode="contain" />

          {/* Organs rendered directly INSIDE the body silhouette */}
          {organs.map((o) => (
            <View
              key={`body-organ-${o.label}`}
              style={[
                styles.organOnBody,
                {
                  left: `${o.ax * 100}%`,
                  top: `${o.ay * 100}%`,
                },
              ]}
            >
              <View style={[styles.organOnBodyPill, { borderColor: o.tint || colors.forest }]}>
                <Image source={{ uri: asrc(o.id) }} style={styles.organOnBodyImg} resizeMode="contain" />
              </View>
            </View>
          ))}
        </View>

        {/* Precision SVG Connector Lines with viewBox (Instant, zero-delay on all platforms) */}
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${AW} ${AH}`}
          preserveAspectRatio="none"
          pointerEvents="none"
        >
          {organs.map((o, i) => {
            const slot = SLOTS[i];
            const x1 = slot.x * AW;
            const y1 = slot.y * AH;
            const x2 = o.ax * AW;
            const y2 = o.ay * AH;
            const color = o.tint || "#0d9488";
            return (
              <G key={`svg-conn-${o.label}`}>
                {/* Outer soft glow line */}
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={4.5}
                  strokeOpacity={0.25}
                />
                {/* Crisp precision dashed line */}
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="4, 3"
                />
                {/* Callout badge anchor dot */}
                <Circle cx={x1} cy={y1} r={4.5} fill={color} stroke="white" strokeWidth={1.5} />
                {/* Body organ pulse locator beacon */}
                <Circle cx={x2} cy={y2} r={9} fill={color} fillOpacity={0.28} />
                <Circle cx={x2} cy={y2} r={4.5} fill={color} stroke="white" strokeWidth={1.5} />
              </G>
            );
          })}
        </Svg>

        {/* Peripheral Callout Badges */}
        {organs.map((o, i) => {
          const slot = SLOTS[i];
          return (
            <View
              key={o.label}
              style={[
                styles.badgeCard,
                {
                  left: `${slot.x * 100}%`,
                  top: `${slot.y * 100}%`,
                },
              ]}
              pointerEvents="none"
            >
              <View style={[styles.badgeIconWrap, { borderColor: o.tint || colors.forest }]}>
                <Image source={{ uri: asrc(o.id) }} style={styles.badgeImg} resizeMode="contain" />
              </View>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeLabel} numberOfLines={1}>
                  {wordLabel(o.label, lang)}
                </Text>
                {o.tip && (
                  <Text style={styles.badgeTip} numberOfLines={1}>
                    {o.tip}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {parts.map((p) => (
          <View key={p.label} style={StyleSheet.absoluteFill} pointerEvents="none">
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
              {wordLabel(p.label, lang)}
            </Text>
          </View>
        ))}

        {!organs.length && !parts.length && (
          <Text style={styles.anatomyHint}>{t("ssAnatomyHint", lang)}</Text>
        )}
      </View>
    );
  }

  const placed = layoutScene(session.items).sort((a, b) => Number(b.it.behind) - Number(a.it.behind));

  return (
    <View style={styles.stage}>
      {/* Calm subtle ground floor plane so scenes are physically grounded */}
      <View style={styles.floorPlane} />
      {placed.map((p) => (
        <Item key={p.it.id} p={p} uri={uris[searchPhrase(p.it)]} />
      ))}
      {!session.items.length && (
        <Text style={styles.empty}>{t("ssEmptyHint", lang)}</Text>
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
  floorPlane: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "24%",
    backgroundColor: "#f7f9f7",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  pic: { width: "100%", height: "100%" },
  glaze: { position: "absolute", opacity: 0.5 },
  loading: {
    width: "72%",
    height: "72%",
    alignSelf: "center",
    marginTop: "14%",
    borderRadius: 10,
    backgroundColor: "#eef0ee",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fallbackGlyph: { fontSize: 46, textAlign: "center", width: "100%" },
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
    position: "relative",
  },
  bodyTitle: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0f766e",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    zIndex: 4,
  },
  bodyFigureContainer: {
    position: "absolute",
    left: "22%",
    right: "22%",
    top: "8%",
    bottom: "2%",
    alignItems: "center",
    justifyContent: "center",
  },
  bodyFigure: {
    width: "100%",
    height: "100%",
  },
  organOnBody: {
    position: "absolute",
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  organOnBodyPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  organOnBodyImg: {
    width: 32,
    height: 32,
  },
  badgeCard: {
    position: "absolute",
    width: 104,
    marginLeft: -52,
    marginTop: -32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f0fdfa",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeImg: {
    width: 38,
    height: 38,
  },
  badgeInfo: {
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
  },
  badgeTip: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#0f766e",
    textAlign: "center",
    marginTop: 1,
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
