import type { SceneItem } from "./sceneSession";

/**
 * Where each thing of a built scene goes in the picture box, as fractions of
 * the box (pure maths, no React — <SceneStage> draws the result).
 */

// the stage is a percentage-width box with this aspect ratio; all sizes and
// positions below are fractions of it, so it is fully responsive
export const STAGE_W = 320;
export const STAGE_H = 300;
// a picture w wide (fraction of the stage width) is w * ASPECT of the stage height
const ASPECT = STAGE_W / STAGE_H;
const PAD = 0.06; // keep everything this far from the edge

const SIZE_SCALE: Record<SceneItem["size"], number> = { tiny: 0.6, small: 0.8, normal: 1, big: 1.3, huge: 1.7 };
// common-sense relative sizes so a laptop reads smaller than a table, etc.
const NATURAL: Record<string, number> = {
  table: 1.3, "dining table": 1.35, desk: 1.3, sofa: 1.5, couch: 1.5, bed: 1.5, "office chair": 1.3,
  chair: 1.3, stool: 0.8, house: 1.7, tree: 1.6, car: 1.5, bus: 1.7, mosque: 1.7,
  box: 0.95, "cardboard box": 0.95, "open box": 0.95, "opened cardboard box": 0.95, basket: 0.9, carton: 0.95,
  laptop: 0.68, computer: 0.75, book: 0.55, cup: 0.45, ball: 0.5, phone: 0.4, apple: 0.42,
  key: 0.35, flower: 0.55, hat: 0.5, shoe: 0.5, cat: 0.8, dog: 0.85, bird: 0.8, fish: 0.8, frog: 0.8, turtle: 0.8, rabbit: 0.8, snail: 0.8, earthworm: 0.8, butterfly: 0.8,
  boy: 1.0, girl: 1.0, child: 1.0, kid: 1.0, man: 1.1, woman: 1.1, baby: 0.7, kidney: 0.5, heart: 0.5,
  camel: 1.4, desert: 1.8, penguin: 0.8, lion: 1.2, monkey: 0.85, elephant: 1.6,
  ocean: 1.8, sea: 1.8, river: 1.8, pond: 1.6, forest: 1.8, jungle: 1.8, farm: 1.8,
  beach: 1.8, garden: 1.7, mountain: 1.8, lake: 1.8, arctic: 1.8, snow: 1.7,
  crying: 1.0, reading: 1.0, running: 1.0, sleeping: 0.9, swimming: 1.0, eating: 1.0,
  jumping: 1.0, walking: 1.0, singing: 1.0, kicking: 1.0, writing: 0.85,
  ice: 0.5, fridge: 1.4, magnet: 0.7, // an ice cube is small next to a fridge
};
const BASE_W = 0.5; // a lone "normal" object is half the stage wide before fit-scaling

// Places and grounds: when something is in / on one of these, the place fills
// the whole box as the background and the thing stands in it, large
const HABITAT_TYPES = new Set([
  "desert", "ocean", "sea", "river", "pond", "forest", "jungle", "sky", "savanna", "playground", "field",
  "farm", "arctic", "snow", "beach", "garden", "mountain", "lake", "grass", "road", "hill", "iceberg",
  "wave", "island", "swamp", "city", "space", "starry sky", "cave", "park", "sand",
]);

const OPEN_TOPS = new Set(["box", "cardboard box", "open box", "basket", "bag", "backpack"]);

// things with leafy tops: "on the tree" means among the leaves, "under" beside the trunk
const TREE_TYPES = new Set(["tree", "apple tree", "pine", "palm tree", "banana tree", "bush", "branch"]);

const AIRBORNE_TYPES = new Set([
  "bird", "birds", "butterfly", "butterflies", "airplane", "aeroplane", "plane",
  "cloud", "clouds", "sun", "moon", "star", "stars", "balloon", "balloons",
  "kite", "kites", "helicopter", "rocket", "fly", "bee", "bees", "bat", "bats",
]);

