/* case-import: completion by a fetched document (R5), acceptance (R6) and its withdrawal (R7), at the module's
   interface. Every refusal is shown with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, refusedThenAccepted, seeded, imp, caseFile, V, MACHINE, F1, F2, F3, sha, bytes } from "./fixture.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";

const LETTER = bytes("%PDF the letter the case relies on");
const NOTE = bytes("%PDF a second document");
const g = (grade) => ({ state: "graded", grade });
async function scripted(w) {
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("B"), connection: g("C") } });
  w.script.set(F2, { role: "supporting", result: "recreated_in_part",
                     missing: [{ sha: sha(LETTER), words: "the letter, fetch it" }, { sha: sha(NOTE), words: "the note" }],
                     pair: { capture: g("D"), connection: g("D") } });
  w.script.set(F3, { role: "load_bearing", result: "did_not_recreate", differs: [{ axis: "capture" }], pair: null });
  return (await imp(w));
}
const accept = (w, a, x = {}, who = "alice") => w.ci.acceptImported({ import: a.import, edition: 1, findings: [F1],
  checked: "every passage against its document", reason: "the chain holds", by: V(who), viewer: V(who), ...x });
const withdraw = (w, a, x = {}, who = "alice") => w.ci.withdrawAcceptance({ import: a.import, edition: 1, reason: "the source corrected it",
  by: V(who), viewer: V(who), ...x });
const complete = async (w, a, b, x = {}, who = "bob") => (await w.ci.completeImportedDocument({ import: a.import, edition: 1, bytes: b,
  by: V(who), viewer: V(who), ...x }));

/* ================================================================ R5 */

test("R5 applies R1's first two refusals: MACHINE_CANNOT_IMPORT, then IMPORT_NOT_A_MEMBER", async () => {
  for (const who of [MACHINE, "token:operator", null]) {
    const w = seeded();
    const a = (await scripted(w));
    (await refusedThenAccepted(w, async () => (await complete(w, a, LETTER, { by: who, viewer: V("bob") })), async () => (await complete(w, a, LETTER)), "MACHINE_CANNOT_IMPORT"));
  }
  for (const who of ["carol", "dave"]) {
    const w = seeded();
    const a = (await scripted(w));
    (await refusedThenAccepted(w, async () => (await complete(w, a, LETTER, {}, who)), async () => (await complete(w, a, LETTER)), "IMPORT_NOT_A_MEMBER"));
  }
  /* the order: a machine before a non-member, both before the bytes are asked */
  const w = seeded();
  const a = (await scripted(w));
  (await rowOk((await complete(w, a, bytes("stray"), { by: MACHINE, viewer: V("carol") })), "MACHINE_CANNOT_IMPORT"));
  (await rowOk((await complete(w, a, bytes("stray"), {}, "carol")), "IMPORT_NOT_A_MEMBER"));
});

test("R5 bytes matching no missing material are IMPORT_DOCUMENT_NOT_MISSING, naming the fingerprint they have", async () => {
  const w = seeded();
  const a = (await scripted(w));
  const stray = bytes("%PDF something else");
  const r = (await refusedThenAccepted(w, async () => (await complete(w, a, stray)), async () => (await complete(w, a, LETTER)), "IMPORT_DOCUMENT_NOT_MISSING"));
  assert.equal(r.fingerprint, sha(stray));
  /* once completed, the same bytes are no longer missing */
  (await rowOk((await complete(w, a, LETTER)), "IMPORT_DOCUMENT_NOT_MISSING"));
  /* nothing given, or an edition not held, matches nothing */
  (await rowOk((await complete(w, a, null)), "IMPORT_DOCUMENT_NOT_MISSING"));
  (await rowOk((await complete(w, a, NOTE, { edition: 4 })), "IMPORT_DOCUMENT_NOT_MISSING"));
  assert.equal((await complete(w, a, Buffer.from(NOTE).toString("base64"))).ok, true, "base64 bytes, as the op carries them");
});

