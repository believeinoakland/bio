/* Converts `bio-plane/test/fence.test.mjs`, public-read's share only: R1 — `verify` of an UNRATIFIED bundle's hash,
   asked with no credential, answers `published: false` and names no title (the old suite's "the unauthenticated
   surface still answers, and still leaks nothing" block). The rest of that suite (token classes, the auth gate, the
   guarded-op walk, invitelook) belongs to other modules.
   The old suite drove a whole Worker under miniflare; here the same facts are rebuilt on public-read's world: a bundle
   whose title is the secret is promoted (working material, never ratified) beside a published case, and its hash is
   asked of this module's `verify` op and of the door's `verify` arm over the published store's stub. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, sha } from "./fixture.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";

const SECRET_TITLE = "Sewer Service Fund transfer series";
const SECRET_ID = "INFO-2026-7100-fence";
const F = "INQ-2026-0001";

/* The door's helpers, as the control plane hands them in (json, requiredArgument, storeSilent, storeRefusal,
   doAnswer), reduced to the envelope they read. */
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const helpers = {
  json,
  requiredArgument: (op, argument, shape) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape }),
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  storeRefusal: (out) => json({ ok: false, ...out.result }, out.status || 409),
  doAnswer: async (res) => {
    let out = null; try { out = await (await res).json(); } catch { out = null; }
    if (out && out.ok === true) return { answered: true, result: out.result };
    return { answered: false };
  },
};
const door = async (w, op, q = {}) => {
  const url = new URL(`https://plane/api/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  const res = await publicReadDoorOp(op, url, {}, stubOf(w), helpers);
  return { status: res.status, body: await res.json() };
};

/* A working bundle whose title is the thing that must not leak, and beside it a ratified, published case, so the
   published projection is not empty (an empty projection would answer false for free). */
function fenced() {
  const w = world();
  w.member("olive"); w.member("alice");
  const proj = w.project("Parks", "olive");
  const md = ["---", `id: ${SECRET_ID}`, "object_type: information", "schema: information@1", `title: "${SECRET_TITLE}"`,
              "current_state: collected", "prior_state: null", `created: "2026-07-20T00:00:00Z"`,
              `last_updated: "2026-07-24T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
              "---", "", "## Summary", "", "Unratified working material.", ""].join("\n");
  const res = w.promote(SECRET_ID, md, "information");
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  const secretSha = w.head(SECRET_ID);
  /* the working record really holds the title under that hash: it is readable there, and only there */
  assert.equal(w.text(SECRET_ID).includes(SECRET_TITLE), true);
  assert.equal(sha(w.text(SECRET_ID)), secretSha);
  return { w, secretSha, pin };
}

test("R1 (fence) verify of an unratified bundle's hash answers published false, no matches, and names no title", () => {
  const { w, secretSha, pin } = fenced();
  const v = w.read("verify", { sha256: secretSha });
  assert.deepEqual(v, { published: false, sha256: secretSha, matches: [] });
  const text = JSON.stringify(v);
  assert.equal(text.includes("Sewer"), false);
  assert.equal(text.includes(SECRET_ID), false);
  /* the same answer as a hash that never existed: an unratified bundle is indistinguishable from nothing */
  const never = "0".repeat(64);
  assert.deepEqual({ ...w.read("verify", { sha256: never }), sha256: secretSha }, v);
  /* and the module's method answers the same */
  assert.deepEqual(w.pr.verifySha(secretSha), v);
  /* positive control: the published finding beside it does verify, so `false` above is a discrimination */
  assert.equal(w.read("verify", { sha256: pin }).published, true);
});

test("R1 (fence) the door's verify arm answers with no credential at all, published false, and names no title", async () => {
  const { w, secretSha, pin } = fenced();
  const r = await door(w, "verify", { sha256: secretSha });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, published: false, sha256: secretSha, matches: [] });
  assert.equal(JSON.stringify(r.body).includes("Sewer"), false);
  assert.equal(JSON.stringify(r.body).includes(SECRET_ID), false);
  /* upper-case hex is the same hash, and answers the same */
  assert.deepEqual((await door(w, "verify", { sha256: secretSha.toUpperCase() })).body, r.body);
  /* positive control through the same door */
  const p = await door(w, "verify", { sha256: pin });
  assert.deepEqual([p.status, p.body.ok, p.body.published], [200, true, true]);
});
