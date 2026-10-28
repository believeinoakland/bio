/* credentials (fix round 10, B16; K5197, K5148, K5132): a clock handed to `credentialsOf` reaches `ai-accounts`, so an
   instant ai-accounts records through this instance reads the handed clock; none handed, the wall clock. Driven through
   the instance credentials makes, as the store's door reaches it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const PINNED = Date.parse("2026-10-20T10:15:30.000Z");
const PINNED_SECOND = "2026-10-20T10:15:30Z";   /* ai-accounts stamps whole seconds */

test("K5197 a clock handed to credentialsOf reaches ai-accounts: an account set through this instance is stamped with the handed instant", async () => {
  const w = world({ now: () => PINNED });
  await w.claim();
  const held = await w.own("admin");
  assert.equal(held.ok, true);
  assert.equal(held.set_at, PINNED_SECOND);
});

test("K5197 control: an instance handed no clock stamps the same account with the wall clock, between the calls either side", async () => {
  const w = world();
  await w.claim();
  const before = Date.now();
  const held = await w.own("admin");
  const after = Date.now();
  assert.equal(held.ok, true);
  const at = Date.parse(held.set_at);
  assert.ok(at >= Math.floor(before / 1000) * 1000 && at <= after, `wall clock, got ${held.set_at}`);
});
