import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from "react-native-svg";
import { colors } from "../theme";

/**
 * Flat vector "sketch" illustrations for the Sentence Picture module.
 * Sensory-friendly by design: plain white ground, single subject, soft matte
 * fills, rounded strokes, no gloss / gradients / 3D. Parts are drawn only when
 * the sentence has revealed them, so the picture builds up live as a child
 * speaks.
 */

const STROKE = "#3a3a3a";
const NEUTRAL = "#c9b79c";

export interface SceneSpec {
  subject: string | null;
  subjectColor: string | null; // hex
  preposition: string | null; // canonical: under | on | above | beside | behind | in front of | inside
  reference: string | null;
}

const W = 300;
const H = 220;

// Where the reference object sits, and the anchor point subjects hang off.
const REF_BOX = { x: 96, y: 108, w: 108, h: 74 };

function subjectOrigin(prep: string | null): { x: number; y: number; scale: number; dim?: boolean } {
  const cx = REF_BOX.x + REF_BOX.w / 2;
  switch (prep) {
    case "under":
      return { x: cx, y: REF_BOX.y + REF_BOX.h + 4, scale: 0.9 };
    case "on":
      return { x: cx, y: REF_BOX.y - 6, scale: 0.9 };
    case "above":
      return { x: cx, y: REF_BOX.y - 46, scale: 0.9 };
    case "beside":
      return { x: REF_BOX.x - 46, y: REF_BOX.y + REF_BOX.h - 20, scale: 0.95 };
    case "behind":
      return { x: cx + 14, y: REF_BOX.y - 8, scale: 0.85, dim: true };
    case "in front of":
      return { x: cx + 6, y: REF_BOX.y + REF_BOX.h + 2, scale: 1.05 };
    case "inside":
      return { x: cx, y: REF_BOX.y + REF_BOX.h / 2, scale: 0.55 };
    default:
      return { x: cx, y: REF_BOX.y + REF_BOX.h + 10, scale: 1 };
  }
}

// --- reference objects (drawn behind, neutral colours) --------------------

function Reference({ kind }: { kind: string }) {
  const { x, y, w, h } = REF_BOX;
  switch (kind) {
    case "table":
      return (
        <G stroke={STROKE} strokeWidth={3} strokeLinecap="round">
          <Rect x={x} y={y} width={w} height={12} rx={3} fill="#d8bd97" />
          <Line x1={x + 10} y1={y + 12} x2={x + 10} y2={y + h} />
          <Line x1={x + w - 10} y1={y + 12} x2={x + w - 10} y2={y + h} />
        </G>
      );
    case "chair":
      return (
        <G stroke={STROKE} strokeWidth={3} strokeLinecap="round" fill="#d8bd97">
          <Rect x={x + 12} y={y + 18} width={w - 40} height={10} rx={3} />
          <Line x1={x + 14} y1={y + 28} x2={x + 14} y2={y + h} />
          <Line x1={x + w - 30} y1={y + 28} x2={x + w - 30} y2={y + h} />
          <Line x1={x + w - 30} y1={y + 18} x2={x + w - 30} y2={y - 22} />
          <Rect x={x + w - 32} y={y - 24} width={22} height={40} rx={4} />
        </G>
      );
    case "tree":
      return (
        <G stroke={STROKE} strokeWidth={3}>
          <Rect x={x + w / 2 - 8} y={y + 20} width={16} height={h - 20} rx={4} fill="#b98a5e" />
          <Circle cx={x + w / 2} cy={y + 6} r={42} fill="#a9cf9b" />
        </G>
      );
    case "box":
      return (
        <G stroke={STROKE} strokeWidth={3} strokeLinejoin="round">
          <Rect x={x + 10} y={y} width={w - 20} height={h - 4} rx={5} fill="#e0cbae" />
          <Line x1={x + 10} y1={y + 18} x2={x + w - 10} y2={y + 18} />
        </G>
      );
    case "bed":
      return (
        <G stroke={STROKE} strokeWidth={3} strokeLinecap="round">
          <Rect x={x} y={y + 14} width={w} height={26} rx={6} fill="#cfe0ec" />
          <Rect x={x + 6} y={y + 4} width={30} height={18} rx={5} fill="#fff" />
          <Line x1={x + 4} y1={y + 40} x2={x + 4} y2={y + h} />
          <Line x1={x + w - 4} y1={y + 40} x2={x + w - 4} y2={y + h} />
        </G>
      );
    case "house":
      return (
        <G stroke={STROKE} strokeWidth={3} strokeLinejoin="round">
          <Rect x={x + 12} y={y} width={w - 24} height={h - 4} rx={4} fill="#e8dcc6" />
          <Polygon points={`${x + 4},${y} ${x + w - 4},${y} ${x + w / 2},${y - 34}`} fill="#c98a3d" />
          <Rect x={x + w / 2 - 12} y={y + h - 34} width={24} height={30} fill="#b98a5e" />
        </G>
      );
    case "rug":
    case "mat":
      return <Ellipse cx={x + w / 2} cy={y + h - 6} rx={w / 2} ry={12} fill="#e6d3b3" stroke={STROKE} strokeWidth={3} />;
    case "wall":
      return <Rect x={x} y={y - 30} width={w} height={h + 30} fill="#ece4d5" stroke={STROKE} strokeWidth={3} />;
    default:
      return null;
  }
}

// --- subjects (recolourable) --------------------------------------------

