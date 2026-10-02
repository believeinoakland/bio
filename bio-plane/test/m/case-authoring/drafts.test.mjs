/* case-authoring (T23; DEC-101 (1), K1025, K1058): drafts of a new edition's statement of what changed (R39), and
   R38's arm that adopts or rewrites one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { caseAuthoringOps, WHAT_CHANGED_MAX, WHAT_CHANGED_DRAFTS_MAX } from "../../../src/case-authoring/index.mjs";
import { whatChangedOf } from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter, proposalLabel, PROPOSAL_STATES } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
const AI = "class:ai";
const FRESH = Object.freeze({ statement: "It does not cover the award's amendments.",
  subjectJustification: "A public record, so the question is whether it was followed.",
  biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
  excluded: [{ description: "the amendments", reason: "requested and not yet held" }] });

/* Edition 1 of a case published and signed by alice's project (bo joined), its finding moved, so the next act is
   edition 2; mallory is a member who cannot see the project. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo", "mallory"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  const e1 = w.publish(P, "alice", [Q]);
  assert.equal(e1.ok, true, JSON.stringify(e1).slice(0, 300));
  w.ratify(e1);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  return { w, P, e1 };
}
const second = (w, P, e1, whatChanged) => w.publish(P, "alice", [Q], { caseId: e1.caseId, ...FRESH, whatChanged });
const docOf = (w, caseId, edition) => w.row(`SELECT * FROM case_documents WHERE case_id=? AND edition=?`, caseId, edition);

test("R39: a machine's draft is stored labelled machine work by proposalLabel(proposedBy, \"edition_statement\") and is never a statement — no case document, no edition, nothing on the case — and a member's is labelled a member's proposal", () => {
  const { w, e1 } = setup();
  const docs = w.count("case_documents"), cases = w.snapshot().published_cases;
  const m = w.ca.proposeWhatChanged({ case: e1.caseId, text: "The amendments now appear by name.", proposedBy: AI,
                                      viewer: AI });
  assert.equal(m.ok, true, JSON.stringify(m));
  assert.match(m.draft.id, /^WCD-\d{4}-\d{4}$/);
  assert.deepEqual(m.draft.label, proposalLabel(AI, "edition_statement"));
  assert.deepEqual([m.draft.label.machine_work, m.draft.label.state, m.draft.label.says],
    [true, "machine_proposed", PROPOSAL_STATES.edition_statement.machine_proposed]);
  const b = w.ca.proposeWhatChanged({ case: e1.caseId, text: "We excluded the amendments.", proposedBy: "bo", viewer: V("bo") });
  assert.deepEqual([b.draft.label.machine_work, b.draft.label.state, b.draft.label.by], [false, "member_proposed", "bo"]);
  /* never a statement: nothing authored, no edition, the published record untouched */
  assert.equal(w.count("case_documents"), docs);
  assert.equal(w.snapshot().published_cases, cases);
  /* negative control: the label is the proposer's, and a blank proposer is `unstated`, never a member */
  const u = w.ca.proposeWhatChanged({ case: e1.caseId, text: "x", proposedBy: "  ", viewer: AI });
  assert.deepEqual([u.draft.label.state, u.draft.label.by], ["unstated", null]);
});

