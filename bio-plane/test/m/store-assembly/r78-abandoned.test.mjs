/* store-assembly R78 (fix round 10; K5200, PLANE #63 J66 (a)): the lag meter of a run is an instrument, not work: a run abandoned (the owner never
   returns, as an isolate killed in the middle of it never does) leaves no timer that keeps the process alive, so a suite that abandons runs exits
   by itself. Driven in a process of its own, which must end without being killed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const here = import.meta.dirname;
const at = (p) => pathToFileURL(resolve(here, p)).href;
const child = `
import ${JSON.stringify(at("../../../src/store-assembly/register.mjs"))};
import { store } from ${JSON.stringify(at("./alarmed-store.mjs"))};
import { bucketStandIn } from ${JSON.stringify(at("../case-carriage/fixture.mjs"))};
import { extractionOf } from ${JSON.stringify(at("../../../src/extraction/index.mjs"))};
const x = await store({ env: { CAPTURES: bucketStandIn() } });
let began; const started = new Promise((r) => { began = r; });
extractionOf(x.ctx).readHeld = async () => { began(); return new Promise(() => {}); };
const sha = "a".repeat(64);
await x.call("/pendingadd?kind=reading&sha=" + sha);
const state = await Promise.race([x.s.onAlarm(Date.now() + 1000), started.then(() => "abandoned")]);
if (state !== "abandoned") { console.error("the run did not begin: " + JSON.stringify(state)); process.exit(2); }
`;

test("R78 (K5200): a run abandoned in the middle leaves no timer holding the process: it ends by itself, and its lag meter still reports for a run that ends", () => {
  const r = spawnSync(process.execPath, ["--import", at("../../platform-sqlite.mjs"), "--input-type=module", "-e", child],
    { encoding: "utf8", cwd: resolve(here, "../../.."), timeout: 60_000 });
  assert.equal(r.error, undefined, `the process ended on its own (${r.error && r.error.code}): ${r.stderr}`);
  assert.equal(r.signal, null);
  assert.equal(r.status, 0, r.stderr);
});
