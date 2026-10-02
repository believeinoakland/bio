/* case-authoring (T22; DEC-101, K1019): what changed in an edition above 1, and why (R38). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { WHAT_CHANGED_MAX } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
/* A second edition's own completeness, fresh against the first's (R10). */
const FRESH = Object.freeze({ statement: "It does not cover the award's amendments.",
  subjectJustification: "A public record, so the question is whether it was followed.",
  biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
  excluded: [{ description: "the amendments", reason: "requested and not yet held" }] });

/* Edition 1 of a case published and signed, and its finding moved, so the next act is edition 2. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const e1 = w.publish(P, "alice", [Q], { whatChanged: undefined });
  assert.equal(e1.ok, true, JSON.stringify(e1).slice(0, 300));
  w.ratify(e1);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  return { w, P, e1 };
}
const second = (w, P, e1, over = {}) => w.publish(P, "alice", [Q], { caseId: e1.caseId, ...FRESH, ...over });

test("R38: an edition above 1 with no whatChanged, a blank text, or a text over 8,000 characters is refused by name (NO_WHAT_CHANGED, BAD_WHAT_CHANGED) before anything is written — no case document stored, no id allocated; a named draft is NO_SUCH_WHAT_CHANGED_DRAFT", () => {
  const { w, P, e1 } = setup();
  const before = w.snapshot();
  assert.equal(WHAT_CHANGED_MAX, 8000);
  for (const whatChanged of [undefined, null, "a sentence", [], {}, { text: null }, { text: 7 }, { text: "" },
                             { text: "   " }, { text: "\n\t" }]) {
    const r = second(w, P, e1, { whatChanged });
    assert.deepEqual([r.ok, r.reason, r.caseId, r.edition], [false, "NO_WHAT_CHANGED", e1.caseId, 2],
      `whatChanged ${JSON.stringify(whatChanged)}`);
  }
  /* 8,001 code points, ASCII or astral (two UTF-16 units each) */
  for (const text of ["x".repeat(8001), "\u{1F4DC}".repeat(8001)]) {
    const r = second(w, P, e1, { whatChanged: { text } });
    assert.deepEqual([r.ok, r.reason, r.length, r.max], [false, "BAD_WHAT_CHANGED", 8001, 8000]);
  }
  /* no draft store yet (R39 is T23's): a named draft is one that is not */
  for (const draft of ["WCD-2026-0001", 7]) {
    const r = second(w, P, e1, { whatChanged: { ...WHAT_CHANGED, draft } });
    assert.deepEqual([r.ok, r.reason, r.draft], [false, "NO_SUCH_WHAT_CHANGED_DRAFT", String(draft)]);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written: no case document, no id, no row");
  assert.equal(w.rows(`SELECT 1 FROM case_documents WHERE case_id=? AND edition=2`, e1.caseId).length, 0);
  /* after R3's refusals: an act missing its statement too answers NO_STATEMENT first */
  assert.equal(second(w, P, e1, { whatChanged: undefined, statement: "" }).reason, "NO_STATEMENT");
  /* negative controls: exactly 8,000 code points, astral or not, publishes; a draft of null or blank names none */
  for (const text of ["x".repeat(8000), "\u{1F4DC}".repeat(8000)]) {
    const w2 = setup();
    const ok = second(w2.w, w2.P, w2.e1, { whatChanged: { text, draft: "  " } });
    assert.deepEqual([ok.ok, ok.edition], [true, 2], JSON.stringify(ok).slice(0, 300));
  }
  const ok = second(w, P, e1, { whatChanged: { ...WHAT_CHANGED, draft: null } });
  assert.deepEqual([ok.ok, ok.edition], [true, 2], JSON.stringify(ok).slice(0, 300));
});

test("R38: a first edition needs no statement of what changed, and carries none", () => {
  const w = world();
  w.member("alice"); w.doc(DOC); w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const r = w.ca.publishCase({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"),
                               author: "alice" });
  assert.deepEqual([r.ok, r.edition], [true, 1], JSON.stringify(r).slice(0, 300));
});

test("R38 (R34): the pre-flight's first is exactly the act's refusal for a missing, over-long or drafted statement, and it writes nothing", () => {
  const { w, P, e1 } = setup();
  const base = { ...AUTHORED, ...FRESH, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, caseId: e1.caseId,
                 viewer: V("alice"), author: "alice" };
  for (const whatChanged of [undefined, { text: " " }, { text: "x".repeat(8001) }, { ...WHAT_CHANGED, draft: "WCD-1" }]) {
    const before = w.snapshot();
    const pre = w.ca.publishPreflight({ ...base, whatChanged });
    assert.deepEqual(w.snapshot(), before, "the pre-flight wrote nothing");
    const act = w.ca.publishCase({ ...base, whatChanged });
    assert.equal(act.ok, false);
    assert.deepEqual(pre.first, act, `first is the act's own refusal (${act.reason})`);
    assert.equal(pre.ready, false);
  }
});
