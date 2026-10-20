/* case-import's words (T50-15; N1116, K3366, K3368; plan rule 6; `setup-words` R11–R13): the module holds keys and reads
   each sentence through `setup-words`' `word`. Its key list is the design stream's declaration for `case-import`
   (`words-reads.json`), every key is one the list holds, and the rows and sentences it answers are the list's word for the
   key, so a change of the list's English reaches an answer with no edit here. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { hasWord, word } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, say, rowWord, keysRead } from "../../../src/case-import/words.mjs";
import { CASE_IMPORT_CHECKS, STATEMENT, SOURCE_BAR, SOURCE_LENS, OWN_LENS, NO_OWN_BAR, LENS_LIMIT, LENS_UNDETERMINED,
         LENS_NOT_REWEIGHED, NOT_ACCEPTED_WHY, SOURCE_CALCULATION, GROUP_FIELDS_LABEL, GROUP_FIELDS_NONE, NO_MOVE_SEEN } from "../../../src/case-import/index.mjs";
import { seeded, imp, caseFile, V, bytes, F1, F2, F3 } from "./fixture.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules["case-import"].reads;

test("R14 R4 R19 R21 (plan rule 6): the module's keys are the owner's declared list for case-import, every one held by the word list", () => {
  /* the owner's list, which names R25's `caseimport.stake.unreadable` among its reads (K3727, DEC-323) */
  assert.deepEqual([...WORD_KEYS].sort(), [...READS].sort());
  for (const k of WORD_KEYS) assert.equal(hasWord(k), true, k);
  assert.throws(() => say("not.a.key"), /not one of this module's word keys/, "a key outside the list is refused");
  assert.throws(() => say("case-import.why.evaluated"), /WORD_VAR_MISSING/, "a placeholder with no value is refused, never answered bare");
});

