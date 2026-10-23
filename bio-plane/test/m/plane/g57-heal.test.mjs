/* plane (T51 fix round 6, G57; K4720, K4724, K4727; `ratification` R57, R6), the sweep heals a finding the act's copy did not store, on the plane: the REAL `Store` and scheduler on workerd under
   Miniflare (`g57-heal-entry.mjs`), the edition completed by a member's real `op=ratify` through the Worker's door (a signed-in session, a registered key and a real SSH signature made here), the
   published bucket refusing the act's first put. The act answers 200 with `published.reason` `COPY_FAILED`, the edition is complete with no case file and the finding's `bundle.md` is absent
   (`publishedbytes` does not answer 200); then the object's own alarm handler runs the `casefile-sweep` consumer (never a hand-fired `caseFileSweep`): it copies the finding from the record,
   builds the case file, and `publishedcase` answers `case_file.state` `built` and `publishedbytes` of the finding's `bundle.md` answers 200. Control: a healthy edition, ratified with no fault, is built by the
   act and the sweep puts nothing. Counts, never times (R-CLOCK). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { newKey, signBundle } from "../ratification/fixture.mjs";

const ENTRY = fileURLToPath(new URL("./g57-heal-entry.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "plane-g57-"));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "G57Plane", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "g57", VERSION: "test" },
  durableObjectsPersist: PERSIST, r2Persist: join(PERSIST, "r2"),
});
after(() => mf.dispose());
const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
const doAsk = async (path) => { const r = await (await stub()).fetch(`http://do/${path}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const FAR = () => Date.now() + 30 * 86_400_000;
const alarm = () => doAsk(`g54p/alarm?at=${FAR()}`);
const state = (s) => doAsk(`g54/state?case=${s.caseId}&edition=1`);
const iris = await newKey();
let nth = 0;
const seeded = async () => {
  const caseId = `CASE-2026-${String(5700 + ++nth)}`;
  return { ...(await doAsk(`g57/seed?case=${caseId}&key=${encodeURIComponent(iris.keyB64)}`)), caseId };
};
const ratify = async (s) => {
  const sig = await signBundle(iris, s.finding, s.pin);
  const r = await mf.dispatchFetch("http://plane/api?op=ratify", { method: "POST", headers: { authorization: `Bearer ${s.token}`, "content-type": "application/json" },
    body: JSON.stringify({ bundleId: s.finding, expectedSha: s.pin, sig }) });
  const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t);
};
const bytes = async (sha) => (await mf.dispatchFetch(`http://plane/api?op=publishedbytes&sha256=${sha}`)).status;
const caseFile = async (s) => { const r = await mf.dispatchFetch(`http://plane/api?op=publishedcase&id=${s.caseId}`); const j = JSON.parse(await r.text()); return j.result ? j.result.case_file ?? (j.result.verification && j.result.verification.case_file) : j.case_file; };
const drain = async () => { await doAsk("g54p/bucket?mode=none"); for (let i = 0; i < 40; i++) { const t = await alarm(); if (!(t.sweep && t.sweep.asked)) return; } };

test("R57 R6 G57: an edition completed by a member's real op=ratify whose finding copy failed is healed by the object's own alarm: the finding's bundle.md is copied from the record, the case file is built, publishedcase says built and publishedbytes of the finding answers 200", { timeout: 300_000 }, async () => {
  await drain();
  const s = await seeded();
  await doAsk("g54p/bucket?mode=put_throws_once");
  const act = await ratify(s);
  console.log(`# G57 plane: the act answered ${JSON.stringify({ published: act.published && { ok: act.published.ok, reason: act.published.reason } }).slice(0, 200)}`);
  assert.equal(act.published && act.published.reason, "COPY_FAILED", JSON.stringify(act).slice(0, 400));
  const before = await state(s);
  assert.deepEqual([before.complete, before.manifest_sha], [true, null], "the act completed the edition and built no case file");
  assert.equal(before.ledger.state, "failed", JSON.stringify(before.ledger));
  assert.notEqual(await bytes(s.pin), 200, "the finding's bundle.md is not in the published bucket");
  const pending = await caseFile(s);
  console.log(`# G57 plane before the sweep: ledger ${JSON.stringify(before.ledger)}; case_file ${JSON.stringify(pending)}`);
  await doAsk("g54p/bucket?mode=count");
  const t = await alarm();
  console.log(`# G57 plane: the alarm's sweep ${JSON.stringify(t.sweep).slice(0, 300)}`);
  const after1 = await state(s);
  assert.match(String(after1.manifest_sha), /^[0-9a-f]{64}$/, "built by the object's own alarm");
  assert.equal(after1.ledger.state, "built");
  assert.deepEqual(t.sweep.built, [{ case: s.caseId, edition: 1 }], "the tick built this edition");
  assert.ok(t.counts.put >= 1, `the tick put the finding and the case file's files (${t.counts.put} puts)`);
  const cf = await caseFile(s);
  assert.equal(cf && cf.state, "built", JSON.stringify(cf));
  assert.equal(await bytes(s.pin), 200, "the finding's bundle.md answers 200");
  const again = await alarm();
  assert.equal(again.sweep ? again.sweep.asked : 0, 0, "idempotent: nothing is owed, nothing is asked");
});

test("R57 G57 control: a healthy edition ratified with no fault is built by the act itself and the sweep puts nothing and heals nothing", { timeout: 300_000 }, async () => {
  await drain();
  const s = await seeded();
  const act = await ratify(s);
  assert.notEqual(act.published && act.published.reason, "COPY_FAILED", JSON.stringify(act).slice(0, 300));
  await doAsk("g54p/bucket?mode=count");   /* the counts start again: the act's own puts are not the sweep's */
  const st = await state(s);
  assert.match(String(st.manifest_sha), /^[0-9a-f]{64}$/, "built by the act");
  assert.equal(await bytes(s.pin), 200);
  const t = await alarm();
  assert.equal(t.counts.put, 0, "the sweep put no file");
  assert.ok(!t.sweep || !t.sweep.healed || t.sweep.healed.every((h) => h.case !== s.caseId), "and healed nothing of this edition");
});
