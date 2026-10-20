/**
 * Short real-life video clips for lessons, keyed by the lesson's stable id
 * ("sc3-plants-001"). A lesson with a clip shows it in place of the picture.
 *
 * For now the clips ship inside the app for testing. Once every lesson has
 * one they move to cloud storage: made once per lesson, downloaded on first
 * view and kept on the phone.
 */
const VIDEOS: Record<string, number> = {
  // Part 1 · "A plant is a living thing" (Gemini / Veo test clip)
  "sc3-plants-001": require("../../assets/videos/sc3-plants-001.mp4"),
  // Part 1 · "A bean plant grows taller every day"
  "sc3-plants-002": require("../../assets/videos/sc3-plants-002.mp4"),
  // Part 1 · "A plant needs water and air to stay alive"
  "sc3-plants-003": require("../../assets/videos/sc3-plants-003.mp4"),
  // Part 1 · "A plant makes its own food, but a camel must find and eat its food"
  "sc3-plants-004": require("../../assets/videos/sc3-plants-004.mp4"),
};

/** The clip for a lesson, if it has one. */
export function lessonVideo(lessonId: string | undefined): number | null {
  return (lessonId && VIDEOS[lessonId]) || null;
}
