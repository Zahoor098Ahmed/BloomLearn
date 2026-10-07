/// <reference types="node" />
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  validateChapterSentence,
  getChapterImagePrompt,
  isPrepositionChapter,
  chapterById,
  getAllChapters,
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
    assert.ok(prompt.includes("on top of the table"), "Prompt should spell out the ON position");
    assert.ok(!/\bON\b/.test(prompt), "No uppercase lesson words — image models paint them as text");
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

    // Math questions must be rejected in English Colours chapter:
    const resMath = validateChapterSentence("en1-colours", "5 pencil - 2 pencil");
    assert.strictEqual(resMath.valid, false);
    assert.ok(resMath.reason?.includes("Mathematics"));
  });

  it("validates Math chapters accept math questions and reject non-math", () => {
    const resMath = validateChapterSentence("ma1-adding", "2 pencil + 3 pencil");
    assert.strictEqual(resMath.valid, true);

    const resSub = validateChapterSentence("ma1-subtracting", "5 apples - 2 apples");
    assert.strictEqual(resSub.valid, true);
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
    assert.ok(promptShape.includes("plain white background"), "Prompt must have clean background");
  });

  it("builds dedicated educational prompts for Science body & organ lessons", () => {
    const promptLungs = getChapterImagePrompt("sc1-body", "The lungs");
    assert.ok(promptLungs.includes("showing the lungs"), "Prompt must show the lungs");
    assert.ok(promptLungs.includes("see-through window on the chest"), "Lungs are shown in the chest");

    const promptHeart = getChapterImagePrompt("sc1-body", "The heart");
    assert.ok(promptHeart.includes("showing the heart"), "Prompt must show the heart");

    const promptStomach = getChapterImagePrompt("sc1-body", "The stomach");
    assert.ok(promptStomach.includes("on the tummy"), "The stomach is shown in the tummy");

    // a body chapter sentence that is not an organ must not become an anatomy cut-away
    const eating = getChapterImagePrompt("sc4-digestion", "The boy is eating");
    assert.ok(!eating.includes("see-through"), "\"The boy is eating\" is a boy eating, not an organ");
  });

  it("has a topic rule for every chapter, and every lesson fits its own chapter", () => {
    for (const { chapter } of getAllChapters()) {
      for (const lesson of chapter.lessons) {
        const res = validateChapterSentence(chapter.id, lesson.say);
        assert.strictEqual(res.valid, true, `${chapter.id}: "${lesson.say}" should be valid`);
      }
      // an obviously off-topic sentence is refused in every chapter
      const off = validateChapterSentence(chapter.id, "I want to go home now please");
      assert.strictEqual(off.valid, false, `${chapter.id} should refuse an off-topic sentence`);
    }
  });

  it("keeps each chapter to its own topic", () => {
    const cases: [string, string, boolean][] = [
      ["en1-prepositions", "The giraffe is under the umbrella", true],
      ["en1-prepositions", "A red apple", false],
      ["en1-colours", "A blue car", true],
      ["en1-sizes", "A red apple", false],
      ["en2-plurals", "Six ducks", true],
      ["en2-plurals", "A duck", false],
      ["en4-adverbs", "The horse is running fast", false],
      ["en4-adverbs", "The horse is running quickly", true],
      ["ma1-counting", "Four cars", true],
      ["ma1-counting", "The cat is on the table", false],
      ["ma1-adding", "5 apples - 2 apples", false],
      ["ma1-shapes", "A triangle", true],
      ["sc1-plants", "A sunflower", true],
      ["sc1-plants", "The car is red", false],
      ["sc1-animals", "A snail", true],
      ["sc1-animals", "A rainbow", false],
      ["sc4-magnets", "A paperclip and a magnet", true],
      ["sc4-magnets", "The girl is singing", false],
      ["sc5-space", "A planet", true],
      ["sc5-space", "A burger", false],
    ];
    for (const [id, s, ok] of cases) {
      assert.strictEqual(validateChapterSentence(id, s).valid, ok, `${id}: "${s}" should be ${ok ? "valid" : "refused"}`);
    }
  });

  it("draws the lesson's own scene for science and math lessons", () => {
    const inv = getChapterImagePrompt("sc1-animals", "Invertebrates do not have a backbone");
    assert.ok(inv.includes("earthworm") && inv.includes("snail"), "Invertebrates are shown as real invertebrates");

    const fern = getChapterImagePrompt("sc1-plants", "Non-flowering plants do not have seeds and flowers");
    assert.ok(fern.includes("fern") && !fern.includes("blooming"), "Non-flowering plants must not get a flower");

    const clock = getChapterImagePrompt("ma2-time", "A clock");
    assert.ok(clock.includes("A clock"), "Math lessons keep their own subject (a clock), not random objects");
  });

  it("never asks the image model for uppercase lesson words", () => {
    for (const { chapter } of getAllChapters()) {
      for (const lesson of chapter.lessons) {
        const prompt = getChapterImagePrompt(chapter.id, lesson.say);
        assert.ok(!/\b[A-Z]{3,}\b/.test(prompt), `${chapter.id}: "${lesson.say}" prompt has an uppercase word`);
      }
    }
  });
});
