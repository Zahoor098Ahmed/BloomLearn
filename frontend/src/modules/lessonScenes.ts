import { sceneFromSpec, type SceneSession } from "./sceneSession";
import { LESSON_SCENE_SPECS } from "./lessonScenes.data";

/**
 * The exact on-device picture for a school lesson sentence.
 *
 * The rule parser draws short sentences well ("The cat is on the table"), but
 * lesson sentences often say more than it can understand ("A sunflower turns
 * towards the sun", "A boy is going home"). Those lessons carry a fixed scene
 * spec (see sceneFromSpec) so the picture always shows what the sentence says.
 */

function key(sentence: string): string {
  return sentence.toLowerCase().replace(/[.,!?;:"']/g, " ").replace(/\s+/g, " ").trim();
}

const SPECS = new Map(Object.entries(LESSON_SCENE_SPECS).map(([s, spec]) => [key(s), spec]));

/** The spec written for this lesson sentence, if it has one. */
export function lessonSceneSpec(sentence: string): string | null {
  return SPECS.get(key(sentence)) ?? null;
}

/** The fixed picture for this lesson sentence, or null to let the parser draw it. */
export function lessonScene(sentence: string): SceneSession | null {
  const spec = lessonSceneSpec(sentence);
  return spec ? sceneFromSpec(spec) : null;
}
