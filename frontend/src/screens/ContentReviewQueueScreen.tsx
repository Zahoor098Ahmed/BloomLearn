import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSettings } from "../context/SettingsContext";
import { t, type TKey } from "../modules/i18n";
import {
  ensureContentQueueLoaded,
  listQueueEntries,
  queueCounts,
  approveEntry,
  rejectEntry,
  updatePendingEntry,
  deleteQueueEntry,
  importQueueImage,
  type ReviewStatus,
} from "../modules/contentQueue";
import type { ContentReviewEntry, PhraseLevel } from "../types";
import { colors, radius } from "../theme";
import BigButton from "../components/BigButton";

interface Props {
  onBack: () => void;
}

const STATUS_ORDER: { key: ReviewStatus | "all"; labelKey: TKey; tone: string }[] = [
  { key: "pending", labelKey: "crqPending", tone: colors.orangeDeep },
  { key: "approved", labelKey: "crqApproved", tone: colors.greenDeep },
  { key: "rejected", labelKey: "crqRejected", tone: colors.pinkDeep },
  { key: "all", labelKey: "crqAll", tone: colors.textMid },
];

export default function ContentReviewQueueScreen({ onBack }: Props) {
  const { settings } = useSettings();
  const lang = settings.language;
  const tt = (k: TKey) => t(k, lang);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");

  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<ContentReviewEntry | null>(null);
  const [ePhrase, setEPhrase] = useState("");
  const [eVars, setEVars] = useState("");
  const [eImage, setEImage] = useState("");
  const [eLabel, setELabel] = useState("");
  const [eCat, setECat] = useState("");
  const [eLevel, setELevel] = useState<PhraseLevel>(2);
  const [eSource, setESource] = useState("");
  const [eLicense, setELicense] = useState("");
  const [eNote, setENote] = useState("");

  useEffect(() => {
    ensureContentQueueLoaded().then(() => {
      setReady(true);
      setTick((t) => t + 1);
    });
  }, []);

  const counts = useMemo(() => (ready ? queueCounts() : { total: 0, pending: 0, approved: 0, rejected: 0 }), [ready, tick]);
  const entries = useMemo(() => (ready ? listQueueEntries(filter) : []), [ready, tick, filter]);

  function openEdit(e: ContentReviewEntry) {
    setEditing(e);
    setEPhrase(e.phrase);
    setEVars(e.suggestedVariations.join(", "));
    setEImage(e.imagePath);
    setELabel(e.suggestedLabel);
    setECat(e.suggestedCategory);
    setELevel(e.suggestedLevel);
    setESource(e.source);
    setELicense(e.sourceLicense);
    setENote(e.reviewerNote ?? "");
    setEditorVisible(true);
  }

  async function saveEdits() {
    if (!editing) return;
    let img = eImage;
    if (img && img !== editing.imagePath) img = await importQueueImage(img, editing.id);
    updatePendingEntry(editing.id, {
      phrase: ePhrase,
      suggestedVariations: eVars.split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
      imagePath: img,
      suggestedLabel: eLabel,
      suggestedCategory: eCat,
      suggestedLevel: eLevel,
      source: eSource,
      sourceLicense: eLicense,
      reviewerNote: eNote,
    });
    setEditorVisible(false);
    setEditing(null);
    setTick((t) => t + 1);
  }

  function handleApprove(e: ContentReviewEntry) {
    if (e.status === "rejected" || e.status === "approved") {
      Alert.alert(tt("crqAlreadyReviewedTitle"), tt("crqAlreadyReviewedMsg"));
      return;
    }
    Alert.alert(tt("crqApprovePublishTitle"), tt("crqApprovePublishMsg").replace("{label}", e.suggestedLabel), [
      { text: tt("cancel") },
      {
        text: tt("crqApprove"),
        style: "default",
        onPress: () => {
          approveEntry(e.id);
          setTick((t) => t + 1);
        },
      },
    ]);
  }

  function handleReject(e: ContentReviewEntry) {
    if (e.status !== "pending") {
      Alert.alert(tt("crqAlreadyReviewedTitle"), tt("crqAlreadyReviewedMsg"));
      return;
    }
    Alert.alert(tt("crqRejectTitle"), tt("crqRejectMsg").replace("{source}", e.source), [
      { text: tt("cancel") },
      {
        text: tt("crqReject"),
        style: "destructive",
        onPress: () => {
          rejectEntry(e.id);
          setTick((t) => t + 1);
        },
      },
    ]);
  }

  async function pickImage() {
    const r = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!r.granted) return Alert.alert(tt("crqGalleryPermission"));
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled) setEImage(res.assets[0].uri);
  }

  async function takePhoto() {
    const r = await ImagePicker.requestCameraPermissionsAsync();
    if (!r.granted) return Alert.alert(tt("crqCameraPermission"));
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled) setEImage(res.assets[0].uri);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>{tt("crqTitle")}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.statsRow}>
            <Stat label={tt("crqPending")} value={`${counts.pending}`} tone={colors.orangeDeep} />
            <Stat label={tt("crqApproved")} value={`${counts.approved}`} tone={colors.greenDeep} />
            <Stat label={tt("crqRejected")} value={`${counts.rejected}`} tone={colors.pinkDeep} />
          </View>

          <View style={styles.chipRow}>
            {STATUS_ORDER.map((s) => (
              <Pressable key={s.key} onPress={() => setFilter(s.key)} style={[styles.chip, filter === s.key && { backgroundColor: s.tone, borderColor: s.tone }]}>
                <Text style={[styles.chipText, filter === s.key && { color: "white" }]}>
                  {tt(s.labelKey)}
                  {s.key === "pending" && counts.pending > 0 ? ` · ${counts.pending}` : ""}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMid} />
            <Text style={styles.infoText}>{tt("crqInfoText")}</Text>
          </View>

          {entries.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>{tt("crqNothingToShow")}</Text>
              <Text style={styles.emptySub}>
                {filter === "pending" ? tt("crqEmptyPending") : tt("crqEmptyOther")}
              </Text>
            </View>
          )}

          {entries.map((e) => (
            <View key={e.id} style={[styles.card, e.status === "approved" && { borderColor: colors.greenDeep + "80" }, e.status === "rejected" && { borderColor: colors.pinkDeep + "80" }]}>
              <View style={styles.cardRow}>
                <View style={[styles.thumb, { backgroundColor: colors.cardMuted }]}>
                  {e.imagePath ? (
                    <Image source={{ uri: e.imagePath }} style={styles.thumbImg} />
                  ) : (
                    <Ionicons name="image-outline" size={28} color={colors.textMid} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {e.suggestedLabel}
                    </Text>
                    <StatusBadge status={e.status} lang={lang} />
                  </View>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {e.phrase}
                  </Text>
                  <Text style={styles.cardSrc} numberOfLines={1}>
                    {tt("crqSourceLicense").replace("{source}", e.source).replace("{license}", e.sourceLicense)}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {tt("crqCategoryLevel").replace("{category}", e.suggestedCategory).replace("{level}", String(e.suggestedLevel))}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.greenDeep }]}
                  onPress={() => handleApprove(e)}
                  disabled={e.status !== "pending"}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.actionText}>{tt("crqApprove")}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.forest }]}
                  onPress={() => openEdit(e)}
                >
                  <Ionicons name="create-outline" size={16} color="white" />
                  <Text style={styles.actionText}>{tt("crqEdit")}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.pinkDeep }]}
                  onPress={() => handleReject(e)}
                  disabled={e.status !== "pending"}
                >
                  <Ionicons name="close" size={16} color="white" />
                  <Text style={styles.actionText}>{tt("crqReject")}</Text>
                </Pressable>
                {e.status !== "pending" && (
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: colors.cardMuted }]}
                    onPress={() => {
                      Alert.alert(tt("crqDeleteRecordTitle"), tt("crqDeleteRecordMsg"), [
                        { text: tt("cancel") },
                        { text: tt("crqDelete"), style: "destructive", onPress: () => { deleteQueueEntry(e.id); setTick((t) => t + 1); } },
                      ]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textMid} />
                    <Text style={[styles.actionText, { color: colors.textMid }]}>{tt("crqClear")}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={editorVisible} onRequestClose={() => setEditorVisible(false)} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Pressable onPress={() => setEditorVisible(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>{tt("crqEditTitle")}</Text>
            <Pressable onPress={saveEdits} style={styles.backBtn}>
              <Ionicons name="checkmark" size={18} color="white" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.editorBody}>
            <Pressable onPress={() => (eImage ? undefined : pickImage())} style={styles.imagePicker}>
              {eImage ? (
                <Image source={{ uri: eImage }} style={styles.imagePreview} />
              ) : (
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Ionicons name="image" size={44} color={colors.textMid} />
                  <Text style={styles.imageHint}>{tt("crqImagePickHint")}</Text>
                </View>
              )}
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <BigButton variant="mint" onPress={takePhoto} style={{ flex: 1 }}>
                <Text style={styles.btnText}>{tt("crqCameraBtn")}</Text>
              </BigButton>
              <BigButton variant="lavender" onPress={pickImage} style={{ flex: 1 }}>
                <Text style={styles.btnText}>{tt("crqGalleryBtn")}</Text>
              </BigButton>
            </View>

            <Label>{tt("crqDetectedPhrase")}</Label>
            <TextInput value={ePhrase} onChangeText={setEPhrase} style={styles.input} placeholder={tt("crqDetectedPhrasePlaceholder")} placeholderTextColor={colors.textLight} />

            <Label>{tt("crqAltVariations")}</Label>
            <TextInput value={eVars} onChangeText={setEVars} multiline style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]} placeholder={tt("crqAltVariationsPlaceholder")} placeholderTextColor={colors.textLight} />

            <Label>{tt("crqSuggestedLabel")}</Label>
            <TextInput value={eLabel} onChangeText={setELabel} style={styles.input} placeholder={tt("crqSuggestedLabelPlaceholder")} placeholderTextColor={colors.textLight} />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Label>{tt("crqCategoryLabel")}</Label>
                <TextInput value={eCat} onChangeText={setECat} style={styles.input} placeholder={tt("crqCategoryPlaceholder")} placeholderTextColor={colors.textLight} />
              </View>
              <View style={{ width: 96 }}>
                <Label>{tt("crqLevelLabel")}</Label>
                <View style={styles.levelRow}>
                  {[1, 2, 3, 4, 5].map((lv) => (
                    <Pressable key={lv} onPress={() => setELevel(lv as PhraseLevel)} style={[styles.levelBtn, eLevel === lv && { backgroundColor: colors.forest, borderColor: colors.forest }]}>
                      <Text style={[styles.levelBtnText, eLevel === lv && { color: "white" }]}>{lv}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Label>{tt("crqSourceLabel")}</Label>
            <TextInput value={eSource} onChangeText={setESource} style={styles.input} placeholder={tt("crqSourcePlaceholder")} placeholderTextColor={colors.textLight} />

            <Label>{tt("crqLicenseLabel")}</Label>
            <TextInput value={eLicense} onChangeText={setELicense} style={styles.input} placeholder={tt("crqLicensePlaceholder")} placeholderTextColor={colors.textLight} />

            <Label>{tt("crqReviewerNote")}</Label>
            <TextInput value={eNote} onChangeText={setENote} multiline style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]} placeholder={tt("crqReviewerNotePlaceholder")} placeholderTextColor={colors.textLight} />

            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status, lang }: { status: ReviewStatus; lang: Parameters<typeof t>[1] }) {
  const tone = status === "approved" ? colors.greenDeep : status === "rejected" ? colors.pinkDeep : colors.orangeDeep;
  const label = status === "approved" ? t("crqApproved", lang) : status === "rejected" ? t("crqRejected", lang) : t("crqPending", lang);
  return (
    <View style={[styles.statusPill, { backgroundColor: tone + "22" }]}>
      <Text style={[styles.statusText, { color: tone }]}>{label}</Text>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={{ marginTop: 14, marginBottom: 6, fontSize: 13, fontWeight: "700", color: colors.textMid }}>{children}</Text>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, flexDirection: "row", alignItems: "center", gap: 14, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800", flex: 1 },
  body: { padding: 20, gap: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.textDark },
  statLabel: { fontSize: 12, fontWeight: "600", color: colors.textMid },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.textMid },
  infoCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.textMid },
  empty: { padding: 36, alignItems: "center", gap: 10, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  emptySub: { fontSize: 13, color: colors.textMid, textAlign: "center" },
  card: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 12 },
  cardRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  thumb: { width: 72, height: 72, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.textDark },
  cardSub: { fontSize: 13, color: colors.textDark },
  cardSrc: { fontSize: 12, color: colors.textMid, marginTop: 2 },
  cardMeta: { fontSize: 12, color: colors.textMid, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  actionText: { color: "white", fontSize: 13, fontWeight: "700" },
  editorBody: { padding: 20, gap: 4 },
  imagePicker: { height: 220, borderRadius: 20, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  imagePreview: { width: "100%", height: "100%" },
  imageHint: { fontSize: 14, color: colors.textMid, fontWeight: "600" },
  btnText: { color: colors.textDark, fontSize: 14, fontWeight: "700", textAlign: "center" },
  input: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, color: colors.textDark, fontSize: 15 },
  levelRow: { flexDirection: "row", gap: 4 },
  levelBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  levelBtnText: { fontSize: 13, fontWeight: "800", color: colors.textMid },
});
