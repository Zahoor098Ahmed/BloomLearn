import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import {
  type ChildProfile,
  type DoctorPrescription,
  saveProfile,
  deleteProfile,
  getCachedProfiles,
} from "../modules/childProfiles";
import { SUBJECT_LIST, type Grade, type SubjectId } from "../modules/curriculum";
import FaceScannerView, { type FaceScannerRef } from "./FaceScannerView";
import {
  generateFeatureVectorFromString,
  mergeEmbeddings,
  findMatch,
  SIMILARITY_THRESHOLD,
} from "../modules/faceEngine";
import { useSettings } from "../context/SettingsContext";
import { speak } from "../modules/tts";

interface Props {
  visible: boolean;
  initialProfile?: ChildProfile | null;
  initialPhoto?: string;
  initialVector?: number[];
  onClose: () => void;
  onSaved: (saved: ChildProfile) => void;
  onDelete?: (deletedId: string) => void;
}

const AVATARS = ["🦁", "🌸", "🚀", "🎨", "🤖", "⭐", "🐬", "🐼", "🦊", "👑"];

const POPULAR_CHAPTERS: { id: string; label: string; subject: SubjectId }[] = [
  { id: "math-count-5", label: "Math: Counting to 5", subject: "math" },
  { id: "math-add-5", label: "Math: Adding up to 5", subject: "math" },
  { id: "math-sub-5", label: "Math: Subtracting within 5", subject: "math" },
  { id: "eng-prepositions", label: "English: Prepositions (in, on, under)", subject: "english" },
  { id: "eng-g1-animals", label: "English: Everyday Animals", subject: "english" },
  { id: "sci-senses", label: "Science: The 5 Senses", subject: "science" },
  { id: "sci-living", label: "Science: Living vs Non-Living", subject: "science" },
];

