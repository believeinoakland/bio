/* question-explorer's words (T50-68; N1115, K3366, K3632; plan rule 6; setup-words R11–R13): the module holds keys and
   reads each sentence through `setup-words`' `word`. Its key list is the design stream's declaration for
   `question-explorer` (`words-reads.json`), every key is one the list holds, and what it answers is the list's word for
   the key, so a change of the list's English reaches an answer with no edit here. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, say, keysRead } from "../../../src/question-explorer/words.mjs";
import { EXPLORE_CHECKS, EXPLORE_WORK, EXPLORE_FIND_SAYS } from "../../../src/question-explorer/index.mjs";
import { world, CAP, CALLER } from "./fixture.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules["question-explorer"].reads;

test("R5 R8 R9 R10 (plan rule 6): the module's keys are the owner's declared list for question-explorer, every one held by the word list", () => {
  assert.deepEqual([...WORD_KEYS].sort(), [...READS].sort());
  for (const k of WORD_KEYS) assert.equal(hasWord(k), true, k);
  assert.throws(() => say("not.a.key"), /not one of this module's word keys/, "a key outside the list is refused");
});

test("R4 R6 R8 R9 R10 R13 (plan rule 6): every refusal row's translation is the word of its refusal.<CODE> key, read through setup-words, and none says group where the list says team", () => {
  for (const [code, row] of Object.entries(EXPLORE_CHECKS)) {
    assert.equal(row.translation, word(`refusal.${code}`), code);
    assert.doesNotMatch(row.translation, /\bgroup\b/i, "DEC-149: team, never group");
  }
  assert.equal(new Set(Object.values(EXPLORE_CHECKS).map((r) => r.translation)).size, Object.keys(EXPLORE_CHECKS).length, "control: no two rows share a sentence");
});

test("R5 R8 R12 (plan rule 6): the system step's words, an offered find's and a stop's are the list's, and the gate's reasons and estimate too", async () => {
  assert.equal(EXPLORE_WORK, word("question-explorer.system_explored_question"));
  assert.equal(EXPLORE_FIND_SAYS, word("question-explorer.system_found_exploring"));
  const w = await world().standard();
  const o = await w.openRun("group");
  assert.equal(w.calledAs("open")[0].label, word("question-explorer.label.exploring_question"));
  assert.equal(w.calledAs("open")[0].work, EXPLORE_WORK);
  assert.equal(o.estimate, word("question-explorer.known"));
  assert.equal(w.p.find({ run: o.run, kind: "capture", ref: CAP, bearing: "supports", how: "a mention", caller: CALLER }).ok, true);
  assert.equal(w.p.findsFor({ viewer: "member:alice" }).finds[0].says, EXPLORE_FIND_SAYS);
  await w.p.end({ run: o.run, end: "set_aside", reason: "fetches", caller: CALLER });
  assert.equal(w.p.stopsFor({ viewer: "member:dana" }).stops[0].says, word("question-explorer.says.exploring_run_enabled"));
  /* the gate's reasons, shut for each cause */
  const shut = await world({ gateOpen: false }).standard();
  assert.equal(shut.p.gate().why, word("question-explorer.investigate_mode_explorer"));
  const keys = keysRead();
  for (const k of ["question-explorer.label.exploring_question", "question-explorer.system_explored_question",
                   "question-explorer.system_found_exploring", "question-explorer.says.exploring_run_enabled",
                   "question-explorer.investigate_mode_explorer", "refusal.EXPLORE_RUN_ENDED"]) assert.ok(keys.has(k), k);
});

test("R6 R13 (plan rule 6): a find's route and a proposal's aim are the list's words; a placeholder with no value is refused, never answered bare", () => {
  assert.throws(() => word("ai.label.explored"), /WORD_VAR_MISSING/);
  assert.equal(say("question-explorer.capture_page_act"), word("question-explorer.capture_page_act"));
  assert.equal(say("question-explorer.promotion_question_writes"), word("question-explorer.promotion_question_writes"));
  assert.equal(say("question-explorer.proposed_connection"), word("question-explorer.proposed_connection"));
});
