/* ratification R6 (T51 fix round 6, G54), the platform check L, STEP 0: on workerd under Miniflare, with a real Durable Object and
   real R2 buckets, each candidate cause of CASE-2026-4783 and 6227 (`build/plan/diagnosis-R6-g54-cause.md` section 4) tried on the
   tree as it stood before the fix: the Worker half's post-commit block (`copyMaterials`, then the one assembly) run with a bucket
   `put` that throws, with a store that does not answer `recordcasemanifest`, and under a request its caller cancels after the
   commit. What each leaves is read from the object: the edition's state and the bucket. The numbers are printed. */
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
async function seeded() {
  const caseId = `CASE-2026-${String(7000 + ++nth)}`;
  const s = await doAsk(`seed?case=${caseId}&edition=1`);
  assert.equal((await doAsk(`state?case=${caseId}&edition=1`)).complete, false, "not complete before the finding is signed");
  return { ...s, caseId };
}
const completed = async (s) => {
  await doAsk(`finding?finding=${s.finding}`);
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  assert.deepEqual([st.complete, st.manifest_sha], [true, null], "complete, no case file yet");
  return st;
};

test("G54 L step 0: with nothing faulty the block builds the case file, records its manifest and puts the manifest's bytes (the control)", { timeout: 120_000 }, async () => {
  const s = await seeded();
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=none`);
  console.log(`# G54 L0 control: ${JSON.stringify(r.out).slice(0, 200)}`);
  assert.match(String(r.out.manifest_sha), /^[0-9a-f]{64}$/, JSON.stringify(r.out));
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  assert.equal(st.manifest_sha, r.out.manifest_sha);
});

test("G54 L step 0 (b): a bucket put that throws after the commit leaves a complete edition with no manifest and records nothing", { timeout: 120_000 }, async () => {
  const s = await seeded();
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=put_throws`);
  console.log(`# G54 L0 (b) put throws: the block answered ${JSON.stringify(r.out).slice(0, 160)}`);
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  console.log(`# G54 L0 (b) edition afterwards: complete ${st.complete}, manifest_sha ${st.manifest_sha}, columns ${st.rows.filter((c) => /^casefile/.test(c)).join(",") || "(none)"}`);
  assert.equal(st.complete, true);
  assert.equal(st.manifest_sha, null);
});

test("G54 L step 0 (b'): a put that throws only for the manifest's bytes leaves the manifest recorded and its bytes never stored", { timeout: 120_000 }, async () => {
  const s = await seeded();
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=manifest_put_throws`);
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  console.log(`# G54 L0 (b') manifest put throws: the block answered ${JSON.stringify(r.out).slice(0, 160)}; manifest_sha ${st.manifest_sha ? "recorded" : "null"}`);
  assert.equal(st.complete, true);
});

test("G54 L step 0 (c): a store that does not answer recordcasemanifest leaves a complete edition with no manifest, the failure only in an answer seen once", { timeout: 120_000 }, async () => {
  const s = await seeded();
  await completed(s);
  const r = await workerAsk(`run?case=${s.caseId}&fault=record_silent`);
  const st = await doAsk(`state?case=${s.caseId}&edition=1`);
  console.log(`# G54 L0 (c) record silent: the block answered ${JSON.stringify(r.out).slice(0, 160)}; manifest_sha ${st.manifest_sha}`);
  assert.equal(st.complete, true);
  assert.equal(st.manifest_sha, null);
});

test("G54 L step 0 (a): a request its caller cancels after the commit", { timeout: 120_000 }, async () => {
  const s = await seeded();
  const ctl = new AbortController();
  const pending = mf.dispatchFetch(`http://plane/g54w/complete?case=${s.caseId}&finding=${s.finding}&wait=2500`, { signal: ctl.signal }).catch((e) => e);
  /* the commit lands, then the caller goes away while the block waits */
  let st = await doAsk(`state?case=${s.caseId}&edition=1`);
  for (let i = 0; i < 100 && !st.complete; i++) { await new Promise((r) => setTimeout(r, 50)); st = await doAsk(`state?case=${s.caseId}&edition=1`); }
  assert.equal(st.complete, true, "the commit landed");
  ctl.abort();
  await pending;
  await new Promise((r) => setTimeout(r, 4000));
  st = await doAsk(`state?case=${s.caseId}&edition=1`);
  const flag = await workerAsk("flag");
  console.log(`# G54 L0 (a) caller cancelled after the commit: complete ${st.complete}, manifest_sha ${st.manifest_sha}, the block reached its end ${!!flag.after}`);
  assert.equal(st.complete, true);
});
