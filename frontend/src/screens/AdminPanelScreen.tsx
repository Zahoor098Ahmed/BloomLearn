import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Image,
  Share,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile, CustomCategory, CustomWord, DiagnosisType, TileSize, PageSetStyle, Supervisor } from "../types";
import { DIAGNOSIS_LABELS } from "../types";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { LANGUAGES, t, TKey, applyLanguageDirection } from "../modules/i18n";
import {
  ensureCategoriesLoaded,
  listCategories,
  createBlankCategory,
  deleteCategoryDeep,
  retranslateSeedBoard,
  setSeedLanguage,
  buildBackup,
  restoreBackup,
} from "../modules/customCategories";
import {
  loadChildren,
  saveChildren,
  updateChild,
  deleteChild,
  getUsage,
  UsageData,
} from "../modules/storage";
import { loadPasscode, hasPasscode, setPasscode } from "../modules/passcode";
import { loadPixabayKey, hasPixabayKey, setPixabayKey } from "../modules/imageSearch";
import { loadStoredKey, setStoredKey, getOpenAiKey, isAiConfigured } from "../modules/aiImage";
import { playWord } from "../modules/audio";
import { speak } from "../modules/tts";
import { getPictogramUrl } from "../modules/aacPictograms";
import WordEditor from "../components/WordEditor";
import { colors, radius } from "../theme";

interface Props {
  onBack: () => void;
  onSelectChild?: (child: ChildProfile) => void;
  onNavigateAddChild?: () => void;
  onNavigateReviewQueue?: () => void;
}

type AdminTab = "boards" | "children" | "content" | "settings" | "analytics";

const ADMIN_TABS: { key: AdminTab; labelKey: TKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "boards", labelKey: "admTabBoards", icon: "grid-outline" },
  { key: "children", labelKey: "admTabChildren", icon: "people-outline" },
  { key: "content", labelKey: "admTabContent", icon: "images-outline" },
  { key: "settings", labelKey: "admTabSettings", icon: "settings-outline" },
  { key: "analytics", labelKey: "admTabAnalytics", icon: "bar-chart-outline" },
];

