import { describe, it } from "node:test";
import assert from "node:assert";
import {
  validateChapterSentence,
  getChapterImagePrompt,
  isPrepositionChapter,
  chapterById,
} from "./curriculum";

describe("Curriculum Validation & High Quality Prompt Generation", () => {
  it("identifies preposition chapters correctly", () => {
    assert.strictEqual(isPrepositionChapter("en1-prepositions"), true);
    assert.strictEqual(isPrepositionChapter("en2-prepositions"), true);
    assert.strictEqual(isPrepositionChapter("en1-colours"), false);
    assert.strictEqual(isPrepositionChapter("ma1-counting"), false);
  });

  it("validates predefined chapter lessons as always valid", () => {
    const course = chapterById("en1-prepositions")!;
    for (const lesson of course.chapter.lessons) {
      const res = validateChapterSentence("en1-prepositions", lesson.say);
      assert.strictEqual(res.valid, true, `Lesson "${lesson.say}" should be valid`);
    }
  });

  it("accepts custom preposition sentences in English Grade 1 Prepositions", () => {
    const validSentences = [
      "A puppy is under the bench",
      "The bird is above the house",
      "The rabbit is inside the box",
      "The boy is standing behind the door",
      "The keys are on the desk",
      "The cat is beside the bed",
      "The girl is in front of the car",
    ];

    for (const s of validSentences) {
      const res = validateChapterSentence("en1-prepositions", s);
      assert.strictEqual(res.valid, true, `"${s}" should be valid`);
    }
  });

  it("rejects non-preposition sentences in English Grade 1 Prepositions", () => {
    const invalidSentences = [
      "I love pizza",
      "The car is red",
      "Good morning",
      "A fast horse",
      "Look at the sunny day",
    ];

    for (const s of invalidSentences) {
      const res = validateChapterSentence("en1-prepositions", s);
      assert.strictEqual(res.valid, false, `"${s}" should be rejected in prepositions chapter`);
      assert.ok(res.reason?.includes("Prepositions"));
      assert.ok(res.suggestions && res.suggestions.length > 0);
    }
  });

  it("builds high quality educational prompts for prepositions", () => {
    const prompt = getChapterImagePrompt("en1-prepositions", "The cat is on the table");
    assert.ok(prompt.includes("ON"), "Prompt should emphasize ON in uppercase");
    assert.ok(prompt.includes("cat"), "Prompt should mention cat");
    assert.ok(prompt.includes("table"), "Prompt should mention table");
    assert.ok(!prompt.includes("single clear centred subject"), "Prompt must avoid single-subject isolation");
    assert.ok(prompt.includes("no text"), "Prompt should have negative text guidance");
  });

  it("validates Colours chapter properly", () => {
    const resGood = validateChapterSentence("en1-colours", "A green leaf");
    assert.strictEqual(resGood.valid, true);

    const resBad = validateChapterSentence("en1-colours", "The dog is barking");
    assert.strictEqual(resBad.valid, false);
  });

  it("validates Action words chapter properly", () => {
    const resGood = validateChapterSentence("en1-actions", "The boy is running");
    assert.strictEqual(resGood.valid, true);

    const resBad = validateChapterSentence("en1-actions", "A wooden chair");
    assert.strictEqual(resBad.valid, false);
  });

  it("builds exact counting prompts for math sums (e.g. 2 pencil + 3 pencil)", () => {
    const promptAdd = getChapterImagePrompt("ma1-adding", "2 pencil + 3 pencil");
    assert.ok(promptAdd.includes("2 colorful pencils"), "Prompt must specify 2 pencils on left");
    assert.ok(promptAdd.includes("3 colorful pencils"), "Prompt must specify 3 pencils on right");
    assert.ok(promptAdd.includes("5 pencils"), "Prompt must specify total 5 pencils");
    assert.ok(!promptAdd.includes("2 pencil + 3 pencil"), "Prompt must not contain raw equation notation with plus");

    const promptSub = getChapterImagePrompt("ma1-subtracting", "5 apples - 2 apples");
    assert.ok(promptSub.includes("5 colorful apples"), "Prompt must specify 5 apples");
    assert.ok(promptSub.includes("2 of them separated"), "Prompt must specify 2 taken away");
    assert.ok(promptSub.includes("3 apples"), "Prompt must specify 3 remaining");

    const promptShape = getChapterImagePrompt("ma1-shapes", "A circle");
    assert.ok(promptShape.includes("circle"), "Prompt must mention circle");
    assert.ok(promptShape.includes("pure clean white background"), "Prompt must have clean background");
  });
});
