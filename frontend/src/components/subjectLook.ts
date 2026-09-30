import type { Ionicons } from "@expo/vector-icons";
import type { SubjectId } from "../modules/curriculum";
import type { TKey } from "../modules/i18n";
import { colors } from "../theme";

/** Icon and colours for each subject, shared by Home, the subject screen and Talk. */
export const SUBJECT_LOOK: Record<SubjectId, { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; blurb: TKey }> = {
  english: { icon: "book-outline", tint: colors.blueDeep, bg: colors.blue, blurb: "sbEnglishBlurb" },
  math: { icon: "calculator-outline", tint: colors.yellowDeep, bg: colors.yellow, blurb: "sbMathBlurb" },
  science: { icon: "flask-outline", tint: colors.greenDeep, bg: colors.green, blurb: "sbScienceBlurb" },
};