test("R14 (plan rule 6): every refusal row's translation is the word of its key refusal.<CODE>, read through setup-words", () => {
  /* the sixteen rows of the design stream's list; the six of T51's rerun (C-130.17 on) are written once by `localize` (R14) */
  const keyed = Object.entries(CASE_IMPORT_CHECKS).filter(([code]) => hasWord(`refusal.${code}`));
  for (const [code, row] of keyed) {
    assert.equal(row.translation, word(`refusal.${code}`), code);
    assert.equal(rowWord(code), row.translation, code);
    assert.ok(keysRead().has(`refusal.${code}`), `${code} was read by key`);
  }
  assert.equal(keyed.length, 16, "every row of the list reads a key");
  const written = Object.entries(CASE_IMPORT_CHECKS).filter(([code]) => !hasWord(`refusal.${code}`));
  assert.deepEqual(written.map(([code]) => code), ["MACHINE_CANNOT_RERUN", "RERUN_ALREADY", "NOT_A_RERUN", "NO_SUCH_SOURCE_FINDING", "NO_SUCH_OWN_FINDING", "REGRADE_LENS_UNKNOWN"]);
  for (const [code, row] of written) assert.ok(typeof row.translation === "string" && row.translation.length > 20, code);
  /* control: no row's translation is another's, and the key of a code no row names is refused */
  const all = Object.values(CASE_IMPORT_CHECKS).map((r) => r.translation);
  assert.equal(new Set(all).size, all.length);
  assert.throws(() => rowWord("NOT_A_ROW_OF_THIS_MODULE"), /not one of this module's word keys/);
});

test("R4 R11 R19 R21 R22 R23 (plan rule 6): each exported sentence the reads draw is the list's word for its key", () => {
  const pairs = [[STATEMENT, "case-import.statement"], [SOURCE_BAR, "case-import.source_bar"], [SOURCE_LENS, "case-import.source_lens"],
                 [OWN_LENS, "case-import.own_lens"], [NO_OWN_BAR, "case-import.no_own_bar"], [LENS_LIMIT, "case-checker.lens_limit_statement"],
                 [LENS_UNDETERMINED, "case-import.lens_undetermined"], [LENS_NOT_REWEIGHED, "case-import.lens_not_reweighed"],
                 [NOT_ACCEPTED_WHY.did_not_recreate, "case-import.did_not_recreate"], [NOT_ACCEPTED_WHY.gaps_unstated, "case-import.gaps_unstated"],
                 [SOURCE_CALCULATION, "case-import.source_calculation"], [GROUP_FIELDS_LABEL, "case-import.group_fields_label"],
                 [GROUP_FIELDS_NONE, "case-import.group_fields_none"], [NO_MOVE_SEEN, "case-import.no_move_seen"]];
  for (const [en, key] of pairs) assert.equal(en, word(key), key);
  /* a grade is never composed with the words: the acceptance's `grades` line is the list's too */
});

test("R6 R22 an acceptance answers the list's sentence for 'grades unchanged', and a whole-edition acceptance the list's reasons for each finding left out", async () => {
  const w = seeded();
  w.script.set(F2, { role: "supporting", result: "recreated_in_part", missing: [{ sha: "d4".repeat(32), words: "the letter" }],
                     pair: { capture: { state: "graded", grade: "D" }, connection: { state: "graded", grade: "D" } } });
  w.script.set(F3, { role: "load_bearing", result: "did_not_recreate", differs: [{ axis: "connection" }], pair: null });
  const a = await imp(w);
  const r = w.ci.acceptImported({ import: a.import, edition: 1, findings: "all", checked: "the transfers", reason: "they hold", by: V("alice"), viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.grades, word("case-import.grades"));
  const why = Object.fromEntries(r.not_accepted.map((x) => [x.finding, x.why]));
  assert.equal(why[F3], word("case-import.did_not_recreate"));
  assert.equal(why[F2], word("case-import.gaps_unstated"));
});

test("R1 R3 R21 (plan rule 6): the reasons a case file could not be read, and the checker that gave no answer, are the list's words filled with what happened", async () => {
  const w = seeded();
  const r = await w.ci.importCaseFile({ parts: [bytes("not a case file")], by: V("alice"), viewer: V("alice") });
  assert.equal(r.reason, "IMPORT_NOT_A_CASE_FILE");
  assert.ok(r.departures.length >= 1);
  /* each departure of the file's own bytes draws the list's sentence for it, `notbytes` counting its part from 1 */
  const none0 = await w.ci.importCaseFile({ parts: [], by: V("alice"), viewer: V("alice") });
  assert.deepEqual(none0.departures, [word("refusal.IMPORT_NOT_A_CASE_FILE.noparts")]);
  const notBytes = await w.ci.importCaseFile({ parts: [bytes("ok"), {}], by: V("alice"), viewer: V("alice") });
  assert.deepEqual(notBytes.departures, [word("refusal.IMPORT_NOT_A_CASE_FILE.notbytes", { n: 2 })]);
  /* the checker down: the edition is imported and every finding unread, the reason the list's sentence with the fault */
  w.checker.throws = true;
  const a = await imp(w);
  assert.equal(a.ok, true);
  assert.equal(a.recreation.unread, word("case-import.unread.case_checker_failed", { e: "checker down" }));
  const none = seeded();
  none.checker.throws = false;
  const ok = await imp(none);
  assert.equal(ok.recreation.unread, undefined, "control: a checker that answers leaves nothing unread");
});

test("R4 (plan rule 6, N1068, N1160): the module says \"labeled\", never \"labelled\", and none of its words calls the team's Civicsmith the group's", () => {
  const dir = fileURLToPath(new URL("../../../src/case-import/", import.meta.url));
  for (const f of readdirSync(dir)) assert.doesNotMatch(readFileSync(dir + f, "utf8"), /\blabelled\b/i, f);
  for (const k of WORD_KEYS) assert.doesNotMatch(word(k, { e: "x", why: "", method: "m", calc_method: "c", calc_input_max: 1, n: 1 }), /\bgroup's Civicsmith\b|\blabelled\b/i, k);
});
