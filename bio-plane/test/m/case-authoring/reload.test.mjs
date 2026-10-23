/* case-authoring R83 (T51 fix round 4; C48 / N6; K4467): the ceremony's reload. A second instance of the module over the same
   storage (`w.reload()`, a Durable Object coming up again) is asked as the ceremony asks, the draft and the project only; the
   draft is made and prepared as the member's own acts make them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const NONE = { case: null, prepared: null, published: null };

function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const draftOf = (id, extra = {}) => {
    w.draft(id, P, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, ...extra });
    return id;
  };
  const as = (draft, over = {}) => ({ draft, project: P, viewer: V("alice"), author: "alice", ...over });
  return { w, P, draftOf, as };
}

test("R83 (C48 / N6): a draft that names no case, prepared, states its case and prepared 1 on a reload in a fresh instance; before it is prepared it states neither (control)", () => {
  const { w, draftOf, as } = setup();
  const draft = draftOf("DRAFT-A");
  assert.deepEqual(w.reload().publishPreflight(as(draft, { tieAttested: true })).editions, NONE, "control: before it is prepared");
  const done = w.ca.publishCase(as(draft, { tieAttested: true }));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.minted, true, "the pre-flight's rolled-back run left no case behind");
  assert.deepEqual(w.reload().publishPreflight(as(draft, { tieAttested: true })).editions,
                   { case: done.caseId, prepared: 1, published: null });
});

test("R83 (C48 / N6): a draft that asks for a new case (newCase), prepared, states its case and prepared 1 on a reload in a fresh instance, found by the draft that made the document", () => {
  const { w, draftOf, as } = setup();
  const draft = draftOf("DRAFT-N", { newCase: true });
  const done = w.ca.publishCase(as(draft, { tieAttested: true }));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.deepEqual(w.reload().publishPreflight(as(draft, { tieAttested: true })).editions,
                   { case: done.caseId, prepared: 1, published: null });
  const idle = draftOf("DRAFT-M", { newCase: true });
  assert.deepEqual(w.reload().publishPreflight(as(idle, { tieAttested: true })).editions, NONE, "control: a second newCase draft, never prepared");
});

test("R83 (fix round 4, C48; K4467): the walker's path: a new-case draft whose pre-flight first refuses (the signer's confirmation not given), then prepared, states `case` = the minted case id with prepared 1 on a reload in a fresh instance, and casedocument({case, edition 1}) answers the document; a draft never prepared states case null (control)", () => {
  const { w, draftOf, as } = setup();
  const draft = draftOf("DRAFT-W", { newCase: true });
  const refused = w.ca.publishPreflight(as(draft));
  assert.ok(refused.first, "the pre-flight first refuses");
  assert.deepEqual(refused.editions, NONE, "control: never prepared");
  const done = w.ca.publishCase(as(draft, { tieAttested: true }));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  const pre = w.reload().publishPreflight(as(draft));
  assert.ok(pre.first, "the reloaded pre-flight refuses first as before");
  assert.deepEqual(pre.editions, { case: done.caseId, prepared: 1, published: null });
  const doc = w.publication.caseDocument(pre.editions.case, pre.editions.prepared, V("alice"));
  assert.equal(doc.ok, true, JSON.stringify(doc).slice(0, 300));
  assert.equal(w.reload().draftEditions({ draft: "DRAFT-W" }).case, done.caseId);
  assert.equal(w.reload().draftEditions({ draft: draftOf("DRAFT-X", { newCase: true }) }).case, null, "control: a draft never prepared");
});
