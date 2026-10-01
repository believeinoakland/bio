/* control-plane: the plane's limits (N336; installer R20, K649 (6)). The door states them in code, equal to the `limits`
   of the plane's own configuration, so the bundle a release signs carries what the installer sends. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { M } from "./harness.mjs";

const jsonc = (t) => JSON.parse(t.replace(/("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m, str) => str ?? "")
                                 .replace(/,(\s*[}\]])/g, "$1"));

test("installer R20 (N336): PLANE_LIMITS equals wrangler.jsonc's limits exactly, is frozen, and is carried on the door makeFetch makes, with PLANE_LIMITS_STATEMENT, its one-line statement", () => {
  const config = jsonc(readFileSync(new URL("../../../wrangler.jsonc", import.meta.url), "utf8"));
  assert.ok(config.limits && typeof config.limits === "object", "the configuration states limits");
  assert.deepEqual({ ...M.PLANE_LIMITS }, config.limits);
  assert.ok(Object.isFrozen(M.PLANE_LIMITS));
  assert.equal(M.makeFetch({}).limits, M.PLANE_LIMITS);
  /* the statement (K723, K724): the tag, then key=<positive integer> per key of the configuration's limits, sorted */
  const keys = Object.keys(config.limits).sort();
  assert.ok(keys.every((k) => Number.isInteger(config.limits[k]) && config.limits[k] > 0));
  assert.equal(M.PLANE_LIMITS_STATEMENT, ["bio-plane-limits/1", ...keys.map((k) => `${k}=${config.limits[k]}`)].join(" "));
  assert.match(M.PLANE_LIMITS_STATEMENT, /^bio-plane-limits\/1( [a-z_]+=[1-9][0-9]*)+$/);
  assert.equal(M.makeFetch({}).limitsStatement, M.PLANE_LIMITS_STATEMENT);
  /* its parsed form is PLANE_LIMITS */
  assert.deepEqual(Object.fromEntries(M.PLANE_LIMITS_STATEMENT.split(" ").slice(1).map((kv) => kv.split("=")).map(([k, v]) => [k, Number(v)])),
                   { ...M.PLANE_LIMITS });
  /* negative control: a configuration stating another value is not equal */
  assert.notDeepEqual({ ...M.PLANE_LIMITS }, { ...config.limits, subrequests: config.limits.subrequests + 1 });
});
