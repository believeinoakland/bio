/* control-plane: the plane's limits (N336; installer R20, K649 (6)). The door states them in code, equal to the `limits`
   of the plane's own configuration, so the bundle a release signs carries what the installer sends. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { M } from "./harness.mjs";

const jsonc = (t) => JSON.parse(t.replace(/("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m, str) => str ?? "")
                                 .replace(/,(\s*[}\]])/g, "$1"));

test("installer R20 (N336): PLANE_LIMITS equals wrangler.jsonc's limits exactly, is frozen, and is carried on the door makeFetch makes", () => {
  const config = jsonc(readFileSync(new URL("../../../wrangler.jsonc", import.meta.url), "utf8"));
  assert.ok(config.limits && typeof config.limits === "object", "the configuration states limits");
  assert.deepEqual({ ...M.PLANE_LIMITS }, config.limits);
  assert.ok(Object.isFrozen(M.PLANE_LIMITS));
  assert.equal(M.makeFetch({}).limits, M.PLANE_LIMITS);
  /* negative control: a configuration stating another value is not equal */
  assert.notDeepEqual({ ...M.PLANE_LIMITS }, { ...config.limits, subrequests: config.limits.subrequests + 1 });
});
