/* plane R77 (T51 fix round 5; E2; K4530), the platform check L on workerd under Miniflare, with the real Durable Object alarm and the real
   object storage: a reading that never returns (the isolate killed in the middle of it) is found started by the next runtime over the
   same storage, counted as an interrupted run, and not run first again; the ledger of the round before gains its columns. The runtimes
   are Miniflare's, which enforces no 128 MB and no CPU limit: the numbers of a read at the object's real share are the job's record's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./l75-entry.mjs", import.meta.url));
const persist = mkdtempSync(join(tmpdir(), "plane-l77-"));
const boot = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Held", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "l77", VERSION: "test" },
  durableObjectsPersist: persist,
});
const ask = async (mf, path) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = await ns.get(ns.idFromName("bio")).fetch(`http://do/l75/${path}`);
  const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t);
};
const d = "c".repeat(64);

test("R77 L: on workerd a run that never returns is stamped started with its try counted; the next runtime over the storage reaps it as an interrupted run and does not run it first again", { timeout: 120_000 }, async () => {
  const first = boot();
  try {
    const filed = await ask(first, `hang?sha=${d}`);
    assert.deepEqual(filed.owed, { ok: true });
    let s;
    for (let i = 0; i < 100; i++) { s = await ask(first, `state?sha=${"0".repeat(64)}`); if (s.readHeld.length) break; await new Promise((r) => setTimeout(r, 100)); }
    assert.equal(s.readHeld.length, 1, "the alarm began the read");
    const [row] = s.pending;
    assert.equal(row.attempts, 1, "its try was counted before the owner ran");
    assert.equal(row.running, true);
  } finally { await first.dispose(); }   /* the isolate is gone: the run never returned */
  const second = boot();
  try {
    let row;
    for (let i = 0; i < 100; i++) { const s = await ask(second, `state?sha=${"0".repeat(64)}`); [row] = s.pending; if (row && row.interrupted >= 1) break; await new Promise((r) => setTimeout(r, 100)); }
    assert.equal(row.interrupted, 1, "found started and not finished: an interrupted run");
    assert.equal(row.state, "owed");
    assert.equal(row.running, false);
  } finally { await second.dispose(); }
});
