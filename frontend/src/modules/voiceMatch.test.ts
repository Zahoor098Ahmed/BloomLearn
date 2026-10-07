/// <reference types="node" />
import { describe, it } from "node:test";
import assert from "node:assert";
import { snapToLesson } from "./voiceMatch";
import { chapterById } from "./curriculum";

const prepositions = chapterById("en1-prepositions")!.chapter.lessons.map((l) => l.say);
const body = chapterById("sc1-body")!.chapter.lessons.map((l) => l.say);

describe("snapToLesson — fixing phone mishearings against the open chapter", () => {
  it("fixes a near-miss word to the lesson sentence", () => {
    assert.strictEqual(snapToLesson("the cat is on the tablet", prepositions), "The cat is on the table");
    assert.strictEqual(snapToLesson("The ball is under the chairs.", prepositions), "The ball is under the chair");
    assert.strictEqual(snapToLesson("the dog is behind the three", prepositions), "The dog is behind the tree");
    assert.strictEqual(snapToLesson("Apple is inside the bocks", prepositions), "The apple is inside the box");
    assert.strictEqual(snapToLesson("the ice", body), "The eyes");
  });

  it("never changes the word the lesson is about", () => {
    // a different position is a different sentence, not a mishearing
    assert.strictEqual(snapToLesson("the cat is under the table", prepositions), null);
    assert.strictEqual(snapToLesson("the ball is on the chair", prepositions), null);
  });

  it("keeps a correct or unrelated sentence as it was heard", () => {
    assert.strictEqual(snapToLesson("The cat is on the table", prepositions), null);
    assert.strictEqual(snapToLesson("the giraffe is under the umbrella", prepositions), null);
    assert.strictEqual(snapToLesson("", prepositions), null);
  });
});
