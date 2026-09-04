import { View, Text, Image, StyleSheet } from "react-native";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { searchPhrase } from "../modules/sceneSession";
import { colors } from "../theme";

/**
 * The built scene, positioned: "cat above the table" draws the cat above the
 * table. Items keep their own place and state (eyes, expression, count, colour).
 * "behind" items draw first for depth. Clear ARASAAC symbols, offline, no keys.
 */

const STAGE_W = 320;
const STAGE_H = 300;
const SIZE_SCALE: Record<SceneItem["size"], number> = { tiny: 0.72, small: 0.86, normal: 1, big: 1.25, huge: 1.55 };
const BASE = 64;
const SLOT = 200;

function Item({ item, uri, crowd = 1 }: { item: SceneItem; uri?: string; crowd?: number }) {
  const size = BASE * SIZE_SCALE[item.size] * crowd;
  const n = Math.max(1, Math.min(5, item.count));
  const pic = size * 2.3;
  // A flat tint would wipe the pictogram's black outline and inner detail
  // (eyes, whiskers), so colour is shown as a soft wash behind the symbol plus
  // a coloured ring — the drawing stays fully clear.
  const col = item.colorHex ?? undefined;
  return (
    <View
      style={{
        position: "absolute",
        left: item.x * STAGE_W - SLOT / 2,
        top: item.y * STAGE_H - SLOT / 2,
        width: SLOT,
        height: SLOT,
        alignItems: "center",
        justifyContent: "center",
        opacity: item.behind ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {Array.from({ length: n }).map((_, i) => (
          <View
            key={i}
            style={[
              { alignItems: "center", justifyContent: "center", marginLeft: i === 0 ? 0 : -size * 0.14 },
              col
                ? {
                    backgroundColor: `${col}2e`, // ~18% wash
                    borderColor: col,
                    borderWidth: 3,
                    borderRadius: pic * 0.16,
                    padding: pic * 0.05,
                  }
                : null,
            ]}
          >
            {uri ? (
              <Image source={{ uri }} style={{ width: pic, height: pic }} resizeMode="contain" />
            ) : (
              <View style={[styles.loading, { width: pic * 0.72, height: pic * 0.72, borderRadius: pic * 0.1 }]} />
            )}
          </View>
        ))}
      </View>
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

  const ordered = [...session.items].sort((a, b) => Number(b.behind) - Number(a.behind));
  const crowd =
    session.items.length >= 4 ? 0.66 : session.items.length === 3 ? 0.8 : session.items.length === 2 ? 0.92 : 1;

  return (
    <View style={styles.stage}>
      <View style={styles.groundShadow} />
      {ordered.map((it) => (
        <Item key={it.id} item={it} uri={uris[searchPhrase(it)]} crowd={crowd} />
      ))}
      {!session.items.length && (
        <Text style={styles.empty}>Say an object — “table”, then “cat above the table”, then “open the cat’s eyes”.</Text>
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
  groundShadow: {
    position: "absolute",
    left: "12%",
    right: "12%",
    bottom: "12%",
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  loading: { backgroundColor: "#eef0ee", borderWidth: 1, borderColor: colors.border },
  empty: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "42%",
    textAlign: "center",
    color: colors.textLight,
    fontSize: 12.5,
  },
  anatomyTitle: { fontSize: 14, fontWeight: "800", color: colors.textDark, marginBottom: 10, textAlign: "center" },
  anatomyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingHorizontal: 16 },
  anatomyChip: { backgroundColor: colors.forestLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  anatomyChipText: { color: colors.forestDark, fontWeight: "800", fontSize: 12 },
  anatomyHint: { marginTop: 12, fontSize: 11, color: colors.textLight, textAlign: "center" },
});