test("R5 matching bytes are stored, every finding of the edition is checked again (R3), and nothing else about the edition changes", async () => {
  const w = seeded();
  const a = (await scripted(w));
  const edition = JSON.stringify(w.rows(`SELECT * FROM case_import_editions`));
  const files = JSON.stringify(w.rows(`SELECT * FROM case_import_files ORDER BY path`));
  const calls = w.checker.calls.length;
  w.clock.now = Date.parse("2026-10-06T08:00:00Z");
  const r = (await complete(w, a, LETTER));
  assert.equal(r.ok, true);
  assert.equal(r.document, sha(LETTER));
  assert.equal(w.checker.calls.length, calls + 1);
  assert.deepEqual(w.checker.calls.at(-1), { parts: 1, documents: 1 }, "the check runs over the parts with the stored document");
  assert.equal(r.recreation.cause, "completion");
  assert.equal(r.recreation.document, sha(LETTER));
  const f2 = r.recreation.findings.find((f) => f.finding === F2);
  assert.deepEqual(f2.missing, [{ sha: sha(NOTE), words: "the note" }], "one gap filled, one left");
  assert.equal(r.recreation.findings.length, 3, "every finding re-checked");
  /* the second completes it */
  const r2 = (await complete(w, a, NOTE));
  assert.equal(r2.recreation.findings.find((f) => f.finding === F2).result, "recreated");
  assert.deepEqual(w.checker.calls.at(-1), { parts: 1, documents: 2 });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM case_import_editions`)), edition, "the edition is unchanged");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM case_import_files ORDER BY path`)), files, "its files are unchanged");
  const read = w.ci.importedCase({ import: a.import, viewer: V("alice") }).edition;
  assert.deepEqual(read.documents.map((d) => d.sha), [sha(LETTER), sha(NOTE)]);
  assert.equal(read.documents[0].by, "bob");
});

/* ================================================================ R6 */

test("R6 refusals in order: R1's two, then IMPORT_NO_SUCH_EDITION, each writing nothing", async () => {
  const w = seeded();
  const a = (await scripted(w));
  (await refusedThenAccepted(w, async () => accept(w, a, { by: MACHINE }), async () => accept(w, a), "MACHINE_CANNOT_IMPORT"));
  (await refusedThenAccepted(w, async () => accept(w, a, {}, "carol"), async () => accept(w, a), "IMPORT_NOT_A_MEMBER"));
  for (const x of [{ edition: 2 }, { edition: null }, { edition: "one" }, { import: "f".repeat(64) }, { import: null }])
    (await refusedThenAccepted(w, async () => accept(w, a, x), async () => accept(w, a), "IMPORT_NO_SUCH_EDITION"));
  /* the order: a machine on a missing edition is the machine's refusal; a non-member's is the membership's */
  (await rowOk(accept(w, a, { by: MACHINE, edition: 9 }), "MACHINE_CANNOT_IMPORT"));
  (await rowOk(accept(w, a, { edition: 9 }, "carol"), "IMPORT_NOT_A_MEMBER"));
});

test("R6 checked or reason absent, blank or over 2,000 characters is IMPORT_ACCEPT_NO_REASON, before the findings are asked", async () => {
  const w = seeded();
  const a = (await scripted(w));
  for (const x of [{ checked: null }, { checked: "" }, { checked: "   " }, { checked: "c".repeat(2001) },
                   { reason: null }, { reason: "" }, { reason: "\n\t" }, { reason: "r".repeat(2001) }])
    (await refusedThenAccepted(w, async () => accept(w, a, x), async () => accept(w, a, { checked: "c".repeat(2000), reason: "r".repeat(2000) }),
                        "IMPORT_ACCEPT_NO_REASON"));
  (await rowOk(accept(w, a, { reason: "", findings: ["INQ-2026-0999-none"] }), "IMPORT_ACCEPT_NO_REASON"));
});

