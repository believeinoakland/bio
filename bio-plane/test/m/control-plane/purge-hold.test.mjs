/* control-plane R46 (DEC-113; K1252, K1253): a purge of held material is refused in the record store's door. Driven through
   `dispatch(req, store)` with the reader `plane` hands it (`store.purgeHeld`, actions R60) and the object's namespace
   (`store.namespace`, plane R2, R14): a purge of the real record runs only when the reader answers exactly `false`, and
   is otherwise refused 409 PURGE_HOLD_IN_PLACE (C-69.5) before record-core's arm runs; `scratch` is never refused for a
   hold. A record fixture shows nothing is cleared, read for proof or written; the Worker door relays the refusal at its
   status (R23). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, refused } from "./harness.mjs";
import { record } from "./record.mjs";
import { recordOf, recordCoreOps } from "../../../src/record-core/index.mjs";
const D = await import("../../../src/control-plane/dispatch.mjs");
const { DISPATCH_CHECKS } = await import("../../../src/control-plane/checks.mjs");

/* A store whose purge route and reader record what reached them. */
function store({ namespace = "bio", held } = {}) {
  const log = { routes: 0, asked: [] };
  const s = { namespace, routes: () => ({ purge: () => { log.routes++; return { ok: true, scope: "all" }; } }),
              membership: () => null };
  if (held !== undefined) s.purgeHeld = (a) => { log.asked.push(a); return typeof held === "function" ? held(a) : held; };
  return { s, log };
}
const go = async (s, path) => { const r = await D.dispatch(new Request(`http://do/${path}`, { method: "POST" }), s); return { status: r.status, json: await r.json() }; };

function isHoldRefusal(r, bundleId) {
  const row = DISPATCH_CHECKS.PURGE_HOLD_IN_PLACE;
  assert.equal(r.status, 409);
  assert.deepEqual([r.json.ok, r.json.reason, r.json.code, r.json.check, r.json.translation, r.json.bundleId],
                   [false, "PURGE_HOLD_IN_PLACE", "PURGE_HOLD_IN_PLACE", "C-69.5", row.translation, bundleId]);
  assert.match(r.json.detail, /Nothing was removed/);
  /* it names nothing but the bundleId asked: no action, project or member */
  assert.deepEqual(Object.keys(r.json).sort(), ["bundleId", "check", "code", "detail", "error", "ok", "reason", "translation"]);
}

test("R46 (C-69.5): in `bio`, a purge the reader answers `true` for is refused 409 PURGE_HOLD_IN_PLACE before the purge route runs, the whole store (bundleId absent or empty, asked as null) and a single bundle alike; the reader is asked with the bundleId as record-core's arm reads it (negative control: answered `false`, the purge runs)", async () => {
  for (const [q, bundleId] of [["", null], ["&bundleId=", null], ["&bundleId=PROJ-1", "PROJ-1"], ["&bundleId=INFO-2026-0001-x", "INFO-2026-0001-x"]]) {
    const { s, log } = store({ held: true });
    isHoldRefusal(await go(s, `purge?confirm=bio${q}`), bundleId);
    assert.deepEqual([log.routes, log.asked], [0, [{ bundleId }]], q);
    const ok = store({ held: false });
    const r = await go(ok.s, `purge?confirm=bio${q}`);
    assert.deepEqual([r.status, r.json, ok.log.routes, ok.log.asked], [200, { ok: true, result: { ok: true, scope: "all" } }, 1, [{ bundleId }]], q);
  }
});

test("R46: a failure to ask refuses too — a reader that throws, one never handed, and any answer but exactly `false` (a truthy or falsy non-boolean, a promise, undefined); the namespace not handed or unknown is the real record's, and asked", async () => {
  const answers = [() => { throw new Error("hold table unreadable"); }, 0, "", null, "false", 1, {}, Promise.resolve(false)];
  for (const held of answers) {
    const { s, log } = store({ held: typeof held === "function" ? held : () => held });
    isHoldRefusal(await go(s, "purge?confirm=bio&bundleId=B-1"), "B-1");
    assert.equal(log.routes, 0, String(held));
  }
  const none = store({});
  isHoldRefusal(await go(none.s, "purge?confirm=bio"), null);
  assert.equal(none.log.routes, 0);
  for (const namespace of [undefined, null, "", "Scratch", "nonsense"]) {
    const { s, log } = store({ namespace, held: true });
    isHoldRefusal(await go(s, "purge"), null);
    assert.deepEqual([log.routes, log.asked.length], [0, 1], String(namespace));
  }
});

