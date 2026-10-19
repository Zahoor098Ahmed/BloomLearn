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
  | "teeth" | "tongue" | "hair" | "finger" | "arm" | "leg" | "bone"
  | "thumb" | "palm" | "wrist" | "elbow" | "knee" | "ankle" | "toe"
  | "fingernail" | "toenail" | "heel" | "eyebrow" | "eyelash" | "lip"
  | "cheek" | "chin" | "forehead" | "neck" | "shoulder" | "chest"
  | "throat" | "spine" | "rib" | "skull" | "muscle" | "skin";

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
  brain: { kind: "brain", label: "Brain", tip: "Helps us think", tint: "#e11d48", x: CX, y: 50, s: 0.9 },
  lungs: { kind: "lungs", label: "Lungs", tip: "Helps us breathe", tint: "#db2777", x: CX, y: 118, s: 1.25 },
  heart: { kind: "heart", label: "Heart", tip: "Pumps blood", tint: "#dc2626", x: CX + 7, y: 124, s: 0.72 },
  liver: { kind: "liver", label: "Liver", tip: "Cleans our blood", tint: "#b45309", x: CX - 11, y: 146, s: 0.9 },
  stomach: { kind: "stomach", label: "Stomach", tip: "Digests food", tint: "#7c3aed", x: CX + 12, y: 148, s: 0.8 },
  pancreas: { kind: "pancreas", label: "Pancreas", tip: "Makes insulin", tint: "#d97706", x: CX + 2, y: 158, s: 0.7 },
  kidneys: { kind: "kidneys", label: "Kidneys", tip: "Filters water", tint: "#65a30d", x: CX, y: 160, s: 0.75 },
  intestines: { kind: "intestines", label: "Intestines", tip: "Absorbs nutrients", tint: "#ea580c", x: CX, y: 174, s: 1.0 },
  bladder: { kind: "bladder", label: "Bladder", tip: "Stores liquid", tint: "#2563eb", x: CX, y: 192, s: 0.58 },
  eye: { kind: "eye", label: "Eyes", tip: "We see with them", tint: "#0284c7", x: CX - 7, y: 48, s: 0.3, outside: true },
  ear: { kind: "ear", label: "Ears", tip: "We hear with them", tint: "#9333ea", x: CX + 23, y: 52, s: 0.3, outside: true },
  nose: { kind: "nose", label: "Nose", tip: "We smell with it", tint: "#ea580c", x: CX, y: 55, s: 0.3, outside: true },
  mouth: { kind: "mouth", label: "Mouth", tip: "We eat and talk", tint: "#e11d48", x: CX, y: 62, s: 0.3, outside: true },
  hand: { kind: "hand", label: "Hands", tip: "We hold and clap", tint: "#d97706", x: 92, y: 188, s: 0.5, outside: true },
  foot: { kind: "foot", label: "Feet", tip: "We walk and run", tint: "#16a34a", x: 137, y: 278, s: 0.55, outside: true },
  teeth: { kind: "teeth", label: "Teeth", tip: "We chew food", tint: "#64748b", x: CX, y: 62, s: 0.3, outside: true },
  tongue: { kind: "tongue", label: "Tongue", tip: "We taste with it", tint: "#db2777", x: CX, y: 63, s: 0.3, outside: true },
  hair: { kind: "hair", label: "Hair", tip: "Keeps head warm", tint: "#92400e", x: CX, y: 30, s: 0.3, outside: true },
  finger: { kind: "finger", label: "Fingers", tip: "Point and write", tint: "#c2410c", x: 228, y: 188, s: 0.5, outside: true },
  arm: { kind: "arm", label: "Arms", tip: "We lift and hug", tint: "#0d9488", x: 106, y: 132, s: 0.4, outside: true },
  leg: { kind: "leg", label: "Legs", tip: "Jump and kick", tint: "#4f46e5", x: 140, y: 232, s: 0.4, outside: true },
  bone: { kind: "bone", label: "Bones", tip: "Make body strong", tint: "#78716c", x: 180, y: 232, s: 0.4, outside: true },
  thumb: { kind: "thumb", label: "Thumbs", tip: "We grip and hold", tint: "#ea580c", x: 86, y: 182, s: 0.48, outside: true },
  palm: { kind: "palm", label: "Palms", tip: "Inner surface", tint: "#d97706", x: 92, y: 188, s: 0.48, outside: true },
  wrist: { kind: "wrist", label: "Wrists", tip: "Help hands bend", tint: "#0d9488", x: 96, y: 172, s: 0.4, outside: true },
  elbow: { kind: "elbow", label: "Elbows", tip: "Help arms bend", tint: "#2563eb", x: 215, y: 142, s: 0.4, outside: true },
  knee: { kind: "knee", label: "Knees", tip: "Help legs bend", tint: "#4f46e5", x: 179, y: 236, s: 0.4, outside: true },
  ankle: { kind: "ankle", label: "Ankles", tip: "Help feet turn", tint: "#059669", x: 144, y: 264, s: 0.4, outside: true },
  toe: { kind: "toe", label: "Toes", tip: "Help us balance", tint: "#16a34a", x: 184, y: 278, s: 0.45, outside: true },
  fingernail: { kind: "fingernail", label: "Fingernails", tip: "Protect fingertips", tint: "#ea580c", x: 228, y: 194, s: 0.45, outside: true },
  toenail: { kind: "toenail", label: "Toenails", tip: "Protect toetips", tint: "#16a34a", x: 184, y: 282, s: 0.4, outside: true },
  heel: { kind: "heel", label: "Heels", tip: "Back of our feet", tint: "#059669", x: 139, y: 278, s: 0.45, outside: true },
  eyebrow: { kind: "eyebrow", label: "Eyebrows", tip: "Keep sweat away", tint: "#78350f", x: CX - 7, y: 46, s: 0.3, outside: true },
  eyelash: { kind: "eyelash", label: "Eyelashes", tip: "Keep dust away", tint: "#334155", x: CX - 8, y: 48, s: 0.3, outside: true },
  lip: { kind: "lip", label: "Lips", tip: "Speak and smile", tint: "#e11d48", x: CX, y: 62, s: 0.3, outside: true },
  cheek: { kind: "cheek", label: "Cheeks", tip: "Sides of face", tint: "#db2777", x: CX - 14, y: 56, s: 0.3, outside: true },
  chin: { kind: "chin", label: "Chin", tip: "Bottom of face", tint: "#9333ea", x: CX, y: 69, s: 0.3, outside: true },
  forehead: { kind: "forehead", label: "Forehead", tip: "Front of head", tint: "#0284c7", x: CX, y: 38, s: 0.3, outside: true },
  neck: { kind: "neck", label: "Neck", tip: "Holds our head", tint: "#0d9488", x: CX, y: 74, s: 0.4, outside: true },
  shoulder: { kind: "shoulder", label: "Shoulders", tip: "Carry our bag", tint: "#b45309", x: 118, y: 92, s: 0.4, outside: true },
  chest: { kind: "chest", label: "Chest", tip: "Expands to breathe", tint: "#db2777", x: CX, y: 112, s: 0.4, outside: true },
  throat: { kind: "throat", label: "Throat", tip: "Swallows food", tint: "#ea580c", x: CX, y: 76, s: 0.4, outside: true },
  spine: { kind: "spine", label: "Spine", tip: "Holds back straight", tint: "#64748b", x: CX, y: 125, s: 0.4, outside: true },
  rib: { kind: "rib", label: "Ribs", tip: "Protect our heart", tint: "#78716c", x: CX - 16, y: 120, s: 0.4, outside: true },
  skull: { kind: "skull", label: "Skull", tip: "Protects brain", tint: "#64748b", x: CX, y: 44, s: 0.4, outside: true },
  muscle: { kind: "muscle", label: "Muscles", tip: "Help us move", tint: "#dc2626", x: 206, y: 132, s: 0.4, outside: true },
  skin: { kind: "skin", label: "Skin", tip: "Covers our body", tint: "#d97706", x: 110, y: 132, s: 0.4, outside: true },
};