test("R6 a finding not in the edition is IMPORT_NO_SUCH_FINDING; a did_not_recreate finding is IMPORT_ACCEPT_NOT_RECREATED, naming each", async () => {
  const w = seeded();
  const a = (await scripted(w));
  for (const findings of [["INQ-2026-0999-none"], [F1, "INQ-2026-0999-none"], [], null, "INQ-2026-0999-none"])
    (await refusedThenAccepted(w, async () => accept(w, a, { findings }), async () => accept(w, a), "IMPORT_NO_SUCH_FINDING"));
  const r = (await refusedThenAccepted(w, async () => accept(w, a, { findings: [F1, F3] }), async () => accept(w, a, { findings: [F1] }), "IMPORT_ACCEPT_NOT_RECREATED"));
  assert.deepEqual(r.findings, [F3]);
  /* the order: an unknown finding before a not-recreated one */
  (await rowOk(accept(w, a, { findings: [F3, "INQ-2026-0999-none"] }), "IMPORT_NO_SUCH_FINDING"));
});

test("R6 a recreated_in_part finding needs each missing entry stated in the member's words, else IMPORT_ACCEPT_GAPS_UNSTATED naming each gap", async () => {
  const w = seeded();
  const a = (await scripted(w));
  const both = { [F2]: ["we have not seen the letter", "the note is not public"] };
  for (const gaps of [null, {}, { [F2]: [] }, { [F2]: ["only the first"] }, { [F2]: ["", "the note"] }, { [F2]: ["x".repeat(2001), "y"] }])
    (await refusedThenAccepted(w, async () => accept(w, a, { findings: [F2], gaps }), async () => accept(w, a, { findings: [F2], gaps: both }),
                        "IMPORT_ACCEPT_GAPS_UNSTATED"));
  const r = accept(w, a, { findings: [F1, F2], gaps: { [F2]: ["", "the note"] } });
  (await rowOk(r, "IMPORT_ACCEPT_GAPS_UNSTATED"));
  assert.deepEqual(r.unstated, [{ finding: F2, entry: 0, missing: { sha: sha(LETTER), words: "the letter, fetch it" } }]);
  /* with gaps stated, accepted; the gaps are kept in the member's words */
  const ok = accept(w, a, { findings: [F2], gaps: JSON.stringify(both) });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.gaps, both);
  assert.deepEqual(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F2 }).gaps, both[F2]);
});

test("R6 the act records one edition's acceptance for those findings with by, instant, checked, reason and gaps, naming each finding's ref", async () => {
  const w = seeded();
  const a = (await scripted(w));
  (await imp(w, caseFile({ edition: 2 })));
  w.clock.now = Date.parse("2026-10-07T07:07:07Z");
  const r = accept(w, a, { findings: [F1] }, "bob");
  assert.equal(r.ok, true);
  assert.deepEqual({ edition: r.edition, by: r.by, at: r.at, checked: r.checked, reason: r.reason, gaps: r.gaps },
                   { edition: 1, by: "bob", at: "2026-10-07T07:07:07Z", checked: "every passage against its document",
                     reason: "the chain holds", gaps: {} });
  assert.deepEqual(r.findings, [{ finding: F1, ref: importedFindingRef(a.import, F1), result: "recreated" }]);
  assert.equal(r.findings[0].ref, `imported:${a.import}/${F1}`, "the spelling a leg names");
  assert.deepEqual(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }),
                   { acceptance: r.acceptance, by: "bob", at: "2026-10-07T07:07:07Z", reason: "the chain holds",
                     checked: "every passage against its document", gaps: [] });
  /* one edition: a later edition of the same case reads as another group's until it is accepted */
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 2, finding: F1 }), null);
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F2 }), null, "only the findings named");
});

/* ================================================================ R7 */

