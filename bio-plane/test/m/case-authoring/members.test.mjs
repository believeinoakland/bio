/* case-authoring: each member of the case — who may be one (R4), the project's bar asked of the load-bearing ones (R6),
   hunch debt (R55 (case-disclosures R16)), what publishing writes on a member (nothing: R13, R23), and that no case-level strength is composed
   anywhere (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, readingLines, currentLines } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const ALICE = "member:alice";

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  return w;
}
const keysDeep = (o, out = []) => {
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { out.push(k); keysDeep(v, out); }
  return out;
};

test("R4: each member, in order — NO_SUCH_BUNDLE (absent and invisible alike), NOT_AN_INQUIRY, NO_DOCUMENT, NOT_CONCLUDED", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const hidden = w.project("Elsewhere", "bo", []);
  /* a question whose bundle.md is held only as a blob has no readable document */
  w.finding(Q2, [{ target: DOC }]);
  w.st.sql.exec(`UPDATE files SET content=NULL, blob_sha='ab' WHERE bundle_id=? AND path='bundle.md'`, Q2);
  const before = w.snapshot();
  const absent = w.publish(P, "alice", [Q, "INQ-2026-0099-none"]);
  const unseen = w.publish(P, "alice", [Q, hidden]);
  assert.deepEqual([absent.reason, absent.target], ["NO_SUCH_BUNDLE", "INQ-2026-0099-none"]);
  assert.deepEqual([unseen.reason, Object.keys(unseen).sort()], ["NO_SUCH_BUNDLE", Object.keys(absent).sort()],
    "a project the publisher cannot see answers exactly as an id that names nothing");
  const doc = w.publish(P, "alice", [DOC]);
  assert.deepEqual([doc.reason, doc.target, doc.object_type], ["NOT_AN_INQUIRY", DOC, "information"]);
  const own = w.publish(P, "alice", [P]);
  assert.equal(own.reason, "NOT_AN_INQUIRY", "a project the publisher sees is no finding");
  const blob = w.publish(P, "alice", [Q2]);
  assert.deepEqual([blob.reason, blob.target], ["NO_DOCUMENT", Q2]);
  /* in order: the first member's refusal wins, and every member is judged before any member moves */
  assert.equal(w.publish(P, "alice", [DOC, "INQ-2026-0099-none"]).reason, "NOT_AN_INQUIRY");
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R4: NOT_CONCLUDED is asked of the publishing project's relationship (ratification R1), naming the relationship, why (never concluded, withdrew, undetermined, question not case-bearing) and the projects that did conclude, with the read's bound", () => {
  const w = setup();
  /* an open question with an accepted reading, which two projects stand on */
  w.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC]) });
  const P = w.project("Team", "alice", [Q], { extra: currentLines(Q) });
  const P2 = w.project("Other", "bo", [Q], { extra: currentLines(Q) });
  w.join(P2, "alice");
  const never = w.publish(P, "alice", [Q]);
  assert.deepEqual([never.reason, never.target, never.project, never.relationship, never.why, never.from],
    ["NOT_CONCLUDED", Q, P, "project", "project_has_never_concluded", "open"]);
  assert.match(never.detail, /^only a CONCLUDED finding may be a case member/, "the rule's own sentence leads");
  assert.deepEqual(never.concluded_elsewhere, []);
  assert.equal(typeof never.concluded_elsewhere_bounds, "object");
  /* the other project concludes it: information, never P's stance */
  const c2 = w.basisVersions.conclude({ target: Q, project: P2, falsifier: "a later amendment", author: "bo",
                                        viewer: V("bo"), identity: "member:bo" });
  assert.equal(c2.ok, true, JSON.stringify(c2).slice(0, 300));
  const elsewhere = w.publish(P, "alice", [Q]);
  assert.deepEqual([elsewhere.why, elsewhere.concluded_elsewhere.map((o) => o.project)],
    ["project_has_never_concluded", [P2]]);
  /* P concludes: it publishes, recording its own relationship */
  const c1 = w.basisVersions.conclude({ target: Q, project: P, falsifier: "a later amendment", author: "alice",
                                        viewer: V("alice"), identity: ALICE });
  assert.equal(c1.ok, true, JSON.stringify(c1).slice(0, 300));
  const ok = w.publish(P, "alice", [Q]);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const doc = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=?`, ok.caseId).text);
  assert.deepEqual([doc.case_conclusions[0].relationship, doc.case_conclusions[0].project], ["project", P]);
  /* withdrawn: it stands on none today */
  const w2 = setup();
  w2.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC]) });
  const PW = w2.project("Team", "alice", [Q], { extra: currentLines(Q) });
  w2.basisVersions.conclude({ target: Q, project: PW, falsifier: "f", author: "alice", viewer: V("alice"), identity: ALICE });
  assert.equal(w2.basisVersions.withdrawConclusion({ target: Q, project: PW, reason: "second thoughts", who: ALICE,
                                                     viewer: V("alice"), identity: ALICE }).ok, true);
  assert.equal(w2.publish(PW, "alice", [Q]).why, "project_withdrew_its_conclusion");
  /* undetermined: the project's latest entry names an act this plane does not know */
  const w3 = setup();
  w3.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC]) });
  const PU = w3.project("Team", "alice", [Q], { extra: [...currentLines(Q), "conclusions:", `  - inquiry: "${Q}"`,
    `    act: "reconsidered"`, `    at: "${T0}"`, `    by: "${ALICE}"`] });
  assert.equal(w3.publish(PU, "alice", [Q]).why, "project_stance_undetermined");
  /* not case-bearing: a question the group set down, however it was concluded */
  const w4 = setup();
  w4.finding(Q, [{ target: DOC }], { state: "deferred", lines: ['disposition_reason: "later"'] });
  const PD = w4.project("Team", "alice", [Q]);
  const down = w4.publish(PD, "alice", [Q]);
  assert.deepEqual([down.reason, down.why, down.from], ["NOT_CONCLUDED", "question_not_case_bearing", "deferred"]);
});

test("R6: the project's bar is read once; on each axis it declares each load-bearing member's pair must reach it, an unrated or undetermined axis not reaching; supporting members and undeclared axes are not asked; the group default is never consulted", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);   /* capture C */
  w.finding(Q2, [{ target: DOC2 }]);                                                                  /* unrated */
  w.finding(Q3, [{ target: DOC, grade: "B", grade_axis: "capture", grade_source: "capture" }]);  /* capture B */
  const bar = (cap) => ["required_strength:", `  capture: ${cap}`];
  const P = w.project("Team", "alice", [Q, Q2, Q3], { extra: bar("B") });
  const before = w.snapshot();
  const low = w.publish(P, "alice", [Q]);
  assert.deepEqual([low.reason, low.target, low.axis, low.project, low.required, low.reached, low.state],
    ["BELOW_PROJECT_STRENGTH", Q, "capture", P, "B", "C", "graded"]);
  const unrated = w.publish(P, "alice", [Q2]);
  assert.deepEqual([unrated.reason, unrated.reached, unrated.state], ["BELOW_PROJECT_STRENGTH", null, "unrated"],
    "an unrated axis does not reach a declared bar");
  assert.deepEqual(w.snapshot(), before);
  /* the connection axis is undeclared: nothing asks it (every member here is unrated on it) */
  const reach = w.publish(P, "alice", [Q3]);
  assert.equal(reach.ok, true, JSON.stringify(reach).slice(0, 300));
  assert.deepEqual(reach.required, { ...w.strength.projectBar(P) }, "the bar the act froze is the project's own");
  /* a member below the bar travels as SUPPORTING */
  const w2 = setup();
  w2.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  w2.finding(Q3, [{ target: DOC, grade: "B", grade_axis: "capture", grade_source: "capture" }]);
  const P2 = w2.project("Team", "alice", [Q, Q3], { extra: bar("B") });
  const mixed = w2.publish(P2, "alice", [Q3, Q], { roles: { [Q3]: "load_bearing", [Q]: "supporting" } });
  assert.equal(mixed.ok, true, JSON.stringify(mixed).slice(0, 300));
  /* the group's default seeds new projects and gates no publication */
  const w3 = setup();
  w3.finding(Q2, [{ target: DOC2 }]);
  const P3 = w3.project("Team", "alice", [Q2]);
  w3.member("root", { role: "admin" });
  assert.equal(w3.strength.strengthBarSet({ capture: "A", connection: "A", author: "root",
                                             reason: "The group's default for new projects." }).ok, true);
  const noBar = w3.publish(P3, "alice", [Q2]);
  assert.deepEqual([noBar.ok, noBar.required.declared], [true, false]);
});

test("R55 (case-disclosures R16): a member carrying uncleared hunch debt is refused UNCLEARED_HUNCH, naming every hunch leg, before anything is written (no case id drawn)", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }, { target: DOC2, grade: "B", grade_axis: "connection", grade_source: "hunch",
                                   author: ALICE, date: "2026-09-27" }]);
  w.finding(Q2, [{ target: DOC, grade: "C", grade_axis: "connection", grade_source: "hunch", author: ALICE,
                   date: "2026-09-27" }]);
  w.finding(Q3, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2, Q3]);
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q3, Q, Q2], { roles: { [Q3]: "load_bearing", [Q]: "load_bearing", [Q2]: "supporting" } });
  assert.deepEqual([r.ok, r.reason, r.hunches], [false, "UNCLEARED_HUNCH",
    [{ target: Q, ord: 1, leg_target: DOC2 }, { target: Q2, ord: 0, leg_target: DOC }]],
    "a supporting member's hunch is debt too");
  assert.deepEqual(w.snapshot(), before, "nothing written, no id minted");
  /* cleared: the hunch leg re-graded from the record (here: gone from the basis) */
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC }]);
  assert.equal(w.publish(P, "alice", [Q3, Q, Q2], { roles: { [Q3]: "load_bearing", [Q]: "load_bearing", [Q2]: "supporting" } }).ok, true);
});

test("R13, R23: publishing writes nothing on any finding — each member is pinned at its bundle_sha as prepared; its own edition is the published edition of that sha when another case carried it, else the next on its chain; the case edition is the case's highest published edition plus one; project B's publish leaves project A's pin and raises no flag", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const A = w.project("A", "alice", [Q, Q2]);
  const B = w.project("B", "bo", [Q, Q2]);
  const shaQ = w.head(Q), textQ = w.text(Q), shaQ2 = w.head(Q2);
  const a1 = w.publish(A, "alice", [Q]);
  assert.equal(a1.ok, true, JSON.stringify(a1).slice(0, 300));
  assert.deepEqual([w.head(Q), w.text(Q)], [shaQ, textQ], "the finding's bytes and pin did not move");
  assert.deepEqual([a1.edition, a1.findings[0].bundleSha, a1.findings[0].edition, a1.findings[0].promoted,
                    a1.findings[0].frozen_in], [1, shaQ, 1, false, "case_document"]);
  w.ratify(a1);
  /* the member crosses at edition 1 of its own chain (op=ratify's commit), then A's next edition keeps that number */
  assert.equal(w.publication.commitEdition({ bundleId: Q, edition: 1, bundleSha: shaQ, title: "q", attestorKey: "k",
    gateVersion: "1.37.0", sigArmored: "s-q-1", shas: [], edges: [], at: "2026-09-28T02:00:00Z" }).ok, true);
  /* B publishes a new case over the same bytes: A's case, its document and its pin are untouched, and no flag */
  const aDoc = w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=?`, a1.caseId);
  const b1 = w.publish(B, "bo", [Q, Q2], { newCase: true });
  assert.equal(b1.ok, true, JSON.stringify(b1).slice(0, 300));
  assert.deepEqual([w.head(Q), w.head(Q2)], [shaQ, shaQ2]);
  assert.deepEqual(w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=?`, a1.caseId), aDoc);
  assert.deepEqual(w.publication.caseFlags({}).flags, [], "no revision flag raised");
  const byId = Object.fromEntries(b1.findings.map((f) => [f.target, f]));
  assert.deepEqual([byId[Q].edition, byId[Q].bundleSha, byId[Q2].edition, b1.edition],
    [1, shaQ, 1, 1], "Q's bytes are its published edition 1; Q2's next on its own chain; B's case at its edition 1");
  assert.equal(byId[Q].reevaluation, undefined, "bytes already carried across raise nothing");
  /* A's next edition of its own case, after Q moved: the case edition is 2, the member's own the next on its chain */
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a2 = w.publish(A, "alice", [Q], { caseId: a1.caseId, statement: "It does not cover the award's amendments.",
    subjectJustification: "A public record, so the question is whether it was followed.",
    biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
    excluded: [{ description: "the amendments", reason: "requested and not yet held" }] });
  assert.equal(a2.ok, true, JSON.stringify(a2).slice(0, 300));
  assert.deepEqual([a2.edition, a2.findings[0].edition, a2.findings[0].bundleSha], [2, 2, w.head(Q)]);
  assert.equal(typeof a2.findings[0].reevaluation, "object", "a NEW edition of the finding above 1 raises (R15)");
  assert.deepEqual(a2.findings[0].reevaluation.source, "edition");
});

test("R15: a new member edition above 1 raises through reevaluation, and its answer is carried whole: a listener that fails is named under listeners_failed, never refused on, and the act lands", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }]);
  const A = w.project("A", "alice", [Q]);
  const a1 = w.publish(A, "alice", [Q]);
  assert.equal(a1.ok, true, JSON.stringify(a1).slice(0, 300));
  assert.equal(a1.findings[0].reevaluation, undefined, "a member's edition 1 raises nothing");
  w.ratify(a1);
  assert.equal(w.publication.commitEdition({ bundleId: Q, edition: 1, bundleSha: w.head(Q), title: "q", attestorKey: "k",
    gateVersion: "1.37.0", sigArmored: "s-q-1", shas: [], edges: [], at: "2026-09-28T02:00:00Z" }).ok, true);
  const told = [];
  assert.equal(w.reevaluation.onBasisChanged("queue", () => { throw new Error("listener down"); }).ok, true);
  assert.equal(w.reevaluation.onBasisChanged("monitoring", (e) => { told.push(e); }).ok, true);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a2 = w.publish(A, "alice", [Q], { caseId: a1.caseId, statement: "It does not cover the award's amendments.",
    subjectJustification: "A public record, so the question is whether it was followed.",
    biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
    excluded: [{ description: "the amendments", reason: "requested and not yet held" }] });
  assert.equal(a2.ok, true, JSON.stringify(a2).slice(0, 300));
  const r = a2.findings[0].reevaluation;
  assert.deepEqual([r.source, r.edition, r.listeners_failed], ["edition", 2, ["queue"]]);
  assert.deepEqual(told.map((e) => [e.kind, e.subject, e.source, e.edition]), [["finding", Q, "edition", 2]]);
  assert.ok(w.row(`SELECT 1 x FROM case_documents WHERE case_id=? AND edition=2`, a1.caseId), "the document is stored");
});

test("R24: no answer or document composes a case-level strength: every pair is per member and per axis", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  w.finding(Q2, [{ target: DOC2, grade: "B", grade_axis: "capture", grade_source: "capture" }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const r = w.publish(P, "alice", [Q, Q2]);
  assert.equal(r.ok, true);
  const composed = ["strength", "grade", "score", "overall", "composed", "letter", "rating"];
  for (const k of composed) assert.equal(k in r, false, `no case-level ${k}`);
  for (const f of r.findings) {
    assert.ok(Array.isArray(f.strength), "a finding's strength is its per-axis list");
    for (const a of f.strength) assert.deepEqual(Object.keys(a).sort(), ["axis", "grade", "state", "weakest"]);
  }
  assert.ok(!keysDeep(r.completeness).some((k) => composed.includes(k)));
  const fm = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text);
  for (const k of Object.keys(fm)) assert.ok(!composed.includes(k), `no top-level ${k} in the document`);
  for (const row of fm.case_strength) assert.ok(row.target && row.axis, "every frozen row names its member and axis");
  assert.deepEqual([...new Set(fm.case_strength.map((x) => x.target))].sort(), [Q, Q2].sort());
});