test("R39: whatChangedDrafts lists the case's drafts oldest first, each with its id, text, label and when; drafts are append-only, two identical proposals two drafts", () => {
  const { w, e1 } = setup();
  const times = ["2026-09-28T01:00:00.001Z", "2026-09-28T01:00:00.002Z", "2026-09-28T01:00:00.003Z"];
  const made = [];
  for (const [i, [text, by]] of [["first", AI], ["second", "bo"], ["first", AI]].entries()) {
    w.clock.ms = times[i];
    made.push(w.ca.proposeWhatChanged({ case: e1.caseId, text, proposedBy: by, viewer: by === AI ? AI : V(by) }).draft);
  }
  const list = w.ca.whatChangedDrafts({ case: e1.caseId, viewer: V("alice") });
  assert.deepEqual(list, { ok: true, case: e1.caseId, truncated: false,
    drafts: made.map((d) => ({ id: d.id, text: d.text, label: d.label, at: d.at })) });
  assert.deepEqual(list.drafts.map((d) => [d.text, d.at]), [["first", times[0]], ["second", times[1]], ["first", times[2]]]);
  assert.equal(new Set(list.drafts.map((d) => d.id)).size, 3, "two identical proposals are two drafts");
  /* append-only: adopting one at op=publish leaves every draft as it was */
  const before = w.snapshot().what_changed_drafts;
  const P = w.row(`SELECT project_id FROM cases WHERE case_id=?`, e1.caseId).project_id;
  assert.equal(second(w, P, e1, { text: "first", draft: made[0].id }).ok, true);
  assert.equal(w.snapshot().what_changed_drafts, before, "nothing updated or removed");
  /* negative control: another case's drafts are not this case's */
  w.finding("INQ-2026-0009-z", [{ target: DOC }]);
  const o = w.publish(w.project("Other", "alice", ["INQ-2026-0009-z"]), "alice", ["INQ-2026-0009-z"]); w.ratify(o);
  w.ca.proposeWhatChanged({ case: o.caseId, text: "elsewhere", proposedBy: AI, viewer: AI });
  assert.equal(w.ca.whatChangedDrafts({ case: e1.caseId, viewer: V("alice") }).drafts.length, 3);
  assert.equal(w.ca.whatChangedDrafts({ case: o.caseId, viewer: V("alice") }).drafts.length, 1);
  assert.equal(WHAT_CHANGED_DRAFTS_MAX, 500);
});