test("R7 refusals: R1's two, IMPORT_NO_SUCH_EDITION, IMPORT_ACCEPT_NO_REASON for a missing reason, IMPORT_NOTHING_ACCEPTED, each writing nothing", async () => {
  const w = seeded();
  const a = (await scripted(w));
  (await rowOk(withdraw(w, a), "IMPORT_NOTHING_ACCEPTED"));
  accept(w, a);
  (await refusedThenAccepted(w, async () => withdraw(w, a, { by: "class:daemon" }), async () => accept(w, a), "MACHINE_CANNOT_IMPORT"));
  (await refusedThenAccepted(w, async () => withdraw(w, a, {}, "dave"), async () => accept(w, a), "IMPORT_NOT_A_MEMBER"));
  (await refusedThenAccepted(w, async () => withdraw(w, a, { edition: 3 }), async () => accept(w, a), "IMPORT_NO_SUCH_EDITION"));
  for (const reason of [null, "", "  ", "r".repeat(2001)])
    (await refusedThenAccepted(w, async () => withdraw(w, a, { reason }), async () => accept(w, a), "IMPORT_ACCEPT_NO_REASON"));
  assert.equal(withdraw(w, a).ok, true);
  (await refusedThenAccepted(w, async () => withdraw(w, a), async () => accept(w, a), "IMPORT_NOTHING_ACCEPTED"));
  assert.equal(withdraw(w, a, { reason: "r".repeat(2000) }).ok, true, "the control at the bound");
});

test("R7 the withdrawal is recorded with by, instant and reason; the acceptance stays in the history, corrected forward and never erased", async () => {
  const w = seeded();
  const a = (await scripted(w));
  w.clock.now = Date.parse("2026-10-08T00:00:00Z");
  const acc = accept(w, a, { findings: [F1, F2], gaps: { [F2]: ["a", "b"] } });
  const rowsBefore = JSON.stringify(w.rows(`SELECT * FROM case_import_acceptances`));
  w.clock.now = Date.parse("2026-10-09T00:00:00Z");
  const r = withdraw(w, a, {}, "bob");
  assert.equal(r.ok, true);
  assert.deepEqual({ by: r.by, at: r.at, reason: r.reason, acceptances: r.acceptances },
                   { by: "bob", at: "2026-10-09T00:00:00Z", reason: "the source corrected it", acceptances: [acc.acceptance] });
  assert.deepEqual(r.refs, [importedFindingRef(a.import, F1), importedFindingRef(a.import, F2)]);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM case_import_acceptances`)), rowsBefore, "the acceptance stays");
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }), null, "no longer in force");
  /* corrected forward: a new acceptance is in force again */
  const again = accept(w, a);
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }).acceptance, again.acceptance);
  assert.equal(w.count("case_import_acceptances"), 2);
});

test("R7 after the withdrawal commits it calls reevaluation.acceptanceWithdrawn and carries its answer; a failure there never undoes it and is named", async () => {
  const w = seeded();
  const a = (await scripted(w));
  accept(w, a);
  const r = withdraw(w, a);
  assert.deepEqual(w.reeval.told, [{ withdrawal: r.withdrawal }]);
  assert.deepEqual(r.reevaluation, { ok: true, told: true, kind: "acceptance", withdrawal: r.withdrawal, dependents: 0 });
  /* after the commit: the withdrawal is readable by the time it is told */
  assert.ok(w.ci.withdrawals({}).withdrawals.some((x) => x.withdrawal === r.withdrawal));
  /* a failure is named and undoes nothing */
  accept(w, a);
  w.reeval.throws = true;
  const r2 = withdraw(w, a);
  assert.equal(r2.ok, true);
  assert.equal(r2.reevaluation.told, false);
  assert.deepEqual(r2.reevaluation.listeners_failed, [{ module: "reevaluation", error: "listeners down" }]);
  assert.equal(w.count("case_import_withdrawals"), 2);
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }), null);
  /* a refused withdrawal tells nobody */
  const told = w.reeval.told.length;
  withdraw(w, a);
  assert.equal(w.reeval.told.length, told);
});
