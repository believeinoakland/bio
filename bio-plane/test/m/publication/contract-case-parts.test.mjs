/* publication runs reevaluation's case-parts contract (its R14 case half, registered through its R26): `parts({case})`
   answers `{case, edition, project, parts: [{bundle_id, capture_sha}]}` for a ratified case, and `{ok: false, reason:
   "NO_SUCH_CASE_EDITION"}` for a case with no ratified edition. This runs the real read that publication hands to
   reevaluation (R41, its `caseCitedParts`, through the `registerCaseParts` call at creation, R43) against that contract,
   on a ratified case made by the same acts the ratification ceremony plays (as `cases.test.mjs` does), and on a case
   with no edition. Where the real answer carries more than the contract names, the difference is pinned here and
   reported to BOB; this file changes no product code. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, sha, SIG, NOW } from "./fixture.mjs";

// fixtures-run: reevaluation case-cited-parts

const F = "INQ-2026-0001", G = "INQ-2026-0002";
const DOC1 = "INFO-2026-0001-minutes";
const C1 = sha("capture one");
const CASE = "CASE-2026-0001", NONE = "CASE-2026-0404";

/* CASE-2026-0001 edition 1 over F and G at their pins, both published, so the edition is ratified; its signed document
   cites DOC1 pinned to capture C1. As in cases.test.mjs, each step is the act ratification makes through this module. */
function ratified() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F); w.inquiry(G);
  const roles = [{ target: F, version_sha: w.head(F) }, { target: G, version_sha: w.head(G) }];
  const citations = [{ target: DOC1, version: "pinned", capture: C1 }];
  w.prepare(CASE, 1, { project: proj, roles, citations });
  w.signCase(CASE, 1, { project: proj,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
  w.signFinding(F, { sig: SIG(2) });
  w.signFinding(G, { sig: SIG(3) });
  return { w, proj };
}

/* The keys reevaluation's contract names (its `caseparts.test.mjs`, the marked stand-in): the success and the refusal. */
const CONTRACT_PARTS_KEYS = ["case", "edition", "project", "parts"];
const CONTRACT_REFUSAL_KEYS = ["ok", "reason"];

test("R41 R43 reevaluation's case-cited-parts contract: a ratified case answers the contract's four keys with each part as {bundle_id, capture_sha}", () => {
  const { w, proj } = ratified();
  const answer = w.p.caseCitedParts({ case: CASE });
  for (const k of CONTRACT_PARTS_KEYS) assert.ok(k in answer, `the contract's key ${k} is in the answer`);
  assert.deepEqual(answer.parts, [{ bundle_id: DOC1, capture_sha: C1 }], "each part exactly the contract's two keys");
  assert.deepEqual([answer.case, answer.edition, answer.project], [CASE, 1, proj]);
  /* the real answer also carries `ok`, `limit` and `truncated`; the contract names none of them. Pinned here as the
     difference found, for BOB to decide (reevaluation's line follows his ruling). */
  assert.deepEqual(Object.keys(answer).sort(), ["case", "edition", "limit", "ok", "parts", "project", "truncated"]);
});

test("R41 R43 reevaluation's case-cited-parts contract: a case with no ratified edition is refused with the contract's NO_SUCH_CASE_EDITION", () => {
  const { w } = ratified();
  const refusal = w.p.caseCitedParts({ case: NONE });
  assert.equal(refusal.ok, false);
  assert.equal(refusal.reason, "NO_SUCH_CASE_EDITION", "the code the contract names, as the real answer gives it");
  for (const k of CONTRACT_REFUSAL_KEYS) assert.ok(k in refusal, `the contract's key ${k} is in the refusal`);
  /* the real refusal also carries `case`, `edition` and `detail`; pinned as the difference found, reported to BOB. */
  assert.deepEqual(Object.keys(refusal).sort(), ["case", "detail", "edition", "ok", "reason"]);
});
