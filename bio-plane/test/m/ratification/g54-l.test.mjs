/* ratification R6, R57 (T51 fix round 6, G54), the platform check L: on workerd under Miniflare, with a real Durable Object and
   real R2 buckets (`g54-entry.mjs`), each candidate cause of CASE-2026-4783 and 6227 (`build/plan/diagnosis-R6-g54-cause.md`
   section 4) tried on the Worker half's post-commit block: a bucket `put` that throws, a store that does not answer
   `recordcasemanifest`, a request its caller cancels after the commit. STEP 0 ran these on the tree as it stood before the
   fix (section 7 of that file: three red, one not reproduced); here they run on the fixed block, which must state the
   failure and never throw, and the sweep (`caseFileSweep`) must heal what is left, a few editions a tick. What the ledger
   records is publication's and public-read's: those assertions are named SEAM and stay red until those jobs land. The
   numbers (what the assembly asked of the bucket, and how much it held) are printed (R-CLOCK: counted, not timed). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./g54-entry.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "G54Held", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "g54", VERSION: "test" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "ratification-g54-")),
});
after(() => mf.dispose());
const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
const doAsk = async (path) => { const r = await (await stub()).fetch(`http://do/g54/${path}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const workerAsk = async (path, init) => { const r = await mf.dispatchFetch(`http://plane/g54w/${path}`, init); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };

/* a case edition whose finding is not yet signed: the act that signs it completes the edition */
let nth = 0;
async function seeded(extra = "") {
  const caseId = `CASE-2026-${String(7000 + ++nth)}`;
  const s = await doAsk(`seed?case=${caseId}&edition=1${extra}`);
  assert.equal((await doAsk(`state?case=${caseId}&edition=1`)).complete, false, "not complete before the finding is signed");
  return { ...s, caseId };
}
const completed = async (s) => {
  await doAsk(`finding?finding=${s.finding}`);
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  assert.deepEqual([st.complete, st.manifest_sha], [true, null], "complete, no case file yet");
  return st;
};

test("G54 L: with nothing faulty the block builds the case file, records its manifest and puts the manifest's bytes (the control)", { timeout: 120_000 }, async () => {
  const s = await seeded();
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=none`);
  assert.match(String(r.out.manifest_sha), /^[0-9a-f]{64}$/, JSON.stringify(r.out));
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  assert.equal(st.manifest_sha, r.out.manifest_sha);
});

/* each fault: the block states it and never throws, and the edition stays complete (the sweep owes it); what the ledger says of
   it is the providers' (SEAM) */
const FAULTS = [
  ["put_throws", "a bucket put that throws after the commit", null],
  ["manifest_put_throws", "a put that throws only for the manifest's own bytes", "recorded"],
  ["record_silent", "a store that does not answer recordcasemanifest", null],
];
for (const [fault, what, manifest] of FAULTS) {
  test(`G54 L (${fault}): ${what} is stated by the block, never a throw; the edition stays complete without a built case file`, { timeout: 120_000 }, async () => {
    const s = await seeded();
    await completed(s);
    const r = await workerAsk(`run?case=${s.caseId}&fault=${fault}`);
    assert.equal(r.out.ok, false, `stated: ${JSON.stringify(r.out).slice(0, 200)}`);
    assert.equal("threw" in r.out, false);
    const st = await doAsk(`state?case=${s.caseId}&edition=1`);
    console.log(`# G54 L (${fault}): the block answered ${JSON.stringify(r.out).slice(0, 140)}; manifest_sha ${st.manifest_sha ? "recorded" : "null"}; recorded by the caller ${JSON.stringify(r.recorded)}`);
    assert.equal(st.complete, true);
    assert.equal(st.manifest_sha !== null, manifest === "recorded");
  });
  test(`G54 L SEAM (${fault}): the failure is recorded for the edition in publication's ledger (state failed, with its step and code)`, { timeout: 120_000 }, async () => {
    const s = await seeded();
    await completed(s);
    await workerAsk(`run?case=${s.caseId}&fault=${fault}`);
    const st = await doAsk(`state?case=${s.caseId}&edition=1`);
    assert.equal(st.ledger.state, "failed", JSON.stringify(st.ledger));
    assert.ok(JSON.parse(st.ledger.why).code, "a stable code");
    assert.equal(st.ledger.attempts, 2, "the assembly records building, then failed: two attempts");
  });
}

