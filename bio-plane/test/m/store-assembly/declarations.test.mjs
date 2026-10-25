/* store-assembly's copy of plane's test. plane R68, R71 -> R83, R47 (T51 fix round; K4168, K4189; op-declarations R80, R81; op-grades R49, R50): the assembly assembles every
   module's op declarations at start-up, by its own static imports, and refuses to start on a duplicate or a disagreement;
   every op served through an owner's map is reachable through the door. (plane R71's other half, an op answered by a Worker arm of `door.mjs`, is the Worker's and stays in plane.) The modules and ops are found from `build/modules.json` and the
   owners' own exports (`declaredOpsOf`, `maps.mjs`), never listed here (K3268). */
import "../../../src/store-assembly/register.mjs";   /* the start's registration first: door.mjs' graph reads the op tables when it loads */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { store } from "./fixture.mjs";
import { declaredOpsOf } from "../../declared-ops.mjs";
import { OWNERS, assembleDeclaredOps } from "../../../src/store-assembly/declarations.mjs";
import { ASSEMBLY_DECLARED_OPS } from "../../../src/store-assembly/declared.mjs";
import { OWNER_MAP_DECLARED_OPS } from "../../../src/store-assembly/owner-ops.mjs";
/* the copy window (K5052 (4)): plane and control-plane still export these rows as `DECLARED_OPS`, so the collector finds them under those two */
import { declaredFields, OPS } from "../../../src/op-declarations/index.mjs";
import { opsServedBy, servedThroughDoor } from "./maps.mjs";

const ROOT = resolve(import.meta.dirname, "../../../..");
const DECLARATIONS = pathToFileURL(resolve(import.meta.dirname, "../../../src/store-assembly/declarations.mjs")).href;
const DECLARED = pathToFileURL(resolve(import.meta.dirname, "../../../src/op-declarations/index.mjs")).href;
const row = { classes: ["member"], mutating: false, weight: "read", description: "x", fields: { accepts: ["a"], requires: [] } };

/* a process of its own: the registrations are once per process, and a disagreement stops the start */
const child = (code) => spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8", cwd: resolve(import.meta.dirname, "../../..") });

test("R83 the assembly started over the real modules holds, for every module whose source exports DECLARED_OPS, each of its ops in the assembled table with the module's values; a module missing from the assembly is named; the copy window's only two are plane and control-plane, whose rows store-assembly holds as its own", async () => {
  await store();   /* the start: register.mjs hands the owners' declarations to both registrations at load */
  const { ops, owners, duplicates } = await declaredOpsOf(ROOT);
  assert.deepEqual(duplicates, [], "no op is declared by two modules");
  assert.ok(Object.keys(ops).length > 0);
  const missing = [...new Set(Object.values(owners))].filter((id) => !Object.hasOwn(OWNERS, id));
  /* the copy window (K5052 (4)): plane and control-plane still export DECLARED_OPS, and store-assembly exports its rows under other names, so the collector finds the two and not store-assembly */
  const COPIED_FROM = ["plane", "control-plane"];
  assert.deepEqual(missing.sort(), [...COPIED_FROM].sort(), "modules that export DECLARED_OPS and are not in the assembly (declarations.mjs): exactly plane and control-plane, whose rows are the assembly's own under `store-assembly`");
  const stray = Object.keys(OWNERS).filter((id) => !Object.values(owners).includes(id));
  assert.deepEqual(stray, ["store-assembly"], "modules in the assembly that export no DECLARED_OPS: exactly store-assembly, whose rows are exported as ASSEMBLY_DECLARED_OPS and OWNER_MAP_DECLARED_OPS");
  /* the copied rows: every op plane and control-plane declare is in store-assembly's row, the same row save its description's wording (the descriptions name store-assembly's ids) */
  const bare = (d) => ({ ...d, description: undefined });
  for (const op of Object.keys(ops).filter((o) => COPIED_FROM.includes(owners[o]))) {
    assert.ok(Object.hasOwn(OWNERS["store-assembly"], op), `${op}: store-assembly holds the row ${owners[op]} declares`);
    assert.deepEqual(bare(OWNERS["store-assembly"][op]), bare(ops[op]), `${op}: store-assembly's row is ${owners[op]}'s but for its description`);
  }
  assert.deepEqual(Object.keys(OWNERS["store-assembly"]).sort(), Object.keys(ops).filter((o) => COPIED_FROM.includes(owners[o])).sort(), "and holds no other (plane's and control-plane's rows, as the collector finds them)");
  for (const [op, d] of Object.entries(ops)) {
    if (COPIED_FROM.includes(owners[op])) { assert.ok(Object.hasOwn(OPS, op), `${op} is in the assembled table`); if (d.fields) assert.deepEqual(declaredFields(op), d.fields, `${op}: the owner's fields are read back`); continue; }
    assert.equal(OWNERS[owners[op]][op], d, `${op}: the assembly holds the owner's own row`);
    assert.ok(Object.hasOwn(OPS, op), `${op} is in the assembled table`);
    assert.deepEqual([OPS[op].classes ?? null, OPS[op].mutating], [d.classes, d.mutating], `${op}: the table agrees with the owner's row`);
    if (d.fields) assert.deepEqual(declaredFields(op), d.fields, `${op}: the owner's fields are read back`);
  }
  assert.equal(owners.ask, "plane", "the collector finds the assembly's own rows (R84) under plane while plane's copy stands");
  for (const op of Object.keys(ASSEMBLY_DECLARED_OPS)) assert.equal(OWNERS["store-assembly"][op], ASSEMBLY_DECLARED_OPS[op], `${op}: the assembly's own row is store-assembly's`);
  for (const op of Object.keys(OWNER_MAP_DECLARED_OPS)) assert.equal(OWNERS["store-assembly"][op], OWNER_MAP_DECLARED_OPS[op], `${op}: the owner map's row is store-assembly's`);
  /* control: the assembly is the assembly's own static imports, never the test collector */
  assert.equal(Object.keys(OWNERS).every((id) => owners && typeof OWNERS[id] === "object"), true);
});

