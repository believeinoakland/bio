/* Converts `bio-plane/test/caseobject.test.mjs`, public-read's share only: R4 — `publishedmanifest`'s `production`
   string and its `cases[].project_id` and `caseMembers` fields (ord, bundle_id, version_sha, role), through the
   public read with no credential (the old suite's blocks 1 and 2). The rest of that suite (the schema's NOT NULL
   constraint, the design document parse, the publishing act) belongs to other modules.
   The old suite published and ratified a case through a whole Worker and read it back off `op=publishedmanifest`;
   here the same facts are rebuilt on public-read's world through publication's commits as ratification makes them
   (w.prepare, w.signCase, w.signFinding), and read through this module's op and through the door's
   `publishedmanifest` arm over the published store's stub. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf } from "./fixture.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const helpers = {
  json,
  requiredArgument: (op, argument, shape) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape }),
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  storeRefusal: (out) => json({ ok: false, ...out.result }, out.status || 409),
  doAnswer: async (res) => {
    let out = null; try { out = await (await res).json(); } catch { out = null; }
    return out && out.ok === true ? { answered: true, result: out.result } : { answered: false };
  },
};
/* The public read as a stranger meets it: no credential, the envelope kept. */
const publicIndex = async (w) => {
  const res = await publicReadDoorOp("publishedmanifest", new URL("https://plane/api/?op=publishedmanifest"), {},
                                     stubOf(w), helpers);
  return { status: res.status, body: await res.json() };
};

function assertProduction(p) {
  assert.equal(typeof p, "string");
  assert.match(p, /PRODUCTION OF A PROJECT/);
  /* it states, in words, what each of the nulls means, so none is left to be read */
  assert.match(p, /`project_id` is null NO PROJECT IS RECORDED/);
  assert.match(p, /`role` is null NOBODY DESIGNATED/);
  assert.match(p, /`version_sha` is null the member was rostered without a version being pinned/);
  assert.match(p, /`bar` is null NO STANDARD OF EVIDENCE IS RECORDED/);
  /* and the one join instruction a reconstructor cannot do without */
  assert.match(p, /`caseMembers` AND `published` IS `version_sha` TO `bundle_sha`, NEVER EDITION TO\s+EDITION/);
}

/* CASE-2026-0001 edition 1: F load-bearing and G supporting, both pinned, owned by the project; F published. */
function publishedCase() {
  const w = world();
  w.member("ruth"); w.member("olive");
  const proj = w.project("Parks", "ruth");
  w.inquiry(F); w.inquiry(G);
  const pinF = w.head(F), pinG = w.head(G);
  const roles = [{ target: F, version_sha: pinF, role: "load_bearing" }, { target: G, version_sha: pinG, role: "supporting" }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, signer: "ruth",
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role })) }).ok, true);
  assert.equal(w.signFinding(F, { signer: "ruth" }).ok, true);
  return { w, proj, pinF, pinG };
}

test("R4 (caseobject) publishedmanifest answers on an empty record, with cases and caseMembers lists and the production sentence", async () => {
  const w = world();
  const m = w.read("publishedmanifest");
  assert.deepEqual([m.ok, m.scope, m.cases, m.caseMembers], [true, "published", [], []]);
  assertProduction(m.production);
  const r = await publicIndex(w);
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.deepEqual([Array.isArray(r.body.result.cases), Array.isArray(r.body.result.caseMembers)], [true, true]);
  assert.equal(r.body.result.production, m.production);
});

test("R4 (caseobject) a published case's row names its owning project_id, and each member row carries ord, bundle_id, the pinned version_sha and the authored role", async () => {
  const { w, proj, pinF, pinG } = publishedCase();
  const m = w.read("publishedmanifest");
  assertProduction(m.production);
  assert.deepEqual(m.cases.map((c) => [c.case_id, c.edition, c.project_id]), [["CASE-2026-0001", 1, proj]]);
  assert.equal("project_id" in m.cases[0], true);
  /* every member of the roster, in its order, with exactly these fields */
  assert.deepEqual(m.caseMembers, [
    { case_id: "CASE-2026-0001", edition: 1, ord: 0, bundle_id: F, version_sha: pinF, role: "load_bearing" },
    { case_id: "CASE-2026-0001", edition: 1, ord: 1, bundle_id: G, version_sha: pinG, role: "supporting" }]);
  /* the pin is the hash the member was published at: the join is version_sha to bundle_sha */
  const pubF = m.published.find((p) => p.bundle_id === F);
  assert.equal(pubF.bundle_sha, m.caseMembers[0].version_sha);
  /* G is declared and not yet ratified: in caseMembers, not in published */
  assert.equal(m.published.some((p) => p.bundle_id === G), false);
  /* the same through the door, with no credential, envelope wrapped */
  const r = await publicIndex(w);
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.ok, r.body.result.cases.map((c) => c.project_id), r.body.result.caseMembers],
                   [true, [proj], m.caseMembers]);
  assert.equal(r.body.result.production, m.production);
  assert.deepEqual(w.pr.publishedManifest(), m);
});

test("R4 (caseobject) the nulls production describes arrive as nulls: a case with no cases row keeps its place with project_id null, an undesignated role and an unpinned version are null", () => {
  const w = world();
  w.member("ruth");
  const proj = w.project("Parks", "ruth");
  w.inquiry(F); w.inquiry(G);
  const pinF = w.head(F);
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pinF }, { target: G, version_sha: "none" }] });
  /* a roster row with no role, and one with neither role nor pin, as a pre-CASE-2/-3 store holds them */
  assert.equal(w.signCase("CASE-2026-0002", 1, { project: proj, signer: "ruth",
    roster: [{ bundle_id: F, version_sha: pinF }, { bundle_id: G }] }).ok, true);
  /* a store migrated from before DEC-72 holds a published case with no `cases` row */
  w.st.sql.exec(`DELETE FROM cases WHERE case_id='CASE-2026-0002'`);
  const m = w.read("publishedmanifest");
  assert.deepEqual(m.cases.map((c) => [c.case_id, c.edition, "project_id" in c, c.project_id]),
                   [["CASE-2026-0002", 1, true, null]]);
  assert.deepEqual(m.caseMembers.map((x) => [x.ord, x.bundle_id, x.version_sha, x.role]),
                   [[0, F, pinF, null], [1, G, null, null]]);
  assertProduction(m.production);
});
