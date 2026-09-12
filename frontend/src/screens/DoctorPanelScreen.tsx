import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Share,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type {
  ChildProfile,
  ContentTag,
  TherapyGoal,
  DoctorContact,
  ClinicalNote,
  TherapyCategory,
} from "../types";
import { CONTENT_TAG_LABELS, DIAGNOSIS_LABELS } from "../types";
import {
  loadChildren,
  updateChild,
  getUsage,
  addTherapyGoal,
  updateTherapyGoal,
  deleteTherapyGoal,
  addClinicalNote,
  deleteClinicalNote,
  updateDoctorContact,
} from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { t, diagnosisLabel, wordLabel, type TKey } from "../modules/i18n";
import Mascot from "../components/Mascot";
import Card from "../components/Card";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
}

const ALL_TAGS = Object.keys(CONTENT_TAG_LABELS) as ContentTag[];
const DOCTOR_BLUE = "#0284c7";
const DOCTOR_DARK = "#0f172a";

type DoctorSubTab = "performance" | "therapy" | "notes" | "contact" | "permissions";

const SUB_TABS: { key: DoctorSubTab; labelKey: TKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "performance", labelKey: "tabAZPerformance", icon: "analytics" },
  { key: "therapy", labelKey: "tabTherapyGoalsShort", icon: "flag" },
  { key: "notes", labelKey: "tabClinicalNotes", icon: "document-text" },
  { key: "contact", labelKey: "tabDoctorContact", icon: "call" },
  { key: "permissions", labelKey: "tabContent", icon: "shield-checkmark" },
];

const THERAPY_CATEGORIES: { key: TherapyCategory; labelKey: TKey; icon: string; color: string }[] = [
  { key: "speech", labelKey: "docTherapyCatSpeech", icon: "🗣️", color: colors.blueDeep },
  { key: "sensory", labelKey: "docTherapyCatSensory", icon: "🌿", color: colors.greenDeep },
  { key: "occupational", labelKey: "docTherapyCatOccupational", icon: "📅", color: colors.orangeDeep },
  { key: "behavioral", labelKey: "docTherapyCatBehavioral", icon: "🤝", color: colors.purpleDeep },
];

