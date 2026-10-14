/* case-authoring (T23; DEC-101 (1), K1025, K1058; T47, N908): R38's arm that adopts or rewrites a draft of a new edition's
   statement of what changed. The drafts themselves, their proposal, list and ops, are `case-inputs`' (its R6, R7), and
   their own arms are its tests; here they are proposed through it (`w.ci`) as setup. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { whatChangedOf } from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

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

test("R38 (T47; read through case-inputs R7's whatChangedDraftOf): a draft adopted unchanged records began_as machine_draft, the draft and adopted_as_drafted true; rewritten, false; a draft of another case, or none, is NO_SUCH_WHAT_CHANGED_DRAFT with nothing written", () => {
  for (const [text, kept] of [["The amendments now appear by name.", true], ["We rewrote it: amendments named.", false]]) {
    const { w, P, e1 } = setup();
    const d = w.ci.proposeWhatChanged({ case: e1.caseId, text: "The amendments now appear by name.", proposedBy: AI,
                                        viewer: AI }).draft;
    const pre = w.ca.publishPreflight({ ...AUTHORED, ...FRESH, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
      caseId: e1.caseId, whatChanged: { text, draft: d.id }, viewer: V("alice"), author: "alice" });
    assert.equal(pre.first, null, JSON.stringify(pre.first));
    const drafts = w.count("what_changed_drafts");
    const r = second(w, P, e1, { text, draft: ` ${d.id} ` });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.equal(w.count("what_changed_drafts"), drafts, "adopting a draft writes nothing on the drafts");
    const p = parseFrontmatter(docOf(w, e1.caseId, 2).text);
    assert.deepEqual(whatChangedOf(p.data, p.body),
      { statement: text, began_as: "machine_draft", draft: d.id, adopted_as_drafted: kept });
  }
  /* a draft of another case, and an id no draft holds, are refused before anything is written */
  const { w, P, e1 } = setup();
  w.finding("INQ-2026-0009-z", [{ target: DOC }]);
  const P2 = w.project("Other", "alice", ["INQ-2026-0009-z"]);
  const o = w.publish(P2, "alice", ["INQ-2026-0009-z"]); w.ratify(o);
  const other = w.ci.proposeWhatChanged({ case: o.caseId, text: "elsewhere", proposedBy: AI, viewer: AI }).draft;
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
