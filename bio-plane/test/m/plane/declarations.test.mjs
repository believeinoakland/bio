/* plane R68, R71 (T51 fix round; K4168, K4189; op-declarations R80, R81; op-grades R49, R50): the plane assembles every
   module's op declarations at start-up, by its own static imports, and refuses to start on a duplicate or a disagreement;
   every op an owner declares is reachable through the door. The modules and ops are found from `build/modules.json` and the
   owners' own exports (`declaredOpsOf`, `maps.mjs`), never listed here (K3268). */
import "../../../src/plane/register.mjs";   /* the start's registration first: door.mjs' graph reads the op tables when it loads */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { store } from "./fixture.mjs";
import { declaredOpsOf } from "../../declared-ops.mjs";
import { OWNERS, assembleDeclaredOps } from "../../../src/plane/declarations.mjs";
import { DECLARED_OPS as PLANE_OPS } from "../../../src/plane/declared.mjs";
import { gatedOp } from "../../../src/plane/door.mjs";
import { declaredFields, OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { opsServedBy, servedThroughDoor } from "./maps.mjs";

const ROOT = resolve(import.meta.dirname, "../../../..");
const DECLARATIONS = pathToFileURL(resolve(import.meta.dirname, "../../../src/plane/declarations.mjs")).href;
const DECLARED = pathToFileURL(resolve(import.meta.dirname, "../../../src/op-declarations/index.mjs")).href;
const row = { classes: ["member"], mutating: false, weight: "read", description: "x", fields: { accepts: ["a"], requires: [] } };

/* a process of its own: the registrations are once per process, and a disagreement stops the start */
const child = (code) => spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8", cwd: resolve(import.meta.dirname, "../../..") });

test("R68 the plane started over the real modules holds, for every module whose source exports DECLARED_OPS, each of its ops in the assembled table with the module's values; a module missing from the assembly is named", async () => {
  await store();   /* the start: store.mjs hands the owners' declarations to both registrations at load */
  const { ops, owners, duplicates } = await declaredOpsOf(ROOT);
  assert.deepEqual(duplicates, [], "no op is declared by two modules");
  assert.ok(Object.keys(ops).length > 0);
  const missing = [...new Set(Object.values(owners))].filter((id) => !Object.hasOwn(OWNERS, id));
  assert.deepEqual(missing, [], "modules that export DECLARED_OPS and are not in the plane's assembly (declarations.mjs)");
  const stray = Object.keys(OWNERS).filter((id) => !Object.values(owners).includes(id));
  assert.deepEqual(stray, [], "modules in the assembly that export no DECLARED_OPS");
  for (const [op, d] of Object.entries(ops)) {
    assert.equal(OWNERS[owners[op]][op], d, `${op}: the assembly holds the owner's own row`);
    assert.ok(Object.hasOwn(OPS, op), `${op} is in the assembled table`);
    assert.deepEqual([OPS[op].classes ?? null, OPS[op].mutating], [d.classes, d.mutating], `${op}: the table agrees with the owner's row`);
    if (d.fields) assert.deepEqual(declaredFields(op), d.fields, `${op}: the owner's fields are read back`);
  }
  assert.equal(owners.ask, "plane", "the plane's own rows (R72) are an owner's");
  assert.equal(OWNERS.plane, PLANE_OPS);
  /* control: the assembly is the plane's own static imports, never the test collector */
  assert.equal(Object.keys(OWNERS).every((id) => owners && typeof OWNERS[id] === "object"), true);
});

test("R68 two modules declaring one op stop the start naming the op and both modules, before either registration is called; control: with no duplicate each registration is called once with the owners", () => {
  const calls = [];
  const spy = (owners) => { calls.push(owners); };
  assert.throws(() => assembleDeclaredOps({ alpha: { zzdup: row }, beta: { zzone: row, zzdup: row } }, [spy, spy]),
    (e) => /zzdup/.test(e.message) && /alpha/.test(e.message) && /beta/.test(e.message) && !/zzone/.test(e.message));
  assert.equal(calls.length, 0, "no registration was called");
  const owners = { alpha: { zzone: row }, beta: { zztwo: row } };
  assert.equal(assembleDeclaredOps(owners, [spy, spy]), owners);
  assert.deepEqual(calls, [owners, owners]);
  /* a registration's own refusal passes through unchanged and stops the rest */
  const boom = () => { throw new TypeError("op-declarations: zzbad: differs from the hand row on mutating (R81)"); };
  assert.throws(() => assembleDeclaredOps(owners, [boom, spy]), /zzbad.*differs from the hand row/);
  assert.equal(calls.length, 2);
});

test("R68 a row that disagrees with a hand row stops the start with the op named, in a process of its own; control: the plane's own assembly registers, and every op that had a hand row is as it was", () => {
  const hand = OPS.cite;   /* a hand-rowed op; the fixture row flips its `mutating`, nothing else */
  const wrong = { classes: hand.classes, mutating: !hand.mutating, weight: hand.mutating ? "read" : "reversible", description: "x" };
  const stopped = child(`const { assembleDeclaredOps } = await import(${JSON.stringify(DECLARATIONS)});
    assembleDeclaredOps({ fixture: { cite: ${JSON.stringify(wrong)} } });`);
  assert.notEqual(stopped.status, 0, "the start stops");
  assert.match(stopped.stderr, /cite: fixture's row differs from the hand row on mutating/);
  /* control: the same op as its owner declares it, in the plane's own assembly, registers; no hand-rowed op moved */
  const real = child(`const { assembleDeclaredOps } = await import(${JSON.stringify(DECLARATIONS)});
    const { OPS } = await import(${JSON.stringify(DECLARED)});
    assembleDeclaredOps();
    process.stdout.write(JSON.stringify(OPS));`);
  assert.equal(real.status, 0, real.stderr);
  const before = JSON.parse(child(`const { OPS } = await import(${JSON.stringify(DECLARED)}); process.stdout.write(JSON.stringify(OPS));`).stdout);
  const after = JSON.parse(real.stdout);
  assert.ok(Object.keys(before).length > 100);
  for (const op of Object.keys(before)) assert.deepEqual(after[op], before[op], `${op} is as it was`);
});

test("R68 the start registers once: a second registration over the same modules is refused naming an op, late or second", () => {
  assert.throws(() => assembleDeclaredOps(), /op-declarations: \S+: (registered after the first read|a second registration) \(R81\)/);
});

test("R71 every op an owner declares is reachable: in the route map (by its door name or its alias), or answered by a Worker arm or the plane's own doors; none is declared and unreachable", async () => {
  const x = await store();
  const keys = new Set(Object.keys(x.s.routes(new URL("http://do/"), null)));
  const { ops } = await declaredOpsOf(ROOT);
  const unrouted = Object.keys(ops).filter((op) => !keys.has(OP_ALIASES[op] ?? op));
  const unreachable = [];
  const publicReads = new Set(publicReadOf(x.ctx).publicReads().map((r) => r.name));
  const store1 = { fetch: async () => new Response("ROUTE_MAP") };
  for (const op of unrouted) {
    if (Object.hasOwn(PLANE_OPS, op)) continue;   /* R72: the door's ask arm and the draft path, no route */
    if (Object.hasOwn(OWNERS["control-plane"], op)) continue;   /* control-plane R112: the door's own map serves it (its tests ask it) */
    if (Object.hasOwn(OWNERS["signin-door"] ?? {}, op)) continue;   /* signin-door R6 (K5052 (4)): `subscriptionsignin` moved its declaration from control-plane's rows to signin-door's; the door's own arm still serves it */
    if (publicReads.has(op)) continue;   /* a public read a module registered at start: asked as `op=publicread&name=` (t51 R17) */
    let arm = null;
    try {
      arm = await gatedOp({ req: new Request(`http://w/${op}`, { method: "GET" }), url: new URL(`http://w/${op}`),
        env: { STORE: { idFromName: () => "bio", get: () => store1 } }, op, cls: "admin", viaSession: false, sessMember: null,
        sessViewer: null, aiCred: null, storeName: "bio", stub: store1, grantMember: null });
    } catch { arm = { threw: true }; }
    if (!arm) unreachable.push(op);
  }
  assert.deepEqual(unreachable, [], "declared by an owner, in no route map and answered by no Worker arm");
  /* control: an op no owner declares is no route either */
  assert.equal(keys.has("zzundeclared71"), false);
});

test("R71 the ops of provenance, case-inputs, case-import, citation, monitoring, link-sweep and the store door's (tasks, queue) answer through the door as the owners' own maps answer them, none an unknown op, each once in the route map", async () => {
  const x = await store(), twin = await store();
  const u = new URL("http://do/");
  const owners = ["provenance", "case-inputs", "case-import", "citation", "monitoring", "link-sweep", "store-door"];
  const served = opsServedBy(x.ctx, u, x.env, owners);
  assert.ok(served.length > 0);
  for (const o of owners) assert.ok(served.some(([, m]) => m === o), `${o} serves ops through its own map`);
  const keys = Object.keys(x.s.routes(u, null));
  for (const [op, owner] of served) assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
  const { failed } = await servedThroughDoor(x, twin, owners);
  assert.deepEqual(failed, []);
});