export interface Placed {
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
  "sea turtle": 0.25,
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
  student: 0.48,
  pupil: 0.48,
  camel: 0.48,
  desert: 0.48,
  penguin: 0.45,
  lion: 0.38,
  wolf: 0.39,
  dog: 0.38,
  puppy: 0.38,
  bear: 0.38,
  "polar bear": 0.38,
  fox: 0.36,
  "fennec fox": 0.36,
  deer: 0.42,
  tiger: 0.38,
  cheetah: 0.38,
  zebra: 0.42,
  horse: 0.44,
  cow: 0.42,
  sheep: 0.38,
  goat: 0.42,
  pig: 0.38,
  rabbit: 0.36,
  tortoise: 0.25,
  monkey: 0.42,
  gorilla: 0.42,
  elephant: 0.46,
  giraffe: 0.46,
  kangaroo: 0.42,
  hippo: 0.36,
  rhino: 0.38,
  crocodile: 0.22,
  alligator: 0.22,
  beaver: 0.32,
  walrus: 0.30,
  seal: 0.28,
  crab: 0.30,
  frog: 0.32,
  toad: 0.32,
  duck: 0.38,
  dolphin: 0.35,
  whale: 0.35,
  shark: 0.35,
  octopus: 0.35,
  jellyfish: 0.35,
  seahorse: 0.35,
  starfish: 0.30,
  reading: 0.45,
  crying: 0.45,
  running: 0.48,
  sleeping: 0.35,
  swimming: 0.40,
  eating: 0.45,
  jumping: 0.45,
  walking: 0.48,
  moss: 0.2,
  bee: 0.25,
  butterfly: 0.3,
  nest: 0.25,
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
  rock: 0.22,
  flower: 0.15,
  plate: 0.0,
  nest: 0.08,
  stone: 0.22,
};
const surfaceTopOf = (type: string) => SURFACE_OFFSET[type] ?? 0.36;

const WATER_HABITATS = new Set([
  "sea", "ocean", "river", "pond", "lake", "water", "wave", "swamp",
]);

const WATER_BOTTOM_CREATURES = new Set([
  "starfish", "crab", "seaweed", "coral", "shell", "lobster",
]);

const WATER_SURFACE_ITEMS = new Set([
  "duck", "lotus", "wood", "rowing boat", "boat", "ship", "kayak", "canoe", "raft", "hovercraft",
]);

/**
 * "A snake on the grass", "a camel in the desert": the place is the whole
 * picture and the animal stands in it — never perched on the top edge of a
 * small square of grass. Flyers ("a bird above the forest") go in its sky, the
 * rest stand side by side on its ground, as large as the box allows.
 */