export default function AdminPanelScreen({
  onBack,
  onSelectChild,
  onNavigateAddChild,
  onNavigateReviewQueue,
}: Props) {
  const { isTablet, isPhone, isSmallPhone, isLargeTablet } = useResponsive();
  const { settings, update } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);

  const [activeTab, setActiveTab] = useState<AdminTab>("boards");
  const [loading, setLoading] = useState(true);

  // ---- Boards State ----
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [boardSearch, setBoardSearch] = useState("");
  const [editorWord, setEditorWord] = useState<CustomWord | null>(null);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newCatModal, setNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  // ---- Children State ----
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editDiagnoses, setEditDiagnoses] = useState<DiagnosisType[]>([]);
  const [editStars, setEditStars] = useState(0);
  const [editDensity, setEditDensity] = useState<number>(28);
  const [editPageStyle, setEditPageStyle] = useState<PageSetStyle>("category-folders");

  // ---- System Settings State ----
  const [openAiKeyInput, setOpenAiKeyInput] = useState("");
  const [pixabayKeyInput, setPixabayKeyInput] = useState("");
  const [adminPinInput, setAdminPinInput] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [speechTestPlaying, setSpeechTestPlaying] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [importText, setImportText] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        ensureCategoriesLoaded(),
        loadPasscode(),
        loadPixabayKey(),
        loadStoredKey(),
      ]);
      setCategories(listCategories());
      setChildren(loadChildren());
      setOpenAiKeyInput(getOpenAiKey());
      setLoading(false);
    }
    init();
  }, []);

  const refreshCategories = () => {
    setCategories(listCategories());
  };

  const refreshChildren = () => {
    setChildren(loadChildren());
  };

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCatId) || categories[0] || null;
  }, [categories, selectedCatId]);

  // Filtered categories for board search
  const filteredWords = useMemo(() => {
    if (!activeCategory) return [];
    if (!boardSearch.trim()) return activeCategory.words;
    const q = boardSearch.toLowerCase().trim();
    return activeCategory.words.filter(
      (w) => w.label.toLowerCase().includes(q) || (w.phrase && w.phrase.toLowerCase().includes(q))
    );
  }, [activeCategory, boardSearch]);

  // Aggregate Analytics
  const aggregatedStats = useMemo(() => {
    let totalWordTaps = 0;
    let totalSentences = 0;
    let totalRoutines = 0;
    const globalWordCounts: Record<string, number> = {};

    for (const ch of children) {
      const u = getUsage(ch.id);
      totalSentences += u.sentencesSpoken ?? 0;
      const weekWords = u.wordsByDay.reduce((a, b) => a + b, 0);
      totalWordTaps += weekWords;

      for (const [w, count] of Object.entries(u.wordTotals)) {
        globalWordCounts[w] = (globalWordCounts[w] ?? 0) + count;
      }
      const recordedDays = u.scheduleByDay.filter((v) => v > 0);
      if (recordedDays.length > 0) {
        totalRoutines += Math.round(recordedDays.reduce((a, b) => a + b, 0) / recordedDays.length);
      }
    }

    const topWords = Object.entries(globalWordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const avgRoutine = children.length > 0 ? Math.round(totalRoutines / children.length) : 0;

    return { totalWordTaps, totalSentences, avgRoutine, topWords };
  }, [children]);

  function handleExportCsv() {
    let csv = "Patient_ID,Patient_Name,Age,Enrolled_Date,Diagnoses,Words_This_Week,Sentences_Spoken,Longest_Sentence_Length,Routine_Adherence_Pct,Top_Words\n";
    for (const ch of children) {
      const u = getUsage(ch.id);
      const weekWords = u.wordsByDay.reduce((a, b) => a + b, 0);
      const recorded = u.scheduleByDay.filter((v) => v > 0);
      const avgAdh = recorded.length ? Math.round(recorded.reduce((a, b) => a + b, 0) / recorded.length) : 0;
      const topW = Object.entries(u.wordTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w, c]) => `${w}:${c}`)
        .join(";");
      const diags = (ch.diagnoses || []).join(";");
      const enrolled = new Date(ch.enrolledAt).toISOString().slice(0, 10);
      csv += `"${ch.id}","${ch.name}",${ch.age},"${enrolled}","${diags}",${weekWords},${u.sentencesSpoken ?? 0},${u.longestSentenceLength ?? 0},${avgAdh},"${topW}"\n`;
    }
    Share.share({ message: csv, title: "kiddocare_clinical_outcomes.csv" }).catch(() => {});
  }

  // --- Category Actions ---
  function handleCreateCategory() {
    if (!newCatName.trim()) return Alert.alert(tt("admRequired"), tt("admEnterCategoryName"));
    const cat = createBlankCategory({ name: newCatName.trim(), icon: newCatIcon });
    refreshCategories();
    setSelectedCatId(cat.id);
    setNewCatModal(false);
    setNewCatName("");
    Alert.alert(tt("admSuccess"), tt("admCategoryCreated").replace("{name}", newCatName.trim()));
  }

  function handleDeleteCategory(cat: CustomCategory) {
    Alert.alert(
      tt("admDeleteCategoryTitle"),
      tt("admDeleteCategoryMsg").replace("{name}", cat.name).replace("{count}", String(cat.words.length)),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: tt("admDelete"),
          style: "destructive",
          onPress: () => {
            deleteCategoryDeep(cat.id);
            refreshCategories();
            setSelectedCatId(null);
          },
        },
      ]
    );
  }

  function handleDeleteWord(word: CustomWord) {
    if (!activeCategory) return;
    Alert.alert(tt("admDeleteCardTitle"), tt("admDeleteCardMsg").replace("{label}", word.label), [
      { text: t("cancel", lang), style: "cancel" },
      {
        text: tt("admDelete"),
        style: "destructive",
        onPress: () => {
          import("../modules/customCategories").then(({ removeWord }) => {
            removeWord(activeCategory.id, word.id);
            refreshCategories();
          });
        },
      },
    ]);
  }

  // --- Child Profile Actions ---
  function openEditChildModal(ch: ChildProfile) {
    setEditingChild(ch);
    setEditName(ch.name);
    setEditAge(ch.age.toString());
    setEditDiagnoses(ch.diagnoses || []);
    setEditStars(ch.stars || 0);
    setEditDensity(ch.buttonDensity || 28);
    setEditPageStyle(ch.pageSetStyle || "category-folders");
    setChildModalOpen(true);
  }

  function saveChildProfile() {
    if (!editingChild) return;
    const parsedAge = parseInt(editAge, 10);
    if (!editName.trim() || isNaN(parsedAge) || parsedAge <= 0) {
      return Alert.alert(tt("admInvalidInput"), tt("admInvalidNameAge"));
    }
    const updated: ChildProfile = {
      ...editingChild,
      name: editName.trim(),
      age: parsedAge,
      diagnoses: editDiagnoses,
      stars: editStars,
      buttonDensity: editDensity,
      pageSetStyle: editPageStyle,
    };
    updateChild(updated);
    refreshChildren();
    setChildModalOpen(false);
    Alert.alert(tt("admSaved"), tt("admProfileUpdated").replace("{name}", updated.name));
  }

  function handleDeleteChild(ch: ChildProfile) {
    Alert.alert(
      tt("admDeleteChildTitle").replace("{name}", ch.name),
      tt("admDeleteChildMsg"),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: tt("admDeleteProfile"),
          style: "destructive",
          onPress: () => {
            deleteChild(ch.id);
            refreshChildren();
          },
        },
      ]
    );
  }

  function toggleDiagnosis(diag: DiagnosisType) {
    if (editDiagnoses.includes(diag)) {
      setEditDiagnoses(editDiagnoses.filter((d) => d !== diag));
    } else {
      setEditDiagnoses([...editDiagnoses, diag]);
    }
  }

  // --- System & AI Actions ---
  async function saveOpenAiKey() {
    await setStoredKey(openAiKeyInput.trim());
    Alert.alert(tt("admSuccess"), tt("admOpenAiKeySaved"));
  }

  async function savePixabayKey() {
    await setPixabayKey(pixabayKeyInput.trim());
    Alert.alert(tt("admSuccess"), tt("admPixabayKeySaved"));
  }

  async function saveNewPin() {
    if (adminPinInput.length !== 4 || !/^\d{4}$/.test(adminPinInput)) {
      return Alert.alert(tt("admInvalidPin"), tt("admPinDigitsMsg"));
    }
    await setPasscode(adminPinInput);
    setAdminPinInput("");
    Alert.alert(tt("admPinSavedTitle"), tt("admPinSavedMsg"));
  }

  async function handleTestVoice() {
    setSpeechTestPlaying(true);
    const testMsg =
      lang === "ar-SA"
        ? "مرحبا، اختبار نظام النطق"
        : lang === "ur-PK"
        ? "ہیلو، یہ سپیچ انجن کا ٹیسٹ ہے"
        : "Hello, this is a speech synthesizer audio test.";
    await speak(testMsg, lang, true);
    setSpeechTestPlaying(false);
  }

  function handleExportBackup() {
    const json = JSON.stringify(buildBackup(), null, 2);
    setBackupText(json);
    setBackupModalOpen(true);
    Share.share({ message: json, title: "KiddoCare_Admin_Backup.json" }).catch(() => {});
  }

  function handleImportBackup() {
    if (!importText.trim()) return Alert.alert(tt("admError"), tt("admPasteBackupJson"));
    try {
      const parsed = JSON.parse(importText.trim());
      const report = restoreBackup(parsed);
      if (report.ok) {
        refreshCategories();
        setBackupModalOpen(false);
        setImportText("");
        Alert.alert(tt("admSuccess"), tt("admRestoredMsg").replace("{cats}", String(report.restoredCategories)).replace("{words}", String(report.restoredWords)));
      } else {
        Alert.alert(tt("admError"), report.issues?.join("\n") || tt("admBackupInvalidStruct"));
      }
    } catch {
      Alert.alert(tt("admInvalidJsonTitle"), tt("admInvalidJsonMsg"));
    }
  }

  function handleRetranslateBoards() {
    Alert.alert(
      tt("admSyncBoardLangTitle"),
      tt("admSyncBoardLangMsg").replace("{lang}", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: tt("admTranslate"),
          onPress: () => {
            retranslateSeedBoard(lang);
            refreshCategories();
            Alert.alert(tt("admCompleted"), tt("admSeedTranslated"));
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.forest} />
        <Text style={{ marginTop: 12, color: colors.textDark, fontWeight: "600" }}>
          {tt("admLoading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={[styles.topHeaderInner, isTablet && styles.topHeaderInnerTablet]}>
            <Pressable onPress={onBack} style={styles.headerBackBtn}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.headerTitle}>{tt("admHeaderTitle")}</Text>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>{tt("admSuperAdmin")}</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                {tt("admHeaderSubtitle")}
              </Text>
            </View>
            <Pressable onPress={onBack} style={styles.exitBtn}>
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Tab Navigation Bar */}
        <View style={styles.tabsNavContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabsNav, isTablet && styles.tabsNavTablet]}>
            {ADMIN_TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={active ? "white" : colors.textMid}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tt(tab.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content Panels */}
        <ScrollView contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}>
          {/* ================= TAB 1: AAC BOARDS & CARDS ================= */}
          {activeTab === "boards" && (
            <View style={styles.panelSection}>
              {/* Category selector row */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>{tt("admCategoriesTitle")}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tt("admCategoriesSubtitle").replace("{count}", String(categories.length))}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setNewCatModal(true)}
                  style={styles.actionPrimaryBtn}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={styles.actionBtnText}>{tt("admAddCategory")}</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catChipsRow}
              >
                {categories.map((c) => {
                  const isSel = (activeCategory?.id === c.id);
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCatId(c.id)}
                      style={[styles.catChip, isSel && styles.catChipActive]}
                    >
                      <Text style={{ fontSize: 16 }}>{c.icon || "📁"}</Text>
                      <Text style={[styles.catChipText, isSel && styles.catChipTextActive]}>
                        {c.name} ({c.words.length})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Active Category Toolbar */}
              {activeCategory && (
                <View style={styles.activeCatToolbar}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <Text style={{ fontSize: 26 }}>{activeCategory.icon || "📁"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activeCatName}>{activeCategory.name}</Text>
                      <Text style={styles.activeCatCount}>
                        {tt("admTotalTiles").replace("{count}", String(activeCategory.words.length))}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => setIsAddingWord(true)}
                      style={[styles.actionSmallBtn, { backgroundColor: colors.forest }]}
                    >
                      <Ionicons name="add-circle" size={18} color="white" />
                      <Text style={styles.actionBtnText}>{tt("admAddCardBtn")}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteCategory(activeCategory)}
                      style={[styles.actionSmallBtn, { backgroundColor: colors.pinkDeep }]}
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Search Bar for cards */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.textMid} />
                <TextInput
                  value={boardSearch}
                  onChangeText={setBoardSearch}
                  placeholder={tt("admSearchCardsPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  style={styles.searchInput}
                />
                {boardSearch.length > 0 && (
                  <Pressable onPress={() => setBoardSearch("")}>
                    <Ionicons name="close-circle" size={18} color={colors.textMid} />
                  </Pressable>
                )}
              </View>

              {/* Cards Grid */}
              <View style={styles.cardsGrid}>
                {filteredWords.map((w) => {
                  const pictoUrl = getPictogramUrl(w.label);
                  const imageSrc = w.imageUri || pictoUrl;

                  return (
                    <View
                      key={w.id}
                      style={[
                        styles.cardItem,
                        isLargeTablet
                          ? styles.cardItemLargeTablet
                          : isTablet
                          ? styles.cardItemTablet
                          : isSmallPhone
                          ? styles.cardItemSmallPhone
                          : null,
                      ]}
                    >
                      <Pressable
                        onPress={() => playWord(w, lang, settings.speechRate || 0.9)}
                        style={styles.cardPreview}
                      >
                        {imageSrc ? (
                          <Image
                            source={{ uri: imageSrc }}
                            style={styles.cardImg}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={{ fontSize: 32 }}>{w.emoji || "🔹"}</Text>
                        )}
                        <Text style={styles.cardLabel} numberOfLines={1}>
                          {w.label}
                        </Text>
                      </Pressable>

                      {/* Card Action Controls */}
                      <View style={styles.cardControls}>
                        <Pressable
                          onPress={() => playWord(w, lang, settings.speechRate || 0.9)}
                          style={styles.controlIconBtn}
                        >
                          <Ionicons name="volume-medium" size={16} color={colors.forest} />
                        </Pressable>
                        <Pressable
                          onPress={() => setEditorWord(w)}
                          style={styles.controlIconBtn}
                        >
                          <Ionicons name="create-outline" size={16} color={colors.blueDeep} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteWord(w)}
                          style={styles.controlIconBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.pinkDeep} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>

              {filteredWords.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>{tt("admNoCardsFound")}</Text>
                  <Pressable
                    onPress={() => setIsAddingWord(true)}
                    style={[styles.actionPrimaryBtn, { marginTop: 12 }]}
                  >
                    <Text style={styles.actionBtnText}>{tt("admAddFirstCard")}</Text>
                  </Pressable>
                </View>
              )}

              {/* Board Translation Action */}
              <View style={styles.syncBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.syncTitle}>{tt("admSyncTitle")}</Text>
                  <Text style={styles.syncDesc}>
                    {tt("admSyncDesc").replace("{lang}", lang)}
                  </Text>
                </View>
                <Pressable onPress={handleRetranslateBoards} style={styles.syncBtn}>
                  <Ionicons name="language" size={16} color={colors.forest} />
                  <Text style={styles.syncBtnText}>{tt("admSyncNow")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ================= TAB 2: CHILDREN PROFILES ================= */}
          {activeTab === "children" && (
            <View style={styles.panelSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>{tt("admChildrenTitle")}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tt("admChildrenSubtitle").replace("{count}", String(children.length))}
                  </Text>
                </View>
                {onNavigateAddChild && (
                  <Pressable onPress={onNavigateAddChild} style={styles.actionPrimaryBtn}>
                    <Ionicons name="person-add" size={16} color="white" />
                    <Text style={styles.actionBtnText}>{tt("admEnrollChild")}</Text>
                  </Pressable>
                )}
              </View>

              <View style={[styles.childGrid, isTablet && styles.childGridTablet]}>
                {children.map((ch) => (
                  <View key={ch.id} style={[styles.childCard, isTablet && styles.childCardTablet]}>
                    <View style={styles.childHeader}>
                      <View style={styles.childAvatar}>
                        {ch.photoUrl ? (
                          <Image source={{ uri: ch.photoUrl }} style={styles.avatarImg} />
                        ) : (
                          <Text style={{ fontSize: 24 }}>🧒</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.childName}>{ch.name}</Text>
                        <Text style={styles.childMeta}>
                          {tt("admAgeEnrolled")
                            .replace("{age}", String(ch.age))
                            .replace("{date}", new Date(ch.enrolledAt).toLocaleDateString())}
                        </Text>
                      </View>
                      <View style={styles.starsBadge}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.starsText}>{ch.stars || 0}</Text>
                      </View>
                    </View>

                    {/* Diagnoses Tags */}
                    <View style={styles.diagRow}>
                      {ch.diagnoses && ch.diagnoses.length > 0 ? (
                        ch.diagnoses.map((d) => (
                          <View key={d} style={styles.diagTag}>
                            <Text style={styles.diagTagText}>
                              {DIAGNOSIS_LABELS[d] || d}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={{ fontSize: 12, color: colors.textLight }}>
                          {tt("admNoDiagnoses")}
                        </Text>
                      )}
                    </View>

                    {/* Child Management Row */}
                    <View style={styles.childActionRow}>
                      {onSelectChild && (
                        <Pressable
                          onPress={() => onSelectChild(ch)}
                          style={[styles.actionSmallBtn, { backgroundColor: colors.forest }]}
                        >
                          <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                          <Text style={styles.actionBtnText}>{tt("admSetActive")}</Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => openEditChildModal(ch)}
                        style={[styles.actionSmallBtn, { backgroundColor: colors.blueDeep }]}
                      >
                        <Ionicons name="create-outline" size={16} color="white" />
                        <Text style={styles.actionBtnText}>{tt("admEditRecord")}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteChild(ch)}
                        style={[styles.actionSmallBtn, { backgroundColor: colors.pinkDeep }]}
                      >
                        <Ionicons name="trash-outline" size={16} color="white" />
                        <Text style={styles.actionBtnText}>{tt("admDelete")}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              {children.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>{tt("admNoChildren")}</Text>
                  {onNavigateAddChild && (
                    <Pressable
                      onPress={onNavigateAddChild}
                      style={[styles.actionPrimaryBtn, { marginTop: 12 }]}
                    >
                      <Text style={styles.actionBtnText}>{tt("admEnrollFirstChild")}</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ================= TAB 3: CONTENT & VISUALS ================= */}
          {activeTab === "content" && (
            <View style={styles.panelSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>{tt("admContentTitle")}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tt("admContentSubtitle")}
                  </Text>
                </View>
                {onNavigateReviewQueue && (
                  <Pressable onPress={onNavigateReviewQueue} style={styles.actionPrimaryBtn}>
                    <Ionicons name="list-circle" size={16} color="white" />
                    <Text style={styles.actionBtnText}>{tt("admReviewQueue")}</Text>
                  </Pressable>
                )}
              </View>

              {/* Source Highlights */}
              <View style={styles.sourceGrid}>
                <View style={styles.sourceCard}>
                  <Text style={styles.sourceTitle}>{tt("admArasaacTitle")}</Text>
                  <Text style={styles.sourceDesc}>
                    {tt("admArasaacDesc")}
                  </Text>
                  <View style={styles.sourceStatusActive}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.greenDeep} />
                    <Text style={styles.sourceStatusText}>{tt("admIntegratedCached")}</Text>
                  </View>
                </View>

                <View style={styles.sourceCard}>
                  <Text style={styles.sourceTitle}>{tt("admOpenSymbolsTitle")}</Text>
                  <Text style={styles.sourceDesc}>
                    {tt("admOpenSymbolsDesc")}
                  </Text>
                  <View style={styles.sourceStatusActive}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.greenDeep} />
                    <Text style={styles.sourceStatusText}>{tt("admReadyOnDemand")}</Text>
                  </View>
                </View>
              </View>

              {/* Cache Maintenance Box */}
              <View style={styles.maintenanceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.maintenanceTitle}>{tt("admCacheTitle")}</Text>
                  <Text style={styles.maintenanceDesc}>
                    {tt("admCacheDesc")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => Alert.alert(tt("admCacheCleaned"), tt("admCacheCleanedMsg"))}
                  style={styles.maintenanceBtn}
                >
                  <Ionicons name="refresh" size={16} color={colors.pinkDeep} />
                  <Text style={styles.maintenanceBtnText}>{tt("admClearCache")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ================= TAB 4: SYSTEM & AI SETTINGS ================= */}
          {activeTab === "settings" && (
            <View style={styles.panelSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>{tt("admSettingsTitle")}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tt("admSettingsSubtitle")}
                  </Text>
                </View>
              </View>

              {/* API Keys Box */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="key" size={20} color={colors.forest} />
                  <Text style={styles.configCardTitle}>{tt("admApiKeysTitle")}</Text>
                  <Pressable
                    onPress={() => setShowKeys(!showKeys)}
                    style={{ marginLeft: "auto" }}
                  >
                    <Ionicons
                      name={showKeys ? "eye-off" : "eye"}
                      size={18}
                      color={colors.textMid}
                    />
                  </Pressable>
                </View>

                {/* OpenAI Key */}
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>{tt("admOpenAiKeyLabel")}</Text>
                  <View style={styles.keyInputRow}>
                    <TextInput
                      value={openAiKeyInput}
                      onChangeText={setOpenAiKeyInput}
                      placeholder="sk-..."
                      placeholderTextColor={colors.textLight}
                      secureTextEntry={!showKeys}
                      style={[styles.inputField, { flex: 1 }]}
                    />
                    <Pressable onPress={saveOpenAiKey} style={styles.saveKeyBtn}>
                      <Text style={styles.saveKeyBtnText}>{t("save", lang)}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.fieldHint}>
                    {isAiConfigured()
                      ? tt("admAiConfigured")
                      : tt("admAiOptional")}
                  </Text>
                </View>

                {/* Pixabay Key */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.inputLabel}>{tt("admPixabayKeyLabel")}</Text>
                  <View style={styles.keyInputRow}>
                    <TextInput
                      value={pixabayKeyInput}
                      onChangeText={setPixabayKeyInput}
                      placeholder={tt("admPixabayPlaceholder")}
                      placeholderTextColor={colors.textLight}
                      secureTextEntry={!showKeys}
                      style={[styles.inputField, { flex: 1 }]}
                    />
                    <Pressable onPress={savePixabayKey} style={styles.saveKeyBtn}>
                      <Text style={styles.saveKeyBtnText}>{t("save", lang)}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Audio & Speech Synthesizer */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="volume-high" size={20} color={colors.forest} />
                  <Text style={styles.configCardTitle}>{tt("admSpeechEngineTitle")}</Text>
                </View>

                <View style={styles.audioRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>{tt("admVoiceTest").replace("{lang}", lang)}</Text>
                    <Text style={styles.fieldHint}>
                      {tt("admSpeechRateLabel").replace("{rate}", String(settings.speechRate || 0.9))}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleTestVoice}
                    disabled={speechTestPlaying}
                    style={styles.testVoiceBtn}
                  >
                    <Ionicons
                      name={speechTestPlaying ? "radio-outline" : "play"}
                      size={16}
                      color="white"
                    />
                    <Text style={styles.actionBtnText}>
                      {speechTestPlaying ? tt("admPlaying") : tt("admTestVoice")}
                    </Text>
                  </Pressable>
                </View>

                {/* Speech rate presets */}
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>{tt("admSpeechPreset")}</Text>
                  <View style={styles.presetRow}>
                    {[
                      { label: tt("admPresetSlow"), rate: 0.65 },
                      { label: tt("admPresetNormal"), rate: 0.9 },
                      { label: tt("admPresetFast"), rate: 1.0 },
                    ].map((p) => {
                      const isSel = Math.abs(settings.speechRate - p.rate) < 0.05;
                      return (
                        <Pressable
                          key={p.rate}
                          onPress={() => update({ speechRate: p.rate })}
                          style={[styles.presetChip, isSel && styles.presetChipActive]}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              isSel && styles.presetChipTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Sound & Haptics Toggles */}
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleItemLabel}>{tt("admSoundFx")}</Text>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(val) => update({ soundEnabled: val })}
                    trackColor={{ false: colors.border, true: colors.greenDeep }}
                  />
                </View>
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleItemLabel}>{tt("admHaptics")}</Text>
                  <Switch
                    value={settings.hapticsEnabled}
                    onValueChange={(val) => update({ hapticsEnabled: val })}
                    trackColor={{ false: colors.border, true: colors.greenDeep }}
                  />
                </View>
              </View>

              {/* Language Selector */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="language" size={20} color={colors.forest} />
                  <Text style={styles.configCardTitle}>{tt("admLanguageTitle")}</Text>
                </View>
                <View style={styles.langGrid}>
                  {LANGUAGES.map((l) => {
                    const isSel = lang === l.code;
                    return (
                      <Pressable
                        key={l.code}
                        onPress={() => {
                          update({ language: l.code });
                          setSeedLanguage(l.code);
                          retranslateSeedBoard(l.code);
                          applyLanguageDirection(l.code);
                        }}
                        style={[styles.langChip, isSel && styles.langChipActive]}
                      >
                        <Text style={{ fontSize: 18 }}>{l.flag}</Text>
                        <View>
                          <Text style={[styles.langName, isSel && styles.langNameActive]}>
                            {l.nativeName}
                          </Text>
                          <Text style={[styles.langSub, isSel && styles.langSubActive]}>
                            {l.name}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Security & Access */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.forest} />
                  <Text style={styles.configCardTitle}>{tt("admSecurityTitle")}</Text>
                </View>

                {/* Change PIN */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.inputLabel}>{tt("admSetPin")}</Text>
                  <View style={styles.keyInputRow}>
                    <TextInput
                      value={adminPinInput}
                      onChangeText={setAdminPinInput}
                      placeholder={tt("admPinPlaceholder")}
                      placeholderTextColor={colors.textLight}
                      keyboardType="number-pad"
                      maxLength={4}
                      style={[styles.inputField, { flex: 1 }]}
                    />
                    <Pressable onPress={saveNewPin} style={styles.saveKeyBtn}>
                      <Text style={styles.saveKeyBtnText}>{tt("admUpdatePin")}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Kiosk Mode Toggle */}
                <View style={[styles.toggleItem, { marginTop: 14 }]}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.toggleItemLabel}>{tt("admKioskLock")}</Text>
                    <Text style={styles.fieldHint}>
                      {tt("admKioskDesc")}
                    </Text>
                  </View>
                  <Switch
                    value={settings.kioskMode}
                    onValueChange={(val) => update({ kioskMode: val })}
                    trackColor={{ false: colors.border, true: colors.greenDeep }}
                  />
                </View>
              </View>

              {/* Full JSON Backup & Restore */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="cloud-upload" size={20} color={colors.forest} />
                  <Text style={styles.configCardTitle}>{tt("admBackupTitle")}</Text>
                </View>
                <Text style={styles.fieldHint}>
                  {tt("admBackupDesc")}
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <Pressable onPress={handleExportBackup} style={[styles.actionPrimaryBtn, { flex: 1 }]}>
                    <Ionicons name="download" size={16} color="white" />
                    <Text style={styles.actionBtnText}>{tt("admExportJson")}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setBackupModalOpen(true)}
                    style={[styles.actionSecondaryBtn, { flex: 1 }]}
                  >
                    <Ionicons name="arrow-up-circle" size={16} color={colors.forest} />
                    <Text style={styles.actionSecondaryBtnText}>{tt("admImportJson")}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* ================= TAB 5: CLINICAL ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <View style={styles.panelSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>{tt("admAnalyticsTitle")}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tt("admAnalyticsSubtitle")}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => {
                      const report = tt("admReportTemplate")
                        .replace("{date}", new Date().toLocaleString())
                        .replace("{children}", String(children.length))
                        .replace("{taps}", String(aggregatedStats.totalWordTaps))
                        .replace("{sentences}", String(aggregatedStats.totalSentences))
                        .replace("{routine}", String(aggregatedStats.avgRoutine))
                        .replace("{topWords}", aggregatedStats.topWords.map(([w, c]) => `${w} (${c})`).join(", "));
                      Share.share({ message: report, title: "KiddoCare_Clinical_Report.txt" });
                    }}
                    style={styles.actionPrimaryBtn}
                  >
                    <Ionicons name="share-social" size={16} color="white" />
                    <Text style={styles.actionBtnText}>{tt("admReport")}</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleExportCsv}
                    style={[styles.actionPrimaryBtn, { backgroundColor: "#0284c7" }]}
                  >
                    <Ionicons name="document-text" size={16} color="white" />
                    <Text style={styles.actionBtnText}>{tt("admExportCsv")}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Metric Stat Cards */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{children.length}</Text>
                  <Text style={styles.statLabel}>{tt("admEnrolledPatients")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.greenDeep }]}>
                    {aggregatedStats.totalWordTaps}
                  </Text>
                  <Text style={styles.statLabel}>{tt("admWeeklyWordTaps")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.blueDeep }]}>
                    {aggregatedStats.totalSentences}
                  </Text>
                  <Text style={styles.statLabel}>{tt("admSentencesSpoken")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.orangeDeep }]}>
                    {aggregatedStats.avgRoutine}%
                  </Text>
                  <Text style={styles.statLabel}>{tt("admAvgAdherence")}</Text>
                </View>
              </View>

              {/* Top Communicated Words Leaderboard */}
              <View style={styles.configCard}>
                <View style={styles.configCardHeader}>
                  <Ionicons name="flame" size={20} color="#f59e0b" />
                  <Text style={styles.configCardTitle}>{tt("admTopVocab")}</Text>
                </View>
                {aggregatedStats.topWords.length > 0 ? (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {aggregatedStats.topWords.map(([w, cnt], idx) => (
                      <View key={w} style={styles.leaderboardRow}>
                        <Text style={styles.rankNum}>#{idx + 1}</Text>
                        <Text style={styles.rankWord}>{w}</Text>
                        <View style={styles.rankCountBadge}>
                          <Text style={styles.rankCountText}>{tt("admTapsSuffix").replace("{count}", String(cnt))}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.fieldHint, { marginTop: 10 }]}>
                    {tt("admNoWordEvents")}
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Word Editor Modal */}
        {activeCategory && (
          <WordEditor
            visible={isAddingWord || !!editorWord}
            catId={activeCategory.id}
            word={editorWord}
            onClose={() => {
              setIsAddingWord(false);
              setEditorWord(null);
            }}
            onSaved={() => {
              setIsAddingWord(false);
              setEditorWord(null);
              refreshCategories();
            }}
          />
        )}

        {/* New Category Modal */}
        <Modal visible={newCatModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
              <Text style={styles.modalTitle}>{tt("admNewCategoryTitle")}</Text>
              <Text style={styles.modalSubtitle}>
                {tt("admNewCategorySubtitle")}
              </Text>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>{tt("admCategoryNameLabel")}</Text>
              <TextInput
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder={tt("admCategoryNamePlaceholder")}
                placeholderTextColor={colors.textLight}
                style={styles.inputField}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("admCategoryIconLabel")}</Text>
              <View style={styles.emojiPickerRow}>
                {["📁", "🏫", "⚽", "🍎", "🧸", "🎨", "🏥", "🚗", "💬", "⭐"].map((em) => (
                  <Pressable
                    key={em}
                    onPress={() => setNewCatIcon(em)}
                    style={[styles.emojiPickBtn, newCatIcon === em && styles.emojiPickBtnActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{em}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setNewCatModal(false)}
                  style={styles.actionSecondaryBtn}
                >
                  <Text style={styles.actionSecondaryBtnText}>{t("cancel", lang)}</Text>
                </Pressable>
                <Pressable onPress={handleCreateCategory} style={styles.actionPrimaryBtn}>
                  <Text style={styles.actionBtnText}>{tt("admCreateCategory")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Child Profile Modal */}
        <Modal visible={childModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
              <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
                <Text style={styles.modalTitle}>{tt("admEditChildTitle")}</Text>
                <Text style={styles.modalSubtitle}>{tt("admEditChildSubtitle")}</Text>

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>{tt("admChildNameLabel")}</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.inputField}
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("admAgeYearsLabel")}</Text>
                <TextInput
                  value={editAge}
                  onChangeText={setEditAge}
                  keyboardType="number-pad"
                  style={styles.inputField}
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("admDensityLabel")}</Text>
                <View style={styles.densityChipsRow}>
                  {[
                    { label: tt("admDensityBeginner"), val: 1 },
                    { label: "2", val: 2 },
                    { label: "4", val: 4 },
                    { label: "8", val: 8 },
                    { label: "12", val: 12 },
                    { label: "20", val: 20 },
                    { label: "28", val: 28 },
                    { label: tt("admDensityDense"), val: 35 },
                  ].map((item) => {
                    const sel = editDensity === item.val;
                    return (
                      <Pressable
                        key={item.val}
                        onPress={() => setEditDensity(item.val)}
                        style={[styles.densityChip, sel && styles.densityChipActive]}
                      >
                        <Text style={[styles.densityChipText, sel && styles.densityChipTextActive]}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("admPageStyleLabel")}</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <Pressable
                    onPress={() => setEditPageStyle("category-folders")}
                    style={[
                      styles.pageStyleBtn,
                      editPageStyle === "category-folders" && styles.pageStyleBtnActive,
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>📁</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pageStyleTitle, editPageStyle === "category-folders" && styles.pageStyleTitleActive]}>
                        {tt("admCategoryFolders")}
                      </Text>
                      <Text style={styles.pageStyleSub}>{tt("admCategoryFoldersSub")}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditPageStyle("core-grid")}
                    style={[
                      styles.pageStyleBtn,
                      editPageStyle === "core-grid" && styles.pageStyleBtnActive,
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>🔲</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pageStyleTitle, editPageStyle === "core-grid" && styles.pageStyleTitleActive]}>
                        {tt("admFixedCoreGrid")}
                      </Text>
                      <Text style={styles.pageStyleSub}>{tt("admFixedCoreGridSub")}</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>{tt("admDiagnosesTagsLabel")}</Text>
                <View style={styles.diagSelectGrid}>
                  {(Object.keys(DIAGNOSIS_LABELS) as DiagnosisType[]).map((diag) => {
                    const sel = editDiagnoses.includes(diag);
                    return (
                      <Pressable
                        key={diag}
                        onPress={() => toggleDiagnosis(diag)}
                        style={[styles.diagSelectChip, sel && styles.diagSelectChipActive]}
                      >
                        <Ionicons
                          name={sel ? "checkbox" : "square-outline"}
                          size={16}
                          color={sel ? "white" : colors.textMid}
                        />
                        <Text style={[styles.diagSelectText, sel && styles.diagSelectTextActive]}>
                          {DIAGNOSIS_LABELS[diag]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setChildModalOpen(false)}
                    style={styles.actionSecondaryBtn}
                  >
                    <Text style={styles.actionSecondaryBtnText}>{t("cancel", lang)}</Text>
                  </Pressable>
                  <Pressable onPress={saveChildProfile} style={styles.actionPrimaryBtn}>
                    <Text style={styles.actionBtnText}>{tt("admSaveChanges")}</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Backup Modal */}
        <Modal visible={backupModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxHeight: "80%" }, isTablet && styles.modalCardTablet]}>
              <Text style={styles.modalTitle}>{tt("admBackupModalTitle")}</Text>
              <Text style={styles.modalSubtitle}>
                {tt("admBackupModalSubtitle")}
              </Text>

              <TextInput
                value={importText}
                onChangeText={setImportText}
                placeholder={tt("admPasteJsonPlaceholder")}
                placeholderTextColor={colors.textLight}
                multiline
                style={[styles.inputField, { height: 160, textAlignVertical: "top", marginTop: 12 }]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setBackupModalOpen(false)}
                  style={styles.actionSecondaryBtn}
                >
                  <Text style={styles.actionSecondaryBtnText}>{tt("admCloseBtn")}</Text>
                </Pressable>
                <Pressable onPress={handleImportBackup} style={styles.actionPrimaryBtn}>
                  <Text style={styles.actionBtnText}>{tt("admRestoreData")}</Text>
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { alignItems: "center", justifyContent: "center" },

  /* Top Header */
  topHeader: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  topHeaderInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topHeaderInnerTablet: {
    maxWidth: 1040,
    alignSelf: "center",
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "800" },
  headerSubtitle: { color: "#94a3b8", fontSize: 11.5, marginTop: 2 },
  adminBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: { color: "white", fontSize: 9.5, fontWeight: "900" },

  /* Tabs Navigation Bar */
  tabsNavContainer: {
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  tabsNav: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabsNavTablet: {
    maxWidth: 1040,
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: colors.forest,
  },
  tabText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "white",
  },

  /* Scroll Content */
  scrollContent: { padding: 16, paddingBottom: 60 },
  scrollContentTablet: {
    maxWidth: 1040,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 28,
  },
  panelSection: { gap: 16 },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  sectionSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },

  /* Buttons */
  actionPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionSecondaryBtnText: { color: "#334155", fontWeight: "700", fontSize: 13 },
  actionBtnText: { color: "white", fontWeight: "700", fontSize: 13 },
  actionSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  /* Category chips */
  catChipsRow: { gap: 8, paddingVertical: 4 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  catChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: colors.blueDeep,
  },
  catChipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  catChipTextActive: { color: colors.blueDeep, fontWeight: "700" },

  /* Active Category Toolbar */
  activeCatToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeCatName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  activeCatCount: { fontSize: 12, color: "#64748b" },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a" },

  /* Cards Grid */
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardItem: {
    width: "31%",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
    alignItems: "center",
  },
  cardItemSmallPhone: {
    width: "48%",
  },
  cardItemTablet: {
    width: "23.2%",
  },
  cardItemLargeTablet: {
    width: "18.3%",
  },
  cardPreview: { alignItems: "center", width: "100%" },
  cardImg: { width: 52, height: 52, marginBottom: 6 },
  cardLabel: { fontSize: 12, fontWeight: "700", color: "#1e293b", textAlign: "center" },
  cardControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 6,
    width: "100%",
  },
  controlIconBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },

  /* Empty Box */
  emptyBox: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: { color: "#64748b", fontSize: 14, fontWeight: "500" },

  /* Sync Box */
  syncBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    gap: 12,
  },
  syncTitle: { fontSize: 14, fontWeight: "700", color: "#065f46" },
  syncDesc: { fontSize: 11.5, color: "#047857", marginTop: 2 },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  syncBtnText: { color: "#065f46", fontSize: 12, fontWeight: "700" },

  /* Children Grid & Cards */
  childGrid: {
    gap: 14,
  },
  childGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  childCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 12,
  },
  childCardTablet: {
    width: "48.8%",
  },
  childHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  childAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  childName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  childMeta: { fontSize: 12, color: "#64748b" },
  starsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starsText: { fontSize: 12, fontWeight: "800", color: "#b45309" },
  diagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  diagTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diagTagText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  childActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },

  /* Source Highlights */
  sourceGrid: { flexDirection: "row", gap: 10 },
  sourceCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    gap: 6,
  },
  sourceTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  sourceDesc: { fontSize: 11, color: "#64748b", lineHeight: 15 },
  sourceStatusActive: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  sourceStatusText: { fontSize: 11, fontWeight: "700", color: colors.greenDeep },

  /* Maintenance Card */
  maintenanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 12,
  },
  maintenanceTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  maintenanceDesc: { fontSize: 11.5, color: "#64748b", marginTop: 2 },
  maintenanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff1f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  maintenanceBtnText: { color: colors.pinkDeep, fontSize: 12, fontWeight: "700" },

  /* Configuration Card */
  configCard: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  configCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  configCardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  inputLabel: { fontSize: 12.5, fontWeight: "700", color: "#334155", marginBottom: 4 },
  fieldHint: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  keyInputRow: { flexDirection: "row", gap: 8, marginTop: 4 },
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
  saveKeyBtn: {
    backgroundColor: colors.forest,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveKeyBtnText: { color: "white", fontWeight: "700", fontSize: 13 },

  /* Audio Synthesizer */
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  testVoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  presetRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  presetChipActive: { backgroundColor: "#eff6ff", borderColor: colors.blueDeep },
  presetChipText: { fontSize: 11.5, fontWeight: "600", color: "#475569" },
  presetChipTextActive: { color: colors.blueDeep, fontWeight: "700" },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  toggleItemLabel: { fontSize: 13, fontWeight: "600", color: "#1e293b" },

  /* Language Selection Grid */
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langChipActive: { backgroundColor: "#ecfdf5", borderColor: colors.greenDeep },
  langName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  langNameActive: { color: colors.greenDeep },
  langSub: { fontSize: 10.5, color: "#94a3b8" },
  langSubActive: { color: colors.forest },

  /* Stats Grid */
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  statNumber: { fontSize: 26, fontWeight: "900", color: "#0f172a" },
  statLabel: { fontSize: 11.5, color: "#64748b", marginTop: 4, fontWeight: "600" },

  /* Leaderboard */
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rankNum: { width: 30, fontSize: 12, fontWeight: "800", color: "#94a3b8" },
  rankWord: { flex: 1, fontSize: 13.5, fontWeight: "700", color: "#1e293b" },
  rankCountBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankCountText: { fontSize: 11, fontWeight: "700", color: "#475569" },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  modalCardTablet: {
    maxWidth: 580,
    padding: 26,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  emojiPickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  emojiPickBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  emojiPickBtnActive: { backgroundColor: "#eff6ff", borderColor: colors.blueDeep },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 18 },

  /* Diag select */
  diagSelectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  diagSelectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  diagSelectChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  diagSelectText: { fontSize: 11, color: "#475569", fontWeight: "600" },
  diagSelectTextActive: { color: "white" },

  /* Density & PageSet Styles */
  densityChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  densityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  densityChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  densityChipText: { fontSize: 11.5, fontWeight: "600", color: "#475569" },
  densityChipTextActive: { color: "white", fontWeight: "700" },
  pageStyleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  pageStyleBtnActive: { borderColor: colors.forest, backgroundColor: "#ecfdf5" },
  pageStyleTitle: { fontSize: 12, fontWeight: "700", color: "#1e293b" },
  pageStyleTitleActive: { color: colors.forest },
  pageStyleSub: { fontSize: 9.5, color: "#64748b", marginTop: 2 },
});
