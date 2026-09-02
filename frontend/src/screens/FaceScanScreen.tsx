import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { ChildProfile } from "../types";
import { loadChildren } from "../modules/storage";
import { captureEmbedding, findMatch } from "../modules/faceEngine";
import { useSettings } from "../context/SettingsContext";
import { t } from "../modules/i18n";
import { speak } from "../modules/tts";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import { colors } from "../theme";

interface Props {
  onMatch: (child: ChildProfile) => void;
  onNoMatch: () => void;
  onParentArea: () => void;
}

type Phase = "scanning" | "found" | "nomatch" | "error";

export default function FaceScanScreen({ onMatch, onNoMatch, onParentArea }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [foundName, setFoundName] = useState("");
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
      return;
    }
    if (!streaming) return;

    let cancelled = false;
    async function run() {
      try {
        speak(t("scanning", lang), lang, settings.soundEnabled);
        await new Promise((r) => setTimeout(r, 1200));
        if (cancelled || !cameraRef.current) return;

        // Average a couple of shots (like enrollment does) so a single noisy
        // frame doesn't push the match score below threshold.
        let embedding: number[] | null = null;
        for (let shot = 0; shot < 3; shot++) {
          if (cancelled || !cameraRef.current) return;
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
          if (cancelled) return;
          if (!photo?.uri) continue;
          const emb = await captureEmbedding(photo.uri);
          if (emb.length === 0) continue;
          embedding = embedding ? embedding.map((v, i) => (v + emb[i]) / 2) : emb;
          if (shot < 2) await new Promise((r) => setTimeout(r, 250));
        }
        if (cancelled) return;

        if (!embedding) {
          setPhase("error");
          return;
        }
        const children = loadChildren();
        const match = findMatch(embedding, children);
        if (cancelled) return;

        if (match) {
          setFoundName(match.child.name);
          setPhase("found");
          speak(`${t("hello", lang)}, ${match.child.name}!`, lang, settings.soundEnabled);
          await new Promise((r) => setTimeout(r, 900));
          if (!cancelled) onMatch(match.child);
        } else {
          setPhase("nomatch");
          speak(t("noMatch", lang), lang, settings.soundEnabled);
          await new Promise((r) => setTimeout(r, 1200));
          if (!cancelled) onNoMatch();
        }
      } catch (err) {
        console.warn("Face scan failed:", err);
        if (!cancelled) setPhase("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [permission?.granted, streaming]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("morning", lang) : hour < 17 ? t("afternoon", lang) : hour < 21 ? t("evening", lang) : t("night", lang);

  const cameraReady = permission?.granted === true;
  const cameraUnavailable = permission?.granted === false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.greeting}>{greeting} 👋</Text>
        <Text style={styles.title}>KiddoCare</Text>
      </View>

      <View style={styles.cameraWrap}>
        {cameraReady ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="front" onCameraReady={() => setStreaming(true)} />
        ) : (
          <View style={[styles.camera, { backgroundColor: "#222" }]} />
        )}

        {phase === "scanning" && !settings.reduceMotion && <View style={styles.scanLine} />}

        {phase === "found" && (
          <View style={[styles.overlay, { backgroundColor: "rgba(45,95,79,0.85)" }]}>
            <Text style={{ fontSize: 44 }}>✓</Text>
            <Text style={styles.overlayName}>{foundName}</Text>
          </View>
        )}
        {phase === "nomatch" && (
          <View style={[styles.overlay, { backgroundColor: "rgba(240,221,196,0.9)" }]}>
            <Text style={{ fontSize: 44 }}>😊</Text>
          </View>
        )}
        {(phase === "error" || cameraUnavailable) && (
          <View style={[styles.overlay, { backgroundColor: "rgba(200,150,150,0.85)" }]}>
            <Text style={{ fontSize: 32 }}>📷</Text>
            <Text style={styles.overlayText}>Camera not available</Text>
          </View>
        )}
      </View>

      <Mascot mood={phase === "found" ? "excited" : phase === "nomatch" ? "love" : "thinking"} size={90} />

      <View style={{ alignItems: "center" }}>
        <Text style={styles.statusText}>
          {phase === "scanning" ? t("scanning", lang) : phase === "found" ? `${t("matchFound", lang)} 🎉` : phase === "nomatch" ? t("noMatch", lang) : "Camera unavailable"}
        </Text>
        {phase === "scanning" && <Text style={styles.statusSub}>{t("scanningMessage", lang)}</Text>}
      </View>

      {(phase === "error" || cameraUnavailable) && (
        <BigButton variant="primary" onPress={onNoMatch} style={{ width: "100%", maxWidth: 320 }}>
          Continue Without Camera
        </BigButton>
      )}

      <View style={styles.footer}>
        <Pressable onPress={onParentArea} style={styles.parentBtn}>
          <Text style={styles.parentBtnText}>🔒 {t("parentPin", lang)}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: "center", padding: 24, paddingTop: 40, gap: 24 },
  greeting: { fontSize: 15, color: colors.textLight },
  title: { fontSize: 32, fontWeight: "800", color: colors.textDark, marginTop: 4 },
  cameraWrap: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden",
    borderWidth: 5,
    borderColor: colors.forest,
    backgroundColor: "#222",
  },
  camera: { width: "100%", height: "100%" },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "48%",
    height: 3,
    backgroundColor: colors.greenDeep,
  },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 8 },
  overlayName: { color: "white", fontSize: 18, fontWeight: "700" },
  overlayText: { color: "white", fontSize: 14, textAlign: "center", paddingHorizontal: 16 },
  statusText: { fontSize: 21, color: colors.textDark, fontWeight: "700", textAlign: "center" },
  statusSub: { color: colors.textLight, fontSize: 14, marginTop: 6, textAlign: "center" },
  footer: { marginTop: "auto", paddingBottom: 24 },
  parentBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  parentBtnText: { color: colors.textLight, fontSize: 13 },
});
