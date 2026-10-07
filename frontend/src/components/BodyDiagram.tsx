import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { colors } from "../theme";
import { wordLabel } from "../modules/i18n";
import type { LanguageCode } from "../types";

/**
 * "Parts of the body" diagram. The figure, the organs inside it, the callout
 * badges and their connector lines are all drawn in ONE SVG coordinate space,
 * so a line always ends exactly on its organ at every screen size. The organs
 * are drawn (not pictograms), so a badge shows only the organ — no body around it.
 */

// same proportions as the scene stage, so the box doesn't change size between lessons
const W = 320;
const H = 300;
const CX = W / 2;

const SKIN = "#fbe3d9";
const OUTLINE = "#3f3f46";

type OrganKind =
  | "brain" | "lungs" | "heart" | "liver" | "stomach" | "pancreas" | "kidneys" | "intestines" | "bladder"
  // everyday outside parts: already on the figure, so only their badge is drawn
  | "eye" | "ear" | "nose" | "mouth" | "hand" | "foot"
  | "teeth" | "tongue" | "hair" | "finger" | "arm" | "leg" | "bone";

interface OrganDef {
  kind: OrganKind;
  label: string;
  tip: string;
  tint: string;
  /** where it sits in the body, in diagram units */
  x: number;
  y: number;
  /** drawing scale inside the body */
  s: number;
  /** an outside part: part of the figure, not drawn again inside it */
  outside?: boolean;
}

const ORGANS: Record<OrganKind, OrganDef> = {
  brain: { kind: "brain", label: "Brain", tip: "Helps us think", tint: "#e11d48", x: CX, y: 47, s: 0.95 },
  lungs: { kind: "lungs", label: "Lungs", tip: "Helps us breathe", tint: "#db2777", x: CX, y: 120, s: 1.35 },
  heart: { kind: "heart", label: "Heart", tip: "Pumps blood", tint: "#dc2626", x: CX + 7, y: 126, s: 0.75 },
  liver: { kind: "liver", label: "Liver", tip: "Cleans our blood", tint: "#b45309", x: CX - 11, y: 150, s: 0.95 },
  stomach: { kind: "stomach", label: "Stomach", tip: "Digests food", tint: "#7c3aed", x: CX + 12, y: 152, s: 0.85 },
  pancreas: { kind: "pancreas", label: "Pancreas", tip: "Makes insulin", tint: "#d97706", x: CX + 2, y: 164, s: 0.75 },
  kidneys: { kind: "kidneys", label: "Kidneys", tip: "Filters water", tint: "#65a30d", x: CX, y: 166, s: 0.8 },
  intestines: { kind: "intestines", label: "Intestines", tip: "Absorbs nutrients", tint: "#ea580c", x: CX, y: 181, s: 1.05 },
  bladder: { kind: "bladder", label: "Bladder", tip: "Stores liquid", tint: "#2563eb", x: CX, y: 199, s: 0.6 },
  eye: { kind: "eye", label: "Eyes", tip: "We see with them", tint: "#0284c7", x: CX - 8, y: 46, s: 0.3, outside: true },
  ear: { kind: "ear", label: "Ears", tip: "We hear with them", tint: "#9333ea", x: CX + 24, y: 50, s: 0.3, outside: true },
  nose: { kind: "nose", label: "Nose", tip: "We smell with it", tint: "#ea580c", x: CX, y: 54, s: 0.3, outside: true },
  mouth: { kind: "mouth", label: "Mouth", tip: "We eat and talk", tint: "#e11d48", x: CX, y: 61, s: 0.3, outside: true },
  hand: { kind: "hand", label: "Hands", tip: "We hold and clap", tint: "#d97706", x: 89, y: 196, s: 0.5, outside: true },
  foot: { kind: "foot", label: "Feet", tip: "We walk and run", tint: "#16a34a", x: 136, y: 289, s: 0.6, outside: true },
  teeth: { kind: "teeth", label: "Teeth", tip: "We chew food", tint: "#64748b", x: CX, y: 61, s: 0.3, outside: true },
  tongue: { kind: "tongue", label: "Tongue", tip: "We taste with it", tint: "#db2777", x: CX, y: 62, s: 0.3, outside: true },
  hair: { kind: "hair", label: "Hair", tip: "Keeps our head warm", tint: "#92400e", x: CX, y: 27, s: 0.3, outside: true },
  finger: { kind: "finger", label: "Fingers", tip: "We point and write", tint: "#c2410c", x: 232, y: 197, s: 0.5, outside: true },
  arm: { kind: "arm", label: "Arms", tip: "We lift and hug", tint: "#0d9488", x: 105, y: 136, s: 0.4, outside: true },
  leg: { kind: "leg", label: "Legs", tip: "We jump and kick", tint: "#4f46e5", x: 140, y: 240, s: 0.4, outside: true },
  bone: { kind: "bone", label: "Bones", tip: "Make our body strong", tint: "#78716c", x: 181, y: 240, s: 0.4, outside: true },
};

