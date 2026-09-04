import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { ACTIONS } from "../modules/sentenceScene";
import { colors } from "../theme";

/**
 * AAC sentence-strip view of the built scene.
 *
 * The autism / AAC study standard is clear, consistent single-concept symbols
 * (ARASAAC) laid out left to right like a PECS sentence strip — not an
 * overlapping picture. Each object is one clean tile with its label; spatial
 * relations show as a connector tile ("under", "behind", "→ right").
 */

const REL_LABEL: Record<string, string> = {
  under: "under", below: "under", on: "on", above: "above",
  behind: "behind", "in front of": "in front", left: "left", right: "right",
  inside: "inside", center: "with",
};
const REL_ARROW: Record<string, string> = {
  under: "⬇", below: "⬇", on: "⬆", above: "⬆", left: "⬅", right: "➡",
};

interface Cell {
  item?: SceneItem;
  connector?: string; // relation key
}

function strip(items: SceneItem[]): Cell[] {
  const used = new Set<string>();
  const out: Cell[] = [];
  for (const it of items) {
    if (it.relation && it.reference && !used.has(it.id)) {
      const ref = items.find((r) => r.type === it.reference);
      out.push({ item: it });
      used.add(it.id);
      out.push({ connector: it.relation });
      if (ref && !used.has(ref.id)) {
        out.push({ item: ref });
        used.add(ref.id);
      }
    }
  }
  for (const it of items) if (!used.has(it.id)) out.push({ item: it });
  return out;
}

function subLabel(i: SceneItem): string | null {
  const bits: string[] = [];
  if (i.eyes) bits.push(`eyes ${i.eyes}`);
  if (i.action) bits.push(i.action);
  return bits.length ? bits.join(", ") : null;
}

function Tile({ item, uri }: { item: SceneItem; uri?: string }) {
  const sub = subLabel(item);
  const actionEmoji = item.action && ACTIONS[item.action] ? ACTIONS[item.action] : null;
  return (
    <View style={styles.tile}>
      {item.count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>×{item.count}</Text>
        </View>
      )}
      <View style={styles.symbolBox}>
        {uri ? (
          <Image source={{ uri }} style={styles.symbol} resizeMode="contain" />
        ) : (
          <Text style={styles.emoji}>{item.glyph}</Text>
        )}
        {actionEmoji && <Text style={styles.actionEmoji}>{actionEmoji}</Text>}
      </View>
      <View style={styles.labelRow}>
        {item.colorHex && <View style={[styles.dot, { backgroundColor: item.colorHex }]} />}
        <Text style={styles.label} numberOfLines={1}>
          {item.color ? `${item.color} ` : ""}
          {item.type}
        </Text>
      </View>
      {sub && (
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function Connector({ rel }: { rel: string }) {
  return (
    <View style={styles.connector}>
      <Text style={styles.connectorArrow}>{REL_ARROW[rel] ?? "•"}</Text>
      <Text style={styles.connectorText}>{REL_LABEL[rel] ?? rel}</Text>
    </View>
  );
}

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  if (session.anatomy) {
    return (
      <View style={styles.stage}>
        <Text style={styles.anatomyTitle}>Human body — labelled</Text>
        <View style={styles.anatomyRow}>
          {(session.anatomyParts.length ? session.anatomyParts : ["body"]).map((p) => (
            <View key={p} style={styles.anatomyChip}>
              <Text style={styles.anatomyChipText}>{p}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.anatomyHint}>Say “add heart”, “add lungs”… to build the diagram.</Text>
      </View>
    );
  }

  if (!session.items.length) {
    return (
      <View style={styles.stage}>
        <Text style={styles.empty}>
          Say an object — “table”, then “cat under the table”, then “open the cat’s eyes”.
        </Text>
      </View>
    );
  }

  const cells = strip(session.items);

  return (
    <View style={styles.stage}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {cells.map((c, i) =>
          c.item ? (
            <Tile key={c.item.id} item={c.item} uri={uris[c.item.type]} />
          ) : (
            <Connector key={`c${i}`} rel={c.connector!} />
          ),
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: "100%",
    aspectRatio: 320 / 232,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
  },
  strip: {
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  tile: {
    width: 128,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  symbolBox: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  symbol: { width: 96, height: 96 },
  emoji: { fontSize: 62 },
  actionEmoji: { position: "absolute", right: 0, bottom: 0, fontSize: 24 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    textTransform: "capitalize",
  },
  sub: { fontSize: 11, fontWeight: "600", color: colors.textMid, marginTop: 2 },
  countBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.forest,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 2,
  },
  countText: { color: "white", fontSize: 11, fontWeight: "800" },
  connector: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  connectorArrow: { fontSize: 18, color: colors.forest },
  connectorText: { fontSize: 12, fontWeight: "800", color: colors.forest, textTransform: "lowercase" },
  empty: {
    paddingHorizontal: 24,
    textAlign: "center",
    color: colors.textLight,
    fontSize: 13,
  },
  anatomyTitle: { fontSize: 14, fontWeight: "800", color: colors.textDark, marginBottom: 10, textAlign: "center" },
  anatomyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingHorizontal: 16 },
  anatomyChip: { backgroundColor: colors.forestLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  anatomyChipText: { color: colors.forestDark, fontWeight: "800", fontSize: 12 },
  anatomyHint: { marginTop: 12, fontSize: 11, color: colors.textLight, textAlign: "center" },
});
