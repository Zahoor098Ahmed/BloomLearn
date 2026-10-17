import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { SceneSession, SceneItem } from "../modules/sceneSession";
import { searchPhrase, isPerson } from "../modules/sceneSession";
import { getPictogramUrl, exactPictogramUrl } from "../modules/aacPictograms";
import { dictUrl } from "../modules/pictogramDict";
import { colors } from "../theme";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import BodyDiagram from "./BodyDiagram";
import { layoutScene, STAGE_W, STAGE_H, type Placed } from "../modules/sceneLayout";

/**
 * The built scene, positioned: "cat above the table" draws the cat above the
 * table. A single layout pass sizes every object, then scales + centres the
 * whole group to fit the frame with a margin — nothing is cropped, the scene
 * is always centred, and it scales with the container (mobile → desktop).
 */

function Item({ p, uri }: { p: Placed; uri?: string }) {
  const { it } = p;
  const n = Math.max(1, Math.min(5, it.count));
  const ratio = 1 + (n - 1) * 0.68; // width : height of the row
  const rowW = p.w * 100 * ratio; // % of stage width
  const negLeft = rowW / -2;
  // marginTop % is of the stage width; the picture is p.w of it tall
  const negTop = (p.w * 100) / -2;
  const col = it.colorHex ?? undefined;
  return (
    <>
      <View
        style={{
          position: "absolute",
          left: `${p.cx * 100}%`,
          top: `${p.cy * 100}%`,
          width: `${rowW}%`,
          aspectRatio: ratio,
          marginLeft: `${negLeft}%`,
          marginTop: `${negTop}%`,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: it.behind ? 0.75 : 1,
        }}
      >
        {Array.from({ length: n }).map((_, i) => {
          // "baby crying" has its own picture; otherwise a person shows the verb
          // ("running") and an animal or thing stays itself
          const combo = it.action
            ? exactPictogramUrl(`${it.type} ${it.action}`) || exactPictogramUrl(`${it.action} ${it.type}`)
            : null;
          const resolvedUri =
            combo ||
            (it.action && isPerson(it.type) ? getPictogramUrl(it.action) || uri || dictUrl(it.action) : null) ||
            getPictogramUrl(it.type) ||
            uri ||
            dictUrl(it.type);
          return (
            <View key={i} style={{ flex: 1, height: "100%", marginLeft: i === 0 ? 0 : "-10%" }}>
              {resolvedUri ? (
                <>
                  <Image source={{ uri: resolvedUri }} style={styles.pic} resizeMode="contain" />
                  {col && <Image source={{ uri: resolvedUri }} style={[styles.pic, styles.glaze, { tintColor: col }]} resizeMode="contain" />}
                </>
              ) : uri === "" ? (
                <Text style={styles.fallbackGlyph}>{it.glyph}</Text>
              ) : (
                <View style={styles.loading} />
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}

export default function SceneStage({ session, uris = {} }: { session: SceneSession; uris?: Record<string, string> }) {
  const { settings } = useSettings();
  const lang = settings.language;

  if (session.anatomy) {
    return <BodyDiagram parts={session.anatomyParts} title={t("ssBodyTitle", lang)} hint={t("ssAnatomyHint", lang)} lang={lang} />;
  }

  const placed = layoutScene(session.items).sort((a, b) => Number(b.it.behind) - Number(a.it.behind));

  return (
    <View style={styles.stage}>
      {placed.map((p) => (
        <Item key={p.it.id} p={p} uri={uris[searchPhrase(p.it)]} />
      ))}
      {!session.items.length && (
        <Text style={styles.empty}>{t("ssEmptyHint", lang)}</Text>
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
  pic: { width: "100%", height: "100%" },
  glaze: { position: "absolute", opacity: 0.5 },
  loading: {
    width: "72%",
    height: "72%",
    alignSelf: "center",
    marginTop: "14%",
    borderRadius: 10,
    backgroundColor: "#eef0ee",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fallbackGlyph: { fontSize: 46, textAlign: "center", width: "100%" },
  empty: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "42%",
    textAlign: "center",
    color: colors.textLight,
    fontSize: 12.5,
  },
});
