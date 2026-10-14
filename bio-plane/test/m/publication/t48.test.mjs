/* publication — T48 (T48-39; N1019, K3112): R23 names its seven review doors, `statedEdition` among them, and R40 names
   `case-inputs` among the readers of `cases` and `case_documents`; wording only, as built. Each test is driven at the
   module's interface: the provider a later module (`review`) registers is a stand-in, and the SQL `case-inputs` reads
   under R40 is run as it writes it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, caseDoc, V, NOW, sha } from "./fixture.mjs";

const CASE = "CASE-2026-0001";
const DOORS = ["draftForMember", "draftIdentity", "caseIdentitySentence", "statedEdition", "liveGrant",
               "grantAdmitsCaseEdition", "deadAnswer"];
const complete = (calls = []) => Object.fromEntries(DOORS.map((d) => [d, (...a) => { calls.push([d, a]); return `${d}:answer`; }]));

test("R23 (T48) the review provider gives exactly seven doors, and one missing any of them is refused PROVIDER_MALFORMED, registering nothing: each door in turn is left out, and the complete provider then registers", () => {
  const w = world();
  assert.deepEqual(w.p.reviewProvider().registered, false);
  for (const door of DOORS) {
    const partial = complete();
    delete partial[door];
    const r = w.p.registerReviewProvider("review", partial);
    assert.equal(r.ok, false, door);
    assert.equal(r.reason, "PROVIDER_MALFORMED", door);
    assert.match(r.detail, new RegExp(DOORS.join(", ")), "the refusal names the seven doors");
    assert.equal(w.p.reviewProvider().registered, false, `${door} missing: nothing registered`);
    const notFn = { ...complete(), [door]: "not a function" };
    assert.equal(w.p.registerReviewProvider("review", notFn).reason, "PROVIDER_MALFORMED", `${door} not a function`);
    assert.equal(w.p.reviewProvider().registered, false);
  }
  assert.equal(w.p.registerReviewProvider("review", { ...complete(), extra: () => 1 }).ok, true, "control: a complete provider registers");
  const got = w.p.reviewProvider();
  assert.deepEqual(Object.keys(got).filter((k) => typeof got[k] === "function").sort(), [...DOORS].sort(),
                   "the registered provider gives those seven doors and no other");
});

test("R23 (T48) statedEdition(identity, newCase) and caseIdentitySentence(caseId, edition, newCase) are the doors the sentence and the edition a draft states are read through, called with exactly the caller's arguments; the other five doors likewise", () => {
  const w = world();
  const calls = [];
  assert.equal(w.p.registerReviewProvider("review", complete(calls)).ok, true);
  const p = w.p.reviewProvider();
  const identity = { caseId: CASE, edition: 2 };
  assert.equal(p.statedEdition(identity, true), "statedEdition:answer");
  assert.equal(p.caseIdentitySentence(CASE, 2, false), "caseIdentitySentence:answer");
  assert.equal(p.draftForMember("DRAFT-1", V("olive")), "draftForMember:answer");
  assert.equal(p.draftIdentity({ id: "DRAFT-1" }), "draftIdentity:answer");
  assert.equal(p.liveGrant("a".repeat(64)), "liveGrant:answer");
  assert.equal(p.grantAdmitsCaseEdition("a".repeat(64), CASE, 2), "grantAdmitsCaseEdition:answer");
  assert.equal(p.deadAnswer(), "deadAnswer:answer");
  assert.deepEqual(calls, [
    ["statedEdition", [identity, true]], ["caseIdentitySentence", [CASE, 2, false]],
    ["draftForMember", ["DRAFT-1", V("olive")]], ["draftIdentity", [{ id: "DRAFT-1" }]],
    ["liveGrant", ["a".repeat(64)]], ["grantAdmitsCaseEdition", ["a".repeat(64), CASE, 2]], ["deadAnswer", []]]);
  /* control: with no provider the same two doors state nothing, never an edition or a sentence of this module's own */
  const none = world().p.reviewProvider();
  assert.deepEqual([none.registered, none.statedEdition(identity, true), none.caseIdentitySentence(CASE, 2, false)],
                   [false, null, null]);
});

