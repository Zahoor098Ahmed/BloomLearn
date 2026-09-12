import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ChildProfile } from "../types";
import { DIAGNOSIS_LABELS } from "../types";
import { loadChildren, deleteChild, getUsage } from "../modules/storage";
import { useSettings } from "../context/SettingsContext";
import { useResponsive } from "../modules/responsive";
import { t, diagnosisLabel } from "../modules/i18n";
import { tapFeedback } from "../modules/haptics";
import Mascot from "../components/Mascot";
import EmergencyPasscardModal from "../components/EmergencyPasscardModal";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
  onAddChild: () => void;
  onSelectChild?: (child: ChildProfile) => void;
}

export default function ParentHubScreen({ onBack, onAddChild, onSelectChild }: Props) {
  const { isTablet } = useResponsive();
  const { settings } = useSettings();
  const lang = settings.language;
  const [children, setChildren] = useState<ChildProfile[]>(loadChildren);
  const [selectedPasscardChild, setSelectedPasscardChild] = useState<ChildProfile | null>(null);

  const totalStars = children.reduce((s, c) => s + (c.stars ?? 0), 0);

  function remove(id: string, name: string) {
    tapFeedback();
    Alert.alert(t("removeChildTitle", lang).replace("{name}", name), t("removeChildMsg", lang), [
      { text: t("cancel", lang), style: "cancel" },
      {
        text: t("removeBtnShort", lang),
        style: "destructive",
        onPress: () => {
          deleteChild(id);
          setChildren(loadChildren());
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
            <Pressable
              onPress={() => {
                tapFeedback();
                onBack();
              }}
              style={styles.backBtn}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={20} color="#0f172a" />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>{t("parentHub", lang)}</Text>
              <Text style={styles.headerSub}>
                {t("registeredChildProfilesCount", lang)
                  .replace("{n}", String(children.length))
                  .replace("{s}", children.length !== 1 ? "s" : "")
                  .replace("{stars}", String(totalStars))}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                tapFeedback();
                onAddChild();
              }}
              style={styles.addTopBtn}
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text style={styles.addTopBtnText}>{t("addBtnShort", lang)}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.body, isTablet && styles.bodyTablet]} showsVerticalScrollIndicator={false}>
          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Mascot mood="happy" size={50} animate={false} />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>{t("childrenCareDirectoryTitle", lang)}</Text>
                <Text style={styles.summaryDesc}>
                  {t("childrenCareDirectoryDesc", lang)}
                </Text>
              </View>
            </View>
          </View>

          {/* Children Cards List */}
          {children.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 56 }}>👶</Text>
              <Text style={styles.emptyTitle}>{t("noChildren", lang)}</Text>
              <Text style={styles.emptyDesc}>
                {t("enrollFirstChildHint", lang)}
              </Text>
              <Pressable
                onPress={() => {
                  tapFeedback();
                  onAddChild();
                }}
                style={styles.emptyActionBtn}
              >
                <Ionicons name="add-circle" size={18} color="white" />
                <Text style={styles.emptyActionBtnText}>{t("addChild", lang)}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.childGrid, isTablet && styles.childGridTablet]}>
              {children.map((child) => {
                const usage = getUsage(child.id);
                const wordsThisWeek = usage.wordsByDay.reduce((s, v) => s + v, 0);
                const recorded = usage.scheduleByDay.filter((v) => v > 0);
                const adherence = recorded.length
                  ? Math.round(recorded.reduce((s, v) => s + v, 0) / recorded.length)
                  : 0;
                const since = new Date(child.enrolledAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                });
                const faceOn = child.faceConsent !== false && child.embedding.length > 0;

                return (
                  <View key={child.id} style={[styles.childCard, isTablet && styles.childCardTablet]}>
                    {/* Card Header */}
                    <View style={styles.childTop}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{child.name[0]?.toUpperCase() ?? "C"}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <View style={styles.ageBadge}>
                          <Text style={styles.ageBadgeText}>{t("ageLabelShort", lang).replace("{age}", String(child.age))}</Text>
                        </View>
                      </View>
                      <Text style={styles.childMeta}>{t("enrolledSincePrefix", lang).replace("{date}", since).replace("{stars}", String(child.stars ?? 0))}</Text>
                    </View>
                    <Pressable
                      onPress={() => remove(child.id, child.name)}
                      style={styles.deleteIconBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>

                  {/* Diagnostic Badges */}
                  <View style={styles.tagWrap}>
                    {child.diagnoses.map((d) => (
                      <View key={d} style={styles.tag}>
                        <Text style={styles.tagText}>
                          {diagnosisLabel(d, DIAGNOSIS_LABELS[d], lang)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Clinical Metrics Row */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricTile}>
                      <Text style={styles.metricVal}>{wordsThisWeek}</Text>
                      <Text style={styles.metricLabel}>{t("metricWordsPerWeek", lang)}</Text>
                    </View>
                    <View style={styles.metricTile}>
                      <Text style={styles.metricVal}>{usage.gameStreak ?? 0} 🔥</Text>
                      <Text style={styles.metricLabel}>{t("metricStreak", lang)}</Text>
                    </View>
                    <View style={styles.metricTile}>
                      <Text style={[styles.metricVal, { color: colors.greenDeep }]}>{adherence}%</Text>
                      <Text style={styles.metricLabel}>{t("metricRoutineShort", lang)}</Text>
                    </View>
                    <View style={styles.metricTile}>
                      <Text style={[styles.metricVal, { color: faceOn ? colors.greenDeep : "#94a3b8" }]}>
                        {faceOn ? t("faceScanActive", lang) : t("faceScanOff", lang)}
                      </Text>
                      <Text style={styles.metricLabel}>{t("metricFaceScan", lang)}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.childActionsRow}>
                    {onSelectChild && (
                      <Pressable
                        onPress={() => {
                          tapFeedback();
                          onSelectChild(child);
                        }}
                        style={styles.selectChildBtn}
                      >
                        <Ionicons name="play" size={14} color="white" />
                        <Text style={styles.selectChildBtnText}>{t("launchBoardBtn", lang)}</Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => {
                        tapFeedback();
                        setSelectedPasscardChild(child);
                      }}
                      style={styles.passcardBtn}
                    >
                      <Ionicons name="card" size={14} color="#dc2626" />
                      <Text style={styles.passcardBtnText}>{t("passcardBtnLabel", lang)}</Text>
                    </Pressable>
                  </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Enroll New Child Button */}
          {children.length > 0 && (
            <Pressable
              onPress={() => {
                tapFeedback();
                onAddChild();
              }}
              style={styles.addBottomBtn}
            >
              <Ionicons name="person-add" size={18} color={colors.forest} />
              <Text style={styles.addBottomBtnText}>+ {t("addChild", lang)}</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Emergency Passcard Modal */}
      {selectedPasscardChild && (
        <EmergencyPasscardModal
          visible={!!selectedPasscardChild}
          child={selectedPasscardChild}
          onClose={() => setSelectedPasscardChild(null)}
          onUpdated={(updated) => {
            setSelectedPasscardChild(updated);
            setChildren(loadChildren());
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  headerInnerTablet: {
    maxWidth: 860,
    alignSelf: "center",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  headerSub: { fontSize: 11.5, color: "#64748b", marginTop: 1 },
  addTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addTopBtnText: { color: "white", fontSize: 12, fontWeight: "700" },

  body: { padding: 16, gap: 14, paddingBottom: 40 },
  bodyTablet: {
    maxWidth: 860,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 28,
  },

  summaryBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  summaryDesc: { fontSize: 11.5, color: "#64748b", marginTop: 2, lineHeight: 16 },

  /* Child Grid & Card */
  childGrid: {
    gap: 14,
  },
  childGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  childCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  childCardTablet: {
    width: "48.8%",
  },
  childTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 20, fontWeight: "800" },
  childName: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  ageBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ageBadgeText: { fontSize: 10.5, fontWeight: "700", color: "#475569" },
  childMeta: { fontSize: 11.5, color: "#64748b", marginTop: 1 },
  deleteIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },

  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  tagText: { color: colors.forest, fontSize: 10.5, fontWeight: "700" },

  metricsRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  metricTile: { flex: 1, alignItems: "center", gap: 2 },
  metricVal: { fontSize: 13.5, fontWeight: "800", color: "#0f172a" },
  metricLabel: { fontSize: 9.5, color: "#64748b", fontWeight: "600" },

  childActionsRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  selectChildBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectChildBtnText: { color: "white", fontWeight: "700", fontSize: 12.5 },
  passcardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  passcardBtnText: { color: "#dc2626", fontWeight: "700", fontSize: 12.5 },

  /* Empty State */
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  emptyDesc: { fontSize: 12.5, color: "#64748b", textAlign: "center", lineHeight: 18 },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyActionBtnText: { color: "white", fontWeight: "800", fontSize: 14 },

  addBottomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.forest,
    borderRadius: 14,
    paddingVertical: 14,
  },
  addBottomBtnText: { color: colors.forest, fontWeight: "800", fontSize: 14 },
});
