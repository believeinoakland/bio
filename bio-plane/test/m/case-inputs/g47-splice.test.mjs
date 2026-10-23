/* case-inputs, G47 (K4666, K4669): a refused re-author of a document's acknowledgement list is answered as refused. The
   splice is publication's (R21); when its result would pass the case-document byte bound and grow the stored text it
   answers `reauthored: false` with `too_large` and `why`, and this module's answer carries both, never `reauthored`
   alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, WORDS, STATEMENT, caseDocText } from "./fixture.mjs";
import * as publicationModule from "../../../src/publication/index.mjs";

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  return { w, P };
}
const ack = (w, a) => w.ci.acknowledgeStatement({ reason: WORDS, ...a });

test("R2 G47: a splice publication refuses as too large is answered refused, with its `why` and `too_large`; control: a splice that works answers neither", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  const held = w.docOf(pub.caseId, 1);
  const splice = w.publication.reauthorSection;
  const refusal = { ok: true, case_id: pub.caseId, edition: 1, doc_sha: held.doc_sha, reauthored: false,
                    too_large: { bytes: 1572900, bound: 1572864 }, why: "a stand-in reason the splice states" };
  w.publication.reauthorSection = () => refusal;
  const refused = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 }).case_documents[0];
  w.publication.reauthorSection = splice;
  assert.deepEqual([refused.reauthored, refused.doc_sha, refused.too_large, refused.why],
    [false, held.doc_sha, refusal.too_large, refusal.why], "refused, the hash unmoved, the refusal's own facts");
  assert.equal(refused.read, undefined, "no read of a re-authored document is offered");
  assert.equal(w.docOf(pub.caseId, 1).text, held.text, "the stored text is unchanged");

  const ok = ack(w, { viewer: V("bo"), caseId: pub.caseId, edition: 1 }).case_documents[0];
  assert.equal(ok.reauthored, true);
  assert.equal("too_large" in ok || "why" in ok, false, "a splice that worked states no refusal");
});

test("R2 G47 (seam: waits for PUBLICATION #36): through the real publication, an acknowledgement that would push a document past the bound is answered `reauthored: false` with `too_large` and `why`, the stored text unchanged; control: the same act on a small document re-authors", () => {
  const bound = publicationModule.CASE_DOCUMENT_BYTES_MAX;
  assert.equal(typeof bound, "number", "publication exports CASE_DOCUMENT_BYTES_MAX (PUBLICATION #36 has not merged)");
  const { w, P } = setup();
  /* the document sized to sit a few bytes under the bound: the statement is printed twice, front matter and body */
  const bare = Buffer.byteLength(caseDocText({ caseId: "CASE-2026-0001", edition: 1, project: P, statement: "", author: "alice",
                                               acks: w.ci.statementAcknowledgements(P, "CASE-2026-0001", 1, "", "alice", null, null, null) }));
  const statement = "x".repeat(Math.floor((bound - bare - 16) / 2));
  const big = w.prepare(P, "alice", { statement });
  const held = w.docOf(big.caseId, 1);
  assert.ok(Buffer.byteLength(held.text) <= bound && bound - Buffer.byteLength(held.text) < 64, "the stored document sits at the bound");
  const refused = ack(w, { viewer: V("bo"), caseId: big.caseId, edition: 1 }).case_documents[0];
  assert.equal(refused.reauthored, false);
  assert.equal(typeof refused.why, "string");
  assert.equal(typeof refused.too_large?.bytes, "number");
  assert.equal(refused.too_large.bound, bound);
  assert.equal(w.docOf(big.caseId, 1).text, held.text, "the stored text is unchanged");

  const small = w.prepare(P, "alice", { statement: STATEMENT });
  assert.equal(ack(w, { viewer: V("bo"), caseId: small.caseId, edition: 1 }).case_documents[0].reauthored, true);
});
