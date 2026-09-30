export const colors = {
  // Base
  bg: "#f4f2eb",
  card: "#ffffff",
  cardMuted: "#ecefe6",
  border: "#e6e4da",

  // Brand
  forest: "#2e5b47",
  forestDark: "#1f3d31",
  forestLight: "#e4ede1",
  /** Deep green for the hero cards. */
  deep: "#24453a",
  /** Soft lime accent: pills, highlights, play buttons. */
  lime: "#d6e98f",
  /** Mid green for chart bars and progress fills. */
  leaf: "#93b86a",

  // Text
  textDark: "#1f3a30",
  textMid: "#6b7b71",
  textLight: "#9aa59c",

  // Pastel tiles
  blue: "#cfe5e3",
  blueDeep: "#4f8a86",
  yellow: "#f3d68b",
  yellowDeep: "#b58a1f",
  green: "#dcebd6",
  greenDeep: "#4f8a45",
  pink: "#f2b59b",
  pinkDeep: "#c25b3f",
  orange: "#f5dcc4",
  orangeDeep: "#c98a3d",
  purple: "#e2def0",
  purpleDeep: "#7a67b0",

  white: "#ffffff",
  danger: "#c25b3f",
};

export const radius = 20;
export const radiusSm = 14;
export const radiusLg = 28;

/** Shared text styles so every screen reads the same way. */
export const type = {
  /** Small spaced caps above a title: "FRIDAY, SEPTEMBER 25". */
  eyebrow: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 2, color: "#7b8a80", textTransform: "uppercase" as const },
  /** Big page title. */
  display: { fontSize: 36, fontWeight: "800" as const, letterSpacing: -1, color: "#1f3a30", lineHeight: 42 },
  /** Section heading: "A glance at the week". */
  heading: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5, color: "#1f3a30" },
  /** Muted line under a title. */
  lead: { fontSize: 15, color: "#6b7b71", lineHeight: 22 },
  /** Small caps label under a number. */
  statLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1.5, color: "#3d5147", textTransform: "uppercase" as const },
};
