/* case-import: DEC-149's voice (T34-87). Each member-facing string that called the group's Civicsmith "this copy" says
   "your group's Civicsmith": three refusal rows (R14), the note beside a publisher of null (R19), and two of R21's
   reasons a carried calculation was not recreated. Each is read at the module's interface, as a member receives it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, refusedThenAccepted, seeded, imp, caseFile, V, sha, bytes } from "./fixture.mjs";
import { CASE_IMPORT_CHECKS, NO_MOVE_SEEN, CALC_INPUT_MAX } from "../../../src/case-import/index.mjs";
import { METHOD } from "../../../src/calc-grammar/index.mjs";

const OLD_NAMES = /\b(this|the) (copy|plane|instance)\b/i;

test("R14 C-130.3, C-130.5 and C-130.7 call the group's Civicsmith \"your group's Civicsmith\", and each refusal carries its row", async () => {
  assert.equal(CASE_IMPORT_CHECKS.IMPORT_NOT_A_CASE_FILE.translation,
               "What was given is not a case file your group's Civicsmith can read: each way it departs from the case-file "
               + "format is named. Nothing was imported.");
  assert.equal(CASE_IMPORT_CHECKS.IMPORT_EDITION_DIFFERS.translation,
               "Your group's Civicsmith already holds this edition of the case, and the case file given differs from it. An "
               + "edition never changes, so both fingerprints are named for you to compare. Nothing was imported.");
  assert.equal(CASE_IMPORT_CHECKS.IMPORT_NO_SUCH_EDITION.translation,
               "Your group's Civicsmith holds no imported edition by that name. Nothing was written.");
  assert.deepEqual([CASE_IMPORT_CHECKS.IMPORT_NOT_A_CASE_FILE.check, CASE_IMPORT_CHECKS.IMPORT_EDITION_DIFFERS.check,
                    CASE_IMPORT_CHECKS.IMPORT_NO_SUCH_EDITION.check], ["C-130.3", "C-130.5", "C-130.7"]);
  /* no row of this module calls the group's Civicsmith by an old name */
  for (const [code, row] of Object.entries(CASE_IMPORT_CHECKS)) assert.doesNotMatch(row.translation, OLD_NAMES, code);
  /* as a member receives each one, with its negative control */
  const w = seeded();
  const r = await refusedThenAccepted(w, () => w.ci.importCaseFile({ parts: [bytes("not a case file")], by: V("alice"), viewer: V("alice") }),
                                      () => imp(w), "IMPORT_NOT_A_CASE_FILE");
  assert.match(r.translation, /your group's Civicsmith can read/);
  const held = await imp(w, caseFile({ edition: 2 }));
  const differs = await refusedThenAccepted(w, () => imp(w, caseFile({ edition: 2, note: "changed" })),
                                            () => imp(w, caseFile({ edition: 3, note: "changed" })), "IMPORT_EDITION_DIFFERS");
  assert.match(differs.translation, /^Your group's Civicsmith already holds this edition/);
  const none = w.ci.importedCase({ import: held.import, edition: 9, viewer: V("alice") });
  rowOk(none, "IMPORT_NO_SUCH_EDITION");
  assert.match(none.translation, /^Your group's Civicsmith holds no imported edition/);
  assert.equal(w.ci.importedCase({ import: held.import, edition: 2, viewer: V("alice") }).ok, true, "the control");
});

test("R19 a publisher of null says what your group's Civicsmith has seen in its reads, never that nothing changed", async () => {
  assert.equal(NO_MOVE_SEEN, "No new edition or withdrawal of this case has been seen on its publisher's docket. That is "
    + "not a statement that none was made: it says only what your group's Civicsmith has seen in its reads, as of the last read.");
  assert.doesNotMatch(NO_MOVE_SEEN, OLD_NAMES);
  const w = seeded();
  const a = await imp(w);
  const e = w.ci.importedCase({ import: a.import, viewer: V("bob") }).edition;
  assert.deepEqual([e.publisher, e.publisher_note], [null, NO_MOVE_SEEN]);
  assert.equal(w.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0].publisher_note, NO_MOVE_SEEN);
});

test("R21 a method version not held, and an input over the bound, are each named as more than your group's Civicsmith holds or reads", async () => {
  /* a row as a publishing group states one; its input's bytes travel under their hash */
  const row = (over = {}) => ({ calc: "CALC-2026-0007", recipe: { method: METHOD, inputs: [{ name: "t", kind: "table" }],
                                 steps: [{ op: "count", from: "t", as: "n" }], output: "n" },
                                inputs: [{ name: "t", sha256: over.sha ?? "0".repeat(64) }], method_version: METHOD,
                                results: { output: { value: "1" } }, result_key: null, recompute: "agrees", disclosed: null, ...over.row });
  const w = seeded();
  const r = await imp(w, caseFile({ calcs: [row({ row: { method_version: "ironcalc/0.3" } })] }));
  const m = r.recreation.calculations[0].missing.find((x) => x.what === "method_version");
  assert.equal(m.why, `your group's Civicsmith does not hold the method version ironcalc/0.3 (it holds ${METHOD}): the value was `
    + "computed by the publishing group's engine and is not recreated here");
  /* an input one byte over the bound, carried at its hash */
  const big = new Uint8Array(CALC_INPUT_MAX + 1).fill(0x20);
  const w2 = seeded();
  const r2 = await imp(w2, caseFile({ calcs: [row({ sha: sha(big) })], calcInputs: [{ bytes: big }] }));
  const over = r2.recreation.calculations[0];
  assert.equal(over.result, "not_recreated");
  assert.deepEqual(over.missing, [{ input: "t", sha: sha(big), why: `the input is over ${CALC_INPUT_MAX} bytes, more than your group's Civicsmith reads` }]);
  /* the control: at the bound, the input is read (and, not being JSON, named for that instead) */
  const atBound = new Uint8Array(CALC_INPUT_MAX).fill(0x20);
  const w3 = seeded();
  const r3 = await imp(w3, caseFile({ calcs: [row({ sha: sha(atBound) })], calcInputs: [{ bytes: atBound }] }));
  assert.match(r3.recreation.calculations[0].missing[0].why, /not the canonical JSON/);
  for (const c of [r, r2, r3]) assert.doesNotMatch(JSON.stringify(c.recreation.calculations), OLD_NAMES);
});
