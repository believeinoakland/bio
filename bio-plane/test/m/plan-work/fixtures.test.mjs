/* plan-work's published fixtures, called and checked against the module's real answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { watchReaderRegistrar } from "./fixtures.mjs";
import { code } from "./fixture.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

test("R9: watchReaderRegistrar answers the first registration, a second as LISTENER_DECLARED, and a malformed one as LISTENER_MALFORMED", () => {
  const f = watchReaderRegistrar();
  assert.deepEqual(f.registered, { ok: true, module: "following" });
  assert.equal(f.again.ok, false);
  assert.equal(code(f.again), "LISTENER_DECLARED");
  assert.equal(f.again.check, MEMBERSHIP_CHECKS.LISTENER_DECLARED.check);
  for (const bad of [f.noModule, f.noReader]) { assert.equal(bad.ok, false); assert.equal(code(bad), "LISTENER_MALFORMED"); }
  /* control: the same registration, made again on the fixture's own module, is refused as the second was */
  assert.equal(code(f.planWork.registerWatchReader("following", f.reader)), "LISTENER_DECLARED");
});