test("G54 L (cancel): a request its caller cancels after the commit — under Miniflare the block runs to its end and builds the case file (the platform's cancellation is not shown here; the sweep covers it either way)", { timeout: 120_000 }, async () => {
  const s = await seeded();
  const ctl = new AbortController();
  const pending = mf.dispatchFetch(`http://plane/g54w/complete?case=${s.caseId}&finding=${s.finding}&wait=2500`, { signal: ctl.signal }).catch((e) => e);
  let st = await doAsk(`state?case=${s.caseId}&edition=1`);
  for (let i = 0; i < 100 && !st.complete; i++) { await new Promise((r) => setTimeout(r, 50)); st = await doAsk(`state?case=${s.caseId}&edition=1`); }
  assert.equal(st.complete, true, "the commit landed");
  ctl.abort();
  await pending;
  await new Promise((r) => setTimeout(r, 4000));
  st = await doAsk(`state?case=${s.caseId}&edition=1`);
  console.log(`# G54 L (cancel): caller cancelled after the commit: complete ${st.complete}, manifest_sha ${st.manifest_sha ? "recorded" : "null"}, the block reached its end ${!!(await workerAsk("flag")).after}`);
  assert.equal(st.complete, true);
});

/* ============================================================== the sweep on workerd */

/* editions left owed by the tests above are built first, so each sweep test sees only its own */
const drain = async () => { for (let i = 0; i < 30; i++) { const t = await doAsk(`sweep?now=${Date.now() + 30 * 86_400_000}`); if (!t.built.length && !t.failed.length) return; } };

test("G54 L SEAM (sweep): two complete editions without a case file are rebuilt by one tick of the sweep, the object's own door and the real buckets; a second tick calls the assembly 0 times", { timeout: 180_000 }, async () => {
  await drain();
  const a = await seeded(), b = await seeded(), c = await seeded();
  for (const e of [a, b, c]) await completed(e);
  const t1 = await doAsk(`sweep?now=${Date.now() + 3_600_000}`);
  console.log(`# G54 L (sweep) tick 1: built ${t1.built.length}, failed ${t1.failed.length}, files ${t1.files}, bytes ${t1.bytes}`);
  assert.equal(t1.ok, true, JSON.stringify(t1));
  assert.deepEqual(t1.built.map((x) => x.case), [a.caseId, b.caseId], "two a tick, the oldest first");
  assert.equal((await doAsk(`state?case=${c.caseId}&edition=1`)).manifest_sha, null, "the third waits");
  const t2 = await doAsk(`sweep?now=${Date.now() + 3_600_000}`);
  assert.deepEqual(t2.built.map((x) => x.case), [c.caseId]);
  const t3 = await doAsk(`sweep?now=${Date.now() + 3_600_000}`);
  assert.deepEqual([t3.built, t3.failed], [[], []], "idempotent: nothing owed");
});

test("G54 L SEAM (sweep): a put that threw is recorded failed and the sweep builds the edition once its backoff has passed; one that threw only for the manifest's bytes is healed the same way", { timeout: 180_000 }, async () => {
  await drain();
  for (const fault of ["put_throws", "manifest_put_throws"]) {
    const s = await seeded();
    await completed(s);
    await workerAsk(`run?case=${s.caseId}&fault=${fault}`);
    await doAsk("fault?mode=none");
    const soon = await doAsk(`sweep?now=${Date.now()}`);
    assert.deepEqual(soon.built, [], `${fault}: inside its backoff nothing is owed`);
    const later = await doAsk(`sweep?now=${Date.now() + 3_600_000}`);
    assert.deepEqual(later.built.map((x) => x.case), [s.caseId], `${fault}: built after its backoff`);
    const st = await doAsk(`state?case=${s.caseId}&edition=1`);
    assert.match(String(st.manifest_sha), /^[0-9a-f]{64}$/);
    assert.equal(st.ledger.state, "built");
  }
});

/* ============================================================== the measure (R-CLOCK: counted, not timed) */

test("G54 L (measure): an edition of 120 documents of 330 KiB (about 40 MB of material) assembled at the real shape — the bucket is asked for every byte once, and the figures set the sweep's bounds", { timeout: 300_000 }, async () => {
  const s = await seeded("&materials=120&kib=330");
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=none`);
  assert.match(String(r.out.manifest_sha), /^[0-9a-f]{64}$/, JSON.stringify(r.out).slice(0, 300));
  const bytes = (r.out.part_addresses || []).reduce((n, p) => n + (p.bytes || 0), 0);
  console.log(`# G54 L measure: files ${r.out.files}, parts ${r.out.parts}, case-file bytes ${bytes}; the block asked the bucket for get ${r.counts.get}, head ${r.counts.head}, put ${r.counts.put}, bytes read ${r.counts.bytes}`);
  assert.ok(r.out.files >= 240, `every document and every text is a file (${r.out.files})`);
  assert.ok(bytes >= 120 * 330 * 1024, `the material's bytes are in the case file (${bytes})`);
});
