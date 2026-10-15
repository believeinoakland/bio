/* case-inputs R10 (was case-authoring R73; T46; DEC-194, N913), R12 (was R29, its share) and R17 (T47; N992; DEC-199):
   the rows this module holds, moved with their ids, codes and translations unchanged but for R17, each `where` naming
   this module's region; R9's six rows read words.json's `refusal.<CODE>` by key through `CASE_INPUTS_WORDS`, never a copy,
   C-136.5 with `{field}` filled from the field R9 names. Copied from case-authoring's t46-words.test.mjs, whose arm "R73
   not taken in T46" is rewritten to R17. At the interface: the rows as exported, and each refusal as the acts answer it
   beside its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world } from "./fixture.mjs";
import { CARRIED_OUTCOME_CHECKS, STATEMENT_ACK_CHECKS, CASE_INPUTS_WORDS, fillWords } from "../../../src/case-inputs/index.mjs";
import * as CHECKS from "../../../src/case-inputs/checks.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const fill = (key, f) => en(key).replace(/\{([a-z_]+)\}/g, (m, k) => (k in f ? String(f[k]) : m));

const AT = (fn, region) => `src/case-inputs/index.mjs ${fn} > ${region}`;
/* R9's six rows: the numbers T45 drew, each `where` this module's region. */
const CARRIED = {
  MACHINE_CANNOT_CARRY_OUTCOME: ["C-136.3", AT("carryOutcome", "is-carry-machine")],
  CARRY_NOT_A_PARTICIPANT: ["C-136.4", AT("carryOutcome", "is-carry-participant")],
  BAD_CARRIED_OUTCOME: ["C-136.5", AT("carryOutcome", "is-carry-shaped")],
  NO_SUCH_CARRIED_OUTCOME: ["C-136.6", AT("withdrawCarriedOutcome", "is-carried-outcome-found")],
  CARRIED_OUTCOME_SETTLED: ["C-136.7", AT("withdrawCarriedOutcome", "is-carried-outcome-pending")],
  CARRY_NO_REASON: ["C-136.8", AT("withdrawCarriedOutcome", "is-carry-reasoned")],
};
/* C-136.5 as T46 left it (case-authoring R73): R17 re-takes it, so it is answered no longer. */
const T46_BAD_CARRIED_OUTCOME = "An outcome carried into a case is its kind (a success, a cure or a harm addressed), your "
  + "statement on one line of at most 2,000 characters with no quote or backslash, what it cites, and the date it happened. "
  + "One of these is missing or malformed, and is named. Nothing was written.";
/* C-82.2–C-82.8 as this module holds them: the canonical JSON's sha256 of the family, so no check, `where` or translation
   moves (each translation is case-authoring's, word for word; each `where` this module's). */
const C82 = { count: 7, sha256: "3409003afeb4ce8483647ae08a128ed74bc9f415ea88bbda79091326388d1fa9" };
const SENTENCES = ["signing.openrequest.line", "signing.openrequest.noreply", "signing.openrequest.notlaidout",
                   "signing.openrequest.nowindow.line", "signing.openrequest.nowindow.noreply",
                   "signing.openrequest.nowindow.notlaidout", "signing.openrequest.unread", "signing.openrequest.noquote"];

