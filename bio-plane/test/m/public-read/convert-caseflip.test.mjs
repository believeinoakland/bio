/* Converts the public-read share of `bio-plane/test/caseflip.test.mjs` (CASE-5 / DEC-72, the artifact flip) into
   module tests of `public-read`, in its requirement ids:
     R3 — the divergence: a case's edition 2 holds its members at their own editions (a member at its own edition 1
          inside case edition 2), complete, each pin kept; edition 1 keeps its pin; a hash resolves to the case edition
          that pinned it (and a hash nothing published answers NOT_PUBLISHED).
     R1 — `verify` on the container manifest's sha (assembled by the Worker's `assembleCaseContainer`) names the CASE
          at MANIFEST.json; a member's own bytes answer under the member; a hash never held answers nothing.
     R4 — `publishedmanifest`'s `caseMembers` pins (joined pin-to-sha, never edition-to-edition) and its `production`
          text saying so; the case row's bar and project; the two altitudes on two rows.
   The old suite drove the whole HTTP stack under miniflare with real ssh-keygen signatures; the same facts are rebuilt
   here through the fixture's world, as ratification commits them (`w.prepare`, `w.signCase`, `w.signFinding`). Every
   expected pin is the head captured BEFORE the commit, never read back off a pin column. The rest of that suite
   (the container's contents, the stranger drive, the design-doc clauses, multi-case publishing, the case document's
   bytes) belongs to other modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, sha } from "./fixture.mjs";
import { bindPublishedPlane, assembleCaseContainer } from "../../../src/publication/worker.mjs";

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const CASE = "CASE-2026-5500";
const ALPHA = "INQ-2026-5500-alpha";  /* case edition 1 AND 2 -> its own editions 1, 2 */
const BETA = "INQ-2026-5500-beta";    /* joins at case edition 2 only -> its own edition 1  <-- the divergence */
const BAR = { declared: true, capture: "D", connection: "D" };
const pair = (target, cap, con) => [{ target, axis: "capture", grade: cap }, { target, axis: "connection", grade: con }];

/* The caseflip fixture, smallest thing that diverges:
     case edition 1 : [ALPHA]        ALPHA at its own edition 1
     case edition 2 : [ALPHA, BETA]  ALPHA at its own edition 2, BETA at its own edition 1 */