test("R46: a purge reaching the `scratch` store is never refused for a hold — the reader is not asked, even one answering `true`, throwing or absent (negative control: the same reader refuses in `bio`)", async () => {
  for (const held of [true, () => { throw new Error("x"); }, undefined]) {
    const { s, log } = store({ namespace: "scratch", held });
    const r = await go(s, "purge?confirm=scratch&bundleId=B-1");
    assert.deepEqual([r.status, r.json.ok, log.routes, log.asked], [200, true, 1, []]);
  }
  const { s } = store({ namespace: "bio", held: true });
  assert.equal((await go(s, "purge")).status, 409);
});

test("R46: only `op=purge` is held — every other route runs without the reader being asked, and a route no module serves is still `unknown op` (negative control: purge is asked)", async () => {
  const asked = [];
  const s = { namespace: "bio", membership: () => null, purgeHeld: (a) => { asked.push(a); return true; },
              routes: () => ({ stats: () => "s", purgeproof: () => "p", allocid: () => "a" }) };
  for (const op of ["stats", "purgeproof", "allocid"]) assert.deepEqual((await go(s, op)).json, { ok: true, result: op[0] }, op);
  assert.deepEqual((await go(s, "nosuch")).json, { ok: false, error: "unknown op: nosuch" });
  assert.equal(asked.length, 0);
  /* purge with no route in the map: unknown op, nothing asked */
  assert.deepEqual((await go(s, "purge")).json, { ok: false, error: "unknown op: purge" });
  assert.equal(asked.length, 0);
  s.routes = () => ({ purge: () => ({ ok: true }) });
  assert.equal((await go(s, "purge")).status, 409);
  assert.equal(asked.length, 1);
});

test("R46: against a real record, a refused purge clears nothing and reads nothing for proof — the record's proof counts and its rows are unchanged — while an allowed one runs record-core's arm (its R72) and answers its scope", async () => {
  const { ctx, db } = await record();
  const rc = recordOf(ctx);
  rc.allocId("INFO", "2026");
  const before = rc.proofCounts();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((t) => t.name);
  const snapshot = () => Object.fromEntries(tables.map((t) => [t, db.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n]));
  const rows0 = snapshot();
  let proofReads = 0;
  const orig = rc.proofCounts.bind(rc);
  rc.proofCounts = () => { proofReads++; return orig(); };
  const door = (held) => ({ namespace: "bio", membership: () => null, purgeHeld: () => held,
                            routes: (url, body) => recordCoreOps(rc, url, body) });
  const r = await D.dispatch(new Request("http://do/purge?confirm=bio", { method: "POST" }), door(true));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).reason, "PURGE_HOLD_IN_PLACE");
  assert.equal(proofReads, 0, "the proof was read");
  assert.deepEqual(snapshot(), rows0, "a row changed");
  assert.deepEqual(orig(), before);
  /* negative control: cleared by the same door when the reader answers false */
  const ok = await (await D.dispatch(new Request("http://do/purge?confirm=bio", { method: "POST" }), door(false))).json();
  assert.equal(ok.ok, true);
  assert.equal(ok.result.ok, true);
  assert.ok(proofReads >= 2);
});

test("R46, R23: the Worker door relays the store's hold refusal at 409 with its code, check and sentence, the store and tokenClass added — never a silence, a success or another status", async () => {
  const body = { ok: false, error: "purge refused: a litigation hold is in place", reason: "PURGE_HOLD_IN_PLACE", code: "PURGE_HOLD_IN_PLACE",
                 check: "C-69.5", translation: DISPATCH_CHECKS.PURGE_HOLD_IN_PLACE.translation, bundleId: null, detail: "x. Nothing was removed." };
  const { env } = world({ answer: (c) => (c.route === "purge" ? new Response(JSON.stringify(body), { status: 409 }) : null) });
  const r = await call(env, { op: "purge", token: env.ADMIN_TOKEN, params: { confirm: "bio" }, method: "POST", body: {} });
  refused(r, 409, "PURGE_HOLD_IN_PLACE", "C-69.5");
  assert.deepEqual([r.json.store, r.json.tokenClass, r.json.translation], ["bio", "admin", body.translation]);
  assert.deepEqual(opCalls(env).map((c) => c.route), ["purge"]);
});
