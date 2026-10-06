/* case-import over the real `case-checker` (its R1, R19): a whole `/6` case file, signed with real keys, built by
   case-checker's own fixture as `public-read` packs one. With no checker handed in, case-import reads the parts with
   `readCaseFile` and recreates with `checkCaseFile`, the module's own defaults. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, seeded, V } from "./fixture.mjs";
import { caseFile, MEMO, MEMO_BYTES, MINUTES, A, C, GROUP, CASE, CALC, CALC_INPUT, CALC_INPUT_SHA, calcRow } from "../case-checker/fixture.mjs";
import { caseFilePath } from "../../../src/case-grammar/index.mjs";
import { checkCaseFile } from "../../../src/case-checker/index.mjs";
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
  /* recreated here; case-checker R20 recomputes only over inputs the case file carries (its R9 fills materials, not a
     calculation's inputs), so its answer stays not_recomputed and is recorded as not agreeing with this copy's */
  assert.equal(done.recreation.calculations[0].result, "recreated");
  assert.deepEqual(done.recreation.calculations[0].checker, { result: "not_recomputed", agrees_with_this_copy: false });
});
