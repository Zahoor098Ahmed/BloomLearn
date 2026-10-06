import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import { colors, type, radius } from "../theme";
import FaceScannerView from "../components/FaceScannerView";
import {
  type ChildProfile,
  loadProfiles,
  getCachedProfiles,
  setActiveChild,
  subscribeProfiles,
} from "../modules/childProfiles";
import {
  findMatch,
  SIMILARITY_THRESHOLD,
} from "../modules/faceEngine";
import ChildEnrollmentModal from "../components/ChildEnrollmentModal";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";

interface RecognitionResult {
  recognized: boolean;
  matchedChild: ChildProfile | null;
  confidence: number;
}

interface Props {
  onSuccess: (child: ChildProfile) => void;
  onOpenParentSettings?: () => void;
}

export default function FaceAuthScreen({
  onSuccess,
  onOpenParentSettings,
}: Props) {
  const { settings } = useSettings();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [unrecognizedFace, setUnrecognizedFace] = useState<{ photo?: string; vector?: number[] } | null>(null);
  const [statusTitle, setStatusTitle] = useState("Scanning Face...");
  const [statusSub, setStatusSub] = useState("Look directly at the camera");
  const isProcessingRef = useRef(false);
  const unrecogCountRef = useRef(0);
  const hasRedirectedRef = useRef(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning 👋" : hour < 17 ? "Good Afternoon 👋" : "Good Evening 👋";

  useEffect(() => {
    loadProfiles().then((list) => {
      setProfiles([...list]);
    });
    const unsub = subscribeProfiles((list) => {
      setProfiles([...list]);
    });
    return unsub;
  }, []);

  // Voice guidance when Face Authentication screen opens
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(
        settings.language === "ar-SA"
          ? "مرحباً بكم في بلوم ليرن. يرجى النظر إلى الكاميرا للتعرف على الوجه."
          : "Welcome to BloomLearn. Look into the camera to scan your face.",
        settings.language || "en-US",
        true
      );
    }, 450);
    return () => clearTimeout(timer);
  }, [settings.language]);

  async function handleProbeVector(probeVector: number[], photoUri?: string) {
    if (
      isProcessingRef.current ||
      analyzing ||
      result?.recognized ||
      showAddModal ||
      hasRedirectedRef.current
    ) {
      return;
    }
    isProcessingRef.current = true;
    setAnalyzing(true);
    setStatusTitle("Analyzing Face...");
    setStatusSub("Checking face biometrics...");

    try {
      // 100% On-Device mathematical feature vector matching via faceEngine (Threshold = 0.78)
      const match = findMatch(probeVector, profiles);

      if (match && match.score >= SIMILARITY_THRESHOLD) {
        unrecogCountRef.current = 0;
        setResult({
          recognized: true,
          matchedChild: match.child,
          confidence: match.score,
        });
        setStatusTitle(`Welcome, ${match.child.name}!`);
        setStatusSub(`${Math.round(match.score * 100)}% Match • Loading learning plan...`);

        // Spoken audio feedback on successful recognition
        speak(
          settings.language === "ar-SA"
            ? `أهلاً بك يا ${match.child.name}! جارٍ تحميل خطتك التعليمية.`
            : `Welcome back, ${match.child.name}! Loading your learning plan.`,
          settings.language || "en-US",
          true
        );

        await setActiveChild(match.child.id);

        setTimeout(() => {
          if (match.child) onSuccess(match.child);
        }, 1200);
      } else {
        // Face detected, but does not match any enrolled child profile -> DIRECT REDIRECT to Add Child
        hasRedirectedRef.current = true;
        unrecogCountRef.current = 0;
        setStatusTitle("New Face Detected!");
        setStatusSub("Opening child profile setup...");

        speak(
          settings.language === "ar-SA"
            ? "لم يتم التعرف على الوجه. يرجى إضافة تفاصيل الطفل."
            : "Face not recognized. Opening form to add child.",
          settings.language || "en-US",
          true
        );

        // Do not pre-attach face photo so user fills form first and takes photo in Step 2
        setUnrecognizedFace(null);

        setTimeout(() => {
          setShowAddModal(true);
        }, 300);
      }
    } catch (err) {
      console.warn("[FaceAuth] Error matching:", err);
      setStatusSub("Checking face...");
    } finally {
      setAnalyzing(false);
      // Keep isProcessingRef true if redirected to stop any in-flight background probes
      if (!hasRedirectedRef.current) {
        isProcessingRef.current = false;
      }
    }
  }

  function handleEnrollSaved(saved: ChildProfile) {
    setShowAddModal(false);
    setUnrecognizedFace(null);
    unrecogCountRef.current = 0;

    speak(
      settings.language === "ar-SA"
        ? `تم حفظ ملف ${saved.name} بنجاح! مرحباً بك في بلوم ليرن.`
        : `Child profile saved! Welcome to BloomLearn, ${saved.name}!`,
      settings.language || "en-US",
      true
    );

    const nextList = getCachedProfiles();
    setProfiles([...nextList]);
    setActiveChild(saved.id).then(() => {
      onSuccess(saved);
    });
  }

  return (
    <View style={styles.background}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand & Greeting matching BloomLearn theme */}
          <View style={styles.header}>
            <Logo size={52} />
            <Text style={styles.brandTitle}>BloomLearn</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>

          {/* Centered Circular Camera Scanner */}
          <View style={styles.circleWrapper}>
            <FaceScannerView
              circular={true}
              size={224}
              autoScan={!showAddModal && !result?.recognized && !analyzing && !hasRedirectedRef.current}
              isScanning={analyzing}
              onCaptureVector={handleProbeVector}
            />
          </View>

          {/* Status Card matching BloomLearn card theme */}
          <View style={styles.statusCard}>
            <View style={[styles.statusIconBadge, result?.recognized && styles.statusIconBadgeSuccess]}>
              <Ionicons
                name={result?.recognized ? "checkmark-circle" : analyzing ? "scan" : "sparkles"}
                size={22}
                color={result?.recognized ? colors.forest : colors.forestDark}
              />
            </View>
            <Text style={[styles.statusTitle, result?.recognized && { color: colors.forest }]}>
              {statusTitle}
            </Text>
            <Text style={styles.statusSub}>{statusSub}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={({ pressed }) => [styles.primaryActionBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="person-add" size={19} color="white" />
              <Text style={styles.primaryActionText}>Add a Child</Text>
            </Pressable>

            {onOpenParentSettings && (
              <Pressable
                onPress={onOpenParentSettings}
                style={({ pressed }) => [styles.parentLinkBtn, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="lock-closed-outline" size={15} color={colors.textMid} />
                <Text style={styles.parentLinkText}>Parent & Doctor Settings</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Child Enrollment Modal */}
      <ChildEnrollmentModal
        visible={showAddModal}
        initialPhoto={unrecognizedFace?.photo}
        initialVector={unrecognizedFace?.vector}
        onClose={() => {
          setShowAddModal(false);
          setUnrecognizedFace(null);
          unrecogCountRef.current = 0;
          setStatusTitle("Scanning Face...");
          setStatusSub("Look directly at the camera");
          setTimeout(() => {
            hasRedirectedRef.current = false;
            isProcessingRef.current = false;
          }, 2000);
        }}
        onSaved={handleEnrollSaved}
        onDelete={async () => {
          const list = await loadProfiles();
          setProfiles([...list]);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
    gap: 4,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.textDark,
    letterSpacing: -0.5,
    marginTop: 6,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMid,
  },
  circleWrapper: {
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 14,
    maxWidth: 360,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.forestLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statusIconBadgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
  },
  statusSub: {
    fontSize: 13,
    color: colors.textMid,
    marginTop: 3,
    textAlign: "center",
  },
  actionsContainer: {
    width: "100%",
    maxWidth: 360,
    marginTop: 18,
    gap: 10,
    alignItems: "center",
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.forest,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius,
    width: "100%",
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "800",
    color: "white",
  },
  parentLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  parentLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMid,
  },
});
