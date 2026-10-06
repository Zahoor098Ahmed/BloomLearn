import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBJECT_LIST, GRADES, chaptersFor, lessonCount, type Subject, type Grade, type Chapter } from "./curriculum";

/**
 * Learning progress: which lessons of which chapters the child has done, and
 * on which days. It is built up as the child uses the school chapters in
 * Picture Talk, and stored only on this device.
 */

export interface ProgressData {
  /** Sentences said or typed in Picture Talk (any mode). */
  sentences: number;
  voiceSentences: number;
  aiPictures: number;
  /** "YYYY-MM-DD" -> sentences that day */
  byDay: Record<string, number>;
  /** chapter id -> lesson indexes the child has done */
  lessons: Record<string, number[]>;
  /** "YYYY-MM-DD" -> new lessons done that day */
  lessonsByDay: Record<string, number>;
  /** The last lesson opened, to continue from. */
  lastLesson: { chapterId: string; index: number; at: number } | null;
}

const STORE_PREFIX = "bloomlearn_progress";

let activeChildId: string | null = null;

function getStoreKey(): string {
  return activeChildId ? `${STORE_PREFIX}_${activeChildId}` : STORE_PREFIX;
}

export async function switchChildForProgress(childId: string | null): Promise<void> {
  activeChildId = childId;
  loaded = false;
  data = fresh();
  await ensureLoaded();
}

const EMPTY: ProgressData = {
  sentences: 0,
  voiceSentences: 0,
  aiPictures: 0,
  byDay: {},
  lessons: {},
  lessonsByDay: {},
  lastLesson: null,
};

let data: ProgressData = fresh();
let loaded = false;

function fresh(): ProgressData {
  return JSON.parse(JSON.stringify(EMPTY));
}

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(getStoreKey());
    data = raw ? { ...fresh(), ...JSON.parse(raw) } : fresh();
  } catch {
    data = fresh();
  }
  loaded = true;
}

function persist() {
  AsyncStorage.setItem(getStoreKey(), JSON.stringify(data)).catch(() => {});
}

export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export async function getProgress(): Promise<ProgressData> {
  await ensureLoaded();
  return data;
}

/** Count one finished sentence from Picture Talk. */
export async function recordSentence(text: string, viaVoice: boolean): Promise<void> {
  if (text.trim().length < 3) return;
  await ensureLoaded();
  data.sentences += 1;
  if (viaVoice) data.voiceSentences += 1;
  bump(data.byDay, dayKey());
  persist();
}

/** Remember that a lesson in a chapter was done (and where to continue). */
export async function recordLesson(chapterId: string, index: number): Promise<void> {
  await ensureLoaded();
  data.lastLesson = { chapterId, index, at: Date.now() };
  const seen = data.lessons[chapterId] ?? [];
  if (!seen.includes(index)) {
    data.lessons = { ...data.lessons, [chapterId]: [...seen, index] };
    data.lessonsByDay = { ...data.lessonsByDay };
    bump(data.lessonsByDay, dayKey());
  }
  persist();
}

export async function recordAiPicture(): Promise<void> {
  await ensureLoaded();
  data.aiPictures += 1;
  persist();
}

export async function clearProgress(): Promise<void> {
  data = fresh();
  loaded = true;
  try {
    await AsyncStorage.removeItem(getStoreKey());
  } catch {
    /* ignore */
  }
}

// --- lessons, chapters, subjects -------------------------------------------

/** How many lessons of a chapter have been done. */
export function lessonsDone(p: ProgressData, chapterId: string): number {
  return p.lessons?.[chapterId]?.length ?? 0;
}

export function chapterComplete(p: ProgressData, chapter: Chapter): boolean {
  return lessonsDone(p, chapter.id) >= chapter.lessons.length;
}

export function gradeReport(p: ProgressData, subject: Subject, grade: Grade): { done: number; total: number } {
  return chaptersFor(subject, grade).reduce(
    (acc, c) => ({ done: acc.done + lessonsDone(p, c.id), total: acc.total + c.lessons.length }),
    { done: 0, total: 0 },
  );
}

export interface SubjectReport {
  subject: Subject;
  done: number;
  total: number;
  chaptersDone: number;
  chaptersTotal: number;
  grades: { grade: Grade; done: number; total: number }[];
}

export function subjectReport(p: ProgressData, subject: Subject): SubjectReport {
  const grades = GRADES.map((grade) => ({ grade, ...gradeReport(p, subject, grade) }));
  const chapters = GRADES.flatMap((g) => chaptersFor(subject, g));
  return {
    subject,
    done: grades.reduce((n, g) => n + g.done, 0),
    total: lessonCount(subject),
    chaptersDone: chapters.filter((c) => chapterComplete(p, c)).length,
    chaptersTotal: chapters.length,
    grades,
  };
}

export function overallReport(p: ProgressData): { done: number; total: number; chaptersDone: number; chaptersTotal: number } {
  const all = SUBJECT_LIST.map((s) => subjectReport(p, s));
  return {
    done: all.reduce((n, r) => n + r.done, 0),
    total: all.reduce((n, r) => n + r.total, 0),
    chaptersDone: all.reduce((n, r) => n + r.chaptersDone, 0),
    chaptersTotal: all.reduce((n, r) => n + r.chaptersTotal, 0),
  };
}

// --- days ------------------------------------------------------------------

function activeOn(p: ProgressData, key: string): boolean {
  return !!(p.byDay[key] || p.lessonsByDay?.[key]);
}

/** Days in a row (ending today or yesterday) with any practice. */
export function streak(p: ProgressData): number {
  const d = new Date();
  if (!activeOn(p, dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (activeOn(p, dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Lessons done on each of the last 7 days, oldest first. */
export function lastWeek(p: ProgressData): { key: string; date: Date; count: number }[] {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ key, date: d, count: p.lessonsByDay?.[key] ?? 0 });
  }
  return out;
}

export function lessonsToday(p: ProgressData): number {
  return p.lessonsByDay?.[dayKey()] ?? 0;
}

// --- badges ----------------------------------------------------------------

export interface Badge {
  id: string;
  earned: boolean;
}

export function badges(p: ProgressData): Badge[] {
  const all = overallReport(p);
  const reports = SUBJECT_LIST.map((s) => subjectReport(p, s));
  const s = streak(p);
  return [
    { id: "firstLesson", earned: all.done >= 1 },
    { id: "firstChapter", earned: all.chaptersDone >= 1 },
    { id: "tenLessons", earned: all.done >= 10 },
    { id: "fiftyLessons", earned: all.done >= 50 },
    { id: "allSubjects", earned: reports.every((r) => r.done > 0) },
    { id: "gradeOne", earned: reports.some((r) => r.grades[0].total > 0 && r.grades[0].done >= r.grades[0].total) },
    { id: "streak3", earned: s >= 3 },
    { id: "streak7", earned: s >= 7 },
  ];
}
