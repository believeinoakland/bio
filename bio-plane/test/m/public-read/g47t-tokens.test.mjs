/* public-read — G47t (fix round 6; K4676, K4677): a co-attestation row stating its capture (`sha`, `case-grammar` R12)
   carries the timestamp tokens `publication` held for that capture and those held for no one capture (`capture_sha`
   null: shared, or registered before the column); a row stating none carries every token of its `ref`. The case is built
   by the real commit (as casefile.test.mjs' co-attestation case) and case-grammar's real writer. SEAM, RED BY NAME until
   CASE-GRAMMAR #20 (the row's `sha`), CASE-CARRIAGE #15 (writes `capture_sha`) and PUBLICATION #36 (the column) have merged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, bucket, caseDoc, V, NOW, sha } from "./fixture.mjs";

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const bodyOf = (n) => `capture ${n} of ${DOC}`;
const tokenOf = (n) => `TSA-TOKEN-${n}`;
const cohold = (ref, capture) => ({ ref, by_kind: "co_attestation", by: "tsa.example", level: null, at: NOW, signature: null,
  recorded_in: null, ...(capture ? { sha: capture } : {}) });
const material = (capture) => ({ ref: DOC, kind: "document", sha: capture, text_sha: null, origin: null, archived_copy: null,
  included: true, rests_under: "load_bearing" });

/* One source, two captures each with a token, committed by the real commit; `attestations` as given. */
function published(attestations, { captures = ["A", "B"] } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const docs = captures.map((n) => ({ file: `snapshots/${n}.txt`, locator: `https://example.org/${DOC}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(bodyOf(n)), encoding: "utf8", bytes: Buffer.byteLength(bodyOf(n)) },
    origin: { kind: "named_request" }, timestamp: { service: "tsa.example", token_file: `attestations/${n}.tsr` } }));
  w.doc("INFO-2026-0009-seed");
  const md = w.text("INFO-2026-0009-seed").replace(/INFO-2026-0009-seed/g, DOC);
  assert.equal(w.promotion.promote({ bundleId: DOC, base: null, snapKey: "k-g47t", author: V("olive"),
    files: [{ path: "bundle.md", text: md },
            ...captures.flatMap((n) => [{ path: `snapshots/${n}.txt`, text: bodyOf(n) }, { path: `attestations/${n}.tsr`, text: tokenOf(n) }]),
            { path: "data/provenance.json", text: JSON.stringify({ documents: docs }) }],
    meta: { object_type: "information" },
    register: captures.map((n) => ({ sha256: sha(bodyOf(n)), path: `snapshots/${n}.txt`, encoding: "utf8", bytes: Buffer.byteLength(bodyOf(n)) })) }).ok, true);
  for (const n of captures) w.receipt(sha(bodyOf(n)));
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const text = caseDoc(CASE, 1, { project: proj, method: { grading: "bio-grading/1", checks: "1.57.0" }, roles: [{ target: F, version_sha: pin }],
    materials: captures.map((n) => material(sha(bodyOf(n)))), attestations });
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW }).ok, true);
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  return w;
}
const heldBy = async (w) => (await w.read("casefilefacts", { caseId: CASE, edition: 1 })).attestations
  .map((a) => [a.row.sha ?? null, a.held.map((h) => h.text).sort()]);
const [A, B] = ["A", "B"].map((n) => sha(bodyOf(n)));

test("R23 G47t (seam: CASE-GRAMMAR #20, CASE-CARRIAGE #15, PUBLICATION #36) two captures of one source, each with a token: a row stating its capture carries that capture's token only", async () => {
  const w = published([cohold(DOC, A), cohold(DOC, B)]);
  assert.deepEqual(await heldBy(w), [[A, [tokenOf("A")]], [B, [tokenOf("B")]]]);
});

test("R23 G47t (seam) a token held for no one capture (capture_sha null: old, or shared) is carried under both rows; a malformed `sha` reads as none and carries every token of the ref", async () => {
  const w = published([cohold(DOC, A), cohold(DOC, B)]);
  w.row(`UPDATE published_shas SET capture_sha=NULL WHERE sha256=?`, sha(tokenOf("A")));
  assert.deepEqual(await heldBy(w), [[A, [tokenOf("A")]], [B, [tokenOf("A"), tokenOf("B")]]]);
  const bad = published([cohold(DOC, "not-a-sha")]);
  assert.deepEqual((await heldBy(bad))[0][1], [tokenOf("A"), tokenOf("B")]);
});

test("R23 G47t (seam) control: a row stating no capture carries every token of its ref, as before", async () => {
  const w = published([cohold(DOC, null)]);
  assert.deepEqual(await heldBy(w), [[null, [tokenOf("A"), tokenOf("B")]]]);
});
