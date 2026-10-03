/* case-authoring over the real `case-import` (T28; DEC-96 item 4, N522; K1327): another group's case file imported,
   recreated, accepted, flagged and withdrawn through case-import's own acts, and a case of this group resting on it —
   its acceptance stated (R55 (case-disclosures R13)), its open flags disclosed and never blocking (R55 (case-disclosures R14)), the ceremony told both (R53). The case
   file is built as case-import's own suite builds one; its checker is scripted at case-checker's R1 (`w.checks`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS } from "../../../src/case-authoring/index.mjs";
import { acceptedWorkOf } from "../../../src/case-grammar/index.mjs";
import { caseFile, SOURCE, CASE } from "../case-import/fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", THEIRS = "INQ-2026-0001-transfers";
const PAIR = { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } };

function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check], [code, code, CASE_DISCLOSURE_CHECKS[code].check]);
}
/* Alice imports another group's case file, recreated whole, and accepts edition 1 of THEIRS; Q rests on it. */
async function setup() {
  const w = world({ realImports: true });
  for (const m of ["alice", "bob"]) w.member(m);
  w.doc(DOC);
  Object.assign(w.checks, { group: SOURCE, case: CASE, edition: 1, findings: [{ finding: THEIRS, pair: PAIR }] });
  const cf = caseFile({ findings: [THEIRS] });
  const imp = await w.imports.importCaseFile({ parts: cf.parts, by: V("alice"), viewer: V("alice") });
  assert.equal(imp.ok, true, JSON.stringify(imp).slice(0, 300));
  const acc = w.imports.acceptImported({ import: imp.import, edition: 1, findings: [THEIRS], checked: "every passage",
                                         reason: "We recreated it whole and read it.", by: V("alice"), viewer: V("alice") });
  assert.equal(acc.ok, true, JSON.stringify(acc).slice(0, 300));
  const ref = w.imports.importedCase({ import: imp.import, edition: 1, viewer: V("alice") }).edition.findings[0].ref;
  w.finding(Q, [{ target: DOC }, { target: ref, target_edition: 1 }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P, ref, imp: imp.import, cf };
}
const args = (P) => ({ scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
  subjectJustification: "A public record.", biasAcknowledgement: "We read the minutes as the account.", excluded: [],
  project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" });
const docOf = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text;

test("R55 (case-disclosures R13) (real case-import): the accepted_work: row states, from case-import's acceptanceOf and importedCase, who accepted which edition, when and why, the recreation result and the source case file's manifest; what was checked stays inside the group", async () => {
  const { w, P, ref, imp, cf } = await setup();
  const r = w.ca.publishCase(args(P));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const acc = w.imports.acceptanceOf({ import: imp, edition: 1, finding: THEIRS });
  const view = w.imports.importedCase({ import: imp, edition: 1, viewer: V("alice") }).edition;
  const text = docOf(w, r);
  assert.deepEqual(acceptedWorkOf(w.fm(text)).rows.map((x) => [x.member, x.leg_of, x.ref, x.group, x.case, x.edition,
    x.finding, x.manifest_sha, x.result, x.accepted_by, x.accepted_at, x.reason]),
    [[Q, Q, ref, SOURCE, CASE, 1, THEIRS, view.manifest_sha, "recreated", acc.by, acc.at, "We recreated it whole and read it."]]);
  assert.equal(view.manifest_sha, cf.manifestSha);
  assert.equal(text.includes("every passage"), false);
});

test("R55 (case-disclosures R14) (real case-import): an open flag raised by flagImported is FLAG_NOT_DISCLOSED until listed, then the case publishes disclosing it; once cleared by clearFlag, listing it is FLAG_DISCLOSURE_NOT_STANDING", async () => {
  const { w, P, imp } = await setup();
  const f = w.imports.flagImported({ import: imp, edition: 1, finding: THEIRS, issue: "page 3 is misread", by: V("bob"), viewer: V("bob") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  refused(w.ca.publishCase(args(P)), "FLAG_NOT_DISCLOSED");
  const ok = w.ca.publishCase({ ...args(P), flagsDisclosed: [{ flag: f.flag, words: "we read page 3 ourselves" }] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const flags = acceptedWorkOf(w.fm(docOf(w, ok))).flags;
  assert.deepEqual(flags.map((x) => [x.flag, x.issue, x.words, x.acknowledged_by]),
    [[f.flag, "page 3 is misread", "we read page 3 ourselves", "alice"]]);
  assert.equal(docOf(w, ok).includes("h_bob"), false, "the flagging member is not named");
  assert.equal(w.imports.clearFlag({ flag: f.flag, reason: "page 3 re-read and right", by: V("bob"), viewer: V("bob") }).ok, true);
  refused(w.ca.publishCase({ ...args(P), newCase: true, flagsDisclosed: [{ flag: f.flag }] }), "FLAG_DISCLOSURE_NOT_STANDING");
});

test("R55 (case-disclosures R13), R53 (real case-import): once the acceptance is withdrawn the act is ACCEPTED_WORK_NOT_IN_FORCE, and the pre-flight's step two names the accepted_work row while it is in force", async () => {
  const { w, P, imp, ref } = await setup();
  const pre = w.ca.publishPreflight(args(P));
  assert.deepEqual(pre.steps[1].accepted_work.map((x) => [x.ref, x.edition, x.case]), [[ref, 1, CASE]]);
  assert.deepEqual([pre.steps[2].flags.count, pre.steps[2].flags.open], [0, []]);
  const wd = w.imports.withdrawAcceptance({ import: imp, edition: 1, reason: "a later edition contradicts it", by: V("alice"),
                                            viewer: V("alice") });
  assert.equal(wd.ok, true, JSON.stringify(wd).slice(0, 300));
  const before = w.snapshot();
  const r = w.ca.publishCase(args(P));
  refused(r, "ACCEPTED_WORK_NOT_IN_FORCE");
  assert.deepEqual(r.not_in_force.map((x) => [x.target, x.ref, x.source.case, x.source.edition]), [[Q, ref, CASE, 1]]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});
