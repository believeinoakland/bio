/* public-read — G47 (fix round 6; K4669, K4671, K4672): the case file's attestations are joined to the capture they
   attest. A case with two captures of one source carries one attestation row per capture, each stating its capture's
   `sha` (`case-grammar` R12, written only for a `ref` with two or more materials); each is shown with its own capture's
   signed account only, and an excluded capture of an included `ref` has no row listed. The document is written by
   `case-grammar`'s own line builders and read by its readers (the seam: red by name until CASE-GRAMMAR's optional `sha`
   merges). Control: a document whose rows state no `sha` is read exactly as before, by `ref`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseDoc, V, NOW, sha } from "./fixture.mjs";

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes", OTHER = "INFO-2026-0002-other";
const A = sha("capture A of the minutes"), B = sha("capture B of the minutes"), C = sha("capture C of the minutes");
const SOLE = sha("the only capture of the other source");
const row = (ref, kind, capture, extra = {}) => ({ ref, kind, sha: capture, text_sha: null, origin: null, archived_copy: null,
  included: true, rests_under: "load_bearing", ...extra });
const member = (ref, by, capture, level = "name") => ({ ref, by_kind: "member", by, level, at: NOW,
  signature: `sig-${by}`, recorded_in: null, ...(capture ? { sha: capture } : {}) });
const account = (capture, by, text) => ({ capture, member: "olive", grade: "B", grade_basis: "fetched", co_attested: false,
  timestamp_at: null, co_archive: null, late: false, self_attested_only: true,
  accounts: [{ by, at: NOW, text, signature: `signature of ${by} on ${text}` }] });

/* A case edition over one finding with `materials` and `attestations` (and the captures' accounts) as given. */
function published({ materials, attestations, captures }) {
  const w = world();
  w.member("olive"); w.member("ann"); w.member("bea");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  const text = caseDoc(CASE, 1, { project: proj, method: { grading: "bio-grading/1", checks: "1.57.0" }, materials, attestations,
    blocks: { captures }, roles: [{ target: F, version_sha: pin, role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] });
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW }).ok, true);
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  return w;
}
const factsOf = (w) => w.read("casefilefacts", { caseId: CASE, edition: 1 });
const shown = (facts) => facts.attestations.map((a) => [a.row.ref, a.row.by, a.row.sha ?? null, a.account ? a.account.text : null]);

test("R23 G47 two captures of one source: each capture's attestation row is shown with its own capture's signed account only, and a capture not included lists no row", async () => {
  const w = published({
    materials: [row(DOC, "document", A), row(DOC, "document", B), row(DOC, "document", C, { included: false }), row(OTHER, "document", SOLE)],
    attestations: [member(DOC, "ann", A), member(DOC, "bea", B), member(DOC, "ann", C), member(OTHER, "ann", null)],
    captures: [account(A, "ann", "ann saw capture A"), account(B, "bea", "bea saw capture B"),
               account(C, "ann", "ann saw capture C"), account(SOLE, "ann", "ann saw the other source")] });
  const facts = await factsOf(w);
  assert.equal(facts.ok, true, JSON.stringify(facts).slice(0, 300));
  assert.deepEqual(shown(facts), [[DOC, "ann", A, "ann saw capture A"], [DOC, "bea", B, "bea saw capture B"],
                                  [OTHER, "ann", null, "ann saw the other source"]],
    "capture A's row with A's account, B's with B's, C (not included) none; the sole capture's row states no `sha` and is joined by ref, as before");
});

test("R23 G47 the same member attests two captures of one source: each row names its own capture's account, never the other's", async () => {
  const w = published({
    materials: [row(DOC, "document", A), row(DOC, "document", B)],
    attestations: [member(DOC, "ann", A), member(DOC, "ann", B)],
    captures: [account(A, "ann", "ann on A"), account(B, "ann", "ann on B")] });
  assert.deepEqual(shown(await factsOf(w)), [[DOC, "ann", A, "ann on A"], [DOC, "ann", B, "ann on B"]]);
});

test("R23 G47 control: rows stating no `sha` (a document written before, one capture per source) are joined by ref, byte for byte as before", async () => {
  const w = published({
    materials: [row(DOC, "document", A), row(OTHER, "document", SOLE, { included: false })],
    attestations: [member(DOC, "ann", null), member(OTHER, "ann", null)],
    captures: [account(A, "ann", "ann on A"), account(SOLE, "ann", "ann on the other")] });
  const facts = await factsOf(w);
  assert.deepEqual(shown(facts), [[DOC, "ann", null, "ann on A"]], "the excluded source's row is still not listed");
  assert.ok(facts.attestations.every((a) => !Object.hasOwn(a.row, "sha")), "a row stating no capture is carried with no `sha` key, so its case-file bytes are as before");
});
