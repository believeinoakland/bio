/* store-assembly R6, R89 (K5046 (a), K5052): THE ROUTE MAP IS PLANE'S. During the copy window (K624) `plane`'s `Store` still
   builds its own composition; `assembleStore`'s route keys over the same fixture ctx are the class's, key for key, so the
   copy answers every op the class answers and no other. Plane's class is built in a child process (`sa-plane-routes.mjs`):
   op declarations are registered once per process (op-declarations R81), so the two assemblies cannot share one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { store } from "./fixture.mjs";

const child = fileURLToPath(new URL("./sa-plane-routes.mjs", import.meta.url));
const preload = fileURLToPath(new URL("../../platform-sqlite.mjs", import.meta.url));
const planeKeys = (path) => JSON.parse(execFileSync(process.execPath, ["--import", preload, child, path],
  { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, env: { ...process.env, NODE_OPTIONS: "" } }));

test("R6, R89: assembleStore's route keys equal plane's Store.routes over the same fixture ctx, for a plain address and for `rule`", async () => {
  const { routes } = await store();
  for (const path of ["/x", "/rule?use=draft"]) {
    const mine = Object.keys(routes(path, null)).sort();
    const theirs = planeKeys(path);
    assert.ok(mine.length > 1000, `a whole route map (${mine.length} keys)`);
    assert.deepEqual(mine.filter((k) => !theirs.includes(k)), [], `${path}: keys only the assembly has`);
    assert.deepEqual(theirs.filter((k) => !mine.includes(k)), [], `${path}: keys only plane's class has`);
    assert.deepEqual(mine, theirs);
  }
});
