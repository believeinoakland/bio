/* case-disclosures' published fixtures (fix round 10, T51; K4990, K4993, K4995, K5044): the refusals the real publish
   pre-flight gates answer, made by this module's own code over the test world when a user's test calls them, never stored.
   A user's test takes the refusal from here and does not write it by hand. Each is called by a test of the module's own,
   `fixtures.test.mjs`, which checks the real answer. */
import { world, V, ADMIN, sha } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", F = "INQ-2026-0001-f";
const RUN = "RUN-2026-0001";
const CA = sha("passage a"), CB = sha("passage b");

function members() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
const judged = (w, ids) => w.cd.materialsJudged(w.prepared(ids), w.roles(ids, []), V("alice"));

/** The refusal of `refusals` with `code`, or an error: a fixture that does not raise its refusal has no answer to give. */
function first(refusals, code) {
  const r = refusals.find((x) => x && x.reason === code);
  if (!r) throw new Error(`gateRefusal: the world did not raise ${code}: ${JSON.stringify(refusals).slice(0, 300)}`);
  return r;
}

/** R2 (C-120.4): a load-bearing Grade B capture neither timestamped nor co-archived, not listed by the owner. */
function coAttestationUnacknowledged() {
  const w = members();
  const b = w.doc(DOC2, {}, { receipt: true });
  w.finding(Q, [{ target: DOC2 }]);
  const resting = w.cd.restingCaptures(w.prepared([Q]));
  const facts = new Map([...new Set(resting.map((r) => r.capture))].map((s) => [s, w.cd.captureFacts(s)]));
  const j = w.cd.selfAttestedJudged(resting, facts, w.roles([Q], []), null);
  return { capture: b, refusal: first(j.refusals, "CO_ATTESTATION_UNACKNOWLEDGED") };
}

/** R6 (C-120.21): a member document whose copy is still being made, relied on by a load-bearing member. */
function documentCopyPending() {
  const w = members();
  const a = w.doc(DOC);
  w.marks.document(a, "pending");
  w.finding(Q, [{ target: DOC }]);
  return { document: DOC, capture: a, refusal: first(judged(w, [Q]).refusals, "DOCUMENT_COPY_PENDING") };
}

/** R6 (C-120.19): a photo with no standing mark, relied on by a member. */
function photoUnchecked() {
  const w = members();
  const a = w.doc(DOC);
  w.marks.photo(a, { state: "unchecked" });
  w.finding(Q, [{ target: DOC }]);
  return { photo: DOC, capture: a, refusal: first(judged(w, [Q]).refusals, "PHOTO_UNCHECKED") };
}

/** R1 (C-120.1): a conflict on what a finding rests on, which its owner has not disclosed. */
function tensionNotDisclosed() {
  const w = members();
  w.content(CA, w.doc(DOC), DOC); w.content(CB, w.doc(DOC2), DOC2);
  w.finding(F, [{ target: DOC, content_id: CA }, { target: DOC2, role: "cuts_against", content_id: CB }]);
  w.project("Team", "alice", [F]);
  w.runs.set(RUN, { status: "running", principal: "member:alice" });
  const pair = w.contradiction.pairs({ key: "K1", viewer: ADMIN }).pairs.find((p) => p.inquiry === F);
  if (!pair) throw new Error("gateRefusal: no K1 pair formed");
  const proposed = w.contradiction.propose({ run: RUN, proposedBy: "class:ai/t", viewer: ADMIN, caller: "member:alice",
    proposals: [{ key: "K1", a: pair.a, b: pair.b, label: "record", reason: "the machine's reason" }] });
  if (!proposed.ok) throw new Error(`gateRefusal: propose refused: ${JSON.stringify(proposed).slice(0, 300)}`);
  const j = w.cd.tensionsJudged(w.prepared([F]), V("alice"), null);
  return { candidate: proposed.candidates[0].candidate, refusal: first(j.refusals, "TENSION_NOT_DISCLOSED") };
}

/** R1, R2, R6: the four refusals of the publish pre-flight's gates, each from a world that raises it:
 *  `DOCUMENT_COPY_PENDING` (with `document` naming the document), `PHOTO_UNCHECKED` (with `photo`),
 *  `CO_ATTESTATION_UNACKNOWLEDGED` and `TENSION_NOT_DISCLOSED`. Each is `{ok: false, reason, code, check, translation,
 *  detail, ...}` as the module's `disclosureRefusal` makes it; the keys beside `refusals` name what the world held. */
export function gateRefusal() {
  const copy = documentCopyPending(), photo = photoUnchecked(), co = coAttestationUnacknowledged(), tension = tensionNotDisclosed();
  return {
    DOCUMENT_COPY_PENDING: copy.refusal,
    PHOTO_UNCHECKED: photo.refusal,
    CO_ATTESTATION_UNACKNOWLEDGED: co.refusal,
    TENSION_NOT_DISCLOSED: tension.refusal,
    held: { document: copy.document, photo: photo.photo, capture: co.capture, candidate: tension.candidate },
  };
}
