/* case-authoring: the case document is bounded as built (R14, G47; K4666, K4672), a refusal of the store is the act's
   refusal, never a prepared document with no sha, and the refusal is a catalogue row. The bound is publication's
   `CASE_DOCUMENT_BYTES_MAX`, read from its exports (no copy here). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { PUBLISH_ACT_CHECKS } from "../../../src/case-authoring/index.mjs";
import * as publicationExports from "../../../src/publication/index.mjs";
import { storeCaseDocumentRefusal } from "../publication/fixtures.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q";
const BOUND = publicationExports.CASE_DOCUMENT_BYTES_MAX;

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  return { w, P: w.project("Team", "alice", [Q]) };
}
/* a case of `n` exclusions, each a distinct line of about 1.5 KB, through the real act */
const exclusions = (n) => Array.from({ length: n }, (_, i) =>
  ({ description: `item ${i} ${sha(`ex ${i}`)} `.padEnd(1500, "x"), reason: "it was not in hand" }));
const sizeOf = (w, r) => w.row(`SELECT length(CAST(text AS BLOB)) AS n FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).n;

test("R14 (G47 b): a document over publication's CASE_DOCUMENT_BYTES_MAX is refused CASE_DOCUMENT_TOO_LARGE with size, bound, materials and members, before any side effect: nothing is written, no reevaluation is raised, no row", () => {
  assert.ok(Number.isFinite(BOUND), "publication exports CASE_DOCUMENT_BYTES_MAX (PUBLICATION merged)");
  const { w, P } = setup();
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q], { excluded: exclusions(Math.ceil(BOUND / 1500) + 40) });
  assert.equal(r.ok, false);
  assert.deepEqual([r.reason, r.code, r.check], ["CASE_DOCUMENT_TOO_LARGE", "CASE_DOCUMENT_TOO_LARGE", PUBLISH_ACT_CHECKS.CASE_DOCUMENT_TOO_LARGE.check]);
  assert.equal(r.bound, BOUND);
  assert.ok(r.size > BOUND);
  assert.deepEqual([typeof r.materials, r.members], ["number", 1]);
  assert.ok(r.detail.includes((r.size / 1048576).toFixed(1)) && r.detail.includes((BOUND / 1048576).toFixed(1)), "the words state the size and the bound in MB");
  assert.deepEqual(w.snapshot(), before, "the record is unchanged");
  assert.equal(w.count("case_documents"), 0);
});

test("R14 (G47 c): a store that refuses (ok: false) makes the act refuse; it is never answered as a prepared document with doc_sha null", () => {
  const { w, P } = setup();
  const { refused: malformed } = storeCaseDocumentRefusal();
  w.publication.storeCaseDocument = () => malformed;
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "MALFORMED");
  assert.equal(r.caseDocument, undefined);
  /* a store that refuses for size is the same row as the early check */
  w.publication.storeCaseDocument = () => ({ ok: false, reason: "CASE_DOCUMENT_TOO_LARGE", bytes: 9, bound: 8 });
  const t = w.publish(P, "alice", [Q]);
  assert.deepEqual([t.ok, t.reason, t.code], [false, "CASE_DOCUMENT_TOO_LARGE", "CASE_DOCUMENT_TOO_LARGE"]);
});

test("R14 (G47 d): a document just under the bound is prepared, and its doc_sha is the hash of its stored bytes", () => {
  assert.ok(Number.isFinite(BOUND), "publication exports CASE_DOCUMENT_BYTES_MAX (PUBLICATION merged)");
  const a = setup();
  const base = a.w.publish(a.P, "alice", [Q], { excluded: exclusions(10) });
  assert.equal(base.ok, true, JSON.stringify(base).slice(0, 300));
  const per = (sizeOf(a.w, base) - 0) / 10;   /* an upper estimate per row: the whole text over its rows */
  const n = Math.floor((BOUND - 30000) / (per * 1.0)) ;
  const b = setup();
  const r = b.w.publish(b.P, "alice", [Q], { excluded: exclusions(Math.max(10, n)) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const bytes = sizeOf(b.w, r);
  assert.ok(bytes <= BOUND, `${bytes} <= ${BOUND}`);
  assert.equal(r.caseDocument.bytes, bytes);
  const row = b.w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
  assert.equal(r.caseDocument.doc_sha, row.doc_sha);
  assert.equal(row.doc_sha, sha(row.text));
});