function Subject({ kind, fill }: { kind: string; fill: string }) {
  const s = { stroke: STROKE, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (kind) {
    case "cat":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={6} rx={20} ry={16} fill={fill} />
          <Path d="M18 6 q14 -4 12 12" fill="none" />
          <Circle cx={-14} cy={-12} r={13} fill={fill} />
          <Polygon points="-24,-18 -18,-30 -12,-18" fill={fill} />
          <Polygon points="-16,-20 -10,-30 -4,-18" fill={fill} />
          <Circle cx={-18} cy={-12} r={1.8} fill={STROKE} />
          <Circle cx={-10} cy={-12} r={1.8} fill={STROKE} />
        </G>
      );
    case "dog":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={6} rx={22} ry={15} fill={fill} />
          <Path d="M20 4 q12 -2 14 -14" fill="none" />
          <Circle cx={-16} cy={-8} r={13} fill={fill} />
          <Ellipse cx={-26} cy={-10} rx={5} ry={10} fill={fill} />
          <Circle cx={-20} cy={-9} r={1.8} fill={STROKE} />
          <Circle cx={-12} cy={-9} r={1.8} fill={STROKE} />
          <Circle cx={-16} cy={-2} r={2.4} fill={STROKE} />
        </G>
      );
    case "rabbit":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={8} rx={16} ry={14} fill={fill} />
          <Circle cx={-2} cy={-10} r={11} fill={fill} />
          <Ellipse cx={-7} cy={-28} rx={4} ry={14} fill={fill} />
          <Ellipse cx={3} cy={-28} rx={4} ry={14} fill={fill} />
          <Circle cx={-6} cy={-11} r={1.6} fill={STROKE} />
          <Circle cx={2} cy={-11} r={1.6} fill={STROKE} />
        </G>
      );
    case "bird":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={0} rx={16} ry={13} fill={fill} />
          <Circle cx={-12} cy={-8} r={8} fill={fill} />
          <Polygon points="-20,-8 -30,-6 -20,-3" fill="#e0a33c" />
          <Path d="M2 -2 q10 6 14 -4" fill={fill} />
          <Circle cx={-14} cy={-9} r={1.6} fill={STROKE} />
        </G>
      );
    case "fish":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={0} rx={18} ry={11} fill={fill} />
          <Polygon points="16,0 30,-9 30,9" fill={fill} />
          <Circle cx={-9} cy={-2} r={1.8} fill={STROKE} />
        </G>
      );
    case "ball":
      return (
        <G {...s}>
          <Circle cx={0} cy={0} r={16} fill={fill} />
          <Path d="M-16 0 q16 -10 32 0" fill="none" />
          <Path d="M-16 0 q16 10 32 0" fill="none" />
        </G>
      );
    case "cup":
      return (
        <G {...s}>
          <Path d="M-12 -12 L12 -12 L9 16 L-9 16 Z" fill={fill} />
          <Path d="M12 -6 q12 2 0 14" fill="none" />
        </G>
      );
    case "apple":
      return (
        <G {...s}>
          <Circle cx={0} cy={2} r={15} fill={fill} />
          <Line x1={0} y1={-13} x2={0} y2={-22} />
          <Path d="M0 -18 q10 -6 12 2" fill="#7fae6a" />
        </G>
      );
    case "flower":
      return (
        <G {...s}>
          <Line x1={0} y1={4} x2={0} y2={26} stroke="#6f9d5c" />
          <Circle cx={0} cy={-10} r={7} fill={fill} />
          <Circle cx={-11} cy={-2} r={7} fill={fill} />
          <Circle cx={11} cy={-2} r={7} fill={fill} />
          <Circle cx={-7} cy={9} r={7} fill={fill} />
          <Circle cx={7} cy={9} r={7} fill={fill} />
          <Circle cx={0} cy={0} r={6} fill="#f0c24a" />
        </G>
      );
    case "car":
      return (
        <G {...s}>
          <Path d="M-24 6 L-24 -2 L-12 -2 L-6 -12 L12 -12 L16 -2 L24 -2 L24 6 Z" fill={fill} />
          <Circle cx={-13} cy={8} r={6} fill="#3a3a3a" />
          <Circle cx={13} cy={8} r={6} fill="#3a3a3a" />
        </G>
      );
    case "hat":
      return (
        <G {...s}>
          <Ellipse cx={0} cy={10} rx={22} ry={6} fill={fill} />
          <Path d="M-12 10 L-9 -12 L9 -12 L12 10 Z" fill={fill} />
        </G>
      );
    case "box_subject":
      return <Rect x={-15} y={-15} width={30} height={30} rx={4} fill={fill} {...s} />;
    default:
      return <Circle cx={0} cy={0} r={15} fill={fill} {...s} />;
  }
}

export default function SceneDrawing({ spec }: { spec: SceneSpec }) {
  const fill = spec.subjectColor ?? NEUTRAL;
  const origin = subjectOrigin(spec.preposition);
  const showSubjectBehind = spec.preposition === "behind";

  const subjectNode = spec.subject ? (
    <G
      transform={`translate(${origin.x}, ${origin.y}) scale(${origin.scale})`}
      opacity={origin.dim ? 0.7 : 1}
    >
      <Subject kind={spec.subject} fill={fill} />
    </G>
  ) : null;

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* soft ground line keeps the scene readable without a busy background */}
      <Line x1={16} y1={H - 18} x2={W - 16} y2={H - 18} stroke={colors.border} strokeWidth={3} strokeLinecap="round" />

      {showSubjectBehind && subjectNode}
      {spec.reference ? <Reference kind={spec.reference} /> : null}
      {!showSubjectBehind && subjectNode}

      {!spec.subject && !spec.reference && (
        <Circle cx={W / 2} cy={H / 2} r={0} />
      )}
    </Svg>
  );
}
