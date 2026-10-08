/* The interface's word list at this module's interface (R68; DEC-179; T39, N807): the list itself is `setup-words`'
   (its R1–R3, checked word by word against words.json in its own tests); this module exports it as `INTERFACE_WORDS`,
   each row of `WORD_ROWS` in order as a frozen `{key, en, note, means, protected}`, and `INTERFACE_WORDS_COMMIT` as its
   `WORDS_COMMIT`, holding no copy of its own. */
import test from "node:test";
import assert from "node:assert/strict";
import { INTERFACE_WORDS, INTERFACE_WORDS_COMMIT } from "../../../src/setup.mjs";
import { WORD_ROWS, WORDS_COMMIT } from "../../../src/setup-words/index.mjs";

test("R68 INTERFACE_WORDS is setup-words' WORD_ROWS in its order, each row as a frozen {key, en, note, means, protected}, the list frozen, and INTERFACE_WORDS_COMMIT is its WORDS_COMMIT", () => {
  assert.equal(INTERFACE_WORDS_COMMIT, WORDS_COMMIT);
  assert.equal(INTERFACE_WORDS.length, WORD_ROWS.length);
  WORD_ROWS.forEach(([key, en, note, means, prot], i) => {
    const w = INTERFACE_WORDS[i];
    assert.deepEqual(w, { key, en, note, means, protected: prot }, key);
    assert.deepEqual(Object.keys(w), ["key", "en", "note", "means", "protected"], key);
    assert.ok(Object.isFrozen(w), key);
  });
  assert.ok(Object.isFrozen(INTERFACE_WORDS));
  /* frozen: a write changes nothing, and throws in strict mode */
  assert.throws(() => { INTERFACE_WORDS.push({}); }, TypeError);
  assert.throws(() => { INTERFACE_WORDS[0].en = "changed"; }, TypeError);
  assert.equal(INTERFACE_WORDS[0].en, WORD_ROWS[0][1]);
});