const DAY_NAME_KEYS: TKey[] = ["dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat", "daySun"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function DoctorPanelScreen({ onBack }: Props) {
  const { isTablet, isPhone, isSmallPhone } = useResponsive();
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const [children, setChildren] = useState<ChildProfile[]>(loadChildren);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<DoctorSubTab>("performance");

  // Therapy goal modal state
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState<TherapyCategory>("speech");
  const [goalTarget, setGoalTarget] = useState("5");
  const [goalUnit, setGoalUnit] = useState("words");
  const [goalPrescriber, setGoalPrescriber] = useState("Dr. Therapist");

  // Clinical note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Dr. SLP Specialist");
  const [noteContent, setNoteContent] = useState("");
  const [noteRecommendations, setNoteRecommendations] = useState("");

  // Doctor contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docSpeciality, setDocSpeciality] = useState("");
  const [docClinic, setDocClinic] = useState("");
  const [docPhone, setDocPhone] = useState("");
  const [docEmail, setDocEmail] = useState("");
  const [docNotes, setDocNotes] = useState("");

  const selected = useMemo(() => {
    return children.find((c) => c.id === selectedId) || null;
  }, [children, selectedId]);

  const refreshChild = () => {
    setChildren(loadChildren());
  };

  // Tag Management
  function applyTags(next: ContentTag[]) {
    if (!selected) return;
    const updated: ChildProfile = { ...selected, allowedTags: next };
    updateChild(updated);
    refreshChild();
  }

  function toggleTag(tag: ContentTag) {
    if (!selected) return;
    const hasTag = selected.allowedTags.includes(tag);
    applyTags(hasTag ? selected.allowedTags.filter((tg) => tg !== tag) : [...selected.allowedTags, tag]);
  }

  // --- Therapy Goal Actions ---
  function handleSaveGoal() {
    if (!selected) return;
    const parsedTarget = parseInt(goalTarget, 10);
    if (!goalTitle.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      return Alert.alert(t("admRequired", lang), tt("docRequiredGoalMsg"));
    }
    const newGoal: TherapyGoal = {
      id: `tg_${Date.now()}`,
      title: goalTitle.trim(),
      category: goalCategory,
      targetCount: parsedTarget,
      currentCount: 0,
      unit: goalUnit.trim() || "times",
      completed: false,
      prescribedBy: goalPrescriber.trim() || "Attending Doctor",
      assignedDate: new Date().toISOString(),
    };
    addTherapyGoal(selected.id, newGoal);
    refreshChild();
    setGoalModalOpen(false);
    setGoalTitle("");
    Alert.alert(t("admSuccess", lang), tt("docGoalSuccessMsg"));
  }

  function handleToggleGoalComplete(goal: TherapyGoal) {
    if (!selected) return;
    const updated: TherapyGoal = {
      ...goal,
      completed: !goal.completed,
      currentCount: !goal.completed ? goal.targetCount : 0,
    };
    updateTherapyGoal(selected.id, updated);
    refreshChild();
  }

  function handleIncrementGoal(goal: TherapyGoal) {
    if (!selected || goal.completed) return;
    const nextCount = Math.min(goal.targetCount, goal.currentCount + 1);
    const updated: TherapyGoal = {
      ...goal,
      currentCount: nextCount,
      completed: nextCount >= goal.targetCount,
    };
    updateTherapyGoal(selected.id, updated);
    refreshChild();
  }

  function handleDeleteGoal(goalId: string) {
    if (!selected) return;
    Alert.alert(tt("docDeleteGoalTitle"), tt("docDeleteGoalMsg"), [
      { text: tt("docCancel"), style: "cancel" },
      {
        text: tt("docDelete"),
        style: "destructive",
        onPress: () => {
          deleteTherapyGoal(selected.id, goalId);
          refreshChild();
        },
      },
    ]);
  }

  // --- Clinical Note Actions ---
  function handleSaveClinicalNote() {
    if (!selected) return;
    if (!noteTitle.trim() || !noteContent.trim()) {
      return Alert.alert(t("admRequired", lang), tt("docRequiredNoteMsg"));
    }
    const recs = noteRecommendations
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const newNote: ClinicalNote = {
      id: `cn_${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
      author: noteAuthor.trim() || tt("docDoctorFallback"),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      recommendations: recs.length > 0 ? recs : [tt("docDefaultRecommendation")],
    };
    addClinicalNote(selected.id, newNote);
    refreshChild();
    setNoteModalOpen(false);
    setNoteTitle("");
    setNoteContent("");
    setNoteRecommendations("");
    Alert.alert(t("admSaved", lang), tt("docNoteSavedMsg"));
  }

  function handleDeleteNote(noteId: string) {
    if (!selected) return;
    Alert.alert(tt("docDeleteNoteTitle"), tt("docDeleteNoteMsg"), [
      { text: tt("docCancel"), style: "cancel" },
      {
        text: tt("docDelete"),
        style: "destructive",
        onPress: () => {
          deleteClinicalNote(selected.id, noteId);
          refreshChild();
        },
      },
    ]);
  }

  // --- Doctor Contact Actions ---
  function openContactEditor() {
    if (!selected) return;
    const existing = selected.doctorContact;
    setDocName(existing?.doctorName || tt("docDefaultDoctorName"));
    setDocSpeciality(existing?.speciality || tt("docDefaultSpeciality"));
    setDocClinic(existing?.clinicName || tt("docDefaultClinicName"));
    setDocPhone(existing?.phone || "+1 (555) 234-5678");
    setDocEmail(existing?.email || "therapy@kiddocare.clinic");
    setDocNotes(existing?.notes || tt("docDefaultContactNotes"));
    setContactModalOpen(true);
  }

  function handleSaveDoctorContact() {
    if (!selected) return;
    const contact: DoctorContact = {
      doctorName: docName.trim(),
      speciality: docSpeciality.trim(),
      clinicName: docClinic.trim(),
      phone: docPhone.trim(),
      email: docEmail.trim(),
      notes: docNotes.trim(),
    };
    updateDoctorContact(selected.id, contact);
    refreshChild();
    setContactModalOpen(false);
    Alert.alert(tt("docContactUpdatedTitle"), tt("docContactUpdatedMsg"));
  }

  // Export Comprehensive Clinical Report
  function handleExportMedicalReport() {
    if (!selected) return;
    const usage = getUsage(selected.id);
    const totalWords = Object.values(usage.wordTotals).reduce((s, v) => s + v, 0);
    const uniqueCount = Object.keys(usage.wordTotals).length;
    const recordedDays = usage.scheduleByDay.filter((v) => v > 0);
    const avgAdherence = recordedDays.length ? Math.round(recordedDays.reduce((s, v) => s + v, 0) / recordedDays.length) : 0;
    const topWords = Object.entries(usage.wordTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w, c]) => `• ${w}: ${tt("docOccurrencesSuffix").replace("{count}", String(c))}`)
      .join("\n");

    const activeGoals = (selected.therapyGoals || [])
      .map((g) => `• [${g.completed ? tt("docCompletedBadge") : tt("docInProgress")}] ${g.title}: ${g.currentCount}/${g.targetCount} ${g.unit}`)
      .join("\n");

    const recentNotes = (selected.clinicalNotes || [])
      .slice(0, 3)
      .map((n) => `[${n.date} - ${n.author}]: ${n.title}\n${n.content}\n${tt("docRecommendationsPrefix")}${n.recommendations.join(", ")}`)
      .join("\n\n");

    const contact = selected.doctorContact || {
      doctorName: tt("docDefaultDoctorName"),
      speciality: tt("docDefaultSpeciality"),
      clinicName: tt("docDefaultClinicName"),
      phone: "+1 555-234-5678",
      email: "therapy@kiddocare.clinic",
    };

    const report = tt("docReportTemplate")
      .replace("{patient}", selected.name)
      .replace("{age}", String(selected.age))
      .replace("{diagnoses}", selected.diagnoses.map((d) => DIAGNOSIS_LABELS[d] || d).join(", "))
      .replace("{enrolled}", new Date(selected.enrolledAt).toLocaleDateString())
      .replace("{reportDate}", new Date().toLocaleString())
      .replace("{doctorLine}", `${contact.doctorName} (${contact.speciality})`)
      .replace("{clinicName}", contact.clinicName)
      .replace("{phone}", contact.phone)
      .replace("{email}", contact.email)
      .replace("{totalWords}", String(totalWords))
      .replace("{uniqueCount}", String(uniqueCount))
      .replace("{sentencesSpoken}", String(usage.sentencesSpoken ?? 0))
      .replace("{longestLen}", String(usage.longestSentenceLength ?? 0))
      .replace("{verbatim}", (usage.longestSentenceWords ?? []).join(" "))
      .replace("{avgAdherence}", String(avgAdherence))
      .replace("{consecutiveDays}", String(usage.consecutiveDays ?? 0))
      .replace("{topWords}", topWords || tt("docNoVocabDataRecorded"))
      .replace("{activeGoals}", activeGoals || tt("docNoGoalsAssignedYet"))
      .replace("{recentNotes}", recentNotes || tt("docNoNotesLoggedYet"));

    Share.share({ message: report, title: `${selected.name}_Clinical_Report.txt` });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
            <Pressable
              onPress={() => (selected ? setSelectedId(null) : onBack())}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text style={styles.backText}>{selected ? t("patientsListBack", lang) : t("back", lang)}</Text>
            </Pressable>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.doctorBadge}>
                <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{t("doctorPanel", lang)}</Text>
                <Text style={styles.headerSub}>
                  {selected
                    ? t("patientHeaderLine", lang).replace("{name}", selected.name).replace("{age}", String(selected.age))
                    : t("doctorPanelSub", lang)}
                </Text>
              </View>
              {selected && (
                <Pressable onPress={handleExportMedicalReport} style={styles.exportHeaderBtn}>
                  <Ionicons name="share-outline" size={16} color="white" />
                  <Text style={styles.exportHeaderBtnText}>{t("exportReportBtn", lang)}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Child Selector List (When No Child Selected) */}
        {!selected && (
          <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>{t("enrolledPatientsCount", lang).replace("{n}", String(children.length))}</Text>
              <Text style={styles.sectionSub}>{t("selectPatientHint", lang)}</Text>
            </View>

            {children.length === 0 ? (
              <Card style={{ alignItems: "center", paddingVertical: 48 }}>
                <Mascot mood="thinking" size={80} />
                <Text style={styles.emptyText}>{t("noChildrenEnrolled", lang)}</Text>
              </Card>
            ) : (
              <View style={[styles.patientGrid, isTablet && styles.patientGridTablet]}>
                {children.map((child) => {
                  const u = getUsage(child.id);
                  const weekWords = u.wordsByDay.reduce((s, v) => s + v, 0);
                  const goals = child.therapyGoals || [];
                  const completedGoals = goals.filter((g) => g.completed).length;

                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => {
                        setSelectedId(child.id);
                        setSubTab("performance");
                      }}
                      style={[styles.childCard, isTablet && styles.childCardTablet]}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{child.name[0]?.toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={styles.childName}>{child.name}</Text>
                          <View style={styles.ageBadge}>
                            <Text style={styles.ageBadgeText}>{t("ageYrsBadge", lang).replace("{age}", String(child.age))}</Text>
                          </View>
                        </View>
                        <Text style={styles.childMeta}>
                          {t("weeklyWordsLabel", lang)}: <Text style={{ fontWeight: "700", color: DOCTOR_BLUE }}>{weekWords}</Text> · {t("therapyGoalsLabel", lang)}:{" "}
                          <Text style={{ fontWeight: "700", color: colors.greenDeep }}>
                            {completedGoals}/{goals.length}
                          </Text>
                        </Text>
                        <View style={styles.chipRow}>
                          {child.diagnoses.map((d) => (
                            <View key={d} style={styles.chip}>
                              <Text style={styles.chipText}>{diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Patient Clinical Workstation (When Child Selected) */}
        {selected && (
          <>
            {/* Sub-Tab Navigation Bar */}
            <View style={[styles.subTabsContainer, isTablet && styles.subTabsContainerTablet]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.subTabsNav, isTablet && styles.subTabsNavTablet]}>
                {SUB_TABS.map((st) => {
                  const active = subTab === st.key;
                  return (
                    <Pressable
                      key={st.key}
                      onPress={() => setSubTab(st.key)}
                      style={[styles.subTabItem, active && styles.subTabItemActive]}
                    >
                      <Ionicons
                        name={st.icon}
                        size={16}
                        color={active ? "white" : colors.textMid}
                      />
                      <Text style={[styles.subTabItemText, active && styles.subTabItemTextActive]}>
                        {t(st.labelKey, lang)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]}>
              {/* ================= SUBTAB 1: PERFORMANCE A TO Z ================= */}
              {subTab === "performance" && (
                <View style={{ gap: 16 }}>
                  {(() => {
                    const usage = getUsage(selected.id);
                    const wordsWeek = usage.wordsByDay.reduce((s, v) => s + v, 0);
                    const totalWords = Object.values(usage.wordTotals).reduce((s, v) => s + v, 0);
                    const uniqueWords = Object.keys(usage.wordTotals).length;
                    const recorded = usage.scheduleByDay.filter((v) => v > 0);
                    const adherence = recorded.length
                      ? Math.round(recorded.reduce((s, v) => s + v, 0) / recorded.length)
                      : 0;
                    const topWords = Object.entries(usage.wordTotals)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 12);
                    const maxWordCount = topWords.length ? topWords[0][1] : 1;

                    return (
                      <>
                        {/* Clinical Summary Cards */}
                        <View style={styles.metricsGrid}>
                          <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                            <Text style={styles.metricNum}>{totalWords}</Text>
                            <Text style={styles.metricLabel}>{t("metricTotalWordTaps", lang)}</Text>
                          </View>
                          <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                            <Text style={[styles.metricNum, { color: DOCTOR_BLUE }]}>{uniqueWords}</Text>
                            <Text style={styles.metricLabel}>{t("metricVocabDiversity", lang)}</Text>
                          </View>
                          <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                            <Text style={[styles.metricNum, { color: colors.greenDeep }]}>
                              {usage.sentencesSpoken ?? 0}
                            </Text>
                            <Text style={styles.metricLabel}>{t("metricSentencesSpoken", lang)}</Text>
                          </View>
                          <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                            <Text style={[styles.metricNum, { color: colors.orangeDeep }]}>
                              {adherence}%
                            </Text>
                            <Text style={styles.metricLabel}>{t("metricRoutineAdherence", lang)}</Text>
                          </View>
                        </View>

                        {/* Longest Sentence & Pragmatic Language Milestone */}
                        <View style={styles.panelCard}>
                          <View style={styles.panelCardHeader}>
                            <Ionicons name="chatbubbles" size={20} color={DOCTOR_BLUE} />
                            <Text style={styles.panelCardTitle}>{t("speechSentenceFormationTitle", lang)}</Text>
                          </View>
                          <Text style={styles.panelCardDesc}>
                            {t("longestVerbalCompositionSub", lang).replace("{name}", selected.name)}
                          </Text>
                          <View style={styles.quoteBox}>
                            <Text style={styles.quoteLength}>
                              {t("wordsConstructedPrefix", lang).replace("{n}", String(usage.longestSentenceLength ?? 0))}
                            </Text>
                            <Text style={styles.quoteText}>
                              {(usage.longestSentenceWords && usage.longestSentenceWords.length > 0)
                                ? `"${usage.longestSentenceWords.join(" ")}"`
                                : t("noFullSentenceLogged", lang)}
                            </Text>
                          </View>
                        </View>

                        {/* 7-Day Word Activity Breakdown */}
                        <View style={styles.panelCard}>
                          <View style={styles.panelCardHeader}>
                            <Ionicons name="calendar-outline" size={20} color={colors.forest} />
                            <Text style={styles.panelCardTitle}>{t("sevenDayVolumeTitle", lang)}</Text>
                          </View>
                          <View style={styles.barChartRow}>
                            {DAY_ORDER.map((d, i) => {
                              const count = usage.wordsByDay[d] || 0;
                              const maxDay = Math.max(1, ...usage.wordsByDay);
                              const heightPct = Math.max(10, Math.round((count / maxDay) * 70));
                              return (
                                <View key={i} style={styles.barCol}>
                                  <Text style={styles.barVal}>{count}</Text>
                                  <View style={[styles.barFill, { height: heightPct }]} />
                                  <Text style={styles.barDay}>{t(DAY_NAME_KEYS[i], lang)}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>

                        {/* Most Used Vocabulary Breakdown */}
                        <View style={styles.panelCard}>
                          <View style={styles.panelCardHeader}>
                            <Ionicons name="flame" size={20} color="#f59e0b" />
                            <Text style={styles.panelCardTitle}>{t("topCommunicatedVocabTitle", lang)}</Text>
                          </View>
                          {topWords.length > 0 ? (
                            <View style={{ gap: 8, marginTop: 6 }}>
                              {topWords.map(([w, cnt]) => (
                                <View key={w} style={styles.vocabRow}>
                                  <Text style={styles.vocabWord}>{wordLabel(w, lang)}</Text>
                                  <View style={styles.vocabBarWrap}>
                                    <View
                                      style={[
                                        styles.vocabBarFill,
                                        { width: `${Math.round((cnt / maxWordCount) * 100)}%` },
                                      ]}
                                    />
                                  </View>
                                  <Text style={styles.vocabCount}>{cnt} {t("tapsUnit", lang)}</Text>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>{t("noVocabTapsYet", lang)}</Text>
                          )}
                        </View>

                        {/* Clinical Readiness Checklist */}
                        <View style={styles.panelCard}>
                          <View style={styles.panelCardHeader}>
                            <Ionicons name="checkbox-outline" size={20} color={colors.greenDeep} />
                            <Text style={styles.panelCardTitle}>Clinical Milestone Evaluation</Text>
                          </View>
                          <View style={{ gap: 10, marginTop: 6 }}>
                            {[
                              { label: "Active Communication Initiator", passed: totalWords >= 20, desc: `${totalWords} cumulative word events` },
                              { label: "Lexical Diversity (10+ unique words)", passed: uniqueWords >= 10, desc: `${uniqueWords} unique cards used` },
                              { label: "Multi-Word Sentence Builder", passed: (usage.longestSentenceLength ?? 0) >= 3, desc: `Max length: ${usage.longestSentenceLength ?? 0} words` },
                              { label: "Routine Consistency (70%+ adherence)", passed: adherence >= 70, desc: `Average: ${adherence}% daily completion` },
                            ].map((item, idx) => (
                              <View key={idx} style={styles.checkRow}>
                                <View style={[styles.checkCircle, { backgroundColor: item.passed ? colors.greenDeep : "#cbd5e1" }]}>
                                  <Ionicons name={item.passed ? "checkmark" : "close"} size={14} color="white" />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.checkTitle}>{item.label}</Text>
                                  <Text style={styles.checkDesc}>{item.desc}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}

              {/* ================= SUBTAB 2: THERAPY PLANS & GOALS ================= */}
              {subTab === "therapy" && (
                <View style={{ gap: 16 }}>
                  <View style={styles.sectionTitleRow}>
                    <View>
                      <Text style={styles.sectionTitle}>{tt("docPrescribedGoalsTitle")}</Text>
                      <Text style={styles.sectionSub}>{tt("docPrescribedGoalsSub")}</Text>
                    </View>
                    <Pressable onPress={() => setGoalModalOpen(true)} style={styles.primaryActionBtn}>
                      <Ionicons name="add" size={18} color="white" />
                      <Text style={styles.primaryActionBtnText}>{tt("docPrescribeGoal")}</Text>
                    </Pressable>
                  </View>

                  {/* Therapy Goals List */}
                  {selected.therapyGoals && selected.therapyGoals.length > 0 ? (
                    selected.therapyGoals.map((goal) => {
                      const catInfo = THERAPY_CATEGORIES.find((c) => c.key === goal.category) || THERAPY_CATEGORIES[0];
                      const pct = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));

                      return (
                        <View key={goal.id} style={styles.goalCard}>
                          <View style={styles.goalHeader}>
                            <View style={[styles.goalCategoryBadge, { backgroundColor: catInfo.color + "18" }]}>
                              <Text style={{ fontSize: 16 }}>{catInfo.icon}</Text>
                              <Text style={[styles.goalCategoryText, { color: catInfo.color }]}>
                                {tt(catInfo.labelKey)}
                              </Text>
                            </View>
                            {goal.completed && (
                              <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-done" size={14} color="white" />
                                <Text style={styles.completedBadgeText}>{tt("docCompletedBadge")}</Text>
                              </View>
                            )}
                            <Pressable onPress={() => handleDeleteGoal(goal.id)} style={styles.deleteGoalBtn}>
                              <Ionicons name="trash-outline" size={16} color={colors.pinkDeep} />
                            </Pressable>
                          </View>

                          <Text style={styles.goalTitle}>{goal.title}</Text>
                          <Text style={styles.goalPrescriber}>
                            {tt("docPrescribedByLine")
                              .replace("{doctor}", goal.prescribedBy || tt("docDoctorFallback"))
                              .replace("{date}", new Date(goal.assignedDate).toLocaleDateString())}
                          </Text>

                          {/* Progress Bar */}
                          <View style={styles.progressBarWrap}>
                            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: catInfo.color }]} />
                          </View>

                          <View style={styles.goalFooter}>
                            <Text style={styles.goalCount}>
                              {tt("docProgressLabel")} <Text style={{ fontWeight: "800", color: colors.textDark }}>{goal.currentCount}</Text> / {goal.targetCount} {goal.unit} ({pct}%)
                            </Text>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                              <Pressable
                                onPress={() => handleIncrementGoal(goal)}
                                disabled={goal.completed}
                                style={[styles.goalStepBtn, goal.completed && { opacity: 0.5 }]}
                              >
                                <Ionicons name="add" size={16} color={colors.forest} />
                                <Text style={styles.goalStepBtnText}>{tt("docIncrementPrefix")} {goal.unit}</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => handleToggleGoalComplete(goal)}
                                style={[styles.goalToggleBtn, goal.completed && { backgroundColor: colors.forest }]}
                              >
                                <Ionicons
                                  name={goal.completed ? "checkmark" : "checkbox-outline"}
                                  size={16}
                                  color={goal.completed ? "white" : colors.textMid}
                                />
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Card style={{ alignItems: "center", paddingVertical: 36 }}>
                      <Text style={{ fontSize: 36 }}>🎯</Text>
                      <Text style={[styles.emptyText, { marginTop: 10 }]}>{tt("docNoGoalsYet")}</Text>
                      <Pressable onPress={() => setGoalModalOpen(true)} style={[styles.primaryActionBtn, { marginTop: 14 }]}>
                        <Text style={styles.primaryActionBtnText}>{tt("docPrescribeFirstGoal")}</Text>
                      </Pressable>
                    </Card>
                  )}
                </View>
              )}

              {/* ================= SUBTAB 3: CLINICAL NOTES ================= */}
              {subTab === "notes" && (
                <View style={{ gap: 16 }}>
                  <View style={styles.sectionTitleRow}>
                    <View>
                      <Text style={styles.sectionTitle}>{tt("docConsultationNotesTitle")}</Text>
                      <Text style={styles.sectionSub}>{tt("docConsultationNotesSub")}</Text>
                    </View>
                    <Pressable onPress={() => setNoteModalOpen(true)} style={styles.primaryActionBtn}>
                      <Ionicons name="add" size={18} color="white" />
                      <Text style={styles.primaryActionBtnText}>{tt("docAddNote")}</Text>
                    </Pressable>
                  </View>

                  {selected.clinicalNotes && selected.clinicalNotes.length > 0 ? (
                    selected.clinicalNotes.map((note) => (
                      <View key={note.id} style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.noteTitle}>{note.title}</Text>
                            <Text style={styles.noteAuthor}>
                              {tt("docByAuthorDate").replace("{author}", note.author).replace("{date}", note.date)}
                            </Text>
                          </View>
                          <Pressable onPress={() => handleDeleteNote(note.id)} style={styles.deleteGoalBtn}>
                            <Ionicons name="trash-outline" size={16} color={colors.pinkDeep} />
                          </Pressable>
                        </View>

                        <Text style={styles.noteContent}>{note.content}</Text>

                        {note.recommendations && note.recommendations.length > 0 && (
                          <View style={styles.recsBox}>
                            <Text style={styles.recsTitle}>{tt("docKeyRecommendations")}</Text>
                            {note.recommendations.map((r, i) => (
                              <View key={i} style={styles.recItem}>
                                <Text style={styles.recDot}>•</Text>
                                <Text style={styles.recText}>{r}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Card style={{ alignItems: "center", paddingVertical: 36 }}>
                      <Text style={{ fontSize: 36 }}>📝</Text>
                      <Text style={[styles.emptyText, { marginTop: 10 }]}>{tt("docNoNotesYet")}</Text>
                      <Pressable onPress={() => setNoteModalOpen(true)} style={[styles.primaryActionBtn, { marginTop: 14 }]}>
                        <Text style={styles.primaryActionBtnText}>{tt("docAddClinicalObservation")}</Text>
                      </Pressable>
                    </Card>
                  )}
                </View>
              )}

              {/* ================= SUBTAB 4: DOCTOR CONTACT ================= */}
              {subTab === "contact" && (
                <View style={{ gap: 16 }}>
                  <View style={styles.sectionTitleRow}>
                    <View>
                      <Text style={styles.sectionTitle}>{tt("docContactTitle")}</Text>
                      <Text style={styles.sectionSub}>{tt("docContactSub")}</Text>
                    </View>
                    <Pressable onPress={openContactEditor} style={styles.primaryActionBtn}>
                      <Ionicons name="create-outline" size={18} color="white" />
                      <Text style={styles.primaryActionBtnText}>{tt("docEditContact")}</Text>
                    </Pressable>
                  </View>

                  {(() => {
                    const c = selected.doctorContact || {
                      doctorName: tt("docDefaultDoctorName"),
                      speciality: tt("docDefaultSpeciality"),
                      clinicName: tt("docDefaultClinicName"),
                      phone: "+1 (555) 234-5678",
                      email: "therapy@kiddocare.clinic",
                      notes: tt("docDefaultDisplayNotes"),
                    };

                    return (
                      <View style={styles.contactCard}>
                        <View style={styles.contactHeader}>
                          <View style={styles.contactAvatar}>
                            <Ionicons name="medkit" size={28} color="white" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.docNameText}>{c.doctorName}</Text>
                            <Text style={styles.docSpecText}>{c.speciality}</Text>
                            <Text style={styles.docClinicText}>{c.clinicName}</Text>
                          </View>
                        </View>

                        {/* Quick Contact Buttons */}
                        <View style={styles.contactActionsRow}>
                          <Pressable
                            onPress={() => Linking.openURL(`tel:${c.phone}`).catch(() => Alert.alert(tt("docPhoneCallTitle"), tt("docCallMsg").replace("{phone}", c.phone)))}
                            style={styles.contactActionBtn}
                          >
                            <Ionicons name="call" size={18} color={DOCTOR_BLUE} />
                            <Text style={styles.contactActionBtnText}>{tt("docCallDoctor")}</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => Linking.openURL(`mailto:${c.email}`).catch(() => Alert.alert(tt("docEmailTitle"), tt("docEmailMsg").replace("{email}", c.email)))}
                            style={styles.contactActionBtn}
                          >
                            <Ionicons name="mail" size={18} color={colors.forest} />
                            <Text style={styles.contactActionBtnText}>{tt("docEmailClinic")}</Text>
                          </Pressable>

                          <Pressable
                            onPress={handleExportMedicalReport}
                            style={[styles.contactActionBtn, { backgroundColor: "#0f172a" }]}
                          >
                            <Ionicons name="share-social" size={18} color="#10b981" />
                            <Text style={[styles.contactActionBtnText, { color: "white" }]}>{tt("docShareIep")}</Text>
                          </Pressable>
                        </View>

                        {c.notes && (
                          <View style={styles.docNotesBox}>
                            <Text style={styles.docNotesTitle}>{tt("docClinicalInstructions")}</Text>
                            <Text style={styles.docNotesContent}>{c.notes}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* ================= SUBTAB 5: CONTENT PERMISSIONS ================= */}
              {subTab === "permissions" && (
                <View style={{ gap: 14 }}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      {tt("docPermissionsInfo").replace("{name}", selected.name)}
                    </Text>
                  </View>

                  <View style={styles.bulkRow}>
                    <Pressable onPress={() => applyTags([...ALL_TAGS])} style={styles.bulkBtn}>
                      <Text style={styles.bulkText}>{tt("docEnableAll")}</Text>
                    </Pressable>
                    <Pressable onPress={() => applyTags([])} style={[styles.bulkBtn, styles.bulkBtnMuted]}>
                      <Text style={[styles.bulkText, { color: colors.textMid }]}>{tt("docDisableAll")}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.tagCount}>
                    {t("allowedContent", lang)} ({selected.allowedTags.length}/{ALL_TAGS.length})
                  </Text>

                  <View style={{ gap: 10 }}>
                    {ALL_TAGS.map((tag) => {
                      const allowed = selected.allowedTags.includes(tag);
                      const [emoji, ...rest] = CONTENT_TAG_LABELS[tag].split(" ");
                      return (
                        <Pressable
                          key={tag}
                          onPress={() => toggleTag(tag)}
                          style={[styles.tagRow, allowed ? styles.tagRowActive : styles.tagRowInactive]}
                        >
                          <Text style={{ fontSize: 20 }}>{emoji}</Text>
                          <Text style={styles.tagLabel}>{rest.join(" ")}</Text>
                          <View style={[styles.tagCheck, { backgroundColor: allowed ? DOCTOR_BLUE : colors.border }]}>
                            {allowed && <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>✓</Text>}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          </>
        )}

        {/* Modal: Prescribe Therapy Goal */}
        <Modal visible={goalModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
              <Text style={styles.modalTitle}>{tt("docPrescribeGoalModalTitle")}</Text>
              <Text style={styles.modalSubtitle}>{tt("docPrescribeGoalModalSub")}</Text>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("docGoalTitleLabel")}</Text>
              <TextInput
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder={tt("docGoalTitlePlaceholder")}
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docTherapyCategoryLabel")}</Text>
              <View style={styles.categoryPickerRow}>
                {THERAPY_CATEGORIES.map((cat) => {
                  const sel = goalCategory === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => setGoalCategory(cat.key)}
                      style={[styles.categoryPickerBtn, sel && { borderColor: cat.color, backgroundColor: cat.color + "15" }]}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      <Text style={[styles.categoryPickerText, sel && { color: cat.color, fontWeight: "700" }]}>
                        {tt(cat.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{tt("docTargetCountLabel")}</Text>
                  <TextInput
                    value={goalTarget}
                    onChangeText={setGoalTarget}
                    keyboardType="number-pad"
                    style={styles.inputField}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{tt("docUnitLabel")}</Text>
                  <TextInput
                    value={goalUnit}
                    onChangeText={setGoalUnit}
                    style={styles.inputField}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docPrescribingClinicianLabel")}</Text>
              <TextInput
                value={goalPrescriber}
                onChangeText={setGoalPrescriber}
                placeholder={tt("docPrescribingClinicianPlaceholder")}
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />

              <View style={styles.modalActions}>
                <Pressable onPress={() => setGoalModalOpen(false)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{tt("docCancel")}</Text>
                </Pressable>
                <Pressable onPress={handleSaveGoal} style={styles.primaryActionBtn}>
                  <Text style={styles.primaryActionBtnText}>{tt("docAssignGoal")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Add Clinical Note */}
        <Modal visible={noteModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
              <Text style={styles.modalTitle}>{tt("docAddNoteModalTitle")}</Text>
              <Text style={styles.modalSubtitle}>{tt("docAddNoteModalSub")}</Text>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("docNoteTitleLabel")}</Text>
              <TextInput
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder={tt("docNoteTitlePlaceholder")}
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docAttendingDoctorLabel")}</Text>
              <TextInput
                value={noteAuthor}
                onChangeText={setNoteAuthor}
                placeholder={tt("docDoctorNamePlaceholder")}
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docClinicalObservationLabel")}</Text>
              <TextInput
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder={tt("docClinicalObservationPlaceholder")}
                placeholderTextColor={colors.textLight}
                multiline
                style={[styles.inputField, { height: 90, textAlignVertical: "top" }]}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docCaregiverRecsLabel")}</Text>
              <TextInput
                value={noteRecommendations}
                onChangeText={setNoteRecommendations}
                placeholder={tt("docCaregiverRecsPlaceholder")}
                placeholderTextColor={colors.textLight}
                multiline
                style={[styles.inputField, { height: 60, textAlignVertical: "top" }]}
              />

              <View style={styles.modalActions}>
                <Pressable onPress={() => setNoteModalOpen(false)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{tt("docCancel")}</Text>
                </Pressable>
                <Pressable onPress={handleSaveClinicalNote} style={styles.primaryActionBtn}>
                  <Text style={styles.primaryActionBtnText}>{tt("docSaveConsultation")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Edit Doctor Contact */}
        <Modal visible={contactModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
              <Text style={styles.modalTitle}>{tt("docEditDoctorProfileTitle")}</Text>
              <Text style={styles.modalSubtitle}>{tt("docEditDoctorProfileSub")}</Text>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("docDoctorNameLabel")}</Text>
              <TextInput value={docName} onChangeText={setDocName} style={styles.inputField} />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docClinicalSpecialityLabel")}</Text>
              <TextInput value={docSpeciality} onChangeText={setDocSpeciality} style={styles.inputField} />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docClinicNameLabel")}</Text>
              <TextInput value={docClinic} onChangeText={setDocClinic} style={styles.inputField} />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{tt("docPhoneLabel")}</Text>
                  <TextInput value={docPhone} onChangeText={setDocPhone} style={styles.inputField} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{tt("docEmailLabel")}</Text>
                  <TextInput value={docEmail} onChangeText={setDocEmail} style={styles.inputField} />
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{tt("docConsultingHoursLabel")}</Text>
              <TextInput
                value={docNotes}
                onChangeText={setDocNotes}
                multiline
                style={[styles.inputField, { height: 50, textAlignVertical: "top" }]}
              />

              <View style={styles.modalActions}>
                <Pressable onPress={() => setContactModalOpen(false)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{tt("docCancel")}</Text>
                </Pressable>
                <Pressable onPress={handleSaveDoctorContact} style={styles.primaryActionBtn}>
                  <Text style={styles.primaryActionBtnText}>{tt("docSaveContact")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: DOCTOR_DARK,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: {
    width: "100%",
  },
  headerInnerTablet: {
    maxWidth: 960,
    alignSelf: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backText: { color: "white", fontWeight: "700", fontSize: 13 },
  doctorBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  exportHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DOCTOR_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportHeaderBtnText: { color: "white", fontSize: 12, fontWeight: "700" },

  body: { padding: 16, paddingBottom: 60, gap: 14 },
  bodyTablet: {
    maxWidth: 960,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  sectionSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  /* Patient Grid */
  patientGrid: { gap: 12 },
  patientGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* Patient Card */
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: radius,
    padding: 16,
  },
  childCardTablet: {
    width: "48.8%",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DOCTOR_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 20, fontWeight: "800" },
  childName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  ageBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ageBadgeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  childMeta: { color: "#64748b", fontSize: 12, marginTop: 3 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 6 },
  chip: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { color: DOCTOR_BLUE, fontSize: 11, fontWeight: "700" },

  /* SubTabs Nav */
  subTabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  subTabsContainerTablet: {
    alignItems: "center",
  },
  subTabsNav: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  subTabsNavTablet: {
    maxWidth: 960,
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
  },
  subTabItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  subTabItemActive: { backgroundColor: DOCTOR_BLUE },
  subTabItemText: { fontSize: 12.5, fontWeight: "700", color: "#475569" },
  subTabItemTextActive: { color: "white" },

  /* Metrics Grid */
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  metricCardTablet: {
    width: "23.5%",
  },
  metricNum: { fontSize: 24, fontWeight: "900", color: "#0f172a" },
  metricLabel: { fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: "600" },

  /* Panel Card */
  panelCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 8,
  },
  panelCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  panelCardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  panelCardDesc: { fontSize: 12, color: "#64748b" },

  quoteBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: DOCTOR_BLUE,
    marginTop: 4,
  },
  quoteLength: { fontSize: 11, fontWeight: "700", color: DOCTOR_BLUE },
  quoteText: { fontSize: 14, fontWeight: "800", color: "#0f172a", marginTop: 4 },

  /* Bar chart */
  barChartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 110,
    paddingTop: 10,
  },
  barCol: { alignItems: "center", flex: 1, gap: 4 },
  barVal: { fontSize: 10, color: "#64748b", fontWeight: "700" },
  barFill: { width: 14, backgroundColor: DOCTOR_BLUE, borderRadius: 4 },
  barDay: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },

  /* Vocab */
  vocabRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  vocabWord: { width: 80, fontSize: 13, fontWeight: "700", color: "#0f172a" },
  vocabBarWrap: { flex: 1, height: 10, backgroundColor: "#f1f5f9", borderRadius: 5, overflow: "hidden" },
  vocabBarFill: { height: "100%", backgroundColor: DOCTOR_BLUE, borderRadius: 5 },
  vocabCount: { width: 60, fontSize: 11.5, fontWeight: "600", color: "#64748b", textAlign: "right" },

  /* Checklist */
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  checkTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  checkDesc: { fontSize: 11, color: "#64748b" },

  /* Primary Button */
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DOCTOR_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryActionBtnText: { color: "white", fontSize: 12, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#334155", fontSize: 12, fontWeight: "700" },

  /* Goal Cards */
  goalCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 8,
  },
  goalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goalCategoryBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  goalCategoryText: { fontSize: 12, fontWeight: "800" },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedBadgeText: { color: "white", fontSize: 10, fontWeight: "900" },
  deleteGoalBtn: { padding: 4 },
  goalTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  goalPrescriber: { fontSize: 11.5, color: "#64748b" },
  progressBarWrap: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginVertical: 4 },
  progressBarFill: { height: "100%", borderRadius: 4 },
  goalFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  goalCount: { fontSize: 12, color: "#64748b" },
  goalStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  goalStepBtnText: { color: colors.forest, fontSize: 11, fontWeight: "700" },
  goalToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Note Cards */
  noteCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 8,
  },
  noteHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  noteTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  noteAuthor: { fontSize: 11.5, color: "#64748b", marginTop: 2 },
  noteContent: { fontSize: 13, color: "#334155", lineHeight: 19 },
  recsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 4,
  },
  recsTitle: { fontSize: 12, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  recItem: { flexDirection: "row", gap: 6, marginTop: 2 },
  recDot: { color: DOCTOR_BLUE, fontWeight: "900" },
  recText: { fontSize: 12, color: "#475569", flex: 1 },

  /* Contact Card */
  contactCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 14,
  },
  contactHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: DOCTOR_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  docNameText: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  docSpecText: { fontSize: 13, color: DOCTOR_BLUE, fontWeight: "700" },
  docClinicText: { fontSize: 12, color: "#64748b" },
  contactActionsRow: { flexDirection: "row", gap: 10 },
  contactActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contactActionBtnText: { fontSize: 12, fontWeight: "700", color: "#1e293b" },
  docNotesBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  docNotesTitle: { fontSize: 12, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  docNotesContent: { fontSize: 12.5, color: "#475569", lineHeight: 18 },

  /* Permissions */
  infoBox: { backgroundColor: "#e0f2fe", borderRadius: radius, padding: 14 },
  infoText: { color: "#0369a1", fontSize: 13, fontWeight: "600", lineHeight: 19 },
  bulkRow: { flexDirection: "row", gap: 10 },
  bulkBtn: { flex: 1, backgroundColor: DOCTOR_BLUE, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  bulkBtnMuted: { backgroundColor: "#e2e8f0" },
  bulkText: { color: "white", fontWeight: "800", fontSize: 13 },
  tagCount: { fontSize: 14, color: "#64748b", fontWeight: "700" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1 },
  tagRowActive: { backgroundColor: "#f0f9ff", borderColor: DOCTOR_BLUE },
  tagRowInactive: { backgroundColor: "white", borderColor: "#e2e8f0" },
  tagLabel: { flex: 1, fontWeight: "600", fontSize: 14, color: "#0f172a" },
  tagCheck: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  emptyText: { color: "#64748b", fontSize: 13, textAlign: "center" },

  /* Modals */
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "white", borderRadius: 16, padding: 20, width: "100%", maxWidth: 440 },
  modalCardTablet: {
    maxWidth: 580,
    padding: 26,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  modalSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 4 },
  inputField: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0f172a",
  },
  categoryPickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryPickerText: { fontSize: 11.5, color: "#475569" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
});
