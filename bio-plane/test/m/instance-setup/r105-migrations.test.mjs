/* instance-setup R105 (fix round 10, K5170; extraction R110): `op=selftest` states each migration's counts for an administrator,
   read only, through the store's own answer (extraction's `migrationCounts`, which the Worker cannot reach by itself). The
   store is this module's real route over a booted world, never a stub written by hand. Each test names the requirement it checks. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, stubOver, envOver, io, read } from "./fixture.mjs";
import { selftest } from "../../../src/setup.mjs";
import { N26_MIGRATION, N439_MIGRATION, REPAIR_MIGRATION, PART_MIGRATION, OWED_MIGRATION, SHAPE_MIGRATION } from "../../../src/extraction/index.mjs";

const LIVE = "a-live-admin-token-0123456789";
const NAMES = [N26_MIGRATION, N439_MIGRATION, REPAIR_MIGRATION, PART_MIGRATION, OWED_MIGRATION, SHAPE_MIGRATION];

test("R105 op=selftest states each migration's counts for an administrator: the six of R110, each with its examined, migrated, done, at, retry and counts", async () => {
  const w = await boot();
  const env = envOver(stubOver(w.m), { ADMIN_TOKEN: LIVE });
  const r = await read(await selftest(env, "bio", { cls: "admin", viewer: "class:admin" }, io));
  assert.deepEqual(r.body.migrations.map((m) => m.migration), NAMES);
  for (const m of r.body.migrations) {
    assert.equal(typeof m.examined, "number", m.migration);
    assert.equal(typeof m.migrated, "number", m.migration);
    assert.equal(typeof m.done, "boolean", m.migration);
    assert.ok(m.at === null || typeof m.at === "string", m.migration);
    assert.equal(typeof m.retry, "boolean", m.migration);
    assert.equal(typeof m.counts, "object", m.migration);
  }
  assert.equal(JSON.stringify(r.body).includes(LIVE), false, "never returns a secret");
});

test("R105 the migrations answer is read only: a second read changes none of its counts", async () => {
  const w = await boot();
  const env = envOver(stubOver(w.m), { ADMIN_TOKEN: LIVE });
  const first = await read(await selftest(env, "bio", { cls: "admin", viewer: "class:admin" }, io));
  const second = await read(await selftest(env, "bio", { cls: "admin", viewer: "class:admin" }, io));
  assert.equal(JSON.stringify(second.body.migrations), JSON.stringify(first.body.migrations));
});

test("R105 a viewer who is not an administrator is not told the migrations, as selftest refuses the store's counts today", async () => {
  const w = await boot();
  const env = envOver(stubOver(w.m), { ADMIN_TOKEN: LIVE });
  const r = await read(await selftest(env, "bio", { cls: "member", viewer: "member:ada" }, io));
  assert.equal("migrations" in r.body, false);
});