test("R83 two modules declaring one op stop the start naming the op and both modules, before either registration is called; control: with no duplicate each registration is called once with the owners", () => {
  const calls = [];
  const spy = (owners) => { calls.push(owners); };
  assert.throws(() => assembleDeclaredOps({ alpha: { zzdup: row }, beta: { zzone: row, zzdup: row } }, [spy, spy]),
    (e) => /zzdup/.test(e.message) && /alpha/.test(e.message) && /beta/.test(e.message) && !/zzone/.test(e.message)
      && e.message === "store-assembly: zzdup: declared by two modules, alpha and beta (R83)");
  assert.equal(calls.length, 0, "no registration was called");
  const owners = { alpha: { zzone: row }, beta: { zztwo: row } };
  assert.equal(assembleDeclaredOps(owners, [spy, spy]), owners);
  assert.deepEqual(calls, [owners, owners]);
  /* a registration's own refusal passes through unchanged and stops the rest */
  const boom = () => { throw new TypeError("op-declarations: zzbad: differs from the hand row on mutating (R81)"); };
  assert.throws(() => assembleDeclaredOps(owners, [boom, spy]), /zzbad.*differs from the hand row/);
  assert.equal(calls.length, 2);
});

test("R83 a row that disagrees with a hand row stops the start with the op named, in a process of its own; control: the assembly's own assembly registers, and every op that had a hand row is as it was", () => {
  const hand = OPS.cite;   /* a hand-rowed op; the fixture row flips its `mutating`, nothing else */
  const wrong = { classes: hand.classes, mutating: !hand.mutating, weight: hand.mutating ? "read" : "reversible", description: "x" };
  const stopped = child(`const { assembleDeclaredOps } = await import(${JSON.stringify(DECLARATIONS)});
    assembleDeclaredOps({ fixture: { cite: ${JSON.stringify(wrong)} } });`);
  assert.notEqual(stopped.status, 0, "the start stops");
  assert.match(stopped.stderr, /cite: fixture's row differs from the hand row on mutating/);
  /* control: the same op as its owner declares it, in the assembly's own, registers; no hand-rowed op moved */
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

test("R83 the start registers once: a second registration over the same modules is refused naming an op, late or second", () => {
  assert.throws(() => assembleDeclaredOps(), /op-declarations: \S+: (registered after the first read|a second registration) \(R81\)/);
});

test("R47 the ops of provenance, case-inputs, case-import, citation, monitoring, link-sweep and the store door's (tasks, queue) answer through the door as the owners' own maps answer them, none an unknown op, each once in the route map", async () => {
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
