export const colors = {
  // Base
  bg: "#f5f0e6",
  card: "#ffffff",
  cardMuted: "#efe9dd",
  border: "#e7e0d2",

  // Brand
  forest: "#2d5f4f",
  forestDark: "#1f4437",
  forestLight: "#e3ede8",
  /** Deepest brand green, for strong surfaces. */
  deep: "#1f4437",
  /** Warm highlight (the original yellow tile). */
  lime: "#f3e3bd",
  /** Soft green for chart bars and progress fills. */
  leaf: "#7fa898",

  // Text
  textDark: "#2b2a26",
  textMid: "#6f6a5e",
  textLight: "#a39d8c",

  // Pastel tiles
  blue: "#cfe0ec",
  blueDeep: "#6699bb",
  yellow: "#f3e3bd",
  yellowDeep: "#c99a2e",
  green: "#d9e8d3",
  greenDeep: "#5c9a58",
  pink: "#f3d9d9",
  pinkDeep: "#c96b6b",
  orange: "#f0ddc4",
  orangeDeep: "#c98a3d",
  purple: "#e3d9ef",
  purpleDeep: "#8a6bc9",

  white: "#ffffff",
  danger: "#c44d4d",
};

export const radius = 20;
export const radiusSm = 14;
export const radiusLg = 24;

/** Shared text styles so every screen reads the same way. */
export const type = {
  /** Small caps label above a group. */
  eyebrow: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 1, color: "#a39d8c", textTransform: "uppercase" as const },
  /** Page title. */
  display: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, color: "#2b2a26", lineHeight: 34 },
  /** Section heading. */
  heading: { fontSize: 18, fontWeight: "800" as const, color: "#2b2a26" },
  /** Muted line under a title. */
  lead: { fontSize: 14.5, color: "#6f6a5e", lineHeight: 21 },
  /** Small label under a number. */
  statLabel: { fontSize: 12, fontWeight: "600" as const, color: "#6f6a5e" },
};
