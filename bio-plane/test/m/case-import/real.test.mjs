/* case-import over the real `case-checker` (its R1, R19): a whole `/6` case file, signed with real keys, built by
   case-checker's own fixture as `public-read` packs one. With no checker handed in, case-import reads the parts with
   `readCaseFile` and recreates with `checkCaseFile`, the module's own defaults. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, seeded, V } from "./fixture.mjs";
import { caseFile, MEMO, MEMO_BYTES, MINUTES, A, B, C, GROUP, CASE, CALC, CALC_INPUT, CALC_INPUT_SHA, calcRow } from "../case-checker/fixture.mjs";
import { caseFilePath, biasApplicationsLines } from "../../../src/case-grammar/index.mjs";
import { checkCaseFile, reweigh, LENS_LIMIT_STATEMENT } from "../../../src/case-checker/index.mjs";
import { LENS_UNDETERMINED } from "../../../src/case-import/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";

const imp = (w, cf, who = "alice") => w.ci.importCaseFile({ parts: cf.parts, by: V(who), viewer: V(who) });
const results = (r) => Object.fromEntries(r.recreation.findings.map((f) => [f.finding, f.result]));

test("R1 R3 a clean case file, checked by the real case-checker, recreates every finding, recorded with the checker's versions", async () => {
  for (const parts of [1, 3]) {
    const w = seeded({ realChecker: true });
    const cf = caseFile({ parts });
    const r = await imp(w, cf);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.equal(r.group, GROUP);
    assert.equal(r.case, CASE);
    const direct = await checkCaseFile({ parts: cf.parts });
    assert.deepEqual(r.recreation.findings.map(({ finding, role, result, missing, differs, pair }) => ({ finding, role, result, missing, differs, pair })),
                     direct.findings.map(({ finding, role, result, missing, differs, pair }) => ({ finding, role, result, missing, differs, pair })),
                     "what the checker answered is what is recorded");
    assert.deepEqual(r.recreation.checker, { grading_versions: direct.checker.grading_versions, checks_version: direct.checker.checks_version,
                                             calc_versions: direct.checker.calc_versions });
    for (const f of r.recreation.findings) assert.equal(f.result, "recreated", `${f.finding} (${parts} part(s))`);
    const e = w.ci.importedCase({ import: r.import, viewer: V("bob") }).edition;
    assert.equal(e.findings[0].origin.another_groups.signature_verified, true);
    assert.equal(e.statement, direct.statement);
    for (const file of [caseFilePath("case_document"), caseFilePath("document", MINUTES)])
      assert.equal(w.ci.fileOf({ import: r.import, edition: 2, path: file }).sha, cf.manifest.files.find((x) => x.path === file).sha256);
    /* a re-import of the same bytes */
    assert.equal((await imp(w, cf)).existed, true);
  }
});

test("R5 a document left out recreates in part; the fetched document completes it, and the finding can then be accepted", async () => {
  const w = seeded({ realChecker: true });
  const memoPath = caseFilePath("document", MEMO);
  const cf = caseFile({ edit: (carried) => carried.delete(memoPath) });
  const r = await imp(w, cf);
  assert.equal(r.ok, true);
  assert.equal(results(r)[A], "recreated_in_part");
  const memoSha = cf.manifest.files.find((x) => x.path === memoPath).sha256;
  assert.ok(JSON.stringify(r.recreation.findings.find((f) => f.finding === A).missing).includes(memoSha), "the gap names the memo's fingerprint");
  /* in part: acceptance needs each gap stated */
  const gapsN = r.recreation.findings.find((f) => f.finding === A).missing.length;
  rowOk(w.ci.acceptImported({ import: r.import, edition: 2, findings: [A], checked: "c", reason: "r", by: V("alice"), viewer: V("alice") }),
        "IMPORT_ACCEPT_GAPS_UNSTATED");
  rowOk(await w.ci.completeImportedDocument({ import: r.import, edition: 2, bytes: new TextEncoder().encode("not the memo"), by: V("bob"), viewer: V("bob") }),
        "IMPORT_DOCUMENT_NOT_MISSING");
  const done = await w.ci.completeImportedDocument({ import: r.import, edition: 2, bytes: new TextEncoder().encode(MEMO_BYTES), by: V("bob"), viewer: V("bob") });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.recreation.findings.find((f) => f.finding === A).result, "recreated");
  const acc = w.ci.acceptImported({ import: r.import, edition: 2, findings: [A, C], checked: "the chain", reason: "it recreates",
                                    by: V("alice"), viewer: V("alice") });
  assert.equal(acc.ok, true);
  assert.equal(acc.findings[0].ref, importedFindingRef(r.import, A));
  assert.ok(gapsN >= 1);
});

test("R6 a tampered file does not recreate under the real checker, and that finding cannot be accepted", async () => {
  const w = seeded({ realChecker: true });
  const path = caseFilePath("document", MINUTES);
  const cf = caseFile({ edit: (carried) => { const b = Buffer.from(carried.get(path)); b[3] ^= 1; carried.set(path, b); } });
  const r = await imp(w, cf);
  assert.equal(r.ok, true);
  assert.equal(results(r)[A], "did_not_recreate");
  const refused = w.ci.acceptImported({ import: r.import, edition: 2, findings: [A], checked: "c", reason: "r", by: V("alice"), viewer: V("alice") });
  rowOk(refused, "IMPORT_ACCEPT_NOT_RECREATED");
  assert.deepEqual(refused.findings, [A]);
});