const ORGAN_ALIASES: Record<string, OrganKind> = {
  brain: "brain", lung: "lungs", lungs: "lungs", heart: "heart", liver: "liver", stomach: "stomach", belly: "stomach",
  pancreas: "pancreas", kidney: "kidneys", kidneys: "kidneys", intestine: "intestines", intestines: "intestines", bladder: "bladder",
  eye: "eye", eyes: "eye", ear: "ear", ears: "ear", nose: "nose", mouth: "mouth", hand: "hand", hands: "hand", foot: "foot", feet: "foot",
  teeth: "teeth", tooth: "teeth", tongue: "tongue", hair: "hair", finger: "finger", fingers: "finger",
  arm: "arm", arms: "arm", leg: "leg", legs: "leg", bone: "bone", bones: "bone", skeleton: "bone",
  thumb: "thumb", thumbs: "thumb",
  palm: "palm", palms: "palm",
  wrist: "wrist", wrists: "wrist",
  elbow: "elbow", elbows: "elbow",
  knee: "knee", knees: "knee",
  ankle: "ankle", ankles: "ankle",
  toe: "toe", toes: "toe",
  fingernail: "fingernail", fingernails: "fingernail",
  toenail: "toenail", toenails: "toenail",
  heel: "heel", heels: "heel",
  eyebrow: "eyebrow", eyebrows: "eyebrow",
  eyelash: "eyelash", eyelashes: "eyelash",
  lip: "lip", lips: "lip",
  cheek: "cheek", cheeks: "cheek",
  chin: "chin", chins: "chin",
  forehead: "forehead", foreheads: "forehead",
  neck: "neck", necks: "neck",
  shoulder: "shoulder", shoulders: "shoulder",
  chest: "chest", chests: "chest",
  throat: "throat", throats: "throat",
  spine: "spine", spines: "spine", backbone: "spine", backbones: "spine", back: "spine",
  rib: "rib", ribs: "rib", ribcage: "rib",
  skull: "skull", skulls: "skull", head: "skull",
  muscle: "muscle", muscles: "muscle",
  skin: "skin",
};

