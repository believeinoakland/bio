/* ratification R57, R6 (T51 fix round 6, G57), the platform check L: on workerd under Miniflare, with a real Durable Object over
   real SQLite storage and real R2 buckets (`g57-entry.mjs`, G54's object with the routes G57 needs). An edition whose member
   findings were committed but whose bundle.md was never copied (what a copy that failed leaves) is healed by the sweep's tick
   before its assembly: `textAtSha` over the real storage (live and snapshot rows); three findings healed in one tick and a
   second tick doing nothing; a put that throws once; an object killed part-way (a fresh Miniflare over the persisted storage and
   buckets) whose next tick copies only the rest; the largest edition the assembly allows (about 1,000 member findings, every
   copy failed) healed and built across ticks with the subrequests of each tick counted against the script's 10,000; one reached
   non-member finding with absent bytes, which the sweep does not heal (the named limit). The figures are printed
   (`# G57 L ...`) and written into `build/plan/diagnosis-R6-g54-cause.md` section 7.3 (R-CLOCK: counted, not timed). The plane's
   alarm is `plane`'s check: the tick is called through the object's door as `g54-l.test.mjs` calls it. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./g57-entry.mjs", import.meta.url));
const dirs = { do: mkdtempSync(join(tmpdir(), "ratification-g57-do-")), r2: mkdtempSync(join(tmpdir(), "ratification-g57-r2-")) };
const live = new Set();
const boot = () => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "G57Held", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "g57", VERSION: "test" },
    durableObjectsPersist: dirs.do, r2Persist: dirs.r2,
  });
  live.add(mf);
  return mf;
};
let mf = boot();
after(async () => { for (const m of live) await m.dispose().catch(() => {}); });
const ask = async (path) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = await ns.get(ns.idFromName("bio")).fetch(`http://do/g57/${path}`);
  const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t);
};
const workerAsk = async (path) => { const r = await mf.dispatchFetch(`http://plane/g57w/${path}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const HOUR = 3_600_000;
let nth = 0;
const seeded = async (n, extra = "") => { const caseId = `CASE-2026-${String(8000 + ++nth)}`; return { ...(await ask(`seedn?case=${caseId}&n=${n}${extra}`)), caseId }; };
const drain = async () => { for (let i = 0; i < 60; i++) { const t = await ask(`sweep?now=${Date.now() + 30 * 86_400_000 * (i + 1)}`); if (!t.tick.built.length && !t.tick.failed.length && !t.tick.healed.length) return; } };
const log = (m) => console.log(`# G57 L ${m}`);

test("G57 L: textAtSha over the real SQLite storage answers the pinned bundle.md from the live row and, once the bundle has a second version, from the snapshot row; a wrong hash answers null", { timeout: 120_000 }, async () => {
  const s = await seeded(1);
  const [id] = s.findings, [pin] = s.pins;
  const first = (await ask(`textat?bundle=${id}&sha=${pin}`)).text;
  assert.match(String(first), /^---/, "live row");
  const r = await ask(`revise?bundle=${id}`);
  assert.deepEqual([r.ok, r.was === r.now], [true, false], JSON.stringify(r));
  assert.equal((await ask(`textat?bundle=${id}&sha=${pin}`)).text, first, "snapshot row: the old pin's bytes");
  assert.equal((await ask(`textat?bundle=${id}&sha=${r.now}`)).text.includes("(revised)"), true, "the live row at the new pin");
  assert.equal((await ask(`textat?bundle=${id}&sha=${"0".repeat(64)}`)).text, null);
  await drain();
});

test("G57 L SEAM (sweep): an edition of 3 findings none of whose bundle.md is in the published bucket (one copy failed in the Worker half, two never made) is healed and built by one tick, the object's door and the real buckets; a second tick does nothing", { timeout: 180_000 }, async () => {
  await drain();
  const s = await seeded(3);
  const c = await workerAsk(`copyfail?bundle=${s.findings[0]}`);
  assert.equal(c.threw, "bucket refused (injected)");
  assert.equal(c.stored, false, "the Worker half's copy of the first finding failed");
  for (const pin of s.pins) assert.equal((await ask(`has?sha=${pin}`)).has, false);
  const t1 = await ask(`sweep?now=${Date.now() + HOUR}`);
  log(`3 findings: tick built ${t1.tick.built.length}, healed ${JSON.stringify(t1.tick.healed)}, bucket get ${t1.counts.get} head ${t1.counts.head} put ${t1.counts.put}, door ${t1.counts.door}`);
  assert.deepEqual(t1.tick.built.map((x) => x.case), [s.caseId], JSON.stringify(t1.tick).slice(0, 400));
  for (const pin of s.pins) assert.equal((await ask(`has?sha=${pin}`)).has, true);
  const led = await ask(`ledger?case=${s.caseId}`);
  assert.deepEqual([led.state, typeof led.manifest_sha], ["built", "string"]);
  const t2 = await ask(`sweep?now=${Date.now() + 2 * HOUR}`);
  assert.deepEqual([t2.tick.built, t2.tick.failed, t2.tick.healed, t2.counts.put], [[], [], [], 0], "a second tick does nothing");
});

test("G57 L SEAM (sweep): a put that throws once during the heal records failed BUCKET_FAILED at step copy; inside its backoff nothing is tried, and the tick after the backoff heals and builds", { timeout: 180_000 }, async () => {
  await drain();
  const s = await seeded(3);
  await ask("fault?mode=put_throws_once");
  const t1 = await ask(`sweep?now=${Date.now() + HOUR}`);
  assert.deepEqual(t1.tick.failed.map((x) => x.code), ["BUCKET_FAILED"], JSON.stringify(t1.tick).slice(0, 300));
  const led = await ask(`ledger?case=${s.caseId}`);
  assert.deepEqual([led.state, led.why.code, led.why.step, led.manifest_sha ?? null], ["failed", "BUCKET_FAILED", "copy", null]);
  const inside = await ask(`sweep?now=${Date.now()}`);
  assert.deepEqual([inside.tick.built, inside.tick.failed, inside.counts.put], [[], [], 0]);
  const t2 = await ask(`sweep?now=${Date.now() + 2 * HOUR}`);
  assert.deepEqual(t2.tick.built.map((x) => x.case), [s.caseId], JSON.stringify(t2.tick).slice(0, 300));
  assert.equal((await ask(`ledger?case=${s.caseId}`)).state, "built");
});

test("G57 L SEAM (sweep): the object killed part-way through the heal (a fresh Miniflare over the persisted storage and buckets) leaves some files present, and the next tick copies only the rest", { timeout: 240_000 }, async () => {
  await drain();
  const s = await seeded(3);
  await ask("fault?mode=put_throws_nth&n=2");
  const t1 = await ask(`sweep?now=${Date.now() + HOUR}`);
  assert.deepEqual(t1.tick.failed.map((x) => x.code), ["BUCKET_FAILED"]);
  assert.deepEqual(t1.tick.healed.map((h) => [h.copied, h.error ? "error" : null]), [[1, "error"]], "one file stored before the put that threw");
  await mf.dispose(); live.delete(mf);
  mf = boot();
  let present = 0;
  for (const pin of s.pins) present += (await ask(`has?sha=${pin}`)).has ? 1 : 0;
  assert.equal(present, 1, "the file stored before the kill survived it");
  const t2 = await ask(`sweep?now=${Date.now() + 3 * HOUR}`);
  log(`killed mid-heal: after restart the tick put ${t2.counts.put - (t2.tick.built.length ? 0 : 0)} (bucket put incl. the case file), head ${t2.counts.head}; healed ${JSON.stringify(t2.tick.healed)}`);
  assert.deepEqual(t2.tick.built.map((x) => x.case), [s.caseId], JSON.stringify(t2.tick).slice(0, 300));
  assert.deepEqual(t2.tick.healed.map((h) => [h.examined, h.copied]), [[3, 2]], "only the two that were absent are copied");
});

test("G57 L SEAM (reached non-member): a finding the case file reads that is no member of the edition, its bytes absent, is not healed by the sweep — the edition stays failed FINDING_MISSING (the named limit)", { timeout: 180_000 }, async () => {
  await drain();
  const s = await seeded(2, "&reached=1");
  const t1 = await ask(`sweep?now=${Date.now() + HOUR}`);
  const t2 = await ask(`sweep?now=${Date.now() + 3 * HOUR}`);
  const led = await ask(`ledger?case=${s.caseId}`);
  log(`reached non-member finding ${s.reached} absent: member findings healed ${JSON.stringify(t1.tick.healed.map((h) => h.copied))}, the edition's ledger ${JSON.stringify({ state: led.state, code: led.why && led.why.code, step: led.why && led.why.step })}`);
  assert.equal((await ask(`has?sha=${s.reachedPin}`)).has, false, "the reached finding's bytes are not copied by the sweep");
  assert.deepEqual([led.state, led.why.code, led.why.step, led.manifest_sha ?? null], ["failed", "FINDING_MISSING", "build", null]);
  assert.deepEqual(t2.tick.built, []);
});

test("G57 L (measure): the largest edition the assembly allows — 1,000 member findings, every copy failed — is healed and built across the ticks the bounds allow, and the bucket operations of every tick stay under the script's 10,000 subrequests", { timeout: 900_000 }, async () => {
  await drain();
  const s = await seeded(1000);
  const ticks = [];
  for (let i = 1; i <= 12 && !ticks.some((t) => t.tick.built.length); i++) {
    const t = await ask(`sweep?now=${Date.now() + (i + 1) * HOUR * 2}`);
    ticks.push(t);
    const subrequests = t.counts.get + t.counts.head + t.counts.put;
    log(`1,000 findings, tick ${i}: examined ${t.tick.healed.map((h) => h.examined)}, copied ${t.tick.healed.map((h) => h.copied)}, built ${t.tick.built.length}, failed ${JSON.stringify(t.tick.failed.map((f) => f.code))}, files ${t.tick.files}, bytes ${t.tick.bytes}; bucket get ${t.counts.get} head ${t.counts.head} put ${t.counts.put} (= ${subrequests} subrequests of 10,000), door ${t.counts.door}`);
    assert.ok(subrequests < 10_000, `tick ${i}: ${subrequests} subrequests`);
  }
  assert.deepEqual(ticks.at(-1).tick.built.map((x) => x.case), [s.caseId], "built");
  assert.ok(ticks.length >= 3, "healed across the ticks the puts bound allows (400 a tick)");
  assert.equal((await ask(`ledger?case=${s.caseId}`)).state, "built");
});
