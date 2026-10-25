/* store-assembly's copy of plane's T49 test: T49's composition (T49-30; N1072, N1091; DEC-237 (3); K3280): the two ops T49 adds to the maps this module spreads,
   `founderhandleset` (membership R144) and `projectownervotes` (project-roster R30), are reached through the one route map,
   each answering what its owner's map answers called directly. The route map is otherwise unchanged (R6). Each test drives
   the plane at its interface (the object's routes and its door) and carries a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { MODULE_MAPS, ownMaps } from "./maps.mjs";

/* the ops T49's owners add to the maps this module spreads: membership R144 (`founderhandleset`) and project-roster R30
   (`projectownervotes`), each declared in the map of the module that serves it */
const T49_OPS = ["founderhandleset", "projectownervotes"];
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>").replace(/"(ms|feeds_ms)":[\d.]+/g, '"$1":"<n>"');

test("R6 (T49; N1072, N1091; membership R144, project-roster R30): `founderhandleset` and `projectownervotes` are in the route map, each reached through the door and answering what its owner's map answers called directly; control: a probe no map serves is in none", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const path = "viewer=member:nobody&by=member:nobody&project=PROJ-2026-none&projectId=PROJ-2026-none&handle=steward";
  for (const op of T49_OPS) {
    const owner = ownMaps(x.ctx, u, null, x.env).find(([, m]) => Object.hasOwn(m, op));
    assert.ok(owner, `no module's map serves ${op}`);
    assert.ok(keys.includes(op), `the route map lacks ${op}`);
    const res = await x.fetch(`/${op}?${path}`, { method: "POST", body: JSON.stringify({ handle: "steward" }) });
    const fn = MODULE_MAPS.find(([m]) => m === owner[0])[1];
    let direct;
    try { direct = await fn(twin.ctx, new URL(`http://do/${op}?${path}`), { handle: "steward" }, twin.env)[op](); }
    catch (e) { direct = { threw: String(e) }; }
    assert.equal(res.status, 200, `${op} (${owner[0]})`);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct ?? null }))), op);
  }
  assert.deepEqual(T49_OPS.map((op) => ownMaps(x.ctx, u, null, x.env).filter(([, m]) => Object.hasOwn(m, op)).length), [1, 1],
                   "each is served by exactly one module's map");
  /* negative control: a probe no module's map serves is in none, and the route map names it nowhere */
  assert.equal(keys.includes("zzprobe49"), false);
  assert.equal(ownMaps(x.ctx, u, null, x.env).some(([, m]) => Object.hasOwn(m, "zzprobe49")), false);
});