// outside parts: a dot on the figure and a label at the side
const PARTS: Record<string, { label: string; x: number; y: number; side: "L" | "R" }> = {
  head: { label: "Head", x: CX, y: 44, side: "R" },
  neck: { label: "Neck", x: CX, y: 74, side: "L" },
  shoulder: { label: "Shoulders", x: 118, y: 92, side: "L" }, shoulders: { label: "Shoulders", x: 118, y: 92, side: "L" },
  chest: { label: "Chest", x: CX, y: 112, side: "R" },
  elbow: { label: "Elbows", x: 215, y: 142, side: "R" }, elbows: { label: "Elbows", x: 215, y: 142, side: "R" },
  tummy: { label: "Tummy", x: CX, y: 162, side: "R" },
  back: { label: "Back", x: CX, y: 125, side: "R" },
  torso: { label: "Torso", x: CX, y: 144, side: "R" },
  body: { label: "Body", x: CX, y: 144, side: "R" },
  hip: { label: "Hips", x: 130, y: 194, side: "L" }, hips: { label: "Hips", x: 130, y: 194, side: "L" },
  knee: { label: "Knees", x: 179, y: 236, side: "R" }, knees: { label: "Knees", x: 179, y: 236, side: "R" },
  toe: { label: "Toes", x: 184, y: 278, side: "R" }, toes: { label: "Toes", x: 184, y: 278, side: "R" },
  forehead: { label: "Forehead", x: CX, y: 38, side: "R" },
  eyebrow: { label: "Eyebrows", x: CX - 7, y: 46, side: "L" }, eyebrows: { label: "Eyebrows", x: CX - 7, y: 46, side: "L" },
  eyelash: { label: "Eyelashes", x: CX - 8, y: 48, side: "L" }, eyelashes: { label: "Eyelashes", x: CX - 8, y: 48, side: "L" },
  cheek: { label: "Cheeks", x: CX - 14, y: 56, side: "L" }, cheeks: { label: "Cheeks", x: CX - 14, y: 56, side: "L" },
  lip: { label: "Lips", x: CX, y: 62, side: "R" }, lips: { label: "Lips", x: CX, y: 62, side: "R" },
  chin: { label: "Chin", x: CX, y: 69, side: "L" },
  throat: { label: "Throat", x: CX, y: 76, side: "R" },
  wrist: { label: "Wrists", x: 96, y: 172, side: "L" }, wrists: { label: "Wrists", x: 96, y: 172, side: "L" },
  palm: { label: "Palms", x: 92, y: 188, side: "L" }, palms: { label: "Palms", x: 92, y: 188, side: "L" },
  thumb: { label: "Thumbs", x: 86, y: 182, side: "L" }, thumbs: { label: "Thumbs", x: 86, y: 182, side: "L" },
  fingernail: { label: "Fingernails", x: 228, y: 194, side: "R" }, fingernails: { label: "Fingernails", x: 228, y: 194, side: "R" },
  ankle: { label: "Ankles", x: 144, y: 264, side: "L" }, ankles: { label: "Ankles", x: 144, y: 264, side: "L" },
  heel: { label: "Heels", x: 139, y: 278, side: "L" }, heels: { label: "Heels", x: 139, y: 278, side: "L" },
  toenail: { label: "Toenails", x: 184, y: 282, side: "R" }, toenails: { label: "Toenails", x: 184, y: 282, side: "R" },
  spine: { label: "Spine", x: CX, y: 125, side: "L" },
  rib: { label: "Ribs", x: CX - 16, y: 120, side: "L" }, ribs: { label: "Ribs", x: CX - 16, y: 120, side: "L" },
  skull: { label: "Skull", x: CX, y: 44, side: "L" },
  skin: { label: "Skin", x: 110, y: 132, side: "L" },
  muscle: { label: "Muscles", x: 206, y: 132, side: "R" }, muscles: { label: "Muscles", x: 206, y: 132, side: "R" },
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
    case "thumb":
      return (
        <G>
          {/* fist with upright thumb */}
          <Path
            d="M -8 13 L 6 13 C 9 13 11 11 11 8 L 11 0 C 11 -3 9 -5 6 -5 L -2 -5 L -2 -14 C -2 -18 -8 -18 -8 -13 L -8 -3 L -12 -3 C -15 -3 -15 2 -15 2 L -15 7 C -15 11 -12 13 -8 13 Z"
            fill={SKIN}
            stroke="#9a3412"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="M -8 -3 L -8 13 M -2 0 L 6 0 M -2 5 L 6 5 M -2 9 L 5 9" stroke="#c2410c" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    case "palm":
      return (
        <G>
          <Rect x={-11} y={-4} width={22} height={18} rx={5} fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          {[-9, -4, 1, 6].map((fx) => (
            <Rect key={fx} x={fx} y={-17} width={3.8} height={14} rx={1.9} fill={SKIN} stroke="#9a3412" strokeWidth={1.5} />
          ))}
          <Rect x={9} y={-1} width={4} height={12} rx={2} fill={SKIN} stroke="#9a3412" strokeWidth={1.5} transform="rotate(-35 11 5)" />
          <Path d="M -6 1 C -2 4 4 5 7 2 M -6 6 C -1 8 4 9 8 7" stroke="#c2410c" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </G>
      );
    case "elbow":
      return (
        <G>
          <Path d="M -14 -12 L -2 0 L 14 -3" stroke="#9a3412" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M -14 -12 L -2 0 L 14 -3" stroke={SKIN} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx={-2} cy={0} r={5} fill="#2563eb" stroke="white" strokeWidth={1.5} />
        </G>
      );
    case "knee":
      return (
        <G>
          <Path d="M -12 -14 L 0 0 L -8 16" stroke="#9a3412" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M -12 -14 L 0 0 L -8 16" stroke={SKIN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx={0} cy={0} r={5.5} fill="#4f46e5" stroke="white" strokeWidth={1.5} />
        </G>
      );
    case "wrist":
      return (
        <G>
          <Rect x={-6} y={-16} width={12} height={18} rx={3} fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Path d="M -10 2 C -10 -2 10 -2 10 2 L 8 14 L -8 14 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Rect x={-8} y={-2} width={16} height={5} rx={2} fill="#0d9488" stroke="white" strokeWidth={1.2} />
        </G>
      );
    case "ankle":
      return (
        <G>
          <Rect x={-5} y={-16} width={10} height={18} rx={2} fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Path d="M -5 2 C -5 2 -12 8 -12 14 L 10 14 C 10 10 5 2 5 2 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Circle cx={-4} cy={2} r={4.5} fill="#059669" stroke="white" strokeWidth={1.2} />
          <Circle cx={4} cy={2} r={4} fill="#059669" stroke="white" strokeWidth={1.2} />
        </G>
      );
    case "toe":
      return (
        <G>
          <Path d="M -10 14 C -10 6 -8 0 0 0 C 8 0 10 6 10 14 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Circle cx={-7} cy={-4} r={3.6} fill={SKIN} stroke="#9a3412" strokeWidth={1.4} />
          <Circle cx={-2.5} cy={-7} r={3.2} fill={SKIN} stroke="#9a3412" strokeWidth={1.4} />
          <Circle cx={2} cy={-6.5} r={2.8} fill={SKIN} stroke="#9a3412" strokeWidth={1.4} />
          <Circle cx={6} cy={-5} r={2.4} fill={SKIN} stroke="#9a3412" strokeWidth={1.4} />
          <Circle cx={9} cy={-2.5} r={2.1} fill={SKIN} stroke="#9a3412" strokeWidth={1.4} />
        </G>
      );
    case "fingernail":
      return (
        <G>
          <Path d="M -7 14 L -7 2 C -7 -6 7 -6 7 2 L 7 14 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          <Path d="M -5 0 C -5 -5 5 -5 5 0 L 5 7 C 5 8 -5 8 -5 7 Z" fill="#fed7aa" stroke="#c2410c" strokeWidth={1.4} />
          <Path d="M -2 -2 Q 0 -4 2 -2" stroke="white" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </G>
      );
    case "toenail":
      return (
        <G>
          <Path d="M -8 14 L -8 3 C -8 -5 8 -5 8 3 L 8 14 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          <Path d="M -6 1 C -6 -4 6 -4 6 1 L 6 7 C 6 8 -6 8 -6 7 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth={1.4} />
          <Path d="M -3 -1 Q 0 -3 3 -1" stroke="white" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </G>
      );
    case "heel":
      return (
        <G>
          <Path d="M -10 -14 L -10 2 C -10 12 -2 14 8 14 L 14 14 L 14 6 C 6 6 0 2 0 -14 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M -10 2 C -10 12 -2 14 8 14" stroke="#059669" strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case "eyebrow":
      return (
        <G>
          <Path d="M -14 -7 Q 0 -16 14 -8" stroke="#78350f" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <Path d="M -12 2 Q 0 -4 12 2 Q 0 8 -12 2 Z" fill="white" stroke="#334155" strokeWidth={1.3} />
          <Circle cx={0} cy={2} r={3.5} fill="#0284c7" />
          <Circle cx={0} cy={2} r={1.6} fill="#0f172a" />
        </G>
      );
    case "eyelash":
      return (
        <G>
          <Path d="M -11 -2 L -14 -9 M -5 -5 L -6 -13 M 0 -6 L 0 -14 M 5 -5 L 6 -13 M 11 -2 L 14 -9" stroke="#0f172a" strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M -13 0 Q 0 -8 13 0 Q 0 8 -13 0 Z" fill="white" stroke="#334155" strokeWidth={1.5} />
          <Circle cx={0} cy={0} r={4.5} fill="#0284c7" />
          <Circle cx={0} cy={0} r={2} fill="#0f172a" />
        </G>
      );
    case "lip":
      return (
        <G>
          <Path d="M -14 0 Q -7 -7 0 -2 Q 7 -7 14 0 Q 0 7 -14 0 Z" fill="#fb7185" stroke="#be123c" strokeWidth={1.8} />
          <Path d="M -14 0 Q 0 3 14 0" stroke="#881337" strokeWidth={1.4} fill="none" />
        </G>
      );
    case "cheek":
      return (
        <G>
          <Circle cx={0} cy={0} r={14} fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Circle cx={0} cy={0} r={8} fill="#f43f5e" opacity={0.45} />
          <Path d="M -5 6 Q 0 9 5 6" stroke="#9a3412" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </G>
      );
    case "chin":
      return (
        <G>
          <Path d="M -14 -8 C -14 6 -8 14 0 14 C 8 14 14 6 14 -8 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          <Path d="M -6 -5 Q 0 -2 6 -5" stroke="#be123c" strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M -3 7 Q 0 9 3 7" stroke="#9a3412" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case "forehead":
      return (
        <G>
          <Path d="M -10 12 L -10 0 C -10 -10 0 -14 10 -14 L 10 12 Z" fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          <Path d="M -10 0 C -10 -10 0 -14 10 -14" stroke="#0284c7" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M -4 -4 L 4 -4 M -4 2 L 4 2" stroke="#9a3412" strokeWidth={1.2} strokeLinecap="round" />
        </G>
      );
    case "neck":
      return (
        <G>
          <Circle cx={0} cy={-10} r={8} fill={SKIN} stroke="#9a3412" strokeWidth={1.5} />
          <Rect x={-6} y={-3} width={12} height={14} rx={2} fill={SKIN} stroke="#9a3412" strokeWidth={1.8} />
          <Path d="M -12 11 L 12 11" stroke="#9a3412" strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case "shoulder":
      return (
        <G>
          <Path d="M -16 6 C -10 -4 10 -4 16 6" stroke="#9a3412" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Path d="M -16 6 C -10 -4 10 -4 16 6" stroke={SKIN} strokeWidth={6} strokeLinecap="round" fill="none" />
          <Circle cx={-12} cy={3} r={4.5} fill="#b45309" stroke="white" strokeWidth={1.2} />
          <Circle cx={12} cy={3} r={4.5} fill="#b45309" stroke="white" strokeWidth={1.2} />
        </G>
      );
    case "chest":
      return (
        <G>
          <Path d="M -14 8 C -14 -6 14 -6 14 8 Z" fill="#fbcfe8" stroke="#be185d" strokeWidth={1.8} />
          <Path d="M 0 -6 L 0 8" stroke="#be185d" strokeWidth={1.4} />
          <Path d="M -9 0 Q 0 3 9 0 M -10 5 Q 0 8 10 5" stroke="#be185d" strokeWidth={1.2} fill="none" />
        </G>
      );
    case "throat":
      return (
        <G>
          <Rect x={-7} y={-14} width={14} height={28} rx={4} fill="#fed7aa" stroke="#ea580c" strokeWidth={1.6} />
          {[-8, -3, 2, 7].map((ry) => (
            <Path key={ry} d={`M -5 ${ry} L 5 ${ry}`} stroke="#ea580c" strokeWidth={1.5} strokeLinecap="round" />
          ))}
        </G>
      );
    case "spine":
      return (
        <G>
          {[-14, -7, 0, 7, 14].map((sy, i) => (
            <Rect key={i} x={-6} y={sy - 2.5} width={12} height={5} rx={1.8} fill="#f5f5f4" stroke="#57534e" strokeWidth={1.4} />
          ))}
          <Line x1={0} y1={-16} x2={0} y2={16} stroke="#57534e" strokeWidth={1.2} strokeDasharray="2 2" />
        </G>
      );
    case "rib":
      return (
        <G>
          <Line x1={0} y1={-15} x2={0} y2={15} stroke="#57534e" strokeWidth={2.4} strokeLinecap="round" />
          {[-9, -3, 3, 9].map((ry, i) => (
            <Path key={i} d={`M -13 ${ry + 3} Q -7 ${ry - 3} 0 ${ry} Q 7 ${ry - 3} 13 ${ry + 3}`} stroke="#78716c" strokeWidth={2} fill="none" strokeLinecap="round" />
          ))}
        </G>
      );
    case "skull":
      return (
        <G>
          <Circle cx={0} cy={-2} r={13} fill="#f5f5f4" stroke="#57534e" strokeWidth={1.6} />
          <Rect x={-6} y={7} width={12} height={6} rx={2} fill="#f5f5f4" stroke="#57534e" strokeWidth={1.4} />
          <Circle cx={-4} cy={-2} r={3} fill="#57534e" />
          <Circle cx={4} cy={-2} r={3} fill="#57534e" />
          <Path d="M -1 3 L 0 1 L 1 3 Z" fill="#57534e" />
        </G>
      );
    case "muscle":
      return (
        <G>
          <Path d="M -14 8 C -14 -4 -4 -12 2 -12 C 8 -12 14 -4 14 8 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth={1.8} />
          <Path d="M -8 2 Q 0 -4 8 2" stroke="#dc2626" strokeWidth={1.4} fill="none" />
        </G>
      );
    case "skin":
      return (
        <G>
          <Rect x={-14} y={-8} width={28} height={16} rx={4} fill={SKIN} stroke="#9a3412" strokeWidth={1.6} />
          <Path d="M -8 -8 C -8 -14 -4 -16 0 -14 C 4 -16 8 -14 8 -8" stroke="#92400e" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Circle cx={-4} cy={0} r={1.5} fill="#f43f5e" />
          <Circle cx={4} cy={0} r={1.5} fill="#f43f5e" />
        </G>
      );
  }
}

/** A child's front-facing outline with generous headroom and footroom. */
function Figure() {
  const torso = "M 122 88 Q 160 81 198 88 Q 211 92 209 104 L 195 174 Q 194 194 184 200 L 136 200 Q 126 194 125 174 L 111 104 Q 109 92 122 88 Z";
  const limbs = (w: number, c: string) => (
    <G stroke={c} strokeWidth={w} strokeLinecap="round">
      <Line x1={117} y1={98} x2={92} y2={188} />
      <Line x1={203} y1={98} x2={228} y2={188} />
      <Line x1={143} y1={194} x2={139} y2={274} />
      <Line x1={177} y1={194} x2={181} y2={274} />
    </G>
  );
  return (
    <G>
      {limbs(23, OUTLINE)}
      <Rect x={148} y={64} width={24} height={28} fill={OUTLINE} />
      <Path d={torso} fill={OUTLINE} stroke={OUTLINE} strokeWidth={5} />
      <Ellipse cx={138} cy={52} rx={5} ry={7} fill={OUTLINE} />
      <Ellipse cx={182} cy={52} rx={5} ry={7} fill={OUTLINE} />
      <Circle cx={CX} cy={50} r={23} fill={OUTLINE} />
      <Ellipse cx={137} cy={278} rx={11} ry={6.5} fill={OUTLINE} />
      <Ellipse cx={183} cy={278} rx={11} ry={6.5} fill={OUTLINE} />
      {limbs(18, SKIN)}
      <Rect x={150} y={64} width={20} height={28} fill={SKIN} />
      <Path d={torso} fill={SKIN} />
      <Ellipse cx={138} cy={52} rx={2.8} ry={4.5} fill={SKIN} />
      <Ellipse cx={182} cy={52} rx={2.8} ry={4.5} fill={SKIN} />
      <Circle cx={CX} cy={50} r={20} fill={SKIN} />
      {/* friendly face */}
      <Circle cx={CX - 7} cy={48} r={2.2} fill={OUTLINE} />
      <Circle cx={CX + 7} cy={48} r={2.2} fill={OUTLINE} />
      <Path d="M 160 52 Q 157.5 56.5 161 57.5" stroke={OUTLINE} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Path d="M 154 62 Q 160 67 166 62" stroke={OUTLINE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M 139 46 Q 140 26 160 26 Q 180 26 181 46 Q 176 34 160 34 Q 144 34 139 46 Z" fill="#7c4a2d" stroke={OUTLINE} strokeWidth={1.5} />
      <Ellipse cx={137} cy={278} rx={8.5} ry={4.2} fill={SKIN} />
      <Ellipse cx={183} cy={278} rx={8.5} ry={4.2} fill={SKIN} />
    </G>
  );
}

const BADGE_R = 25;
const LEFT_X = 42;
const RIGHT_X = W - 42;
const SLOT_TOP = 52;
const SLOT_BOTTOM = 216;

/** Spread a side's badges evenly; a lone badge sits level with its part (eyes high, feet low). */
function slotYs(n: number, onlyY = 130): number[] {
  if (n === 1) return [Math.min(SLOT_BOTTOM, Math.max(SLOT_TOP, onlyY))];
  const step = Math.min(88, (SLOT_BOTTOM - SLOT_TOP) / (n - 1));
  const start = (SLOT_TOP + SLOT_BOTTOM) / 2 - (step * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) => start + i * step);
}

export default function BodyDiagram({ parts, title, hint, lang }: { parts: string[]; title: string; hint: string; lang: LanguageCode }) {
  const organs: OrganDef[] = [];
  const outside: (typeof PARTS)[string][] = [];
  for (const p of parts) {
    const k = ORGAN_ALIASES[p];
    if (k && ORGANS[k]) {
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
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      >
        <SvgText x={CX} y={15} fontSize={11} fontWeight="800" fill="#0f766e" textAnchor="middle" letterSpacing={0.8}>
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
          const edge = p.side === "L" ? 64 : W - 64;
          return (
            <G key={`part-${p.label}`}>
              <Line x1={edge} y1={p.y} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.35)" strokeWidth={1.2} />
              <Circle cx={p.x} cy={p.y} r={4} fill={colors.forest} stroke="white" strokeWidth={1.5} />
              <SvgText x={lx} y={p.y + 4} fontSize={10.5} fontWeight="800" fill={colors.textDark} textAnchor={p.side === "L" ? "start" : "end"}>
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
          const reach = Math.max(0, d - 14 * o.s);
          const ex = bx + (dx / d) * reach;
          const ey = by + (dy / d) * reach;
          return (
            <G key={`badge-${o.kind}`}>
              <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={o.tint} strokeWidth={3.5} strokeOpacity={0.2} />
              <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={o.tint} strokeWidth={1.5} strokeDasharray="4 3" />
              <Circle cx={ex} cy={ey} r={2.8} fill={o.tint} stroke="white" strokeWidth={1.2} />
              <Circle cx={bx} cy={by} r={BADGE_R} fill="white" stroke={o.tint} strokeWidth={2.4} />
              <G transform={`translate(${bx} ${by}) scale(${o.kind === "heart" ? 0.85 : o.outside ? 0.95 : 1})`}>
                <OrganShape kind={o.kind} />
              </G>
              <SvgText x={bx} y={by + BADGE_R + 11} fontSize={10.5} fontWeight="800" fill={colors.textDark} textAnchor="middle">
                {wordLabel(o.label, lang)}
              </SvgText>
              <SvgText x={bx} y={by + BADGE_R + 21} fontSize={8.2} fontWeight="600" fill="#0f766e" textAnchor="middle">
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