function flipped() {
  const w = world();
  w.member("rosa");
  const proj = w.project("Caseflip", "rosa");
  const bar = { ...BAR, project: proj };
  w.inquiry(ALPHA);
  const SIGNED_ALPHA_1 = w.head(ALPHA);
  w.prepare(CASE, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: ALPHA, version_sha: SIGNED_ALPHA_1, edition: 1 }],
                       strength: pair(ALPHA, "B", "C") });
  assert.equal(w.signCase(CASE, 1, { project: proj, signer: "rosa", bar,
    roster: [{ bundle_id: ALPHA, version_sha: SIGNED_ALPHA_1, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(ALPHA, { signer: "rosa", sig: "-----BEGIN SSH SIGNATURE-----\na1\n-----END SSH SIGNATURE-----" }).ok, true);
  /* ALPHA moves on (a second reading), BETA is concluded and never before published */
  assert.equal(w.promote(ALPHA, w.text(ALPHA).replace("## Conclusion\n", "## Conclusion\n\nA second memo surfaced.\n")).ok, true);
  const SIGNED_ALPHA_2 = w.head(ALPHA);
  w.inquiry(BETA);
  const SIGNED_BETA_1 = w.head(BETA);
  w.prepare(CASE, 2, { format: "bio-case-document/5", project: proj,
    roles: [{ target: ALPHA, version_sha: SIGNED_ALPHA_2, edition: 2, role: "load_bearing" },
            { target: BETA, version_sha: SIGNED_BETA_1, edition: 1, role: "supporting" }],
    strength: [...pair(ALPHA, "B", "C"), ...pair(BETA, "C", "C")] });
  assert.equal(w.signCase(CASE, 2, { project: proj, signer: "rosa", bar,
    roster: [{ bundle_id: ALPHA, version_sha: SIGNED_ALPHA_2, role: "load_bearing" },
             { bundle_id: BETA, version_sha: SIGNED_BETA_1, role: "supporting" }] }).ok, true);
  const a2 = w.signFinding(ALPHA, { signer: "rosa", sig: "-----BEGIN SSH SIGNATURE-----\na2\n-----END SSH SIGNATURE-----" });
  const b1 = w.signFinding(BETA, { signer: "rosa", sig: "-----BEGIN SSH SIGNATURE-----\nb1\n-----END SSH SIGNATURE-----" });
  assert.deepEqual([a2.ok, b1.ok], [true, true], "the fixture's ratifications commit");
  return { w, proj, SIGNED_ALPHA_1, SIGNED_ALPHA_2, SIGNED_BETA_1 };
}

test("R3 (caseflip) the divergence: case edition 2 holds ALPHA at its own edition 2 and BETA at its own edition 1, complete, each member's pin the hash it signed, each served at its pin, each with its authored role", () => {
  const { w, SIGNED_ALPHA_1, SIGNED_ALPHA_2, SIGNED_BETA_1 } = flipped();
  /* the fixture really diverged: three different versions, and BETA's own chain has one entry */
  assert.equal(new Set([SIGNED_ALPHA_1, SIGNED_ALPHA_2, SIGNED_BETA_1]).size, 3);
  assert.deepEqual(w.pr.publishedEditions(BETA).editions.map((e) => e.edition), [1],
                   "BETA has no edition 2 at all: resolving it by the case's number could only find nothing");
  assert.deepEqual(w.pr.publishedEditions(ALPHA).editions.map((e) => e.edition), [1, 2]);

  for (const c2 of [w.read("publishedcase", { id: CASE, edition: 2 }), w.pr.publishedCase({ caseId: CASE, edition: 2 })]) {
    assert.equal(c2.ok, true);
    const byId = Object.fromEntries(c2.findings.map((f) => [f.bundle_id, f]));
    assert.deepEqual(Object.keys(byId).sort(), [ALPHA, BETA].sort());
    assert.deepEqual([c2.caseId, c2.edition, byId[ALPHA].edition, byId[BETA].edition], [CASE, 2, 2, 1],
                     "the case's edition and its members' editions are different numbers, and all are served");
    assert.deepEqual([c2.complete, c2.awaiting], [true, []],
                     "the diverged edition is complete, nothing awaiting (BETA has no row at the case's number)");
    assert.deepEqual([byId[ALPHA].version_sha, byId[BETA].version_sha], [SIGNED_ALPHA_2, SIGNED_BETA_1],
                     "each member's pin is the hash that member signed");
    assert.deepEqual([byId[ALPHA].bundle_sha, byId[BETA].bundle_sha], [SIGNED_ALPHA_2, SIGNED_BETA_1],
                     "the bytes served for each member are the bytes the case pinned");
    assert.deepEqual([byId[ALPHA].role, byId[BETA].role], ["load_bearing", "supporting"]);
    assert.equal("strength" in c2, false, "no case-level strength");
    assert.deepEqual(c2.editions, [1, 2]);
    assert.equal(c2.latest_edition, 2);
  }
});

test("R3 (caseflip) edition 1 still answers after edition 2 lands: one member, at its own edition 1, pinned at the hash ALPHA signed for it, and its pin did not follow ALPHA forward", () => {
  const { w, SIGNED_ALPHA_1, SIGNED_ALPHA_2 } = flipped();
  const c1 = w.read("publishedcase", { id: CASE, edition: 1 });
  assert.equal(c1.ok, true);
  assert.deepEqual([c1.caseId, c1.edition, c1.findings.map((f) => f.bundle_id), c1.findings[0].version_sha,
                    c1.findings[0].bundle_sha, c1.findings[0].edition, c1.complete],
                   [CASE, 1, [ALPHA], SIGNED_ALPHA_1, SIGNED_ALPHA_1, 1, true]);
  assert.notEqual(c1.findings[0].version_sha, SIGNED_ALPHA_2);
  /* by case alone, the latest edition answers */
  const latest = w.read("publishedcase", { id: CASE });
  assert.deepEqual([latest.edition, latest.findings.map((f) => f.bundle_id).sort()], [2, [ALPHA, BETA].sort()]);
});

test("R3 (caseflip) a hash resolves to the case edition that PINNED it: BETA's hash to edition 2 (not the 1 on its own row), ALPHA's first hash to edition 1, its second to edition 2; a hash never ratified is NOT_PUBLISHED", () => {
  const { w, SIGNED_ALPHA_1, SIGNED_ALPHA_2, SIGNED_BETA_1 } = flipped();
  const beta = w.read("publishedcase", { sha256: SIGNED_BETA_1 });
  assert.deepEqual([beta.ok, beta.caseId, beta.edition, beta.asked], [true, CASE, 2, BETA]);
  assert.deepEqual(beta.findings.map((f) => f.bundle_id).sort(), [ALPHA, BETA].sort(),
                   "the edition handed back is the one whose roster contains BETA");
  const a1 = w.read("publishedcase", { sha256: SIGNED_ALPHA_1 });
  assert.deepEqual([a1.ok, a1.caseId, a1.edition, a1.asked, a1.findings.map((f) => f.bundle_id)], [true, CASE, 1, ALPHA, [ALPHA]]);
  const a2 = w.read("publishedcase", { sha256: SIGNED_ALPHA_2.toUpperCase() });
  assert.deepEqual([a2.ok, a2.caseId, a2.edition, a2.asked], [true, CASE, 2, ALPHA], "the op lowercases the hash");
  /* the store method, by hash, agrees with the op */
  assert.deepEqual(w.pr.publishedCase({ sha256: SIGNED_BETA_1 }).edition, 2);
  const nothing = w.read("publishedcase", { sha256: sha("no such bytes were ever ratified") });
  assert.deepEqual([nothing.ok, nothing.reason, nothing.check], [false, "NOT_PUBLISHED", "C-98.8"]);
});

test("R1 (caseflip) verify on the container manifest's sha (after assembleCaseContainer) names the CASE at MANIFEST.json; the diverged member's own bytes answer under the member; a hash never held answers published:false with no matches", async () => {
  const { w, SIGNED_BETA_1 } = flipped();
  const cs = w.p.caseEditionState(CASE, 2, "test-group");
  assert.equal(cs.complete, true, "the diverged edition is complete, so its container can be assembled");
  const env = { PUBLISHED: bucket() };
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  const MANIFEST2 = out.manifest_sha;
  assert.match(String(MANIFEST2), /^[0-9a-f]{64}$/);
  assert.equal(out.findings, 2);
  assert.equal(w.read("publishedcase", { id: CASE, edition: 2 }).manifest_sha, MANIFEST2);

  for (const v of [w.read("verify", { sha256: MANIFEST2 }), w.read("verify", { sha256: MANIFEST2.toUpperCase() }),
                   w.pr.verifySha(MANIFEST2)]) {
    assert.deepEqual([v.published, v.sha256, v.matches.map((m) => [m.bundle_id, m.path, m.kind])],
                     [true, MANIFEST2, [[CASE, "MANIFEST.json", "manifest"]]]);
    assert.deepEqual(Object.keys(v.matches[0]).sort(), ["bundle_id", "kind", "path", "published"]);
  }
  const vm = w.read("verify", { sha256: SIGNED_BETA_1 });
  assert.deepEqual([vm.published, vm.matches.map((m) => [m.bundle_id, m.path, m.kind])],
                   [true, [[BETA, "bundle.md", "bundle"]]]);
  const never = sha("bytes this record has never held");
  assert.deepEqual(w.read("verify", { sha256: never }), { published: false, sha256: never, matches: [] });
});

test("R4 (caseflip) publishedmanifest: the diverged edition's caseMembers carry a pin per member, every pin joins a published row by version_sha to bundle_sha, an edition-to-edition join loses BETA, and production says the join in words", () => {
  const { w, proj, SIGNED_ALPHA_1, SIGNED_ALPHA_2, SIGNED_BETA_1 } = flipped();
  for (const pm of [w.read("publishedmanifest"), w.pr.publishedManifest()]) {
    assert.equal(pm.ok, true);
    assert.equal(pm.scope, "published");
    assert.deepEqual(pm.caseMembers.map((m) => [m.case_id, Number(m.edition), m.ord, m.bundle_id, m.version_sha, m.role]),
                     [[CASE, 1, 0, ALPHA, SIGNED_ALPHA_1, "load_bearing"],
                      [CASE, 2, 0, ALPHA, SIGNED_ALPHA_2, "load_bearing"],
                      [CASE, 2, 1, BETA, SIGNED_BETA_1, "supporting"]],
                     "every roster row of every edition, with its pin and its authored role");
    const members = pm.caseMembers.filter((m) => m.case_id === CASE && Number(m.edition) === 2);
    const pubBy = new Map(pm.published.map((p) => [p.bundle_sha, p]));
    assert.ok(members.every((m) => pubBy.has(m.version_sha) && pubBy.get(m.version_sha).bundle_id === m.bundle_id),
              "every pin resolves to its member's published row");
    assert.deepEqual(members.filter((m) => pm.published.find((p) => p.bundle_id === m.bundle_id
                       && Number(p.edition) === Number(m.edition)) == null).map((m) => m.bundle_id), [BETA],
                     "a join on the two numbers silently drops exactly the member the pin exists to name");
    assert.ok(pm.production.includes("version_sha") && pm.production.includes("NEVER EDITION TO EDITION"));
    assert.match(pm.production, /`caseMembers` AND `published` IS `version_sha` TO `bundle_sha`/);
    assert.match(pm.production, /`caseMembers\.edition` is the CASE's edition and `published\.edition` is the FINDING's own/);
    assert.match(pm.production, /bar` is null NO STANDARD OF EVIDENCE IS RECORDED/);
    /* the two altitudes live on two rows, and neither restates the other */
    assert.deepEqual([pm.published.filter((p) => p.bundle_id === BETA).map((p) => Number(p.edition)),
                      members.filter((m) => m.bundle_id === BETA).map((m) => Number(m.edition))], [[1], [2]]);
    assert.deepEqual(pm.published.map((p) => [p.bundle_id, p.edition, p.bundle_sha]),
                     [[ALPHA, 1, SIGNED_ALPHA_1], [ALPHA, 2, SIGNED_ALPHA_2], [BETA, 1, SIGNED_BETA_1]]);
    /* the case row carries the bar and the producing project, and no strength */
    const caseRow = pm.cases.find((c) => c.case_id === CASE && Number(c.edition) === 2);
    assert.deepEqual([caseRow.bar.capture, caseRow.bar.connection, caseRow.bar.declared, caseRow.project_id], ["D", "D", true, proj]);
    for (const c of pm.cases) assert.equal("strength" in c, false);
  }
});
