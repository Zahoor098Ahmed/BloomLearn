import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { searchPhrase } from "../modules/sceneSession";
import { getPictogramUrl } from "../modules/aacPictograms";
import { dictUrl } from "../modules/imageLibrary";
import { colors } from "../theme";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import BodyDiagram from "./BodyDiagram";

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

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  const { settings } = useSettings();
  const lang = settings.language;

  if (session.anatomy) {
    return <BodyDiagram parts={session.anatomyParts} title={t("ssBodyTitle", lang)} hint={t("ssAnatomyHint", lang)} lang={lang} />;
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
});