export default function ChildEnrollmentModal({
  visible,
  initialProfile,
  initialPhoto,
  initialVector,
  onClose,
  onSaved,
  onDelete,
}: Props) {
  const { settings } = useSettings();
  const isEditing = !!initialProfile;

  // Wizard Step: "form" (Name, Age, Doctor details - NO CAMERA) -> "camera" (Single photo snap & conflict check)
  const [step, setStep] = useState<"form" | "camera">("form");

  const [name, setName] = useState(initialProfile?.name ?? "");
  const [age, setAge] = useState(String(initialProfile?.age ?? 6));
  const [avatarIcon, setAvatarIcon] = useState(initialProfile?.avatarIcon ?? "🦁");

  // Doctor prescription fields
  const [doctorName, setDoctorName] = useState(
    initialProfile?.prescription?.prescribedBy ?? ""
  );
  const [doctorNotes, setDoctorNotes] = useState(
    initialProfile?.prescription?.notes ?? ""
  );
  const [assignedSubjects, setAssignedSubjects] = useState<SubjectId[]>(
    initialProfile?.prescription?.assignedSubjects ?? ["english", "math"]
  );
  const [assignedGrade, setAssignedGrade] = useState<Grade>(
    initialProfile?.prescription?.assignedGrade ?? 1
  );
  const [focusChapters, setFocusChapters] = useState<string[]>(
    initialProfile?.prescription?.focusChapterIds ?? []
  );
  const [dailyGoal, setDailyGoal] = useState(
    String(initialProfile?.prescription?.dailySentenceGoal ?? 5)
  );

  // Biometric samples & camera state
  const [samples, setSamples] = useState<number[][]>(
    initialProfile?.faceEnrollment?.featureVectors ?? (initialProfile?.embedding ? [initialProfile.embedding] : [])
  );
  const [lastPhoto, setLastPhoto] = useState<string | undefined>(
    initialProfile?.photoUrl || initialProfile?.faceEnrollment?.photoUri
  );
  const [isRetaking, setIsRetaking] = useState(!initialProfile?.photoUrl && !initialProfile?.faceEnrollment?.photoUri);
  const [isSnapping, setIsSnapping] = useState(false);

  const scannerRef = useRef<FaceScannerRef>(null);

  // Synchronize state every time modal opens
  React.useEffect(() => {
    if (visible) {
      setStep("form"); // Always start on the form step (no camera on Step 1)
      if (initialProfile) {
        setName(initialProfile.name || "");
        setAge(String(initialProfile.age || 6));
        setAvatarIcon(initialProfile.avatarIcon || "🦁");
        setDoctorName(initialProfile.prescription?.prescribedBy || "");
        setDoctorNotes(initialProfile.prescription?.notes || "");
        setAssignedSubjects(initialProfile.prescription?.assignedSubjects || ["english", "math"]);
        setAssignedGrade(initialProfile.prescription?.assignedGrade || 1);
        setFocusChapters(initialProfile.prescription?.focusChapterIds || []);
        setDailyGoal(String(initialProfile.prescription?.dailySentenceGoal || 5));
        const vectors = initialProfile.faceEnrollment?.featureVectors || (initialProfile.embedding ? [initialProfile.embedding] : []);
        setSamples(vectors);
        const photo = initialProfile.photoUrl || initialProfile.faceEnrollment?.photoUri;
        setLastPhoto(photo);
        setIsRetaking(!photo);
      } else {
        setName("");
        setAge("6");
        setAvatarIcon("🦁");
        setDoctorName("");
        setDoctorNotes("");
        setAssignedSubjects(["english", "math"]);
        setAssignedGrade(1);
        setFocusChapters([]);
        setDailyGoal("5");
        setSamples([]);
        setLastPhoto(undefined);
        setIsRetaking(true);
      }
      setIsSnapping(false);
    }
  }, [visible, initialProfile]);

  function toggleSubject(id: SubjectId) {
    if (assignedSubjects.includes(id)) {
      if (assignedSubjects.length === 1) {
        Alert.alert("At least one subject must be assigned.");
        return;
      }
      setAssignedSubjects(assignedSubjects.filter((s) => s !== id));
    } else {
      setAssignedSubjects([...assignedSubjects, id]);
    }
  }

  function toggleChapter(id: string) {
    if (focusChapters.includes(id)) {
      setFocusChapters(focusChapters.filter((c) => c !== id));
    } else {
      setFocusChapters([...focusChapters, id]);
    }
  }

  // Step 1 -> Step 2 validation & transition
  function handleProceedToCamera() {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert("Child Name Required", "Please enter the child's name first.");
      speak(
        settings.language === "ar-SA"
          ? "يرجى كتابة اسم الطفل أولاً."
          : "Please enter the child's name first.",
        settings.language || "en-US",
        true
      );
      return;
    }

    setStep("camera");
    speak(
      settings.language === "ar-SA"
        ? `الآن التقط صورة وجه ${cleanName}.`
        : `Now take one photo of ${cleanName}'s face.`,
      settings.language || "en-US",
      true
    );
  }

  // 1 single verified photo snap callback (Step 2)
  function handleCaptureSample(vector: number[], photoUri?: string) {
    // 1. Conflict Check: verify this face does NOT already belong to another child
    const existingList = getCachedProfiles();
    const otherChildren = existingList.filter((p) => p.id !== initialProfile?.id);
    const conflict = findMatch(vector, otherChildren);

    if (conflict && conflict.score >= SIMILARITY_THRESHOLD) {
      setIsSnapping(false);
      setIsRetaking(true);
      Alert.alert(
        "Face Already Registered",
        `This face is already registered to ${conflict.child.name} (${Math.round(conflict.score * 100)}% match).\n\nPlease make sure ${name.trim() || "the new child"} looks at the camera.`,
        [{ text: "OK" }]
      );
      speak(
        settings.language === "ar-SA"
          ? `هذا الوجه مسجل بالفعل باسم ${conflict.child.name}. يرجى تصوير الطفل الجديد.`
          : `This face already belongs to ${conflict.child.name}. Please scan ${name.trim() || "the new child"}'s face.`,
        settings.language || "en-US",
        true
      );
      return;
    }

    // 2. Single verified photo captured
    setSamples([vector]);
    if (photoUri) setLastPhoto(photoUri);
    setIsRetaking(false);
    setIsSnapping(false);

    speak(
      settings.language === "ar-SA"
        ? "تم التقاط صورة الوجه بنجاح! اضغط على حفظ لإنهاء التسجيل."
        : "Face photo verified successfully! Tap Save to finish.",
      settings.language || "en-US",
      true
    );
  }

  async function triggerSnap() {
    setIsSnapping(true);
    try {
      if (scannerRef.current) {
        await scannerRef.current.capture();
      }
    } finally {
      setTimeout(() => setIsSnapping(false), 1200);
    }
  }

  async function handleDelete() {
    if (!initialProfile) return;
    Alert.alert(
      "Delete Child Profile",
      `Are you sure you want to remove ${initialProfile.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteProfile(initialProfile.id);
            if (onDelete) onDelete(initialProfile.id);
            onClose();
          },
        },
      ]
    );
  }

  async function handleSave() {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert("Child Name Required", "Please enter child's name.");
      speak(
        settings.language === "ar-SA"
          ? "يرجى كتابة اسم الطفل أولاً."
          : "Please enter the child's name first.",
        settings.language || "en-US",
        true
      );
      return;
    }

    let finalSamples = samples;
    if (finalSamples.length === 0) {
      // Guide user to take photo on Step 2
      Alert.alert("Photo Required", "Please take 1 photo of child's face before saving.");
      setStep("camera");
      speak(
        settings.language === "ar-SA"
          ? "يرجى التقاط صورة وجه الطفل أولاً."
          : "Please take a photo of child's face first.",
        settings.language || "en-US",
        true
      );
      return;
    } else {
      // Double check face conflict before saving
      const existingList = getCachedProfiles();
      const otherChildren = existingList.filter((p) => p.id !== initialProfile?.id);
      for (const s of finalSamples) {
        const conflict = findMatch(s, otherChildren);
        if (conflict && conflict.score >= SIMILARITY_THRESHOLD) {
          Alert.alert(
            "Face Conflict",
            `This face is already assigned to ${conflict.child.name}. You cannot assign the same face to ${cleanName}.`
          );
          speak(
            settings.language === "ar-SA"
              ? `هذا الوجه مسجل بالفعل باسم ${conflict.child.name}.`
              : `This face already belongs to ${conflict.child.name}. You cannot assign it to ${cleanName}.`,
            settings.language || "en-US",
            true
          );
          return;
        }
      }
    }

    // Merge photo into averaged, unit-normalized 128D embedding
    const mergedEmbedding = mergeEmbeddings(finalSamples);

    const prescription: DoctorPrescription = {
      prescribedBy: doctorName.trim() || "Parent / Doctor Plan",
      notes:
        doctorNotes.trim() ||
        `Doctor prescribed personalized ${assignedSubjects.join(", ")} content for Grade ${assignedGrade}.`,
      assignedSubjects,
      assignedGrade,
      focusChapterIds: focusChapters,
      dailySentenceGoal: Math.max(1, Number(dailyGoal) || 5),
      speechRate: 0.88,
    };

    const profileToSave: ChildProfile = {
      id: initialProfile?.id ?? `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      age: Math.max(2, Number(age) || 5),
      avatarIcon,
      photoUrl: lastPhoto,
      embedding: mergedEmbedding,
      biometricVersion: 2,
      prescription,
      faceEnrollment: {
        enrolledAt: new Date().toISOString(),
        photoUri: lastPhoto,
        featureVectors: finalSamples,
      },
      createdAt: initialProfile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveProfile(profileToSave);
    onSaved(saved);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheetContainer} edges={["top", "bottom"]}>
        {/* Modal Top Header */}
        <View style={styles.header}>
          {step === "camera" ? (
            <Pressable onPress={() => setStep("form")} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color={colors.textDark} />
              <Text style={styles.backBtnText}>Details</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textDark} />
            </Pressable>
          )}

          <Text style={styles.headerTitle}>
            {step === "form"
              ? isEditing
                ? "Edit Child Details"
                : "Step 1: Child Details"
              : "Step 2: Face Photo"}
          </Text>

          {step === "camera" && samples.length > 0 ? (
            <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          ) : step === "form" && isEditing && samples.length > 0 ? (
            <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          ) : step === "form" ? (
            <Pressable onPress={handleProceedToCamera} style={styles.nextPillBtn} hitSlop={8}>
              <Text style={styles.nextPillText}>Next ➔</Text>
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* Wizard Stepper Tabs */}
        <View style={styles.wizardStepper}>
          <Pressable
            onPress={() => setStep("form")}
            style={[styles.stepTab, step === "form" && styles.stepTabActive]}
          >
            <View style={[styles.stepBadge, step === "form" ? styles.stepBadgeActive : styles.stepBadgeDone]}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={[styles.stepTabText, step === "form" && styles.stepTabTextActive]}>
              Child Details
            </Text>
          </Pressable>

          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />

          <Pressable
            onPress={() => {
              if (!name.trim()) {
                handleProceedToCamera();
              } else {
                setStep("camera");
              }
            }}
            style={[styles.stepTab, step === "camera" && styles.stepTabActive]}
          >
            <View
              style={[
                styles.stepBadge,
                step === "camera"
                  ? styles.stepBadgeActive
                  : samples.length > 0
                  ? styles.stepBadgeDone
                  : styles.stepBadgeInactive,
              ]}
            >
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={[styles.stepTabText, step === "camera" && styles.stepTabTextActive]}>
              Face Photo
            </Text>
          </Pressable>
        </View>

        {/* STEP 1: FORM ONLY (NO CAMERA / NO IMAGE OPTION HERE) */}
        {step === "form" ? (
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Child Identity Card */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.stepNum}>
                  <Ionicons name="person" size={14} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeader}>Child Information</Text>
                  <Text style={styles.cardSub}>Enter child profile name, avatar and age.</Text>
                </View>
              </View>

              <View style={styles.avatarRow}>
                {AVATARS.map((av) => (
                  <Pressable
                    key={av}
                    onPress={() => setAvatarIcon(av)}
                    style={[styles.avatarChoice, avatarIcon === av && styles.avatarSelected]}
                  >
                    <Text style={{ fontSize: 24 }}>{av}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Child Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sara or Ahmed"
                  placeholderTextColor={colors.textLight}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholder="6"
                    placeholderTextColor={colors.textLight}
                    style={styles.textInput}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Daily Target Sentences</Text>
                  <TextInput
                    value={dailyGoal}
                    onChangeText={setDailyGoal}
                    keyboardType="number-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textLight}
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            {/* Doctor Prescription & Assigned Content */}
            <View style={[styles.card, { borderColor: "#c3e6cb", backgroundColor: "#fbfefc" }]}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.forest }]}>
                  <Ionicons name="medkit" size={14} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeader, { color: colors.forest }]}>
                    Doctor / Therapist Prescription
                  </Text>
                  <Text style={styles.cardSub}>
                    Assigned subjects and clinical guidance. Sibling will not see this content.
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor / Specialist Name</Text>
                <TextInput
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder="e.g. Dr. Fatima (Speech & Cognitive Therapy)"
                  placeholderTextColor={colors.textLight}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor's Clinical Notes / Guidance</Text>
                <TextInput
                  value={doctorNotes}
                  onChangeText={setDoctorNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Focus on counting and visual objects for sensory development."
                  placeholderTextColor={colors.textLight}
                  style={[styles.textInput, { height: 72, textAlignVertical: "top" }]}
                />
              </View>

              {/* Assigned Subjects */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Assigned Subjects (Doctor Plan)</Text>
              <View style={styles.subjectRow}>
                {SUBJECT_LIST.map((s) => {
                  const checked = assignedSubjects.includes(s.id);
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => toggleSubject(s.id)}
                      style={[styles.subjectChip, checked && styles.subjectChipActive]}
                    >
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={checked ? "white" : colors.textMid}
                      />
                      <Text style={[styles.subjectChipText, checked && { color: "white", fontWeight: "800" }]}>
                        {s.id.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Assigned Grade */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Assigned Grade</Text>
              <View style={styles.gradeRow}>
                {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setAssignedGrade(g)}
                    style={[styles.gradeBtn, assignedGrade === g && styles.gradeBtnActive]}
                  >
                    <Text style={[styles.gradeBtnText, assignedGrade === g && { color: "white" }]}>
                      Grade {g}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Focus Chapters */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                Focus Chapters (Highlighted with ★ Doctor Badge)
              </Text>
              <View style={{ gap: 8, marginTop: 4 }}>
                {POPULAR_CHAPTERS.filter((c) => assignedSubjects.includes(c.subject)).map((c) => {
                  const on = focusChapters.includes(c.id);
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => toggleChapter(c.id)}
                      style={[styles.chapterPick, on && styles.chapterPickOn]}
                    >
                      <Ionicons
                        name={on ? "star" : "star-outline"}
                        size={18}
                        color={on ? colors.yellowDeep : colors.textLight}
                      />
                      <Text style={[styles.chapterPickText, on && { fontWeight: "700", color: colors.textDark }]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Next: Step 2 Button */}
            <Pressable onPress={handleProceedToCamera} style={styles.bottomNextBtn}>
              <Text style={styles.bottomNextText}>Next: Take Child's Photo</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>

            {isEditing && (
              <Pressable onPress={handleDelete} style={styles.bottomDeleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                <Text style={styles.bottomDeleteText}>Delete This Child Profile</Text>
              </Pressable>
            )}
          </ScrollView>
        ) : (
          /* STEP 2: CAMERA STEP (1 SINGLE PHOTO SNAP + CONFLICT CHECK) */
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.stepNum}>
                  <Ionicons name="camera" size={14} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeader}>Take 1 Photo of {name.trim() || "Child"}</Text>
                  <Text style={styles.cardSub}>
                    Align child's face in the circular frame. Sibling or other child's face will be rejected.
                  </Text>
                </View>
              </View>

              {/* Circular Camera or Photo Preview */}
              <View style={styles.cameraBoxCenter}>
                {lastPhoto && !isRetaking && samples.length > 0 ? (
                  <View style={styles.photoPreviewWrapper}>
                    <Image source={{ uri: lastPhoto }} style={styles.photoPreviewImage} />
                    <View style={styles.checkPill}>
                      <Ionicons name="checkmark-circle" size={18} color="#15803d" />
                      <Text style={styles.checkPillText}>Face Enrolled</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.circularScannerWrapper}>
                    <FaceScannerView
                      ref={scannerRef}
                      circular={true}
                      size={220}
                      autoScan={false}
                      isScanning={isSnapping}
                      onCaptureVector={handleCaptureSample}
                    />
                  </View>
                )}
              </View>

              {/* Action Buttons: Snap / Retake */}
              {lastPhoto && !isRetaking && samples.length > 0 ? (
                <View style={{ alignItems: "center", gap: 12, marginTop: 10 }}>
                  <View style={styles.verifiedCard}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.forest} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.verifiedCardTitle}>Biometrics Ready for {name.trim()}</Text>
                      <Text style={styles.verifiedCardSub}>Face is unique and verified on-device.</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => {
                      setIsRetaking(true);
                      setSamples([]);
                    }}
                    style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Ionicons name="camera-reverse" size={17} color={colors.forestDark} />
                    <Text style={styles.secondaryBtnText}>Retake Photo</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ alignItems: "center", marginTop: 14 }}>
                  <Pressable
                    onPress={triggerSnap}
                    disabled={isSnapping}
                    style={({ pressed }) => [
                      styles.primarySnapBtn,
                      isSnapping && { opacity: 0.6 },
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Ionicons name="camera" size={22} color="white" />
                    <Text style={styles.primarySnapBtnText}>
                      {isSnapping ? "Capturing..." : `Snap ${name.trim() || "Child"}'s Face`}
                    </Text>
                  </Pressable>
                  <Text style={styles.cameraTipText}>
                    Hold camera in front of {name.trim() || "the child"} and tap Snap once.
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Final Save Button */}
            {samples.length > 0 ? (
              <Pressable onPress={handleSave} style={styles.bottomSaveBtn}>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.bottomSaveText}>Save & Add Child Profile</Text>
              </Pressable>
            ) : (
              <View style={styles.bottomSnapHintBtn}>
                <Ionicons name="camera-outline" size={20} color={colors.textLight} />
                <Text style={styles.bottomSnapHintText}>Please snap 1 photo above to finish</Text>
              </View>
            )}

            <Pressable onPress={() => setStep("form")} style={styles.bottomBackBtn}>
              <Ionicons name="arrow-back" size={18} color={colors.forestDark} />
              <Text style={styles.bottomBackText}>Back to Child Details</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  closeBtn: {
    padding: 6,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: colors.textDark,
  },
  saveBtn: {
    backgroundColor: colors.forest,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  nextPillBtn: {
    backgroundColor: colors.forest,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  nextPillText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13.5,
  },
  wizardStepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  stepTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  stepTabActive: {
    backgroundColor: colors.forestLight,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeActive: {
    backgroundColor: colors.forest,
  },
  stepBadgeDone: {
    backgroundColor: colors.forest,
  },
  stepBadgeInactive: {
    backgroundColor: colors.border,
  },
  stepBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  stepTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textLight,
  },
  stepTabTextActive: {
    color: colors.forestDark,
    fontWeight: "800",
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 44,
    gap: 16,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    fontSize: 16.5,
    fontWeight: "800",
    color: colors.textDark,
  },
  cardSub: {
    fontSize: 12.5,
    color: colors.textMid,
    marginTop: 2,
    lineHeight: 17,
  },
  cameraBoxCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  circularScannerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreviewWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: colors.forest,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#162820",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  checkPill: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  checkPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.forest,
  },
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.forestLight,
    borderWidth: 1,
    borderColor: "#a3d9b8",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
  },
  verifiedCardTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: colors.forestDark,
  },
  verifiedCardSub: {
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  primarySnapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.forest,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: colors.forest,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primarySnapBtnText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "800",
  },
  cameraTipText: {
    fontSize: 12.5,
    color: colors.textMid,
    marginTop: 8,
    textAlign: "center",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.cardMuted,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.forestDark,
  },
  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: colors.forest,
    backgroundColor: colors.forestLight,
  },
  inputGroup: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMid,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
    color: colors.textDark,
  },
  subjectRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  subjectChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  subjectChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDark,
  },
  gradeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  gradeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradeBtnActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  gradeBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.textDark,
  },
  chapterPick: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterPickOn: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellowDeep,
  },
  chapterPickText: {
    fontSize: 13,
    color: colors.textMid,
    flex: 1,
  },
  bottomNextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.forest,
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 8,
    shadowColor: colors.forest,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomNextText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  bottomSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.forest,
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 8,
    shadowColor: colors.forest,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  bottomSnapHintBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 8,
  },
  bottomSnapHintText: {
    color: colors.textMid,
    fontSize: 14,
    fontWeight: "600",
  },
  bottomBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  bottomBackText: {
    color: colors.forestDark,
    fontSize: 14,
    fontWeight: "700",
  },
  bottomDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 4,
  },
  bottomDeleteText: {
    color: "#dc2626",
    fontSize: 14.5,
    fontWeight: "800",
  },
});