const ORGAN_ALIASES: Record<string, OrganKind> = {
  brain: "brain", lung: "lungs", lungs: "lungs", heart: "heart", liver: "liver", stomach: "stomach", belly: "stomach",
  pancreas: "pancreas", kidney: "kidneys", kidneys: "kidneys", intestine: "intestines", intestines: "intestines", bladder: "bladder",
  eye: "eye", eyes: "eye", ear: "ear", ears: "ear", nose: "nose", mouth: "mouth", hand: "hand", hands: "hand", foot: "foot", feet: "foot",
  teeth: "teeth", tooth: "teeth", tongue: "tongue", hair: "hair", finger: "finger", fingers: "finger",
  arm: "arm", arms: "arm", leg: "leg", legs: "leg", bone: "bone", bones: "bone", skeleton: "bone",
};

// outside parts: a dot on the figure and a label at the side
const PARTS: Record<string, { label: string; x: number; y: number; side: "L" | "R" }> = {
  head: { label: "Head", x: CX, y: 40, side: "R" },
  neck: { label: "Neck", x: CX, y: 77, side: "L" },
  shoulder: { label: "Shoulders", x: 116, y: 90, side: "L" }, shoulders: { label: "Shoulders", x: 116, y: 90, side: "L" },
  chest: { label: "Chest", x: CX, y: 112, side: "R" },
  elbow: { label: "Elbows", x: 217, y: 146, side: "R" }, elbows: { label: "Elbows", x: 217, y: 146, side: "R" },
  tummy: { label: "Tummy", x: CX, y: 168, side: "R" },
  back: { label: "Back", x: CX, y: 130, side: "R" },
  torso: { label: "Torso", x: CX, y: 150, side: "R" },
  body: { label: "Body", x: CX, y: 150, side: "R" },
  hip: { label: "Hips", x: 128, y: 198, side: "L" }, hips: { label: "Hips", x: 128, y: 198, side: "L" },
  knee: { label: "Knees", x: 180, y: 244, side: "R" }, knees: { label: "Knees", x: 180, y: 244, side: "R" },
  toe: { label: "Toes", x: 186, y: 291, side: "R" }, toes: { label: "Toes", x: 186, y: 291, side: "R" },
};

