/* control-plane R101 (R085-25; K3510): `GET /favicon.ico` answers 204 with no body, through the door, with no op and no
   credential, never as an unknown op. Negative control: an unknown path still answers `UNKNOWN_OP`. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, world } from "./harness.mjs";

test("R101 (favicon): `GET /favicon.ico` answers 204 with no body, with no op and no credential, and reaches no store (control: an unknown path still answers 400 UNKNOWN_OP)", async () => {
  const { env } = world();
  const icon = await call(env, { path: "/favicon.ico" });
  assert.equal(icon.status, 204, icon.text);
  assert.equal(icon.text, "");
  assert.equal(env.calls.length, 0, "no store is asked for the icon");
  const unknown = await call(env, { path: "/no-such-op" });
  assert.equal(unknown.status, 400);
  assert.equal(unknown.json.reason, "UNKNOWN_OP");
});
