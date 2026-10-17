/* extraction's words (T50-9; N1115, K3366, K3632; plan rule 6; setup-words R11–R13): the module holds keys and reads each
   sentence through `setup-words`' `word`. Its key list is the design stream's declaration for `extraction`
   (`words-reads.json`), every key is one the list holds, and the rows and sentences it answers are the list's word for
   the key, so a change of the list's English reaches an answer with no edit here. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, say, rowWord, keysRead } from "../../../src/extraction/words.mjs";
import { REEXTRACT_CHECKS, EXTRACTION_CHECKS, TRANSCRIBE_WORDS, noSha } from "../../../src/extraction/index.mjs";
import { WORD } from "./words.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules.extraction.reads;

test("R47 R71 R75 (plan rule 6): the module's keys are the owner's declared list for extraction, every one held by the word list", () => {
  assert.deepEqual([...WORD_KEYS].sort(), [...READS].sort());
  for (const k of WORD_KEYS) assert.equal(hasWord(k), true, k);
  assert.throws(() => say("not.a.key"), /not one of this module's word keys/, "a key outside the list is refused");
});

test("R47 R63 (plan rule 6): every refusal row's translation is the word of its key, read through setup-words, C-51.7's by transcribe.refused.notdeployed", () => {
  for (const code of ["REEXTRACT_FLAG_MALFORMED", "REEXTRACT_AGENT_REFUSED", "REEXTRACT_NOT_CAPABLE", "REEXTRACT_NO_OCR_MEMBER", "REEXTRACT_NOT_READ"])
    assert.equal(REEXTRACT_CHECKS[code].translation, WORD(`refusal.${code}`), code);
  assert.equal(REEXTRACT_CHECKS.TRANSCRIBE_NOT_DEPLOYED.translation, WORD("transcribe.refused.notdeployed"));
  assert.equal(EXTRACTION_CHECKS.NO_SHA.translation, WORD("refusal.NO_SHA"));
  assert.equal(noSha().translation, WORD("refusal.NO_SHA"));
  assert.equal(rowWord("NO_SHA"), WORD("refusal.NO_SHA"));
  assert.ok(keysRead().has("refusal.NO_SHA"));
  /* control: no row's translation is the sentence of another's, and none says "group" where the list says "team" */
  const all = Object.values(REEXTRACT_CHECKS).map((r) => r.translation);
  assert.equal(new Set(all).size, all.length);
  for (const t of all) assert.doesNotMatch(t, /\bgroup's Civicsmith\b/, "DEC-149: team, never group");
});

test("R71 R75 (plan rule 6): TRANSCRIBE_WORDS is the list's English for each key it holds, placeholders as written", () => {
  for (const [k, en] of Object.entries(TRANSCRIBE_WORDS)) assert.equal(en, WORD(k), k);
  assert.equal(say("transcribe.done", { pages: "2, 3" }), WORD("transcribe.done").replace("{pages}", "2, 3"));
  assert.throws(() => say("transcribe.done"), /WORD_VAR_MISSING/, "a placeholder with no value is refused, never answered bare");
});