/** One organ, drawn around (0, 0) in a ~40-unit box. */
function OrganShape({ kind }: { kind: OrganKind }) {
  switch (kind) {
    case "heart":
      return (
        // a real (front-view) heart: blue veins on its right, the red aorta
        // arching over the top, the blue pulmonary artery in front, and the
        // apex pointing down to the left of the body
        <G transform="translate(0 3)">
          {/* superior vena cava */}
          <Path d="M -14 -6 L -14 -21 L -8.5 -21 L -8.5 -6 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth={1.2} />
          {/* aortic arch and its three branches */}
          <Path d="M -1 -21 L -2 -26 M 4 -22 L 4 -27 M 9 -21 L 10 -26" stroke="#991b1b" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M -3 -6 C -4 -16 0 -22 6 -22 C 11 -22 14 -18 14 -12" stroke="#7f1d1d" strokeWidth={7.5} fill="none" strokeLinecap="round" />
          <Path d="M -3 -6 C -4 -16 0 -22 6 -22 C 11 -22 14 -18 14 -12" stroke="#ef4444" strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* right atrium */}
          <Ellipse cx={-10.5} cy={-3} rx={6} ry={7} fill="#e04848" stroke="#7f1d1d" strokeWidth={1.2} />
          {/* ventricles */}
          <Path
            d="M -11 -2 C -15 6 -8 14 3 18.5 C 5.5 19.5 7.5 18.5 9 16 C 15.5 8 17 -2 12 -7.5 C 8 -11.5 2 -11 -2 -8.5 C -6 -10 -10 -8 -11 -2 Z"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth={1.4}
          />
          {/* pulmonary artery, in front of the aorta */}
          <Path d="M 1 -7 C 1 -12 4 -14.5 9 -14.5 L 15 -14.5" stroke="#1e3a8a" strokeWidth={6.5} fill="none" strokeLinecap="round" />
          <Path d="M 1 -7 C 1 -12 4 -14.5 9 -14.5 L 15 -14.5" stroke="#60a5fa" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          {/* coronary vessels and a soft highlight */}
          <Path d="M -1 -5 C 0 3 2.5 10 5.5 16 M 1.2 3 C 5 2.5 9 0 12 -3.5" stroke="#7f1d1d" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          <Path d="M -8 1 C -8.5 6 -5.5 10.5 -1.5 13.5" stroke="#fca5a5" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </G>
      );
    case "eye":
      return (
        <G>
          <Path d="M -11 -8 L -13 -12.5 M 0 -10 L 0 -15 M 11 -8 L 13 -12.5" stroke="#334155" strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M -18 0 Q 0 -15 18 0 Q 0 15 -18 0 Z" fill="white" stroke="#334155" strokeWidth={1.6} />
          <Circle cx={0} cy={0} r={7.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.2} />
          <Circle cx={0} cy={0} r={3.4} fill="#0f172a" />
          <Circle cx={-2.4} cy={-2.4} r={1.5} fill="white" />
        </G>
      );
    case "ear":
      return (
        <G>
          <Path
            d="M -6 -16 C 6 -20 15 -9 13 2 C 11 10 5 11 3 16 C 1 20 -7 19 -8 13 C -9 8 -3 6 -3 0 C -3 -6 -9 -9 -6 -16 Z"
            fill={SKIN}
            stroke="#9a3412"
            strokeWidth={1.6}
          />
          <Path d="M -1 -10 C 6 -12 9 -4 7 2 C 6 6 2 6 1 2" stroke="#c2410c" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case "nose":
      return (
        <G>
          <Path
            d="M -2.5 -17 C -2.5 -7 -11 1 -12 7 C -13 13 -6 15 -3 12 C -1 14.5 1 14.5 3 12 C 6 15 13 13 12 7 C 11 1 2.5 -7 2.5 -17"
            fill={SKIN}
            stroke="#9a3412"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <Ellipse cx={-5} cy={9.5} rx={2.2} ry={1.4} fill="#7c2d12" />
          <Ellipse cx={5} cy={9.5} rx={2.2} ry={1.4} fill="#7c2d12" />
        </G>
      );
    case "mouth":
      return (
        <G>
          <Path d="M -17 -4 C -9 -1 9 -1 17 -4 C 13 13 -13 13 -17 -4 Z" fill="#9f1239" stroke="#881337" strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M -12.5 -2.3 C -6 -0.3 6 -0.3 12.5 -2.3 L 11.5 2 C 5 3.6 -5 3.6 -11.5 2 Z" fill="white" />
          <Ellipse cx={0} cy={7.5} rx={6.5} ry={3.2} fill="#fb7185" />
        </G>
      );
    case "hand": {
      // four fingers, a palm and a thumb, outlined once so the parts read as one hand
      const piece = (fill: string, stroke?: string) => (
        <G fill={fill} stroke={stroke} strokeWidth={stroke ? 3.2 : 0}>
          {[-11.5, -6, -0.5, 5].map((fx) => (
            <Rect key={fx} x={fx} y={-18} width={4.8} height={16} rx={2.4} />
          ))}
          <Rect x={-12} y={-6} width={22} height={18} rx={6} />
          <Rect x={7} y={-3} width={5} height={13} rx={2.5} transform="rotate(-38 9.5 6)" />
        </G>
      );
      return (
        <G>
          {piece("#9a3412", "#9a3412")}
          {piece(SKIN)}
        </G>
      );
    }
    case "foot": {
      const piece = (fill: string, stroke?: string) => (
        <G fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0}>
          <Path d="M -6 -9 C 4 -11 10 -3 9 7 C 8 15 2 19 -3 18 C -9 17 -11 9 -10 1 C -9 -5 -10 -8 -6 -9 Z" />
          <Circle cx={-7} cy={-14} r={2.9} />
          <Circle cx={-2} cy={-16} r={2.6} />
          <Circle cx={2.8} cy={-15.2} r={2.3} />
          <Circle cx={6.8} cy={-12.6} r={2} />
          <Circle cx={9.6} cy={-8.8} r={1.8} />
        </G>
      );
      return (
        <G>
          {piece("#9a3412", "#9a3412")}
          {piece(SKIN)}
        </G>
      );
    }
    case "teeth":
      return (
        <G>
          <Path
            d="M -12 -11 C -12 -18 -5 -18 0 -15 C 5 -18 12 -18 12 -11 C 12 -4 9 2 8 10 C 7 17 3 17 2 10 C 1 5 -1 5 -2 10 C -3 17 -7 17 -8 10 C -9 2 -12 -4 -12 -11 Z"
            fill="white"
            stroke="#475569"
            strokeWidth={1.7}
          />
          <Path d="M -7 -11 Q -8 -5 -6 -1" stroke="#cbd5e1" strokeWidth={2} fill="none" strokeLinecap="round" />
        </G>
      );
    case "tongue":
      return (
        <G>
          <Path d="M -17 -6 C -9 1 9 1 17 -6" stroke="#9f1239" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M -9 -2 C -10 15 10 15 9 -2 C 4 0 -4 0 -9 -2 Z" fill="#fb7185" stroke="#be123c" strokeWidth={1.6} />
          <Path d="M 0 0 L 0 8" stroke="#be123c" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    case "hair":
      return (
        <G>
          <Path
            d="M -17 10 C -20 -8 -9 -17 0 -17 C 11 -17 20 -8 17 10 C 14 0 9 -4 4 -3 C 1 -8 -6 -7 -8 -2 C -12 -2 -15 3 -17 10 Z"
            fill="#92400e"
            stroke="#78350f"
            strokeWidth={1.6}
          />
          <Path d="M -9 -11 Q -4 -14 1 -12 M 4 -12 Q 9 -11 12 -6" stroke="#b45309" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case "finger": {
      // a pointing hand: one finger up, the others folded
      const piece = (fill: string, stroke?: string) => (
        <G fill={fill} stroke={stroke} strokeWidth={stroke ? 3.2 : 0}>
          <Rect x={-6} y={-19} width={5.5} height={20} rx={2.75} />
          <Rect x={-9} y={-3} width={19} height={17} rx={6} />
          <Rect x={7} y={0} width={5} height={11} rx={2.5} transform="rotate(-30 9.5 5.5)" />
        </G>
      );
      return (
        <G>
          {piece("#9a3412", "#9a3412")}
          {piece(SKIN)}
          <Path d="M 1 2 L 9 2 M 1 7 L 9 7" stroke="#c2410c" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    }
    case "arm": {
      // a strong, bent arm
      const piece = (w: number, c: string) => (
        <G stroke={c} strokeWidth={w} strokeLinecap="round" fill="none">
          <Path d="M -16 10 L 3 10" />
          <Path d="M 4 10 L 9 -9" />
        </G>
      );
      return (
        <G>
          {piece(11, "#9a3412")}
          <Ellipse cx={-6} cy={6} rx={9} ry={7} fill="#9a3412" />
          <Circle cx={10} cy={-12} r={6.5} fill="#9a3412" />
          {piece(8, SKIN)}
          <Ellipse cx={-6} cy={6} rx={7.5} ry={5.5} fill={SKIN} />
          <Circle cx={10} cy={-12} r={5} fill={SKIN} />
        </G>
      );
    }
    case "leg": {
      const piece = (w: number, c: string) => (
        <G stroke={c} strokeWidth={w} strokeLinecap="round" fill="none">
          <Path d="M -3 -18 L -1 3 L -2 13" />
        </G>
      );
      return (
        <G>
          {piece(12, "#9a3412")}
          <Ellipse cx={3} cy={15} rx={8.5} ry={4.8} fill="#9a3412" />
          {piece(9, SKIN)}
          <Ellipse cx={3} cy={15} rx={7} ry={3.4} fill={SKIN} />
        </G>
      );
    }
    case "bone":
      return (
        <G transform="rotate(-35)">
          {(["#78716c", "#f5f5f4"] as const).map((c, i) => {
            const grow = i === 0 ? 1.6 : 0;
            return (
              <G key={c} fill={c}>
                <Rect x={-12} y={-3.5 - grow} width={24} height={7 + grow * 2} rx={2} />
                <Circle cx={-13} cy={-4} r={4.5 + grow} />
                <Circle cx={-13} cy={4} r={4.5 + grow} />
                <Circle cx={13} cy={-4} r={4.5 + grow} />
                <Circle cx={13} cy={4} r={4.5 + grow} />
              </G>
            );
          })}
        </G>
      );
    case "lungs":
      return (
        <G>
          <Path d="M0 -20 L0 -7 M0 -7 L -5 -2 M0 -7 L 5 -2" stroke="#be185d" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M -4 -13 C -10 -16 -19 -5 -19 7 C -19 15 -12 17 -5 15 C -3 14 -3 9 -3 -3 Z" fill="#f9a8d4" stroke="#be185d" strokeWidth={1.5} />
          <Path d="M 4 -13 C 10 -16 19 -5 19 7 C 19 15 12 17 5 15 C 3 14 3 9 3 -3 Z" fill="#f9a8d4" stroke="#be185d" strokeWidth={1.5} />
        </G>
      );
    case "stomach":
      return (
        <G>
          <Path d="M -11 7 Q -16 9 -19 7" stroke="#6d28d9" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path
            d="M -8 -18 L -3 -18 L -3 -11 C -3 -5 3 -3 6 -6 C 9 -9 10 -13 14 -11 C 19 -7 18 9 7 14 C -3 18 -13 12 -13 3 C -13 -4 -8 -7 -8 -12 Z"
            fill="#c4b5fd"
            stroke="#6d28d9"
            strokeWidth={1.5}
          />
        </G>
      );
    case "brain":
      return (
        <G>
          <Ellipse cx={0} cy={0} rx={17} ry={12} fill="#fbcfe8" stroke="#be185d" strokeWidth={1.5} />
          <Path d="M0 -12 L0 12" stroke="#be185d" strokeWidth={1.2} />
          <Path d="M -14 -2 Q -10 -8 -6 -2 Q -3 3 -1 -1 M 2 2 Q 5 -6 9 0 Q 12 4 15 -1 M -12 6 Q -8 2 -5 7 M 4 -7 Q 8 -10 12 -6" stroke="#be185d" strokeWidth={1.2} fill="none" />
        </G>
      );
    case "liver":
      return <Path d="M -19 -6 C -11 -13 13 -12 19 -7 C 17 3 3 10 -14 7 C -19 5 -21 -2 -19 -6 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth={1.5} />;
    case "pancreas":
      return <Path d="M -17 2 C -11 -6 6 -5 17 -5 C 19 -1 15 4 7 4 C -1 4 -10 9 -17 2 Z" fill="#fcd34d" stroke="#b45309" strokeWidth={1.5} />;
    case "kidneys":
      return (
        <G>
          <Path d="M -10 -11 C -19 -11 -21 11 -10 11 C -5 11 -5 5 -7 0 C -5 -5 -5 -11 -10 -11 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
          <Path d="M 10 -11 C 19 -11 21 11 10 11 C 5 11 5 5 7 0 C 5 -5 5 -11 10 -11 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
        </G>
      );
    case "intestines":
      return (
        <G>
          <Rect x={-19} y={-12} width={38} height={24} rx={11} fill="#fdba74" stroke="#c2410c" strokeWidth={1.5} />
          <Path d="M -13 -4 Q -7 -10 -1 -4 Q 5 2 12 -4 M -13 4 Q -7 -2 -1 4 Q 5 10 12 4" stroke="#c2410c" strokeWidth={1.3} fill="none" />
        </G>
      );
    case "bladder":
      return <Path d="M0 -13 C 11 -13 13 0 9 7 C 6 11 -6 11 -9 7 C -13 0 -11 -13 0 -13 Z" fill="#93c5fd" stroke="#1d4ed8" strokeWidth={1.5} />;
  }
}

/** A child's front-facing outline. Outline strokes go down first, skin on top, so it reads as one shape. */
function Figure() {
  const torso = "M 120 86 Q 160 78 200 86 Q 214 90 212 104 L 197 178 Q 196 199 186 205 L 134 205 Q 124 199 123 178 L 108 104 Q 106 90 120 86 Z";
  const limbs = (w: number, c: string) => (
    <G stroke={c} strokeWidth={w} strokeLinecap="round">
      <Line x1={115} y1={98} x2={89} y2={194} />
      <Line x1={205} y1={98} x2={231} y2={194} />
      <Line x1={142} y1={198} x2={138} y2={284} />
      <Line x1={178} y1={198} x2={182} y2={284} />
    </G>
  );
  return (
    <G>
      {limbs(24, OUTLINE)}
      <Rect x={147} y={62} width={26} height={30} fill={OUTLINE} />
      <Path d={torso} fill={OUTLINE} stroke={OUTLINE} strokeWidth={5} />
      <Ellipse cx={137} cy={50} rx={5.5} ry={7.5} fill={OUTLINE} />
      <Ellipse cx={183} cy={50} rx={5.5} ry={7.5} fill={OUTLINE} />
      <Circle cx={CX} cy={48} r={25} fill={OUTLINE} />
      <Ellipse cx={136} cy={289} rx={12} ry={7} fill={OUTLINE} />
      <Ellipse cx={184} cy={289} rx={12} ry={7} fill={OUTLINE} />
      {limbs(19, SKIN)}
      <Rect x={150} y={62} width={20} height={30} fill={SKIN} />
      <Path d={torso} fill={SKIN} />
      <Ellipse cx={137.5} cy={50} rx={3} ry={5} fill={SKIN} />
      <Ellipse cx={182.5} cy={50} rx={3} ry={5} fill={SKIN} />
      <Circle cx={CX} cy={48} r={22} fill={SKIN} />
      {/* a simple friendly face, so eyes, nose and mouth have somewhere to point */}
      <Circle cx={CX - 8} cy={46} r={2.3} fill={OUTLINE} />
      <Circle cx={CX + 8} cy={46} r={2.3} fill={OUTLINE} />
      <Path d="M 160 50 Q 157.5 54.5 161 55.5" stroke={OUTLINE} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Path d="M 153.5 60 Q 160 65.5 166.5 60" stroke={OUTLINE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M 137.5 44 Q 139 22 160 22 Q 181 22 182.5 44 Q 177 31 160 31 Q 143 31 137.5 44 Z" fill="#7c4a2d" stroke={OUTLINE} strokeWidth={1.5} />
      <Ellipse cx={136} cy={289} rx={9.5} ry={4.5} fill={SKIN} />
      <Ellipse cx={184} cy={289} rx={9.5} ry={4.5} fill={SKIN} />
    </G>
  );
}

const BADGE_R = 27;
const LEFT_X = 44;
const RIGHT_X = W - 44;
const SLOT_TOP = 62;
const SLOT_BOTTOM = 230;

/** Spread a side's badges evenly; a lone badge sits level with its part (eyes high, feet low). */
function slotYs(n: number, onlyY = 130): number[] {
  if (n === 1) return [Math.min(SLOT_BOTTOM, Math.max(SLOT_TOP, onlyY))];
  const step = Math.min(95, (SLOT_BOTTOM - SLOT_TOP) / (n - 1));
  const start = (SLOT_TOP + SLOT_BOTTOM) / 2 - (step * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) => start + i * step);
}

export default function BodyDiagram({ parts, title, hint, lang }: { parts: string[]; title: string; hint: string; lang: LanguageCode }) {
  const organs: OrganDef[] = [];
  const outside: (typeof PARTS)[string][] = [];
  for (const p of parts) {
    const k = ORGAN_ALIASES[p];
    if (k) {
      if (!organs.some((o) => o.kind === k)) organs.push(ORGANS[k]);
    } else if (PARTS[p] && !outside.some((o) => o.label === PARTS[p].label)) outside.push(PARTS[p]);
  }

  // badges: organs on the body's left go to the left column, then balance the
  // sides; each column is ordered top to bottom so connector lines never cross
  const shown = organs.slice(0, 6);
  const left: OrganDef[] = [];
  const right: OrganDef[] = [];
  for (const o of [...shown].sort((a, b) => a.x - b.x)) {
    if (o.x < CX && left.length < 3) left.push(o);
    else if (o.x > CX && right.length < 3) right.push(o);
    else (left.length <= right.length && left.length < 3 ? left : right).push(o);
  }
  const placed = [
    ...left.sort((a, b) => a.y - b.y).map((o, i, arr) => ({ o, bx: LEFT_X, by: slotYs(arr.length, o.y)[i] })),
    ...right.sort((a, b) => a.y - b.y).map((o, i, arr) => ({ o, bx: RIGHT_X, by: slotYs(arr.length, o.y)[i] })),
  ];
  // draw big organs first so small ones (the heart) stay visible on top
  const inBody = shown.filter((o) => !o.outside).sort((a, b) => b.s - a.s);

  return (
    <View style={styles.stage}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <SvgText x={CX} y={17} fontSize={12} fontWeight="800" fill="#0f766e" textAnchor="middle" letterSpacing={0.5}>
          {title.toUpperCase()}
        </SvgText>

        <Figure />

        {inBody.map((o) => (
          <G key={`in-${o.kind}`} transform={`translate(${o.x} ${o.y}) scale(${o.s})`}>
            <OrganShape kind={o.kind} />
          </G>
        ))}

        {outside.map((p) => {
          const lx = p.side === "L" ? 14 : W - 14;
          const edge = p.side === "L" ? 66 : W - 66;
          return (
            <G key={`part-${p.label}`}>
              <Line x1={edge} y1={p.y} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.35)" strokeWidth={1.2} />
              <Circle cx={p.x} cy={p.y} r={4} fill={colors.forest} stroke="white" strokeWidth={1.5} />
              <SvgText x={lx} y={p.y + 4} fontSize={11} fontWeight="800" fill={colors.textDark} textAnchor={p.side === "L" ? "start" : "end"}>
                {wordLabel(p.label, lang)}
              </SvgText>
            </G>
          );
        })}

        {placed.map(({ o, bx, by }) => {
          // the line leaves the badge edge (not its centre) and ends on the organ
          const dx = o.x - bx;
          const dy = o.y - by;
          const d = Math.hypot(dx, dy) || 1;
          const sx = bx + (dx / d) * BADGE_R;
          const sy = by + (dy / d) * BADGE_R;
          // …and stops at the organ's edge, so the dot never covers the organ
          const reach = Math.max(0, d - 15 * o.s);
          const ex = bx + (dx / d) * reach;
          const ey = by + (dy / d) * reach;
          return (
            <G key={`badge-${o.kind}`}>
              <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={o.tint} strokeWidth={4} strokeOpacity={0.2} />
              <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={o.tint} strokeWidth={1.6} strokeDasharray="4 3" />
              <Circle cx={ex} cy={ey} r={2.8} fill={o.tint} stroke="white" strokeWidth={1.2} />
              <Circle cx={bx} cy={by} r={BADGE_R} fill="white" stroke={o.tint} strokeWidth={2.5} />
              <G transform={`translate(${bx} ${by}) scale(${o.kind === "heart" ? 0.88 : o.outside ? 1 : 1.05})`}>
                <OrganShape kind={o.kind} />
              </G>
              <SvgText x={bx} y={by + BADGE_R + 12} fontSize={11} fontWeight="800" fill={colors.textDark} textAnchor="middle">
                {wordLabel(o.label, lang)}
              </SvgText>
              <SvgText x={bx} y={by + BADGE_R + 23} fontSize={8.5} fontWeight="600" fill="#0f766e" textAnchor="middle">
                {o.tip}
              </SvgText>
            </G>
          );
        })}

        {!organs.length && !outside.length && (
          <SvgText x={CX} y={H - 8} fontSize={10} fill={colors.textLight} textAnchor="middle">
            {hint}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: W / H,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
