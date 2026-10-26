/* plane R99, R102, R103 (fix round 9, G126i, G93, G94; K4838 (1), K4565): the deployment config's `cpu_ms`, the heal of a lost alarm
   by any request, and the watchdog's slot, at the class's interface over the real `Store` on the suite's storage. The job table
   and its registrar (store-assembly R74, R75) are tested there; the real-alarm and through-the-door checks are `r8-heal-door`,
   `r8-lag` and `r8-wave` (workerd). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { store } from "./fixture.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { PLATFORM_FIGURES } from "../../../src/byte-ledger.mjs";
import { parseJsonc } from "../../../scripts/jsonc.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");

async function world() {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  x.jobs = pendingOf(x.ctx);
  return x;
}

const config = () => parseJsonc(readFileSync(fileURLToPath(new URL("../../../wrangler.jsonc", import.meta.url)), "utf8"));
const cpuHolds = (cfg, figures) => cfg && cfg.limits && cfg.limits.cpu_ms === figures.cpu_ms.value;

test("R99 G126i: `wrangler.jsonc`'s limits state `cpu_ms` equal to runtime-limits' PLATFORM_FIGURES entry, beside `subrequests`, and its comment names the entry's source", () => {
  const cfg = config();
  assert.equal(cpuHolds(cfg, PLATFORM_FIGURES), true, `cpu_ms ${cfg.limits.cpu_ms} against ${PLATFORM_FIGURES.cpu_ms.value}`);
  assert.equal(cfg.limits.subrequests, 10000);
  const text = readFileSync(fileURLToPath(new URL("../../../wrangler.jsonc", import.meta.url)), "utf8");
  assert.ok(text.includes(PLATFORM_FIGURES.cpu_ms.source), "the comment names the entry's source");
  /* control: an entry changed without the config following fails */
  assert.equal(cpuHolds(cfg, { cpu_ms: { value: PLATFORM_FIGURES.cpu_ms.value + 1, source: "PLATFORM.md P-M5" } }), false);
});

test("R103 watchdogRan G94 (R-SEAM: through the real scheduler, whose `watch` records `ran`, scheduler R29; job 33 merged, K4905): the handler called with the cron's slot 26 minutes before now answers `watchdog_seen` equal to the slot and a `watchdog_ran` within the test's own bracket of now", async () => {
  const x = await world();
  const slot = Date.now() - 26 * 60_000;
  const before = Date.now();
  await x.s.watchdog(slot);
  const after = Date.now();
  const h = await schedulerOf(x.ctx, x.env).health();
  assert.equal(h.watchdog_seen, slot, "the slot, as before");
  assert.ok(Number.isFinite(h.watchdog_ran) && h.watchdog_ran >= before && h.watchdog_ran <= after, `watchdog_ran ${h.watchdog_ran}: the instant the check ran, not the slot`);
  const said = (await (await x.fetch("/owedwork?viewer=class:admin")).json()).result;
  assert.equal(said.watchdog_ran, h.watchdog_ran);
});

test("R102 healFrame: `Store.fetch` looks at a lost alarm once for a request, at most once in five seconds, arms it, and never raises; a request during a firing changes nothing", async () => {
  const x = await world();
  const d = sha("owed with the alarm lost");
  x.jobs.registerJob({ kind: "reading", sha: d });
  await x.ctx.storage.deleteAlarm();
  let looks = 0;
  const get = x.ctx.storage.getAlarm;
  x.ctx.storage.getAlarm = async () => { looks++; return get(); };
  const res = await x.fetch("/whoami?viewer=member:ann");
  assert.ok(res.status < 500);
  assert.equal(typeof (await get()), "number", "the request armed the lost alarm");
  const n = looks;
  await x.ctx.storage.deleteAlarm();
  await x.fetch("/whoami?viewer=member:ann");
  assert.equal(looks, n, "a second request within five seconds makes no second look");
  assert.equal(await get(), null);
  /* a heal that throws never raises the request */
  schedulerOf(x.ctx, x.env).heal = async () => { throw new Error("the look failed"); };
  assert.ok((await x.fetch("/whoami?viewer=member:ann")).status < 500);
});