test("R10, R12: C-136.3, .4, .6, .7 and .8 read words.json's refusal.<CODE> by key from CASE_INPUTS_WORDS, never a copy; every word the table holds is words.json's, verbatim; codes, numbers and wheres as R12 moves them", () => {
  assert.ok(Object.isFrozen(CASE_INPUTS_WORDS));
  assert.deepEqual(Object.keys(CASE_INPUTS_WORDS).sort(),
    [...Object.keys(CARRIED).map((c) => `refusal.${c}`), ...SENTENCES].sort(), "the table holds exactly R10's and R17's keys");
  for (const [key, text] of Object.entries(CASE_INPUTS_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  assert.deepEqual(Object.keys(CARRIED_OUTCOME_CHECKS), Object.keys(CARRIED));
  for (const [code, [check, where]] of Object.entries(CARRIED)) {
    const row = CARRIED_OUTCOME_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    assert.equal(row.translation, CASE_INPUTS_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
  }
  /* fillWords is loud for a key it does not hold, and leaves a placeholder it is not given for the screen */
  assert.throws(() => fillWords("refusal.NOT_ONE_OF_OURS"), /not one of this module's words/);
  assert.equal(fillWords("refusal.BAD_CARRIED_OUTCOME"), en("refusal.BAD_CARRIED_OUTCOME"));
  assert.match(fillWords("refusal.BAD_CARRIED_OUTCOME"), /\{field\} is missing/);
});

test("R12: C-82.2–C-82.8 (STATEMENT_ACK_CHECKS) move whole, ids, codes and translations unchanged, each where naming this module's acknowledgeStatement region; this module's families hold each code and each check id once, and no copy of a translation", () => {
  assert.deepEqual(Object.entries(STATEMENT_ACK_CHECKS).map(([k, v]) => [k, v.check, v.where]), [
    ["STATEMENT_ACK_NO_SUBJECT", "C-82.2", AT("acknowledgeStatement", "is-statement-ack-subject")],
    ["STATEMENT_ACK_ALREADY_SIGNED", "C-82.3", AT("acknowledgeStatement", "is-statement-ack-signed")],
    ["STATEMENT_ACK_NOT_A_PARTICIPANT", "C-82.4", AT("acknowledgeStatement", "is-statement-ack-participant")],
    ["STATEMENT_ACK_NO_STATEMENT", "C-82.5", AT("acknowledgeStatement", "is-statement-ack-statement")],
    ["STATEMENT_ACK_BY_ITS_AUTHOR", "C-82.6", AT("acknowledgeStatement", "is-statement-ack-by-its-author")],
    ["STATEMENT_ACK_AUTHOR_UNDETERMINED", "C-82.7", AT("acknowledgeStatement", "is-statement-ack-author-undetermined")],
    ["STATEMENT_ACK_NO_REASON", "C-82.8", AT("acknowledgeStatement", "is-statement-ack-reasoned")]]);
  assert.deepEqual([Object.keys(STATEMENT_ACK_CHECKS).length, sha256HexSync(canonicalJson(STATEMENT_ACK_CHECKS))],
    [C82.count, C82.sha256], "no row's check, where or translation moved");
  /* C-82.8's translation is the requirements' own, word for word (DEC-88) */
  assert.equal(STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON.translation, "An acknowledgement of a statement is recorded "
    + "with your own words on it, and none were given, or they are longer than 2,000 characters. Write them. Nothing was "
    + "written.");
  /* the families this module's checks file holds: exactly the two, each code and each id once */
  const families = Object.entries(CHECKS).filter(([, v]) => v && typeof v === "object" && Object.values(v).every((r) => r && r.check));
  assert.deepEqual(families.map(([k]) => k).sort(), ["CARRIED_OUTCOME_CHECKS", "STATEMENT_ACK_CHECKS"]);
  const all = families.flatMap(([, f]) => Object.entries(f));
  assert.equal(new Set(all.map(([k]) => k)).size, all.length, "each code once");
  assert.equal(new Set(all.map(([, v]) => v.check)).size, all.length, "each check id once");
  for (const [, row] of all) {
    assert.match(row.where, /^src\/case-inputs\/index\.mjs \S+ > [a-z-]+$/, "each row names this module's region");
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, "a member's sentence");
    assert.ok(!/[A-Z]{2,}_[A-Z_]+/.test(row.translation), "no code in a member's words");
  }
  assert.ok(Object.isFrozen(STATEMENT_ACK_CHECKS) && Object.isFrozen(CARRIED_OUTCOME_CHECKS));
});

/* R9's world: a ratified case of alice's project, bo joined, cy invited, di outside. */
const OUTCOME = { kind: "success", text: "The council published the amended minutes.",
                  cites: [{ kind: "finding", ref: "INQ-2026-0001-q" }], on: "2026-09-20" };
function carried() {
  const w = world();
  for (const m of ["alice", "bo", "cy", "di"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  w.join(P, "cy", "invited");
  return { w, P, caseId: w.ratifiedCase(P, "alice") };
}
const answers = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CARRIED_OUTCOME_CHECKS[code].check, en(`refusal.${code}`)], code);
};

test("R10: each re-worded refusal is answered by carryOutcome and withdrawCarriedOutcome with words.json's sentence, behaviour unmoved: refused, nothing written, beside its control", () => {
  const { w, caseId } = carried();
  const before = w.snapshot();
  /* C-136.3, on both acts, and its control */
  answers(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  answers(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: null }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* C-136.4: seen, not joined, read by its key */
  answers(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "cy" }), "CARRY_NOT_A_PARTICIPANT");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const o = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" });
  assert.equal(o.ok, true, "the control: a joined member carries it");
  const mid = w.snapshot();
  answers(w.ci.withdrawCarriedOutcome({ outcome: o.outcome, reason: "wrong", by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* C-136.6: absent, and unseen alike */
  answers(w.ci.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "wrong", by: "alice" }), "NO_SUCH_CARRIED_OUTCOME");
  answers(w.ci.withdrawCarriedOutcome({ outcome: o.outcome, reason: "wrong", by: "di" }), "NO_SUCH_CARRIED_OUTCOME");
  /* C-136.8 */
  for (const reason of [undefined, "  ", "x".repeat(2001)])
    answers(w.ci.withdrawCarriedOutcome({ outcome: o.outcome, reason, by: "alice" }), "CARRY_NO_REASON");
  assert.deepEqual(w.snapshot(), mid, "nothing written");
  /* the control: withdrawn with a reason; C-136.7 once withdrawn */
  assert.equal(w.ci.withdrawCarriedOutcome({ outcome: o.outcome, reason: "the wrong case", by: "alice" }).ok, true);
  const after = w.snapshot();
  const settled = w.ci.withdrawCarriedOutcome({ outcome: o.outcome, reason: "again", by: "alice" });
  answers(settled, "CARRIED_OUTCOME_SETTLED");
  assert.equal(settled.state, "withdrawn");
  assert.deepEqual(w.snapshot(), after, "nothing written");
});

test("R17: C-136.5 BAD_CARRIED_OUTCOME takes its translation from refusal.BAD_CARRIED_OUTCOME with {field} the field R9 names, a sentence true of a missing and a malformed field alike; T46's own sentence is answered no longer; nothing is written", () => {
  const { w, caseId } = carried();
  const row = CARRIED_OUTCOME_CHECKS.BAD_CARRIED_OUTCOME;
  assert.equal(row.translation, en("refusal.BAD_CARRIED_OUTCOME"), "the row holds the key's sentence, {field} for the screen");
  assert.notEqual(row.translation, T46_BAD_CARRIED_OUTCOME, "T46's words no longer");
  const before = w.snapshot();
  for (const [over, field] of [[{ kind: undefined }, "kind"], [{ kind: "story" }, "kind"],
                               [{ text: undefined }, "text"], [{ text: "a\nb" }, "text"],
                               [{ cites: undefined }, "cites"], [{ cites: [{ kind: "story", ref: "x" }] }, "cites"],
                               [{ on: undefined }, "on"], [{ on: "2026-02-30" }, "on"]]) {
    const r = w.ci.carryOutcome({ case: caseId, ...OUTCOME, ...over, by: "alice" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.field, r.translation],
      [false, "BAD_CARRIED_OUTCOME", "BAD_CARRIED_OUTCOME", "C-136.5", field, fill("refusal.BAD_CARRIED_OUTCOME", { field })],
      JSON.stringify(over));
    assert.ok(!r.translation.includes("{field}"), "filled");
    assert.ok(r.translation.includes(`${field} is missing or isn't in that form`));
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* control: a well-shaped outcome is carried, and no refusal carries T46's words */
  assert.equal(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).ok, true);
  assert.ok(!JSON.stringify(CARRIED_OUTCOME_CHECKS).includes(T46_BAD_CARRIED_OUTCOME));
});