test("R23 (T48) a second registration is refused PROVIDER_DECLARED naming the first, which stays registered; case-inputs reads the same provider through reviewProvider()", () => {
  const w = world();
  const first = complete();
  assert.deepEqual(w.p.registerReviewProvider("review", first), { ok: true, module: "review" });
  const again = w.p.registerReviewProvider("other", { ...complete(), statedEdition: () => 99 });
  assert.equal(again.ok, false);
  assert.equal(again.reason, "PROVIDER_DECLARED");
  assert.equal(again.module, "review");
  assert.equal(w.p.reviewProvider().module, "review");
  assert.equal(w.p.reviewProvider().statedEdition({}, false), "statedEdition:answer", "the first provider's door still answers");
});

/* A case edition authored by olive in PROJECT, one draft named, one finding; unsigned, then signed. */
function authored() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry("INQ-2026-0001", { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const pin = w.head("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: pin }];
  const text = caseDoc(CASE, 1, { project: proj, roles });
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW, draft: "DRAFT-2026-0001" });
  assert.equal(stored.ok && stored.stored, true, JSON.stringify(stored));
  return { w, proj, pin, roles, text };
}

test("R40 (T48) case-inputs reads cases and case_documents in its own SQL as it writes it: the owning project of a case, the unsigned preparation a named draft links to (authored_by, authored_at, sig_armored null), and the signed editions' text with ratified_at once committed", () => {
  const { w, proj, pin, roles, text } = authored();
  /* before the commit: no cases row (the owning project is stated at the first edition's commit), the preparation linked by its draft */
  assert.equal(w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), null, "no owner before a commit");
  assert.deepEqual(w.rows(`SELECT edition, text FROM case_documents WHERE case_id=? AND ratified_at IS NOT NULL ORDER BY edition`, CASE), []);
  assert.deepEqual(w.row(`SELECT case_id, edition, authored_by, authored_at, sig_armored FROM case_documents WHERE draft_id=?`, "DRAFT-2026-0001"),
                   { case_id: CASE, edition: 1, authored_by: V("olive"), authored_at: NOW, sig_armored: null });
  assert.equal(w.row(`SELECT case_id, edition, text, ratified_at FROM case_documents WHERE case_id=? AND edition=1`, CASE).ratified_at, null);
  /* after the commit: the owner, the signed text and its instant */
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));
  assert.equal(w.signCase(CASE, 1, { project: proj, roster }).ok, true);
  assert.deepEqual(w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), { project_id: proj });
  const signed = w.rows(`SELECT edition, text FROM case_documents WHERE case_id=? AND ratified_at IS NOT NULL ORDER BY edition`, CASE);
  assert.deepEqual(signed, [{ edition: 1, text }]);
  assert.equal(sha(signed[0].text), w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE).doc_sha);
  assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE draft_id=?`, "DRAFT-2026-0001").sig_armored !== null, true,
               "the draft's link now reads a signed document");
  assert.equal(pin.length > 0, true);
  /* control: a draft no document names links to nothing */
  assert.equal(w.row(`SELECT case_id FROM case_documents WHERE draft_id=?`, "DRAFT-2026-9999"), null);
});

test("R40 (T48) the case_documents columns case-inputs names (case_id, edition, doc_sha, text, draft_id, authored_by, authored_at, sig_armored, ratified_at) and the cases columns (case_id, project_id) keep their names and meaning: a replaced preparation moves doc_sha and text, never the draft link, and a signed document never changes", () => {
  const { w, proj, roles } = authored();
  const doc = () => w.row(`SELECT doc_sha, text, draft_id, authored_by FROM case_documents WHERE case_id=? AND edition=1`, CASE);
  const held = doc();
  const text2 = caseDoc(CASE, 1, { project: proj, roles, excludes: "Something else." });
  const r = w.p.storeCaseDocument({ case: CASE, edition: 1, text: text2, author: V("olive"), at: NOW, draft: "DRAFT-2026-0001" });
  assert.equal(r.stored, true);
  assert.notEqual(doc().doc_sha, held.doc_sha, "the replacement moves doc_sha");
  assert.equal(doc().text, text2);
  assert.equal(doc().draft_id, "DRAFT-2026-0001");
  const roster = roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha, role: "load_bearing" }));
  assert.equal(w.signCase(CASE, 1, { project: proj, roster }).ok, true);
  const signedSha = doc().doc_sha;
  const again = w.p.storeCaseDocument({ case: CASE, edition: 1, text: caseDoc(CASE, 1, { project: proj, roles, excludes: "A third." }),
                                       author: V("olive"), at: NOW, draft: "DRAFT-2026-0001" });
  assert.equal(again.stored, false, "a signed document is never replaced");
  assert.equal(doc().doc_sha, signedSha);
});