function layoutOnBackdrop(items: SceneItem[], backdrop: SceneItem): Placed[] {
  // a square picture as tall as the box
  const bw = 1 / ASPECT;
  const placed: Placed[] = [{ it: { ...backdrop, behind: true }, cx: 0.5, cy: 0.5, w: bw, h: 1, groundShadow: false }];
  const others = items.filter((i) => i !== backdrop);
  const flyers = others.filter((i) => i.relation === "above" || (AIRBORNE_TYPES.has(i.type) && i.relation !== "on"));
  const walkers = others.filter((i) => !flyers.includes(i));

  flyers.forEach((it, k) => {
    const w = Math.min(0.38, 0.6 / flyers.length) * (SIZE_SCALE[it.size] ?? 1);
    const cx = (k + 1) / (flyers.length + 1);
    placed.push({ it: { ...it, behind: false }, cx, cy: 0.24, w, h: w * ASPECT, groundShadow: false });
  });

  const isWater = WATER_HABITATS.has(backdrop.type);

  if (isWater) {
    walkers.forEach((it, k) => {
      const n = Math.max(1, Math.min(5, it.count));
      const ratio = 1 + (n - 1) * 0.68;
      const isSurface = WATER_SURFACE_ITEMS.has(it.type) || it.relation === "on";
      const isBottom = WATER_BOTTOM_CREATURES.has(it.type);
      const slot = Math.min(walkers.length > 1 ? 0.40 : 0.52, 0.88 / Math.max(1, walkers.length));
      const w = (slot / ratio) * (SIZE_SCALE[it.size] ?? 1);
      const h = w * ASPECT;
      const cx = 0.5 + (k - (walkers.length - 1) / 2) * (walkers.length > 1 ? slot : 0);
      let cy: number;
      if (isSurface) {
        cy = 0.32; // resting at the surface waterline
      } else if (isBottom) {
        cy = Math.max(0.2, Math.min(0.90, 0.84 - h * bottomOf(it.type))); // sitting on the sandy sea bed
      } else {
        cy = 0.54; // swimming comfortably inside the blue water body
      }
      placed.push({ it: { ...it, behind: false }, cx, cy, w, h, groundShadow: false });
    });
  } else {
    // Land habitats (savanna, forest, desert, farm, arctic, snow, mountain, hill, grass, field, park)
    const slot = Math.min(walkers.length > 1 ? 0.42 : 0.52, 0.88 / Math.max(1, walkers.length));
    const groundY = 0.88; // ground baseline where feet firmly touch
    walkers.forEach((it, k) => {
      const n = Math.max(1, Math.min(5, it.count));
      const ratio = 1 + (n - 1) * 0.68;
      const w = (slot / ratio) * (SIZE_SCALE[it.size] ?? 1);
      const h = w * ASPECT;
      const cx = 0.5 + (k - (walkers.length - 1) / 2) * slot;
      // feet firmly planted on the ground floor, never floating in the air:
      const cy = Math.max(0.25, Math.min(0.90, groundY - h * bottomOf(it.type)));
      placed.push({ it: { ...it, behind: false }, cx, cy, w, h, groundShadow: false });
    });
  }

  return placed;
}

