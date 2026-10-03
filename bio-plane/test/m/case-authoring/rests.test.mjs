/* case-authoring (T28; DEC-112 (4)(6), DEC-96 item 4; N519, N522): what a case's findings reach and may rest on — each
   chain followed through inquiry legs to the depth bound and stopping at another group's finding (R55 (case-disclosures R8, R12)), material a
   load-bearing finding relies on held whole or refused (R55 (case-disclosures R6)), another group's work stated with its acceptance (R55 (case-disclosures R13)) and
   its open flags disclosed, never blocked (R55 (case-disclosures R14)). Over the real record, provenance, extraction and accepted-work;
   `case-import` is the fixture's stand-in at its ruled interface (its R4, R9, R16) until it is composed here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, REPUBLISH_SENTENCE } from "../../../src/case-authoring/index.mjs";
import { DEPTH_BOUND } from "../../../src/strength/index.mjs";
import { acceptedWorkOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const IMP = "a".repeat(64), THEIRS = "INQ-2026-0042-x";

function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  return w;
}

test("R55 (case-disclosures R6): a load-bearing finding resting on a document this copy does not hold whole — its extracted text not indexed, indexed only in part, a unit cut, or its bytes gone — is RELIED_ON_NOT_PRESENTABLE (C-120.8), naming each member and material and what it lacks, before anything is written", () => {
  for (const [why, lacks, spoil] of [
    ["not indexed", ["extracted_text"], () => {}],
    ["partial", ["extracted_text"], (w, c) => w.indexText(c, DOC2, [{ text: "half" }], "partial")],
    ["a unit cut", ["extracted_text"], (w, c) => w.indexText(c, DOC2, [{ text: "cut", truncated: true }])],
    ["bytes gone", ["bytes"], (w, c) => { w.indexText(c, DOC2); w.st.sql.exec(`DELETE FROM files WHERE bundle_id=? AND path='snapshots/c0.txt'`, DOC2); }],
  ]) {
    const w = setup();
    w.doc(DOC);
    const c = w.doc(DOC2, undefined, { text: false });
    spoil(w, c);
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    const P = w.project("Team", "alice", [Q]);
    const before = w.snapshot();
    const r = w.publish(P, "alice", [Q]);
    refused(r, "RELIED_ON_NOT_PRESENTABLE");
    assert.deepEqual(r.not_presentable, [{ target: Q, materials: [{ ref: DOC2, kind: "document", sha: c, missing: lacks }] }], why);
    assert.deepEqual(w.snapshot(), before, `${why}: no id drawn, nothing written`);
    /* the pre-flight names it before the first screen */
    assert.deepEqual(w.ca.publishPreflight({ ...publishArgs(P, [Q]) }).first, r);
  }
});

