import { View, Text, StyleSheet } from "react-native";
import type { SceneGraph, SceneEntity, SceneSize } from "../types";
import { ACTIONS } from "../modules/sentenceScene";
import { colors } from "../theme";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";

/**
 * The instant, offline half of the Hybrid Smart Sentence-to-Scene engine.
 *
 * Given a scene graph it lays out emoji glyphs with correct depth ordering,
 * size, colour cue and count — so "the small black cat is behind the big tree"
 * renders as a small cat peeking from behind a large tree, immediately, with a
 * consistent visual language and no network.
 */

const STAGE_W = 320;
const STAGE_H = 236;

const SIZE_SCALE: Record<SceneSize, number> = { tiny: 0.5, small: 0.72, normal: 1, big: 1.45, huge: 2 };
const BASE_SUBJECT = 52;
const BASE_REF = 84;

interface Placement {
  left: number; // centre x
  top: number; // centre y
  scale: number;
  behind: boolean; // draw before the reference
  faded: boolean;
}

function placeSubject(relation: string | null, subjSize: SceneSize): Placement {
  const cx = STAGE_W / 2;
  const refCy = STAGE_H * 0.52;
  const s = SIZE_SCALE[subjSize];
  switch (relation) {
    case "under":
      return { left: cx, top: refCy + 66, scale: s, behind: false, faded: false };
    case "on":
      return { left: cx, top: refCy - 44, scale: s, behind: false, faded: false };
    case "above":
      return { left: cx, top: refCy - 92, scale: s, behind: false, faded: false };
    case "beside":
      return { left: cx - 92, top: refCy + 8, scale: s, behind: false, faded: false };
    case "inside":
      return { left: cx, top: refCy + 12, scale: Math.min(s, 0.52), behind: false, faded: false };
    case "behind":
      return { left: cx + 22, top: refCy - 34, scale: s * 0.9, behind: true, faded: true };
    case "in front of":
      return { left: cx, top: refCy + 54, scale: s * 1.05, behind: false, faded: false };
    default:
      return { left: cx, top: STAGE_H * 0.5, scale: s, behind: false, faded: false };
  }
}

function Glyph({ entity, size, faded }: { entity: SceneEntity; size: number; faded?: boolean }) {
  const n = entity.count;
  const spread = size * 0.62;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", opacity: faded ? 0.62 : 1 }}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={{ alignItems: "center", marginLeft: i === 0 ? 0 : -spread * 0.15 }}>
          {entity.colorHex && (
            <View
              style={[
                styles.halo,
                {
                  width: size * 1.02,
                  height: size * 1.02,
                  borderRadius: size,
                  backgroundColor: entity.colorHex,
                  marginBottom: -size * 0.86,
                },
              ]}
            />
          )}
          <Text style={{ fontSize: size * (n > 2 ? 0.82 : 1) }}>{entity.glyph}</Text>
          {entity.action && ACTIONS[entity.action] && i === 0 && (
            <Text style={{ fontSize: size * 0.34, marginTop: -size * 0.1 }}>{ACTIONS[entity.action]}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const SLOT = 180; // fixed-width centred slot so we can anchor by centre point

export default function SceneComposer({ graph }: { graph: SceneGraph }) {
  const { settings } = useSettings();
  const lang = settings.language;
  const { subject, reference, relation } = graph;
  const refSize = reference ? BASE_REF * SIZE_SCALE[reference.size] : 0;
  const subjSize = subject ? BASE_SUBJECT * SIZE_SCALE[subject.size] : 0;
  const p = placeSubject(relation, subject?.size ?? "normal");

  const slot = (cx: number, cy: number) => ({
    position: "absolute" as const,
    left: cx - SLOT / 2,
    top: cy - SLOT / 2,
    width: SLOT,
    height: SLOT,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  });

  const subjectNode = subject ? (
    <View style={slot(p.left, p.top)}>
      <Glyph entity={subject} size={subjSize} faded={p.faded} />
    </View>
  ) : null;

  const referenceNode = reference ? (
    <View style={slot(STAGE_W / 2, STAGE_H * 0.52)}>
      <Glyph entity={reference} size={refSize} />
    </View>
  ) : null;

  return (
    <View style={styles.stage}>
      <View style={styles.groundShadow} />

      {p.behind && subjectNode}
      {referenceNode}
      {!p.behind && subjectNode}

      {!subject && !reference && !graph.conceptKey && (
        <Text style={styles.empty}>{t("scEmptyHint", lang)}</Text>
      )}

      {/* colour + relation cue strip */}
      {(subject?.color || relation) && (
        <View style={styles.cueStrip}>
          {subject?.color && <Text style={styles.cue}>{subject.color}</Text>}
          {subject && <Text style={styles.cueDim}>{subject.count > 1 ? `${subject.count} ` : ""}{subject.type}</Text>}
          {relation && <Text style={styles.cue}>{relation}</Text>}
          {reference && <Text style={styles.cueDim}>{reference.type}</Text>}
        </View>
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
  },
  groundShadow: {
    position: "absolute",
    left: "12%",
    right: "12%",
    bottom: "14%",
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  halo: { position: "absolute", opacity: 0.34 },
  empty: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "42%",
    textAlign: "center",
    color: colors.textLight,
    fontSize: 13,
  },
  cueStrip: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  cue: {
    fontSize: 11,
    fontWeight: "800",
    color: "white",
    backgroundColor: colors.forest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  cueDim: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMid,
    backgroundColor: colors.cardMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
});
