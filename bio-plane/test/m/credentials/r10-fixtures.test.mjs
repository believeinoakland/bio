/* Fix round 10 (K5044): the answers this module publishes in fixtures.mjs, each called and its real answer checked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bootstrapVersions, securityMapRefusal } from "./fixtures.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";
import { SIGN_IN_CHECKS } from "../../../src/credentials/index.mjs";
import { world } from "./fixture.mjs";

test("R2 R82 bootstrapVersions: the real bootstrap arm's answer of a claimed store carries the store's own build; a store whose environment names none answers null, never a default; memberVersions only when given", async () => {
  const a = await bootstrapVersions({ storeVersion: "1.2.3", memberVersions: { "pdf-worker": { state: "SERVING", version: "1.2.3" } } });
  assert.deepEqual([a.ok, a.claimed, a.rearmed, a.version, a.storeVersion], [true, true, false, "1.2.3", "1.2.3"]);
  assert.deepEqual(a.memberVersions, { "pdf-worker": { state: "SERVING", version: "1.2.3" } });
  assert.equal(typeof a.consumedAt, "string");
  const b = await bootstrapVersions({ storeVersion: null, version: "1.2.3" });
  assert.deepEqual([b.storeVersion, b.version, "memberVersions" in b], [null, "1.2.3", false]);
  const c = await bootstrapVersions({ claimed: false });
  assert.deepEqual([c.claimed, c.consumedAt], [false, null]);
  const real = await world().c.bootstrapState("fp-1");
  assert.deepEqual([c.claimed, c.rearmed, c.consumedAt], [real.claimed, real.rearmed, real.consumedAt]);
});

test("R45 securityMapRefusal: the real refusals, NOT_AN_ADMIN through membership and SECURITY_PERIOD_INVALID with its row", async () => {
  const r = await securityMapRefusal();
  assert.deepEqual(r.notAnAdmin, notAnAdmin("ann", "reading the security map"));
  assert.equal(r.notAnAdmin.ok, false);
  assert.equal(r.invalidPeriod.ok, false);
  assert.equal(r.invalidPeriod.reason, "SECURITY_PERIOD_INVALID");
  assert.equal(r.invalidPeriod.check, SIGN_IN_CHECKS.SECURITY_PERIOD_INVALID.check);
});