test("R55 (case-disclosures R6): material only a supporting member reaches is never refused; held whole, a load-bearing one publishes", () => {
  const w = setup();
  w.doc(DOC); w.doc(DOC2, undefined, { text: false });
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const r = w.publish(P, "alice", [Q, Q2], { roles: { [Q]: "load_bearing", [Q2]: "supporting" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  /* negative control: the same document under a load-bearing member is refused */
  refused(w.publish(P, "alice", [Q2], { newCase: true }), "RELIED_ON_NOT_PRESENTABLE");
});

test("R55 (case-disclosures R8): a chain reaches what its legs target through inquiry legs, to strength's depth bound, and no further", () => {
  const w = setup();
  w.doc(DOC);
  const c = w.doc(DOC2, undefined, { text: false });
  /* Q3 rests on the unindexed document; Q rests on Q2, which rests on Q3 */
  w.finding(Q3, [{ target: DOC2 }]);
  w.finding(Q2, [{ target: Q3 }]);
  w.finding(Q, [{ target: DOC }, { target: Q2 }]);
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q]);
  refused(r, "RELIED_ON_NOT_PRESENTABLE");
  assert.deepEqual(r.not_presentable[0].materials.map((m) => m.sha), [c], "reached two inquiries down");
  /* past the depth bound a chain reaches nothing more */
  assert.equal(DEPTH_BOUND, 6);
  const x = setup();
  x.doc(DOC); x.doc(DOC2, undefined, { text: false });
  const ids = Array.from({ length: DEPTH_BOUND + 1 }, (_, i) => `INQ-2026-01${String(i).padStart(2, "0")}-d`);
  x.finding(ids[DEPTH_BOUND], [{ target: DOC2 }]);
  for (let i = DEPTH_BOUND - 1; i >= 0; i--) x.finding(ids[i], [{ target: DOC }, { target: ids[i + 1] }]);
  const XP = x.project("Deep", "alice", [ids[0]]);
  const deep = x.publish(XP, "alice", [ids[0]]);
  assert.equal(deep.ok, true, `the document ${DEPTH_BOUND + 1} inquiries down is past the bound: ${JSON.stringify(deep).slice(0, 200)}`);
  /* negative control: one step shallower, it is reached */
  const y = setup();
  y.doc(DOC); y.doc(DOC2, undefined, { text: false });
  y.finding(ids[DEPTH_BOUND - 1], [{ target: DOC2 }]);
  for (let i = DEPTH_BOUND - 2; i >= 0; i--) y.finding(ids[i], [{ target: DOC }, { target: ids[i + 1] }]);
  refused(y.publish(y.project("Deep", "alice", [ids[0]]), "alice", [ids[0]]), "RELIED_ON_NOT_PRESENTABLE");
});

function onTheirs(over = {}) {
  const w = setup();
  w.doc(DOC);
  w.imports.edition(IMP, 2, { findings: [{ finding: THEIRS, result: "recreated", pair: { capture: "B", connection: "C" } }] });
  const ref = w.imports.accept(IMP, 2, THEIRS, over);
  w.finding(Q, [{ target: DOC }, { target: ref, target_edition: 2 }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P, ref };
}

test("R55 (case-disclosures R12, R13): a chain stops at a leg on another group's finding — none of that group's material is asked of this copy — and with an acceptance in force the case publishes", () => {
  const { w, P } = onTheirs();
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
});

test("R55 (case-disclosures R13): with no acceptance in force at the leg's edition the act is ACCEPTED_WORK_NOT_IN_FORCE (C-120.10), naming the member, the leg and the source case and edition, before anything is written", () => {
  const { w, P, ref } = onTheirs();
  w.imports.withdraw(IMP, 2, THEIRS);
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q]);
  refused(r, "ACCEPTED_WORK_NOT_IN_FORCE");
  assert.deepEqual(r.not_in_force, [{ target: Q, leg_of: Q, ord: 1, ref,
                                      source: { group: "other-group", case: "CASE-2026-0900", edition: 2 } }]);
  assert.deepEqual(w.snapshot(), before);
  /* accepted again, it publishes */
  w.imports.accept(IMP, 2, THEIRS);
  assert.equal(w.publish(P, "alice", [Q]).ok, true);
});

