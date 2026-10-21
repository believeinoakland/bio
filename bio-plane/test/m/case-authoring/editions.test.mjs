/* case-authoring R83 (T51 fix round 3; C48, C50; K4356): the pre-flight says what a draft has prepared and published,
   `editions: {prepared, published}`, for the case identity the call stands at, as the record holds it (so a reloaded page
   states it again). Over the real publication and ratification, through the module's interface as the pre-flight tests
   call it; a published edition is made through the fixture's commit, as op=caseratify makes it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const FRESH = { statement: "It does not cover the later amendments to the award.",
                subjectJustification: "The award is public, and the question is whether its terms were kept.",
                biasAcknowledgement: "We still read the minutes as the account of the meeting, as of this edition.",
                excluded: [{ description: "the amendments, which this edition names", reason: "not yet obtained" }],
                whatChanged: WHAT_CHANGED };

function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P };
}
const act = (P, over = {}) => ({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                                 viewer: V("alice"), author: "alice", tieAttested: true, ...over });
const NONE = { prepared: null, published: null };

test("R83: a draft never prepared states neither a prepared nor a published edition (control), and so does a refused pre-flight of it", () => {
  const { w, P } = setup();
  assert.deepEqual(w.ca.publishPreflight(act(P)).editions, NONE);
  const refused = w.ca.publishPreflight(act(P, { statement: "" }));
  assert.equal(refused.first.reason, "NO_STATEMENT");
  assert.deepEqual(refused.editions, NONE);
  assert.deepEqual(w.ca.publishPreflight(act(P, { newCase: true })).editions, NONE);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM case_documents`).n, 0, "the pre-flight writes nothing");
});

test("R83: after publishCase prepares edition 1 the pre-flight states prepared 1 on every later call, whatever refuses it, and no published edition", () => {
  const { w, P } = setup();
  const done = w.ca.publishCase(act(P));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  for (let i = 0; i < 2; i++) assert.deepEqual(w.ca.publishPreflight(act(P)).editions, { prepared: 1, published: null });
  /* the case identity is the one the members serve or the preparation names: a call that refuses first still stands at it */
  const refused = w.ca.publishPreflight(act(P, { statement: "" }));
  assert.equal(refused.first.reason, "NO_STATEMENT");
  assert.deepEqual(refused.editions, { prepared: 1, published: null });
  assert.deepEqual(w.ca.publishPreflight(act(P, { caseId: done.caseId })).editions, { prepared: 1, published: null });
  /* control: a new case asked for stands at no case at all */
  assert.deepEqual(w.ca.publishPreflight(act(P, { newCase: true })).editions, NONE);
});

test("R83: after edition 1 is published the pre-flight states published {edition 1, address} and prepared null; a published edition is never stated as prepared", () => {
  const { w, P } = setup();
  const done = w.ca.publishCase(act(P));
  w.ratify(done);
  const edition2 = { caseId: done.caseId, targets: [Q2], roles: { [Q2]: "load_bearing" }, ...FRESH };
  const pre = w.ca.publishPreflight(act(P, edition2));
  assert.deepEqual(pre.editions.published, { edition: 1, address: `/app/published/${done.caseId}/1` });
  assert.notEqual(pre.editions.prepared, 1, "edition 1 is published, not prepared");
  /* the next edition prepared is stated as prepared beside the published one */
  const next = w.ca.publishCase(act(P, edition2));
  assert.equal(next.ok, true, JSON.stringify(next).slice(0, 300));
  assert.equal(next.edition, 2);
  assert.deepEqual(w.ca.publishPreflight(act(P, edition2)).editions,
                   { prepared: 2, published: { edition: 1, address: `/app/published/${done.caseId}/1` } });
  /* control: before the edition is published, nothing is stated published */
  const other = setup();
  assert.equal(other.w.ca.publishCase(act(other.P)).ok, true);
  assert.equal(other.w.ca.publishPreflight(act(other.P)).editions.published, null);
});

test("R83, R7, R8, R13: a second preparation of one draft with no edition published between answers the same case identity and the same edition, and mints no case id", () => {
  const { w, P } = setup();
  const first = w.ca.publishCase(act(P));
  assert.equal(first.minted, true);
  const second = w.ca.publishCase(act(P));
  assert.equal(second.ok, true, JSON.stringify(second).slice(0, 300));
  assert.deepEqual([second.caseId, second.edition, second.minted], [first.caseId, first.edition, false]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM case_documents WHERE case_id=?`, first.caseId).n, 1, "one document, replaced");
  assert.deepEqual(w.ca.publishPreflight(act(P)).editions, { prepared: 1, published: null });
});

test("R83: a draft named by the call stands at the case its preparation names, so a reloaded ceremony reads prepared with its number", () => {
  const { w, P } = setup();
  w.draft("DRAFT-1", P, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" } });
  const pre0 = w.ca.publishPreflight({ draft: "DRAFT-1", project: P, viewer: V("alice"), author: "alice", tieAttested: true });
  assert.deepEqual(pre0.editions, NONE, "control: not yet prepared");
  const done = w.ca.publishCase({ draft: "DRAFT-1", project: P, viewer: V("alice"), author: "alice", tieAttested: true });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  const pre = w.ca.publishPreflight({ draft: "DRAFT-1", project: P, viewer: V("alice"), author: "alice", tieAttested: true });
  assert.deepEqual(pre.editions, { prepared: 1, published: null });
});

test("R83 (K4363): draftEditions({caseId, draft}) is the one read the pre-flight uses: by case, by the draft that prepared it (id or row), never prepared states neither, and it writes nothing", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2", P, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" } });
  const ask = { draft: "DRAFT-2", project: P, viewer: V("alice"), author: "alice", tieAttested: true };
  assert.deepEqual(w.ca.draftEditions({ caseId: null, draft: "DRAFT-2" }), NONE, "control: never prepared");
  assert.deepEqual(w.ca.draftEditions({}), NONE);
  const done = w.ca.publishCase(ask);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  const one = { prepared: 1, published: null };
  assert.deepEqual(w.ca.draftEditions({ caseId: done.caseId }), one);
  assert.deepEqual(w.ca.draftEditions({ draft: "DRAFT-2" }), one, "by the draft's id, from the document it made");
  assert.deepEqual(w.ca.draftEditions({ draft: { draft_id: "DRAFT-2", case_id: null } }), one);
  assert.deepEqual(w.ca.draftEditions({ caseId: done.caseId }), w.ca.publishPreflight(ask).editions);
  w.ratify(done);
  assert.deepEqual(w.ca.draftEditions({ caseId: done.caseId, draft: "DRAFT-2" }),
                   { prepared: null, published: { edition: 1, address: `/app/published/${done.caseId}/1` } });
  assert.deepEqual(w.ca.draftEditions({ caseId: "CASE-2026-0000" }), NONE, "a case the record does not hold");
});
