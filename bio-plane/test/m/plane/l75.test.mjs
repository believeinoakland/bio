/* plane R75 (T51 fix round 4; C5a, C5c; K4429), the platform check L: on workerd under Miniflare, with the real Durable Object
   alarm, the real R2 multipart upload and the real object storage. A keep left pending by `captureOf(ctx).keepLater` (what
   acquisition calls when its keep will not end inside the door's bound) is finished by the object's own alarm, with no further
   request, inside a minute, and the stage record is written to and read from the object's storage on workerd. The numbers are
   printed. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./l75-entry.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Held", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "l75", VERSION: "test" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-l75-")),
});
after(() => mf.dispose());
const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
const ask = async (path, init) => { const r = await (await stub()).fetch(`http://do/l75/${path}`, init); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };

test("R75 R4 (C5c) L: on workerd a 40 MiB capture left pending is made whole by the object's own alarm inside a minute, over R2's multipart upload, with no request after the keep; its reading is asked for once", { timeout: 120_000 }, async () => {
  const held = await ask("hold?n=3&mib=40");
  assert.equal(held.parts.length, 3);
  assert.equal((await ask(`state?sha=${held.sha}`)).whole, false, "the whole is not held before");
  const filed = await ask("keep", { method: "POST", body: JSON.stringify({ sha: held.sha, parts: held.parts }) });
  assert.deepEqual(filed.filed, { ok: true });
  /* no request after the keep: the object's own alarm does the work (it fires at once when its instant is already due) */
  let s = await ask(`state?sha=${held.sha}`);
  while (s.pending.length > 0 && Date.now() - filed.at < 60_000) { await new Promise((r) => setTimeout(r, 100)); s = await ask(`state?sha=${held.sha}`); }
  const took = Date.now() - filed.at;
  const asked = s.readHeld.length ? s.readHeld[0].at - filed.at : null;
  console.log(`# L75: 40 MiB in 3 parts: the alarm finished the keep (R2 multipart) and removed the entry within ${took} ms of the registration; readHeld asked ${asked} ms after it`);
  assert.equal(s.pending.length, 0, `the entry is removed once its work has ended (${took} ms)`);
  assert.equal(s.whole, true, "the whole is held");
  assert.deepEqual(s.readHeld.map((c) => c.sha), [held.sha], "readHeld asked once");
  assert.ok(took < 60_000, `within a minute (${took} ms)`);
  assert.ok(asked !== null && asked >= 0, "the object asked for the reading itself, after the registration");
});

test("R75 R73 (C5a) L: on workerd the stage record is written to the object's storage and read from it; a running stage is named; another trace has none", async () => {
  await ask("stages?trace=T-l75");
  const a = await (await (await stub()).fetch("http://do/acquiretimings?trace=T-l75")).json();
  assert.equal(a.ok, true);
  assert.equal(a.result.stageTimes.running, "read");
  assert.equal((await (await (await stub()).fetch("http://do/acquiretimings?trace=T-none")).json()).result.stageTimes, null);
});

test("R77 L: on workerd the ledger of the earlier shape is carried over by `ALTER TABLE ... RENAME` and copy, re-armed, twice over changing nothing, and the new kinds register with their detail", async () => {
  const r = await ask("migrate-old");
  assert.equal(r.rows.length, 1);
  assert.deepEqual([r.rows[0].kind, r.rows[0].attempts, r.rows[0].final_why, r.rows[0].detail], ["reading", 0, null, "{}"]);
  assert.ok(r.rows[0].due_at < Date.now() + 1000, "due now");
  assert.equal(r.old, 0);
  assert.deepEqual(r.owed, { ok: true });
  assert.deepEqual(r.list.map((e) => [e.kind, e.state, e.detail]), [["reading", "owed", {}], ["ocr", "owed", { next_page: 25 }]]);
});