test("R55 (case-disclosures R14): an open flag on the edition is FLAG_NOT_DISCLOSED (C-120.11) until listed in flagsDisclosed, then it publishes — disclose, never block; a listed flag not open is FLAG_DISCLOSURE_NOT_STANDING (C-120.13); a failed or incomplete read FLAGS_UNDETERMINED (C-120.12); a malformed list R3's BAD_COMPLETENESS", () => {
  const { w, P } = onTheirs();
  w.imports.flag(IMP, 2, { flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread" });
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q]);
  refused(r, "FLAG_NOT_DISCLOSED");
  assert.deepEqual(r.undisclosed.map((f) => [f.flag, f.edition, f.issue]), [["IMPFLAG-1", 2, "page 3 is misread"]]);
  refused(w.publish(P, "alice", [Q], { flagsDisclosed: [{ flag: "IMPFLAG-1" }, { flag: "IMPFLAG-9" }] }), "FLAG_DISCLOSURE_NOT_STANDING");
  for (const [list, field] of [["x", "flagsDisclosed"], [[{}], "flagsDisclosed[0]"],
                               [[{ flag: "IMPFLAG-1", words: 'a "q"' }], "flagsDisclosed[0].words"]])
    assert.deepEqual(Object.values((({ reason, field: f }) => ({ reason, f }))(w.publish(P, "alice", [Q], { flagsDisclosed: list }))),
                     ["BAD_COMPLETENESS", field]);
  for (const answer of [{ ok: true, complete: false, flags: [] }, { ok: false, reason: "NO_SUCH_IMPORT" }, null]) {
    w.imports.flagsRead = () => answer;
    refused(w.publish(P, "alice", [Q], { flagsDisclosed: [{ flag: "IMPFLAG-1" }] }), "FLAGS_UNDETERMINED");
  }
  w.imports.flagsRead = () => { throw new Error("down"); };
  refused(w.publish(P, "alice", [Q]), "FLAGS_UNDETERMINED");
  w.imports.flagsRead = null;
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  const ok = w.publish(P, "alice", [Q], { flagsDisclosed: [{ flag: "IMPFLAG-1", words: "we checked page 3 ourselves" }] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  /* cleared, listing it is refused and not listing it publishes */
  w.imports.clear("IMPFLAG-1");
  refused(w.publish(P, "alice", [Q], { flagsDisclosed: [{ flag: "IMPFLAG-1" }], newCase: true }), "FLAG_DISCLOSURE_NOT_STANDING");
});

test("R53, R34: the pre-flight's blockers gain R55 (case-disclosures R6)'s, R55 (case-disclosures R13)'s and R55 (case-disclosures R14)'s refusals, each reachable independently; its step one says the case republishes every document it includes; step two names each accepted_work row; step three lists the flags R55 (case-disclosures R14) requires beside R32's tensions, saying publishing discloses them and is never blocked; it writes nothing", () => {
  const { w, P, ref } = onTheirs();
  w.imports.flag(IMP, 2, { flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread" });
  const before = w.snapshot();
  const pre = w.ca.publishPreflight(publishArgs(P, [Q]));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(pre.first.reason, "FLAG_NOT_DISCLOSED", "exactly op=publish's refusal");
  const [one, two, three] = pre.steps;
  assert.ok(one.says.includes(REPUBLISH_SENTENCE));
  assert.equal(REPUBLISH_SENTENCE, "The published case republishes in full every document it includes, and judging whether "
    + "they may be republished, copyright included, is the group's.");
  assert.deepEqual(two.accepted_work.map((x) => [x.member, x.leg_of, x.ref, x.group, x.case, x.edition, x.finding, x.result,
                                                 x.accepted_by, x.reason]),
    [[Q, Q, ref, "other-group", "CASE-2026-0900", 2, THEIRS, "recreated", "alice", "We recreated it whole."]]);
  assert.deepEqual(two.accepted_work[0].pair, { capture: "B", connection: "C" });
  assert.equal("checked" in two.accepted_work[0], false, "what was checked stays inside the group");
  assert.deepEqual([three.flags.count, three.flags.open.map((f) => [f.flag, f.ref, f.edition, f.issue])],
    [1, [["IMPFLAG-1", ref, 2, "page 3 is misread"]]]);
  assert.match(three.flags.says, /never blocked/);
  assert.ok(Array.isArray(three.tensions.candidates), "beside R32's tensions");
  /* every other refusal reachable independently is a blocker: a withdrawn acceptance beside an earlier refusal */
  const x = setup();
  x.doc(DOC); x.doc(DOC2, undefined, { text: false });
  x.imports.edition(IMP, 2, { findings: [{ finding: THEIRS, result: "recreated" }] });
  const r2 = x.imports.accept(IMP, 2, THEIRS);
  x.finding(Q, [{ target: DOC2 }, { target: r2, target_edition: 2 }]);
  x.imports.withdraw(IMP, 2, THEIRS);
  const XP = x.project("Team", "alice", [Q]);
  const blocked = x.ca.publishPreflight({ ...publishArgs(XP, [Q]), statement: "" });
  assert.equal(blocked.first.reason, "NO_STATEMENT");
  assert.deepEqual(blocked.blockers.map((b) => b.reason).filter((c) => c !== "NO_ATTESTING_KEY" && !c.startsWith("CASE_SIGNER")),
    ["RELIED_ON_NOT_PRESENTABLE", "ACCEPTED_WORK_NOT_IN_FORCE"]);
  /* a flags read that fails is stated in step three as R55 (case-disclosures R14) reads it */
  w.imports.flagsRead = () => ({ ok: true, complete: false, flags: [] });
  assert.equal(w.ca.publishPreflight(publishArgs(P, [Q])).steps[2].flags.reason, "FLAGS_UNDETERMINED");
});

test("R55 (case-disclosures R13, R14), R14: the document's accepted_work: row states who accepted which edition, when and why, the recreation result, the gaps stated and the pair as that edition publishes it, never what was checked; each open flag disclosed is an accepted_work_flags: row with the issue, when it was flagged, the owner's words and acknowledged_by (the author stamp), its flagging member unnamed; the member's block gains its sentence", () => {
  const { w, P, ref } = onTheirs({ gaps: "the third page's image was not carried" });
  w.imports.flag(IMP, 2, { flag: "IMPFLAG-1", finding: THEIRS, issue: "page 3 is misread", by: "bo" });
  const r = w.publish(P, "alice", [Q], { flagsDisclosed: [{ flag: "IMPFLAG-1", words: "we checked page 3 ourselves" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text;
  const back = acceptedWorkOf(w.fm(text));
  assert.deepEqual(back.rows, [{ member: Q, leg_of: Q, ref, group: "other-group", case: "CASE-2026-0900", edition: 2,
    finding: THEIRS, manifest_sha: "f".repeat(64), pair: { capture: { state: "graded", grade: "B" },
    connection: { state: "graded", grade: "C" } }, result: "recreated", gaps: "the third page's image was not carried",
    accepted_by: "alice", accepted_at: "2026-09-27T00:00:00Z", reason: "We recreated it whole." }]);
  assert.deepEqual(back.flags, [{ ref, edition: 2, flag: "IMPFLAG-1", issue: "page 3 is misread", flagged_at: "2026-09-27T00:00:00Z",
    words: "we checked page 3 ourselves", acknowledged_by: "alice", acknowledged_at: w.clock.now }]);
  assert.equal(text.includes("every passage"), false, "what was checked stays inside the group");
  const body = text.slice(text.indexOf("\n---\n", 4) + 5);
  assert.ok(body.includes("## Another Group's Work This Case Rests On"));
  const block = body.slice(body.indexOf("## Findings In This Case"), body.indexOf("## The Conclusions"));
  assert.ok(block.includes("open flag, disclosed with this case: page 3 is misread (flag IMPFLAG-1)"));
  /* negative control: a case reaching no other group's work carries neither block */
  const n = setup(); n.doc(DOC); n.finding(Q, [{ target: DOC }]);
  const nr = n.publish(n.project("Team", "alice", [Q]), "alice", [Q]);
  const nt = n.row(`SELECT text FROM case_documents WHERE case_id=?`, nr.caseId).text;
  assert.deepEqual([acceptedWorkOf(n.fm(nt)), /^accepted_work/m.test(nt)], [{ rows: [], flags: [] }, false]);
});

const publishArgs = (P, targets) => ({ scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
  subjectJustification: "A public record.", biasAcknowledgement: "We read the minutes as the account.", excluded: [],
  project: P, targets, roles: Object.fromEntries(targets.map((t) => [t, "load_bearing"])), viewer: "member:alice",
  author: "alice" });
