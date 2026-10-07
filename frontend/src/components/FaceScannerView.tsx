import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../theme";
import {
  extractEmbeddingFromGrayscale,
  captureEmbedding,
  generateFeatureVectorFromString,
} from "../modules/faceEngine";

export interface FaceScannerRef {
  capture: () => Promise<void>;
  flipCamera: () => void;
}

interface Props {
  onCaptureVector: (vector: number[], photoUri?: string) => void;
  statusText?: string;
  isScanning?: boolean;
  autoScan?: boolean;
  actionLabel?: string;
  circular?: boolean;
  size?: number;
}

const FaceScannerView = forwardRef<FaceScannerRef, Props>(function FaceScannerView(
  {
    onCaptureVector,
    statusText,
    isScanning = false,
    autoScan = true,
    actionLabel = "Scan Face",
    circular = false,
    size = 240,
  },
  ref
) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");
  const [ready, setReady] = useState(false);

  const nativeCameraRef = useRef<any>(null);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const webCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);

  // Animated laser scanning line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  // Web camera setup using native HTML5 getUserMedia
  useEffect(() => {
    if (Platform.OS !== "web") return;

    let mounted = true;
    async function startWebCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing === "front" ? "user" : "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        webStreamRef.current = stream;
        if (webVideoRef.current) {
          webVideoRef.current.srcObject = stream;
          webVideoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (err) {
        console.warn("[FaceScanner] Web camera access failed:", err);
      }
    }

    startWebCamera();

    return () => {
      mounted = false;
      if (webStreamRef.current) {
        webStreamRef.current.getTracks().forEach((t) => t.stop());
        webStreamRef.current = null;
      }
    };
  }, [cameraFacing]);

  // Native camera: wait for onCameraReady (again after a flip). The timer is
  // only a fallback for a device that never fires it — a photo taken before
  // the camera is ready fails with "Failed to capture image".
  useEffect(() => {
    if (Platform.OS !== "web") {
      setReady(false);
      const t = setTimeout(() => setReady(true), 3000);
      return () => clearTimeout(t);
    }
  }, [cameraFacing]);

  // one photo at a time: overlapping takePictureAsync calls fail on Android
  const capturingRef = useRef(false);
  const failuresRef = useRef(0);

  // Frame capture & feature descriptor generation (100% on-device faceEngine)
  async function captureNow() {
    if (Platform.OS === "web") {
      if (!webVideoRef.current) return;
      const video = webVideoRef.current;
      if (!video.videoWidth || !video.videoHeight) return;

      const minDim = Math.min(video.videoWidth, video.videoHeight);
      const sx = Math.max(0, (video.videoWidth - minDim) / 2);
      const sy = Math.max(0, (video.videoHeight - minDim) / 2);

      // 1. High-resolution canvas for crisp photo preview (240x240)
      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = 240;
      previewCanvas.height = 240;
      const pCtx = previewCanvas.getContext("2d");
      if (pCtx) {
        pCtx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 240, 240);
      }
      const photoDataUrl = previewCanvas.toDataURL("image/jpeg", 0.85);

      // 2. 48x48 canvas for 128D mathematical embedding
      const canvas = webCanvasRef.current || document.createElement("canvas");
      webCanvasRef.current = canvas;
      canvas.width = 48;
      canvas.height = 48;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 48, 48);
      const imgData = ctx.getImageData(0, 0, 48, 48);
      const gray: number[] = new Array(48 * 48);
      for (let i = 0; i < 48 * 48; i++) {
        const r = imgData.data[i * 4];
        const g = imgData.data[i * 4 + 1];
        const b = imgData.data[i * 4 + 2];
        gray[i] = r * 0.299 + g * 0.587 + b * 0.114;
      }
      const vector = extractEmbeddingFromGrayscale(gray);
      if (!vector) return; // Blank Wall Guard triggered: reject flat/empty frames

      onCaptureVector(vector, photoDataUrl);
      return;
    }

    // Native CameraView
    if (nativeCameraRef.current && !capturingRef.current) {
      capturingRef.current = true;
      try {
        const photo = await nativeCameraRef.current.takePictureAsync({
          quality: 0.6,
          skipProcessing: false,
          shutterSound: false, // it scans every 1.5s — no clicking
        });
        failuresRef.current = 0;
        if (photo?.uri) {
          const vector = await captureEmbedding(photo.uri, {
            width: photo.width,
            height: photo.height,
          });
          if (vector) {
            onCaptureVector(vector, photo.uri);
          }
        }
      } catch (err) {
        // log the first failure only, not one line every 1.5s
        if (failuresRef.current++ === 0) console.warn("[FaceScanner] Native capture error:", err);
      } finally {
        capturingRef.current = false;
      }
    }
  }

  // Auto scan interval
  useEffect(() => {
    if (!autoScan || !ready || isScanning) return;
    const timer = setInterval(() => {
      if (!isScanning) {
        captureNow();
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [autoScan, ready, isScanning]);

  useImperativeHandle(ref, () => ({
    capture: captureNow,
    flipCamera: () => setCameraFacing((c) => (c === "front" ? "back" : "front")),
  }));

  const travelRange = circular ? size / 2 - 15 : 110;
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-travelRange, travelRange],
  });

  if (Platform.OS !== "web" && !permission?.granted) {
    return (
      <View style={[styles.permissionBox, circular && { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="camera-outline" size={32} color={colors.forest} />
        {!circular && (
          <>
            <Text style={styles.permTitle}>Camera Permission Required</Text>
            <Text style={styles.permSub}>
              Camera access is needed to recognize child faces and load their doctor plans.
            </Text>
          </>
        )}
        <Pressable onPress={() => requestPermission()} style={[styles.permBtn, circular && { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16 }]}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  // Circular view mode as shown in user's screenshot
  if (circular) {
    return (
      <View style={[styles.circleContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Live Camera View */}
        {Platform.OS === "web" ? (
          <View style={StyleSheet.absoluteFill}>
            <video
              ref={webVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: cameraFacing === "front" ? "scaleX(-1)" : "none",
              }}
            />
          </View>
        ) : (
          <CameraView
            ref={nativeCameraRef}
            facing={cameraFacing}
            style={StyleSheet.absoluteFill}
            onCameraReady={() => setReady(true)}
          />
        )}

        {/* Circular Overlay with Reticle & Laser Beam */}
        <View style={styles.circleOverlay}>
          {/* Inner Dashed Reticle */}
          <View style={[styles.innerCircleReticle, { width: size * 0.78, height: size * 0.78, borderRadius: (size * 0.78) / 2 }]} />

          {/* Animated Neon Green Laser Line */}
          <Animated.View style={[styles.circleScanLine, { transform: [{ translateY }] }]} />

          {/* Flip camera button */}
          <Pressable
            onPress={() => setCameraFacing((c) => (c === "front" ? "back" : "front"))}
            style={styles.circleFlipBtn}
            hitSlop={8}
            accessibilityLabel="Flip camera"
          >
            <Ionicons name="camera-reverse-outline" size={17} color="white" />
          </Pressable>
        </View>
      </View>
    );
  }

  // Standard Rectangular Container (used inside Enrollment modal)
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.cameraFrame}>
          <video
            ref={webVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: cameraFacing === "front" ? "scaleX(-1)" : "none",
            }}
          />
        </View>
      ) : (
        <CameraView
          ref={nativeCameraRef}
          facing={cameraFacing}
          style={StyleSheet.absoluteFill}
          onCameraReady={() => setReady(true)}
        />
      )}

      <View style={styles.overlay}>
        <View style={styles.ovalTarget}>
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.statusBadge}>
          {isScanning && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
          <Text style={styles.statusText}>{statusText || "Align face inside the oval"}</Text>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => setCameraFacing((c) => (c === "front" ? "back" : "front"))}
            style={styles.iconCircle}
            accessibilityLabel="Flip camera"
          >
            <Ionicons name="camera-reverse-outline" size={22} color="white" />
          </Pressable>

          <Pressable
            onPress={captureNow}
            disabled={isScanning}
            style={({ pressed }) => [
              styles.captureBtn,
              isScanning && { opacity: 0.6 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="scan" size={20} color={colors.forest} />
            <Text style={styles.captureBtnText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export default FaceScannerView;

const styles = StyleSheet.create({
  circleContainer: {
    alignSelf: "center",
    borderWidth: 4,
    borderColor: colors.forest,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#162820",
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  circleOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  innerCircleReticle: {
    borderWidth: 1.5,
    borderColor: "rgba(243, 227, 189, 0.75)",
    borderStyle: "dashed",
    position: "absolute",
  },
  circleScanLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#34d399",
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  circleFlipBtn: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    height: 340,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111",
    position: "relative",
  },
  cameraFrame: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#1c1c1e",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  ovalTarget: {
    width: 190,
    height: 230,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.85)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    overflow: "hidden",
    position: "relative",
  },
  scanLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  corner: {
    position: "absolute",
    width: 16,
    height: 16,
    borderColor: "#10b981",
  },
  cornerTL: { top: 10, left: 20, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 10, right: 20, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 10, left: 20, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 10, right: 20, borderBottomWidth: 3, borderRightWidth: 3 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statusText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    width: "100%",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  captureBtnText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: "800",
  },
  permissionBox: {
    height: 280,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark,
    marginTop: 10,
  },
  permSub: {
    fontSize: 12.5,
    color: colors.textMid,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 17,
  },
  permBtn: {
    marginTop: 16,
    backgroundColor: colors.forest,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  permBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
});