export function layoutScene(items: SceneItem[]): Placed[] {
  if (!items.length) return [];

  const backdrop = items.find(
    (it) => HABITAT_TYPES.has(it.type) && items.some((o) => o !== it && o.reference === it.type),
  );
  if (backdrop) return layoutOnBackdrop(items, backdrop);

  // 1. Single subject: provide full-size display (82% to 88% of the box) centered prominently!
  if (items.length === 1) {
    const it = items[0];
    const isAirborne = AIRBORNE_TYPES.has(it.type);
    const sz = SIZE_SCALE[it.size] ?? 1.0;
    // "five stars": the whole row fits the box
    const row = 1 + (Math.max(1, Math.min(5, it.count)) - 1) * 0.68;
    const targetW = Math.min(0.88, 0.82 * sz, 0.94 / row);
    const targetH = targetW * ASPECT;
    return [
      {
        it,
        cx: 0.5,
        cy: 0.5,
        w: targetW,
        h: targetH,
        groundShadow: !isAirborne,
      },
    ];
  }

  // a row of n pictures is this much wider than one
  const rowRatio = (it: SceneItem) => 1 + (Math.max(1, Math.min(5, it.count)) - 1) * 0.68;
  const nodes = items.map((it) => {
    // "3 seeds": each smaller, so the row is not three times as wide as one
    const w = (BASE_W * SIZE_SCALE[it.size] * (NATURAL[it.type] ?? 0.9) * Math.min(1, 1.5 / rowRatio(it)));
    return { it, x: it.x, y: it.y, w, h: w * ASPECT };
  });
  type Node = (typeof nodes)[number];
  const rowW = (n: Node) => n.w * rowRatio(n.it);

  // 1. Precise spatial relations for prepositions:
  for (const n of nodes) {
    if (n.it.reference) {
      // the exact name first: "flowerpot right seedling" is next to the seedling, not the seed
      const ref =
        nodes.find((other) => other !== n && other.it.type === n.it.reference) ??
        nodes.find(
          (other) =>
            other !== n && (other.it.type.includes(n.it.reference!) || n.it.reference!.includes(other.it.type)),
        );
      if (ref) {
        const rel = n.it.relation as string | null;
        if (rel === "on" && TREE_TYPES.has(ref.it.type)) {
          // in a tree means among its leaves ("apples on the tree", "an owl on the tree")
          const maxRow = ref.w * 0.5;
          if (rowW(n) > maxRow) {
            n.w = maxRow / rowRatio(n.it);
            n.h = n.w * ASPECT;
          }
          n.x = ref.x;
          n.y = ref.y - ref.h * 0.18;
          n.it.behind = false;
        } else if (rel === "on") {
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
          if (HABITAT_TYPES.has(ref.it.type)) {
            // Natural habitat environment: habitat is the backdrop, subject stands proudly in foreground
            ref.it.behind = true;
            n.it.behind = false;
            n.x = ref.x;
            const groundY = ref.y + ref.h * bottomOf(ref.it.type);
            n.y = groundY - n.h * bottomOf(n.it.type);
          } else {
            // Inside open container (box, basket, bag, cup) - nestled cleanly inside the 3D cavity opening:
            const maxInsideW = ref.w * 0.20;
            if (n.w > maxInsideW) {
              n.w = maxInsideW;
              n.h = n.w * ASPECT;
            }
            // an open box or basket shows its cavity at the top; a glass, jar or
            // bowl holds things low ("a stone sinks to the bottom")
            n.y = OPEN_TOPS.has(ref.it.type) ? ref.y - ref.h * 0.2 : ref.y + ref.h * 0.18;
            n.x = ref.x + ref.w * 0.02;
            n.it.behind = false;
          }
        } else if (rel === "below") {
          // On the ground beneath the reference (under table, bed, chair):
          const floorY = ref.y + ref.h * bottomOf(ref.it.type);
          n.y = floorY - n.h * bottomOf(n.it.type);
          // under a tree: on the ground in its shade, beside the trunk
          n.x = TREE_TYPES.has(ref.it.type) ? ref.x + ref.w * 0.18 + rowW(n) * 0.4 : ref.x;
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
          // whole rows side by side ("a flower and three seeds"), never overlapping
          const gap = rowW(ref) * 0.48 + rowW(n) * 0.48 + 0.04;
          n.x = rel === "right" ? ref.x + gap : ref.x - gap;
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
    // the ground near the bottom of the box, so the scene fills it
    const targetGround = 0.94;
    const dy = targetGround - maxBaseBottom;
    for (const n of nodes) {
      n.y += dy;
    }
  }

  // 3. Compute group bounding box and scaling (a "3 apples" row is wider than one apple):
  const minX = Math.min(...nodes.map((n) => n.x - rowW(n) / 2));
  const maxX = Math.max(...nodes.map((n) => n.x + rowW(n) / 2));
  const minY = Math.min(...nodes.map((n) => n.y - n.h / 2));
  const maxY = Math.max(...nodes.map((n) => n.y + n.h / 2));
  const gw = Math.max(0.01, maxX - minX);

  // Ground baseline anchor so scaling preserves ground contact:
  const grounded = baseGroundNodes.length > 0;
  const groundBase = grounded ? Math.max(...nodes.map((n) => n.y + n.h * bottomOf(n.it.type))) : maxY;

  // Fit scale so the entire scene (birds above trees too) fills the box:
  const topPad = PAD;
  const availTop = Math.max(0.1, groundBase - topPad);
  const spanUp = Math.max(0.01, groundBase - minY);
  const scaleUp = availTop / spanUp;

  const availW = 1 - 2 * PAD;
  const scaleW = availW / gw;
  const k = Math.min(scaleUp, scaleW, 2.4);
  const gcx = (minX + maxX) / 2;
  // centre the scene up and down — a short row (a flower and three seeds) sits
  // in the middle of the box, not along its bottom edge under empty white
  const height = (groundBase - minY) * k;
  const lift = grounded
    ? Math.min(0.94, 0.5 + height / 2) - groundBase
    : 0.5 - (groundBase - (groundBase - (minY + maxY) / 2) * k);

  return nodes.map((n) => {
    const isAirborne = AIRBORNE_TYPES.has(n.it.type);
    const scaledW = n.w * k;
    const scaledH = n.h * k;
    const cx = 0.5 + (n.x - gcx) * k;
    const cy = groundBase - (groundBase - n.y) * k + lift;
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