test("R21 R3 R5 under the real case-checker: a carried calculation recreates here as the checker recomputes it; a forged result differs for both; a missing input is completed", async () => {
  /* clean */
  const w = seeded({ realChecker: true });
  const r = await imp(w, caseFile({ withCalculation: true }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const [c] = r.recreation.calculations;
  assert.equal(c.calc, CALC);
  assert.equal(c.result, "recreated");
  assert.equal(c.recomputed.output.value, "2", "two of the three payments are over 30 days late");
  assert.deepEqual(c.checker, { result: "agrees", agrees_with_this_copy: true });
  /* a forged result: the signed row states 9 under its key */
  const w2 = seeded({ realChecker: true });
  const good = calcRow();
  const forged = { ...good.results[good.result_key], value: "9" };
  const r2 = await imp(w2, caseFile({ withCalculation: true, calcRow: { results: { [good.result_key]: forged } } }));
  const [d] = r2.recreation.calculations;
  assert.equal(d.result, "differs");
  assert.deepEqual(d.differs.map((x) => [x.result, x.source.value, x.recomputed.value]), [["output", "9", "2"]]);
  assert.deepEqual(d.checker, { result: "differs", agrees_with_this_copy: true });
  /* the input left out: not recreated by either; the fetched input completes it */
  const w3 = seeded({ realChecker: true });
  const r3 = await imp(w3, caseFile({ withCalculation: true, dropCalcInput: true }));
  assert.equal(r3.ok, true, JSON.stringify(r3).slice(0, 300));
  const [m] = r3.recreation.calculations;
  assert.equal(m.result, "not_recreated");
  assert.deepEqual(m.missing.map((x) => [x.input, x.sha]), [["pay", CALC_INPUT_SHA]]);
  assert.deepEqual(m.checker, { result: "not_recomputed", agrees_with_this_copy: true });
  const done = await w3.ci.completeImportedDocument({ import: r3.import, edition: 2, bytes: new TextEncoder().encode(CALC_INPUT),
                                                      by: V("bob"), viewer: V("bob") });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  /* recreated here. The checker's own answer is recorded beside, with whether it agrees: whether case-checker fills a
     calculation's input from a supplied document is its R9's (T34-47), so either of its answers is read, never trusted */
  assert.equal(done.recreation.calculations[0].result, "recreated");
  const k = done.recreation.calculations[0].checker;
  assert.ok(["agrees", "not_recomputed"].includes(k.result), JSON.stringify(k));
  assert.deepEqual(k, { result: k.result, agrees_with_this_copy: k.result === "agrees" });
});

/* R23 over the real `case-checker.reweigh` (its R23; K2529) and `case-grammar.biasApplicationsOf` (its R24): the
   fixture's memo leg of B was lowered from A to B by statement S1, as published; A rests on B. */
const S1 = "S1";
const PUBLISHED = { finding: B, ord: 1, target: "leg", statement: S1, effect: "grade_lowered", from: "A", to: "B" };
const EXCLUDED = { finding: A, ord: 0, target: "leg", statement: "S2", effect: "leg_excluded", from: null, to: null };

test("R23 over the real re-weighing: statements in force keep the case's applications of them as published; one not in force reads as removed, through every finding resting on it; undetermined is stated, never false", async () => {
  const w = seeded({ realChecker: true });
  const cf = caseFile({ docLines: biasApplicationsLines([PUBLISHED, EXCLUDED]) });
  const r = await imp(w, cf);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const read = () => w.ci.importedCase({ import: r.import, viewer: V("bob") }).edition;
  const by = (e) => Object.fromEntries(e.findings.map((f) => [f.finding, f]));
  const direct = await checkCaseFile({ parts: cf.parts });
  /* both in force: every finding re-weighs to its recorded (as-published) pair, the excluded leg included */
  w.lens.inForce.set(S1, true).set("S2", true);
  let e = read();
  for (const f of e.findings) {
    assert.equal(f.own_lens.determined, true, f.finding);
    assert.deepEqual(f.own_lens.pair, f.pair, f.finding);
    assert.deepEqual(f.own_lens.changed_by, [], f.finding);
  }
  assert.deepEqual(by(e)[B].own_lens.applications.in_force, [PUBLISHED]);
  assert.equal(e.own_lens.limit, LENS_LIMIT_STATEMENT, "the limit the checker states");
  /* S1 not in force: B's lowered leg reads as removed, and A takes it through B: as the checker answers the same lens */
  w.lens.inForce.set(S1, false);
  e = read();
  const same = reweigh({ parts: cf.parts, answer: direct, lens: { statements: ["S2"], applications: [] } });
  const want = Object.fromEntries(same.findings.map((f) => [f.finding, f]));
  assert.deepEqual(by(e)[B].own_lens.pair.connection, { state: "graded", grade: "A" });
  assert.deepEqual(by(e)[B].own_lens.applications.removed, [PUBLISHED]);
  for (const id of [A, B, C]) {
    assert.deepEqual(by(e)[id].own_lens.pair, want[id].pair, id);
    assert.deepEqual(by(e)[id].own_lens.bar_met, want[id].bar_met, id);
    assert.deepEqual(by(e)[id].own_lens.lens_changes, want[id].lens_changes, id);
  }
  assert.deepEqual(by(e)[A].own_lens.changed_by, [S1], "A changed through B");
  assert.deepEqual(by(e)[B].pair, direct.findings.find((f) => f.finding === B).pair, "the recorded pair beside it stands");
  /* S1 undetermined: B and A (through B) answer no pair and no bar_met, stated; C, resting on neither, is re-weighed */
  w.lens.inForce.set(S1, null);
  e = read();
  for (const id of [A, B]) {
    assert.equal(by(e)[id].own_lens.determined, false, id);
    assert.equal(by(e)[id].own_lens.stated, LENS_UNDETERMINED, id);
    assert.equal(by(e)[id].own_lens.bar_met, null, id);
  }
  assert.equal(by(e)[C].own_lens.determined, true);
});