test("R39: a case not published, one the viewer cannot see, and none at all are NO_SUCH_CASE, answered alike, and an empty, blank, non-string or over-8,000-character text BAD_WHAT_CHANGED; each writes nothing", () => {
  const { w, P, e1 } = setup();
  /* a case authored and not signed: edition 1 of a new case, prepared only */
  w.finding("INQ-2026-0009-z", [{ target: DOC }]);
  const P2 = w.project("Other", "alice", ["INQ-2026-0009-z"]);
  const prepared = w.publish(P2, "alice", ["INQ-2026-0009-z"]);
  assert.equal(prepared.ok, true);
  const before = w.snapshot();
  const answers = [
    w.ca.proposeWhatChanged({ case: prepared.caseId, text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ca.proposeWhatChanged({ case: e1.caseId, text: "t", proposedBy: "mallory", viewer: V("mallory") }),
    w.ca.proposeWhatChanged({ case: e1.caseId, text: "t", proposedBy: "x", viewer: "nobody" }),
    w.ca.proposeWhatChanged({ case: "CASE-2026-0404", text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ca.proposeWhatChanged({ text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ca.whatChangedDrafts({ case: prepared.caseId, viewer: V("alice") }),
    w.ca.whatChangedDrafts({ case: e1.caseId, viewer: V("mallory") }),
    w.ca.whatChangedDrafts({ case: "CASE-2026-0404", viewer: V("alice") }),
  ];
  for (const a of answers) assert.equal(a.reason, "NO_SUCH_CASE", JSON.stringify(a));
  assert.equal(new Set(answers.map((a) => JSON.stringify(a))).size, 1, "byte-identical");
  /* NO_SUCH_CASE first: an unseen case with bad words is still NO_SUCH_CASE */
  assert.equal(w.ca.proposeWhatChanged({ case: e1.caseId, text: "", viewer: V("mallory") }).reason, "NO_SUCH_CASE");
  for (const text of [undefined, null, 7, "", "   ", "\n\t", "x".repeat(WHAT_CHANGED_MAX + 1),
                      "\u{1F4DC}".repeat(WHAT_CHANGED_MAX + 1)]) {
    const r = w.ca.proposeWhatChanged({ case: e1.caseId, text, proposedBy: AI, viewer: AI });
    assert.deepEqual([r.ok, r.reason, r.max], [false, "BAD_WHAT_CHANGED", 8000], JSON.stringify(text)?.slice(0, 20));
  }
  assert.deepEqual(w.snapshot(), before, "nothing written: no draft, no minted id");
  /* negative controls: exactly 8,000 code points, astral or not, and a participant who sees the project */
  for (const text of ["x".repeat(WHAT_CHANGED_MAX), "\u{1F4DC}".repeat(WHAT_CHANGED_MAX)])
    assert.equal(w.ca.proposeWhatChanged({ case: e1.caseId, text, proposedBy: AI, viewer: AI }).ok, true);
  assert.equal(w.ca.proposeWhatChanged({ case: e1.caseId, text: "t", proposedBy: "bo", viewer: V("bo") }).ok, true);
  assert.equal(w.ca.whatChangedDrafts({ case: e1.caseId, viewer: V("bo") }).drafts.length, 3);
  assert.equal(P.startsWith("PROJ-"), true);
});

test("R38, R39: a draft adopted unchanged records began_as machine_draft, the draft and adopted_as_drafted true; rewritten, false; a draft of another case, or none, is NO_SUCH_WHAT_CHANGED_DRAFT with nothing written", () => {
  for (const [text, kept] of [["The amendments now appear by name.", true], ["We rewrote it: amendments named.", false]]) {
    const { w, P, e1 } = setup();
    const d = w.ca.proposeWhatChanged({ case: e1.caseId, text: "The amendments now appear by name.", proposedBy: AI,
                                        viewer: AI }).draft;
    const pre = w.ca.publishPreflight({ ...AUTHORED, ...FRESH, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
      caseId: e1.caseId, whatChanged: { text, draft: d.id }, viewer: V("alice"), author: "alice" });
    assert.equal(pre.first, null, JSON.stringify(pre.first));
    const r = second(w, P, e1, { text, draft: ` ${d.id} ` });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    const p = parseFrontmatter(docOf(w, e1.caseId, 2).text);
    assert.deepEqual(whatChangedOf(p.data, p.body),
      { statement: text, began_as: "machine_draft", draft: d.id, adopted_as_drafted: kept });
  }
  /* a draft of another case, and an id no draft holds, are refused before anything is written */
  const { w, P, e1 } = setup();
  w.finding("INQ-2026-0009-z", [{ target: DOC }]);
  const P2 = w.project("Other", "alice", ["INQ-2026-0009-z"]);
  const o = w.publish(P2, "alice", ["INQ-2026-0009-z"]); w.ratify(o);
  const other = w.ca.proposeWhatChanged({ case: o.caseId, text: "elsewhere", proposedBy: AI, viewer: AI }).draft;
  const before = w.snapshot();
  for (const draft of [other.id, "WCD-2026-0000"]) {
    const r = second(w, P, e1, { ...WHAT_CHANGED, draft });
    assert.deepEqual([r.ok, r.reason, r.draft], [false, "NO_SUCH_WHAT_CHANGED_DRAFT", draft]);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* negative control: without a draft the statement began as the member's */
  const m = second(w, P, e1, WHAT_CHANGED);
  const p = parseFrontmatter(docOf(w, e1.caseId, 2).text);
  assert.deepEqual([m.ok, whatChangedOf(p.data, p.body).began_as, whatChangedOf(p.data, p.body).draft], [true, "member", null]);
});

test("R39 (K3): the ops route a draft's words from the body and the case from either; proposedBy is the author stamp and viewer the viewer stamp, a body's copies never honoured; R28: a whole-store purge clears the drafts", () => {
  const { w, e1 } = setup();
  const url = (op, s = "") => new URL(`http://do/${op}?viewer=${encodeURIComponent(AI)}&author=${encodeURIComponent(AI)}${s}`);
  const r = caseAuthoringOps(w.ca, url("whatchangedpropose", `&case=${e1.caseId}`),
                             { text: "From the body.", proposedBy: "alice", viewer: V("alice") }).whatchangedpropose();
  assert.deepEqual([r.ok, r.draft.text, r.draft.label.by, r.draft.label.machine_work], [true, "From the body.", AI, true]);
  const viaBody = caseAuthoringOps(w.ca, url("whatchangedpropose"), { case: e1.caseId, text: "Case in the body." })
    .whatchangedpropose();
  assert.equal(viaBody.ok, true);
  const list = caseAuthoringOps(w.ca, url("whatchangeddrafts", `&case=${e1.caseId}`), { viewer: V("mallory") })
    .whatchangeddrafts();
  assert.deepEqual(list.drafts.map((d) => d.text), ["From the body.", "Case in the body."]);
  /* negative control: the viewer stamp, not a body's, decides sight */
  const hidden = caseAuthoringOps(w.ca, new URL(`http://do/whatchangeddrafts?viewer=${encodeURIComponent(V("mallory"))}&case=${e1.caseId}`),
                                  { viewer: AI }).whatchangeddrafts();
  assert.equal(hidden.reason, "NO_SUCH_CASE");
  w.record.purge({ bundleId: Q });
  assert.equal(w.count("what_changed_drafts"), 2, "keyed to no bundle");
  w.record.purge({});
  assert.equal(w.count("what_changed_drafts"), 0);
});
